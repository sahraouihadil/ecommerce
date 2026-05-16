"""
orders.py - Order Management API endpoints
============================================
Handles the checkout process and order viewing:
  - POST   /api/orders         → Create an order from cart items (checkout)
  - GET    /api/orders         → View all of the user's orders
  - GET    /api/orders/{id}    → View a specific order with details

All endpoints require authentication.

DELIVERY DATE STRATEGY
──────────────────────
The frontend sends `deliverydate` as either:
  - A single ISO string  → "any time" / "day of week" modes
  - A JSON array of ISO strings → "specific date" mode (up to 10 dates)

Because the Orders.deliverydate column is DateTime (single value), we:
  • Parse the first date into `deliverydate` (DateTime) for sorting/display.
  • Store the full list as a JSON string in `deliverydates` (Text column).

REQUIRED MODEL CHANGE
─────────────────────
Add this column to your Orders model (no data loss, just ALTER TABLE):

    deliverydates = Column(Text, nullable=True)   # JSON array of ISO date strings

Run:  ALTER TABLE orders ADD COLUMN deliverydates TEXT;
(or add it via Alembic migration)
"""

import json
from typing import List, Optional, Union

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, validator
from sqlalchemy.orm import Session
from database import get_db
from models import Orders, OrderItems, CartItems, Products
from security.jwt_handler import verify_token
from datetime import datetime
from schema import OrderCreate
from routers.notifications import push_notification

router = APIRouter(prefix="/api/orders", tags=["orders"], redirect_slashes=False)


# ─── Schema ───────────────────────────────────────────────────────────────
# Replace/extend your existing OrderCreate in schema.py with this,
# or import it from here if you prefer keeping it co-located.

class OrderCreate(BaseModel):
    fullName:      str
    phone:         str
    wilaya:        str
    city:          str
    streetAddress: str
    notes:         Optional[str] = None
    paymentMethod: str

    # Card fields (only required when paymentMethod == "cib")
    cardNumber:    Optional[str] = None
    cardExpiry:    Optional[str] = None
    cardCvv:       Optional[str] = None

    delivery_type: str

    # Accepts a single ISO string OR a list of ISO strings
    deliverydate: Union[str, List[str], None] = None

    @validator("deliverydate", pre=True, always=True)
    def normalise_deliverydate(cls, v):
        """Always store as a list internally for uniform handling."""
        if v is None:
            return []
        if isinstance(v, str):
            return [v]
        if isinstance(v, list):
            return [d for d in v if isinstance(d, str)]
        return []


# ─── Helpers ──────────────────────────────────────────────────────────────

def _parse_first_date(dates: List[str]) -> Optional[datetime]:
    """Return the first valid date in the list as a datetime, or None."""
    for d in dates:
        try:
            return datetime.fromisoformat(d)
        except (ValueError, TypeError):
            continue
    return None


def _serialise_dates(dates: List[str]) -> Optional[str]:
    """JSON-encode the list for storage in the Text column. None if empty."""
    return json.dumps(dates) if dates else None


def _deserialise_dates(raw: Optional[str]) -> List[str]:
    """Decode the stored JSON string back to a list."""
    if not raw:
        return []
    try:
        val = json.loads(raw)
        return val if isinstance(val, list) else [val]
    except (ValueError, TypeError):
        return []


# ─── POST /api/orders ─────────────────────────────────────────────────────

@router.post("")
async def create_order(
    data: OrderCreate,
    db: Session = Depends(get_db),
    payload: dict = Depends(verify_token),
):
    """
    Creates a new order from the user's cart items.

    Steps:
      1. Get all items from the user's cart
      2. Calculate the total price
      3. Create an Order record (with single + multi-date columns)
      4. Create OrderItem records for each cart item
      5. Delete the cart items (moved to the order)
      6. Send a push notification to the user
    """
    user_id = payload.get("id")

    # 1. Cart items
    cart_items = db.query(CartItems).filter(CartItems.user_id == user_id).all()
    if not cart_items:
        raise HTTPException(status_code=400, detail="Cart is empty")

    # 2. Total
    total = 0
    for item in cart_items:
        product = db.query(Products).filter(Products.id == item.product_id).first()
        if product:
            total += product.price * item.quantity

    # 3. Normalised delivery dates
    dates        = data.deliverydate                   # always a list after validation
    first_date   = _parse_first_date(dates)            # DateTime | None  → deliverydate column
    dates_json   = _serialise_dates(dates)             # JSON str | None  → deliverydates column

    # 3. Create Order
    order = Orders(
        user_id        = user_id,
        totalamount    = total,
        status         = "pending",
        orderdate      = datetime.utcnow(),
        deliverydate   = first_date,       # primary date (DateTime, nullable)
        deliverydates  = dates_json,       # full list   (Text, nullable)  ← NEW COLUMN
        delivery_type  = data.delivery_type,
        wilaya         = data.wilaya,
        city           = data.city,
        street_address = data.streetAddress,
        notes          = data.notes,
        payment_method = data.paymentMethod,
    )
    db.add(order)
    db.flush()  # get order.id

    # 4. Order items + cart cleanup
    for item in cart_items:
        product = db.query(Products).filter(Products.id == item.product_id).first()
        db.add(OrderItems(
            order_id   = order.id,
            product_id = item.product_id,
            quantity   = item.quantity,
            price      = product.price if product else 0,
            status     = order.status,
        ))
        db.delete(item)

    # 5. Commit
    db.commit()

    # 6. Notify
    await push_notification(
        db=db,
        user_id=user_id,
        type="order",
        title="✅ Order Placed!",
        body=f"Your order #{order.id} has been placed successfully. Total: {total:.2f} DA",
    )

    return {
        "message":  "Order placed successfully",
        "order_id": order.id,
        "total":    total,
    }


