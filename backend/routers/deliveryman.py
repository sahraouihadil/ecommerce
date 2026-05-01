"""
routers/deliveryman.py - Deliveryman Dashboard API
====================================================
All routes are prefixed /api/deliveryman and require a valid JWT
(deliveryman role). The token payload must contain { "id": <user_id> }.

Endpoints
─────────
GET  /orders/today              → Today's assigned orders + stats
GET  /orders/upcoming           → Future assigned orders
GET  /orders/history            → Past orders (delivered / canceled / problem) + stats
GET  /orders/{order_id}         → Single order detail
GET  /profile                   → Driver profile + aggregated stats
GET  /schedule                  → Monthly calendar data (dot + count per day)

PUT  /orders/{order_id}/status  → Advance status along the pipeline
                                    pending → processing → shipped → delivered
PUT  /orders/{order_id}/cancel  → Cancel any non-terminal order
POST /orders/{order_id}/problem → Report a delivery problem + notify stock manager
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_, extract
from datetime import datetime
from typing import Optional

from database import get_db
from models import Orders, OrderItems, Products, Users, ProductImage, Notifications
from schema import (
    ProblemReportBody,
    OrderOut,
    TodayOrdersOut,
    HistoryOut,
    ScheduleOut,
    ProfileOut,
    StatusUpdateOut,
    ProblemReportOut,
)
from security.jwt_handler import verify_token

router = APIRouter(
    prefix="/api/deliveryman",
    tags=["deliveryman"],
    redirect_slashes=False,
)

# ── Status pipeline ───────────────────────────────────────────────────────────

TRANSITIONS: dict[str, list[str]] = {
    "pending":    ["processing"],
    "processing": ["shipped"],
    "shipped":    ["delivered", "canceled", "problem", "partial"],
    "problem":    ["delivered", "canceled", "partial"],

    "delivered": [],
    "canceled":  [],
    "partial":   []
}

TERMINAL_STATUSES = {"delivered", "canceled", "partial"}

ALLOWED_PROBLEM_REASONS = {
    "Customer not reachable",
    "Wrong address",
    "Product damaged",
    "Traffic delay",
    "Other",
}

# ── Helper: build order dict ──────────────────────────────────────────────────

def _build_order(order: Orders, db: Session) -> dict:
    """
    Maps an Orders ORM row to the shape expected by the React frontend.
    Keeps DB queries minimal by fetching only what's needed.
    """
    # Customer name
    customer_name = "Unknown"
    if order.user_id:
        customer = db.query(Users.username).filter(Users.id == order.user_id).first()
        if customer:
            customer_name = customer[0]

    # Full address string
    address = ", ".join(
        part for part in [order.street_address, order.city, order.wilaya] if part
    ) or "No address provided"

    # ETA in minutes (only meaningful while order is still pending/processing)
    eta = 0
    if order.status.lower() not in TERMINAL_STATUSES and order.deliverydate:
        delta = order.deliverydate - datetime.utcnow()
        eta = max(0, int(delta.total_seconds() / 60))

    # Order items with product info
    items_rows = db.query(OrderItems).filter(OrderItems.order_id == order.id).all()
    items = []
    for item in items_rows:
        product_name = "Unknown"
        image_url    = None
        if item.product_id:
            prod = db.query(Products.name).filter(Products.id == item.product_id).first()
            if prod:
                product_name = prod[0]
            img = (
                db.query(ProductImage.image_url)
                .filter(
                    ProductImage.product_id == item.product_id,
                    ProductImage.order == 0,
                )
                .first()
            )
            if img:
                image_url = img[0]

        items.append({
            "id":           item.id,
            "product_id":   item.product_id,
            "product_name": product_name,
            "image":        image_url,
            "price":        float(item.price or 0),
            "quantity":     item.quantity or 1,
            "status":       item.status or "pending",
        })

    return {
        "id":             f"ORD-{str(order.id).zfill(3)}",
        "id_raw":         order.id,
        "customer":       customer_name,
        "address":        address,
        "eta":            eta,
        "km":             0.0,                             # extend later with routing API
        "amount":         float(order.totalamount or 0),
        "status":         order.status,
        "date":           order.deliverydate.strftime("%Y-%m-%d") if order.deliverydate else None,
        "rating":         order.rating,
        "problem_reason": order.problem_reason,
        "problem_notes":  order.problem_notes,
        "items":          items,
    }


def _notify_stock_manager(
    db: Session,
    order_id: int,
    reason: str,
    notes: str,
    driver_name: str,
) -> None:
    """
    Best-effort: inserts a Notifications row for the stock manager.
    Never raises — a notification failure must not abort the main transaction.
    """
    try:
        notif = Notifications(
            role="stock_manager",
            order_id=order_id,
            message=(
                f"Delivery problem reported by {driver_name} "
                f"for order ORD-{str(order_id).zfill(3)}. "
                f"Reason: {reason}."
                + (f" Notes: {notes}" if notes else "")
            ),
            is_read=False,
            created_at=datetime.utcnow(),
        )
        db.add(notif)
    except Exception:
        pass


# ── GET /orders/today ─────────────────────────────────────────────────────────

@router.get("/orders/today", response_model=TodayOrdersOut)
def get_today_orders(
    db:      Session = Depends(get_db),
    payload: dict    = Depends(verify_token),
):
    """Returns today's assigned orders plus a stats summary."""
    driver_id   = payload["id"]
    today_start = datetime.utcnow().replace(hour=0,  minute=0,  second=0,  microsecond=0)
    today_end   = datetime.utcnow().replace(hour=23, minute=59, second=59, microsecond=999999)

    orders = (
        db.query(Orders)
        .filter(
            Orders.deliveryman_id == driver_id,
            Orders.deliverydate   >= today_start,
            Orders.deliverydate   <= today_end,
        )
        .order_by(Orders.deliverydate.asc())
        .all()
    )

    order_list = [_build_order(o, db) for o in orders]

    stats = {
        "total":      len(orders),
        "delivered":  sum(1 for o in orders if o.status.lower() == "delivered"),
        "in_transit": sum(1 for o in orders if o.status.lower() in ("processing", "shipped")),
        "pending":    sum(1 for o in orders if o.status.lower() == "pending"),
    }

    return {
        "stats":  stats,
        "orders": order_list,
        "date":   datetime.utcnow().strftime("%a, %b %d, %Y"),
    }

# ── GET /orders/history ───────────────────────────────────────────────────────

@router.get("/orders/history", response_model=HistoryOut)
def get_history_orders(
    date_filter: Optional[str] = Query(None, description="ISO date YYYY-MM-DD to filter by"),
    db:          Session       = Depends(get_db),
    payload:     dict          = Depends(verify_token),
):
    """
    Returns past orders (terminal statuses) for the driver.
    Optionally filter by delivery date with ?date_filter=YYYY-MM-DD.
    """
    driver_id   = payload["id"]
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)

    q = db.query(Orders).filter(
        Orders.deliveryman_id == driver_id,
        Orders.orderdate      <  today_start,
    )

    if date_filter:
        try:
            d = datetime.strptime(date_filter, "%Y-%m-%d")
            q = q.filter(
                Orders.deliverydate >= d.replace(hour=0,  minute=0,  second=0),
                Orders.deliverydate <= d.replace(hour=23, minute=59, second=59),
            )
        except ValueError:
            raise HTTPException(status_code=422, detail="date_filter must be YYYY-MM-DD")

    orders = q.order_by(Orders.orderdate.desc()).all()
    order_list = [_build_order(o, db) for o in orders]

    delivered    = sum(1 for o in orders if o.status.lower() == "delivered")
    canceled      = sum(1 for o in orders if o.status.lower() == "canceled")
    total_earned = sum(float(o.totalamount or 0) for o in orders if o.status.lower() == "delivered")

    return {
        "stats": {
            "total":        len(orders),
            "delivered":    delivered,
            "canceled":       canceled,
            "total_earned": round(total_earned, 2),
        },
        "orders": order_list,
    }


# ── GET /orders/{order_id} ────────────────────────────────────────────────────

@router.get("/orders/{order_id}", response_model=OrderOut)
def get_order(
    order_id: int,
    db:       Session = Depends(get_db),
    payload:  dict    = Depends(verify_token),
):
    """Returns a single order. Driver can only access orders assigned to them."""
    driver_id = payload["id"]
    order = db.query(Orders).filter(
        Orders.id             == order_id,
        Orders.deliveryman_id == driver_id,
    ).first()

    if not order:
        raise HTTPException(status_code=404, detail="Order not found or not assigned to you")

    return _build_order(order, db)


# ── GET /schedule ─────────────────────────────────────────────────────────────