# ─── GET /api/orders ──────────────────────────────────────────────────────

@router.get("")
def get_orders(
    db: Session = Depends(get_db),
    payload: dict = Depends(verify_token),
):
    """Returns all orders for the current user, newest first."""
    user_id = payload.get("id")
    orders  = (
        db.query(Orders)
        .filter(Orders.user_id == user_id)
        .order_by(Orders.orderdate.desc())
        .all()
    )

    result = []
    for order in orders:
        items = db.query(OrderItems).filter(OrderItems.order_id == order.id).all()
        result.append({
            "id":           order.id,
            "orderdate":    order.orderdate.isoformat() if order.orderdate else None,
            # Return the full list when available, fall back to single date
            "deliverydates": _deserialise_dates(getattr(order, "deliverydates", None))
                             or ([order.deliverydate.isoformat()] if order.deliverydate else []),
            "deliverydate": order.deliverydate.isoformat() if order.deliverydate else None,
            "delivery_type": order.delivery_type,
            "totalamount":  order.totalamount,
            "status":       order.status,
            "items": [{
                "id":         i.id,
                "product_id": i.product_id,
                "price":      i.price,
                "quantity":   i.quantity,
            } for i in items],
        })
    return result


# ─── GET /api/orders/all ──────────────────────────────────────────────────

@router.get("/all")
def get_all_orders(
    db: Session = Depends(get_db),
    payload: dict = Depends(verify_token),
):
    """Returns all orders. For staff roles (stock manager, deliveryman, accountant)."""
    orders = db.query(Orders).order_by(Orders.orderdate.desc()).all()
    result = []
    for order in orders:
        items = db.query(OrderItems).filter(OrderItems.order_id == order.id).all()
        item_details = []
        for i in items:
            product = db.query(Products).filter(Products.id == i.product_id).first()
            item_details.append({
                "id":           i.id,
                "product_id":   i.product_id,
                "price":        i.price,
                "quantity":     i.quantity,
                "product_name": product.name if product else "Unknown",
            })
        result.append({
            "id":            order.id,
            "user_id":       order.user_id,
            "orderdate":     order.orderdate.isoformat() if order.orderdate else None,
            "deliverydates": _deserialise_dates(getattr(order, "deliverydates", None))
                             or ([order.deliverydate.isoformat()] if order.deliverydate else []),
            "deliverydate":  order.deliverydate.isoformat() if order.deliverydate else None,
            "delivery_type": order.delivery_type,
            "totalamount":   order.totalamount,
            "status":        order.status,
            "items":         item_details,
        })
    return result


# ─── GET /api/orders/{order_id} ───────────────────────────────────────────

@router.get("/{order_id}")
def get_order(
    order_id: int,
    db: Session = Depends(get_db),
    payload: dict = Depends(verify_token),
):
    """Returns detailed info about a specific order (used by the tracking page)."""
    user_id = payload.get("id")
    order   = (
        db.query(Orders)
        .filter(Orders.id == order_id, Orders.user_id == user_id)
        .first()
    )
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    items = db.query(OrderItems).filter(OrderItems.order_id == order.id).all()
    item_details = []
    for i in items:
        product = db.query(Products).filter(Products.id == i.product_id).first()
        item_details.append({
            "id":           i.id,
            "product_id":   i.product_id,
            "price":        i.price,
            "quantity":     i.quantity,
            "product_name": product.name if product else "Unknown",
        })

    return {
        "id":            order.id,
        "orderdate":     order.orderdate.isoformat() if order.orderdate else None,
        "deliverydates": _deserialise_dates(getattr(order, "deliverydates", None))
                         or ([order.deliverydate.isoformat()] if order.deliverydate else []),
        "deliverydate":  order.deliverydate.isoformat() if order.deliverydate else None,
        "delivery_type": order.delivery_type,
        "totalamount":   order.totalamount,
        "status":        order.status,
        "items":         item_details,
    }


# ─── PUT /api/orders/{order_id}/status ───────────────────────────────────

@router.put("/{order_id}/status")
async def update_order_status(
    order_id: int,
    status: str,
    db: Session = Depends(get_db),
    payload: dict = Depends(verify_token),
):
    """Updates order status, syncs all order items, and notifies the user."""
    order = db.query(Orders).filter(Orders.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    order.status = status
    db.query(OrderItems).filter(OrderItems.order_id == order_id).update(
        {"status": status}, synchronize_session=False
    )
    db.commit()

    status_messages = {
        "shipped":   ("📦 Order Shipped!",  f"Your order #{order_id} is on its way."),
        "delivered": ("✅ Order Delivered!", f"Order #{order_id} has been delivered. Enjoy!"),
        "canceled":  ("❌ Order Canceled",   f"Order #{order_id} was canceled."),
        "pending":   ("🕐 Order Pending",    f"Order #{order_id} is being processed."),
    }

    if status in status_messages:
        title, body = status_messages[status]
        await push_notification(
            db=db,
            user_id=order.user_id,
            type="order",
            title=title,
            body=body,
        )

    return {"message": "Status updated", "order_id": order_id, "status": status}