@router.get("/schedule", response_model=ScheduleOut)
def get_schedule(
    year:    int     = Query(default_factory=lambda: datetime.utcnow().year),
    month:   int     = Query(default_factory=lambda: datetime.utcnow().month),
    db:      Session = Depends(get_db),
    payload: dict    = Depends(verify_token),
):
    """
    Returns a per-day summary for the given month.
    Each day that has orders gets: { dot, count, orders[] }.
    dot is "delivered" | "problem" | "pending" (priority: problem > pending > delivered).
    """
    driver_id = payload["id"]

    orders = (
        db.query(Orders)
        .filter(
            Orders.deliveryman_id == driver_id,
            extract("year",  Orders.deliverydate) == year,
            extract("month", Orders.deliverydate) == month,
        )
        .order_by(Orders.deliverydate.asc())
        .all()
    )

    # Group by date string
    day_map: dict[str, list] = {}
    for o in orders:
        if not o.deliverydate:
            continue
        key = o.deliverydate.strftime("%Y-%m-%d")
        day_map.setdefault(key, []).append(o)

    schedule = {}
    for date_str, day_orders in day_map.items():
        statuses = {o.status.lower() for o in day_orders}
        if "problem" in statuses or "canceled" in statuses:
            dot = "problem"
        elif statuses <= {"delivered"}:
            dot = "delivered"
        else:
            dot = "pending"

        schedule[date_str] = {
            "dot":    dot,
            "count":  len(day_orders),
            "orders": [_build_order(o, db) for o in day_orders],
        }

    return {"year": year, "month": month, "schedule": schedule}


# ── GET /profile ──────────────────────────────────────────────────────────────

@router.get("/profile", response_model=ProfileOut)
def get_profile(
    db:      Session = Depends(get_db),
    payload: dict    = Depends(verify_token),
):
    """Returns driver profile info and lifetime delivery stats."""
    driver_id = payload["id"]

    driver = db.query(Users).filter(Users.id == driver_id).first()
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")

    all_orders = db.query(Orders).filter(Orders.deliveryman_id == driver_id).all()

    delivered    = sum(1 for o in all_orders if o.status.lower() == "delivered")
    issues       = sum(1 for o in all_orders if o.status.lower() == "problem")
    total_earned = sum(float(o.totalamount or 0) for o in all_orders if o.status.lower() == "delivered")
    ratings      = [o.rating for o in all_orders if o.rating is not None]
    avg_rating   = round(sum(ratings) / len(ratings), 1) if ratings else None

    return {
        "id":           driver.id,
        "name":         driver.username,
        "phone":        driver.phone_num,
        "vehicle":      driver.vehicle,
        "member_since": driver.created_at.strftime("%B %Y") if driver.created_at else None,
        "avg_rating":   avg_rating,
        "stats": {
            "total_orders": len(all_orders),
            "delivered":    delivered,
            "issues":       issues,
            "total_earned": round(total_earned, 2),
        },
    }


# ── PUT /orders/{order_id}/status ─────────────────────────────────────────────

@router.put("/orders/{order_id}/status", response_model=StatusUpdateOut)
def update_status(
    order_id: int,
    body: dict = None,
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    payload: dict = Depends(verify_token),
):
    driver_id = payload["id"]

    target_status = status
    if not target_status and body and isinstance(body, dict):
        target_status = body.get("status")

    if not target_status:
        raise HTTPException(status_code=422, detail="'status' is required")

    target_status = target_status.lower().strip()

    order = db.query(Orders).filter(
        Orders.id == order_id,
        Orders.deliveryman_id == driver_id,
    ).first()

    if not order:
        raise HTTPException(status_code=404, detail="Order not found or not assigned to you")

    current = order.status.lower().strip()
    allowed_next = TRANSITIONS.get(current, [])

    if target_status not in allowed_next:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid transition: '{current}' → '{target_status}'. "
                   f"Allowed: {', '.join(allowed_next)}",
        )

    # update order
    order.status = target_status

    # update items 
    for item in order.items:

        if item.status != "canceled":
            item.status = target_status

    # delivery date
    if target_status == "delivered":
        order.deliverydate = datetime.utcnow()

    db.commit()
    db.refresh(order)

    return {
        "message": "Status updated",
        "order_id": order_id,
        "status": order.status
    }
# ── PUT /orders/{order_id}/items/{item_id}/status ─────────────────────────────

ALLOWED_ITEM_STATUSES = {"pending", "delivered", "canceled", "problem"}

ORDER_STATUS_PRIORITY = ["problem", "canceled", "pending", "processing", "shipped", "delivered"]

def _recalculate_order_status(order, db):
    statuses = [item.status for item in order.items]

    total = len(statuses)

    delivered_count = statuses.count("delivered")
    canceled_count  = statuses.count("canceled")
    pending_count   = statuses.count("pending")
    problem_count   = statuses.count("problem")


    if canceled_count == total:
        return "canceled"

    
    if delivered_count == total:
        return "delivered"


    if delivered_count > 0 or canceled_count > 0 or problem_count > 0:
        return "partial"


    return "processing"

@router.put("/orders/{order_id}/items/{item_id}/status")
def update_item_status(
    order_id: int,
    item_id:  int,
    body:     dict,                        # { "status": "..." }
    db:       Session = Depends(get_db),
    payload:  dict    = Depends(verify_token),
):
    """
    Updates a single OrderItem's status and recalculates the parent
    order status from all its items.

    Allowed item statuses: pending | delivered | canceled | problem
    Returns: { order_id, item_id, item_status, order_status }
    """
    driver_id = payload["id"]

    # 1. Verify the order belongs to this driver
    order = db.query(Orders).filter(
        Orders.id             == order_id,
        Orders.deliveryman_id == driver_id,
    ).first()

    if not order:
        raise HTTPException(status_code=404, detail="Order not found or not assigned to you")

    if order.status.lower() in TERMINAL_STATUSES - {"delivered", "partial"}:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot update items on an order with status '{order.status}'.",
        )

    # 2. Verify the item belongs to this order
    item = db.query(OrderItems).filter(
        OrderItems.id       == item_id,
        OrderItems.order_id == order_id,
    ).first()

    if not item:
        raise HTTPException(status_code=404, detail="Item not found in this order")

    # 3. Validate target status
    target_status = (body.get("status") or "").lower()
    if target_status not in ALLOWED_ITEM_STATUSES:
        raise HTTPException(
            status_code=422,
            detail=f"Invalid status. Allowed: {sorted(ALLOWED_ITEM_STATUSES)}",
        )

    # 4. Apply item status
    item.status = target_status
    
    # 5. Recalculate and apply parent order status
    new_order_status = _recalculate_order_status(order, db)
    order.status = new_order_status

    if new_order_status == "delivered":
        order.deliverydate = datetime.utcnow()

    db.commit()
    db.refresh(item)
    db.refresh(order)

    return {
        "order_id":     order_id,
        "item_id":      item_id,
        "item_status":  item.status,
        "order_status": order.status,
    }
# ── PUT /orders/{order_id}/cancel ─────────────────────────────────────────────

@router.put("/orders/{order_id}/cancel", response_model=StatusUpdateOut)
def cancel_order(
    order_id: int,
    db:       Session = Depends(get_db),
    payload:  dict    = Depends(verify_token),
):
    driver_id = payload["id"]

    order = db.query(Orders).filter(
        Orders.id             == order_id,
        Orders.deliveryman_id == driver_id,
    ).first()

    if not order:
        raise HTTPException(status_code=404, detail="Order not found or not assigned to you")

    if order.status.lower() in TERMINAL_STATUSES:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot cancel an order with status '{order.status}'.",
        )

    # update order
    order.status = "canceled"

    # update ALL items
    for item in order.items:
        item.status = "canceled"

    db.commit()
    db.refresh(order)

    return {
        "message": "Order canceled",
        "order_id": order_id,
        "status": order.status
    }

# ── POST /orders/{order_id}/problem ───────────────────────────────────────────

@router.post("/orders/{order_id}/problem", response_model=ProblemReportOut)
def report_problem(
    order_id: int,
    body:     ProblemReportBody,
    db:       Session = Depends(get_db),
    payload:  dict    = Depends(verify_token),
):
    """
    Reports a delivery problem.
    - Sets status → 'problem'
    - Stores reason + notes on the Orders row
    - Fires a best-effort Notifications row for the stock manager
    """
    if body.reason not in ALLOWED_PROBLEM_REASONS:
        raise HTTPException(
            status_code=422,
            detail=f"Invalid reason. Allowed: {sorted(ALLOWED_PROBLEM_REASONS)}",
        )

    driver_id = payload["id"]

    order = db.query(Orders).filter(
        Orders.id             == order_id,
        Orders.deliveryman_id == driver_id,
    ).first()

    if not order:
        raise HTTPException(status_code=404, detail="Order not found or not assigned to you")

    if order.status.lower() in TERMINAL_STATUSES:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot report a problem on an order with status '{order.status}'.",
        )

    order.status         = "problem"
    order.problem_reason = body.reason
    order.problem_notes  = body.notes

    driver = db.query(Users).filter(Users.id == driver_id).first()
    driver_name = driver.username if driver else f"Driver #{driver_id}"
    _notify_stock_manager(db, order_id, body.reason, body.notes, driver_name)

    db.commit()
    db.refresh(order)

    return {
        "message":        "Problem reported",
        "order_id":       order_id,
        "status":         order.status,
        "problem_reason": body.reason,
        "problem_notes":  body.notes,
    }