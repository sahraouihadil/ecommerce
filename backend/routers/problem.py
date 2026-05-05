"""
problems.py  —  /api/problems  router
"""

from fastapi import APIRouter, Body, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_
from typing import Literal, Optional

from database import get_db
from models import Orders, Users

router = APIRouter(prefix="/api/problems", tags=["problems"])

ALLOWED_PROBLEM_REASONS = {
    "Customer not reachable",
    "Wrong address",
    "Product damaged",
    "Traffic delay",
    "Other",
}

REASON_PRIORITY = {
    "Customer not reachable": "high",
    "Wrong address":          "critical",
    "Product damaged":        "critical",
    "Traffic delay":          "medium",
    "Other":                  "low",
}

VALID_PRIORITIES = {"critical", "high", "medium", "low"}
VALID_STATUSES   = {"open", "in_review", "resolved"}


def _priority(order: Orders) -> str:
    return REASON_PRIORITY.get((order.problem_reason or "").strip(), "medium")


def _normalize_notes(raw) -> str:
    """Always return a clean string so the frontend can do plain equality checks."""
    val = (raw or "").strip()
    return val if val in ("in_review", "resolved") else "open"


def _serialize(order: Orders, db: Session) -> dict:
    customer = db.query(Users).filter(Users.id == order.user_id).first()
    dm = (
        db.query(Users).filter(Users.id == order.deliveryman_id).first()
        if order.deliveryman_id else None
    )
    return {
        "order_id":          order.id,
        "customer_name":     customer.username  if customer else "—",
        "customer_phone":    customer.phone_num if customer else None,
        "customer_email":    customer.email     if customer else None,
        "deliveryman":       dm.username        if dm else None,
        "deliveryman_phone": dm.phone_num       if dm else None,
        "wilaya":            order.wilaya,
        "commune":           order.city,
        "totalamount":       order.totalamount,
        "orderdate":         order.orderdate.isoformat()    if order.orderdate    else None,
        "deliverydate":      order.deliverydate.isoformat() if order.deliverydate else None,
        "status":            order.status,
        "delivery_type":     order.delivery_type,
        "problem_notes":     _normalize_notes(order.problem_notes),
        "problem_reason":    order.problem_reason,
        "payment_method":    order.payment_method,
        "notes":             order.notes,
        "items_count":       len(order.items) if order.items else 0,
        "priority":          _priority(order),
    }


@router.get("")
def list_problems(
    search:   Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    status:   Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    """
    Filter logic
    ------------
    - "all" (no status param)  → only orders where status == "problem"
    - "open"                   → status == "problem" AND problem_notes == "open"
    - "in_review"              → status == "problem" AND problem_notes == "in_review"
    - "resolved"               → problem_notes == "resolved"  (status is now "shipped")
    """

    if status == "resolved":
        # Resolved orders have status="shipped"; find them by problem_notes alone
        q = (
            db.query(Orders)
            .options(joinedload(Orders.items))
            .filter(Orders.problem_notes == "resolved")
        )
    else:
        # "all", "open", "in_review" — base set is always status == "problem"
        q = (
            db.query(Orders)
            .options(joinedload(Orders.items))
            .filter(Orders.status == "problem")
        )

    if search:
        like = f"%{search}%"
        q = q.join(Users, Users.id == Orders.user_id, isouter=True).filter(
            or_(
                Users.username.ilike(like),
                Orders.wilaya.ilike(like),
                Orders.problem_reason.ilike(like),
            )
        )

    orders = q.order_by(Orders.orderdate.desc()).all()

    result = []
    for o in orders:
        row = _serialize(o, db)

        if priority and priority in VALID_PRIORITIES and row["priority"] != priority:
            continue

        # For "open" and "in_review" apply problem_notes filter in Python
        # ("resolved" is already handled at the query level above)
        if status in ("open", "in_review") and row["problem_notes"] != status:
            continue

        result.append(row)

    # Stats always count from the full status=="problem" set + resolved ones
    all_problem_orders = (
        db.query(Orders)
        .options(joinedload(Orders.items))
        .filter(Orders.status == "problem")
        .all()
    )
    all_resolved_orders = (
        db.query(Orders)
        .options(joinedload(Orders.items))
        .filter(Orders.problem_notes == "resolved")
        .all()
    )
    all_rows = [_serialize(o, db) for o in all_problem_orders] + \
               [_serialize(o, db) for o in all_resolved_orders]

    stats = {
        "total":     len([r for r in all_rows if r["problem_notes"] != "resolved"]),  # active problems
        "open":      sum(1 for r in all_rows if r["problem_notes"] == "open"),
        "in_review": sum(1 for r in all_rows if r["problem_notes"] == "in_review"),
        "resolved":  sum(1 for r in all_resolved_orders),
        "critical":  sum(1 for r in all_rows if r["priority"] == "critical"),
        "high":      sum(1 for r in all_rows if r["priority"] == "high"),
        "medium":    sum(1 for r in all_rows if r["priority"] == "medium"),
        "low":       sum(1 for r in all_rows if r["priority"] == "low"),
        "by_reason": {
            r: sum(1 for row in all_rows if row["problem_reason"] == r)
            for r in ALLOWED_PROBLEM_REASONS
        },
    }

    return {
        "stats":           stats,
        "orders":          result,
        "allowed_reasons": sorted(ALLOWED_PROBLEM_REASONS),
    }


@router.get("/{order_id}")
def get_problem(order_id: int, db: Session = Depends(get_db)):
    order = (
        db.query(Orders)
        .options(joinedload(Orders.items))
        .filter(
            Orders.id == order_id,
            or_(
                Orders.status == "problem",
                Orders.problem_notes == "in_review",
                Orders.problem_notes == "resolved",
            )
        )
        .first()
    )

    if not order:
        raise HTTPException(404, "Problem order not found")

    return _serialize(order, db)


@router.patch("/{order_id}/review")
def set_review(
    order_id: int,
    review_status: Literal["in_review", "open"] = Body(..., embed=True),
    db: Session = Depends(get_db),
):
    """
    Toggle between open and in_review.
    order.status is NOT changed — only problem_notes.
    """
    order = db.query(Orders).filter(Orders.id == order_id).first()
    if not order:
        raise HTTPException(404, "Order not found")

    order.problem_notes = review_status
    db.commit()
    db.refresh(order)
    return {
        "message":       "Review status updated",
        "problem_notes": order.problem_notes,
    }


@router.patch("/{order_id}/resolve")
def resolve_problem(order_id: int, db: Session = Depends(get_db)):
    """
    Resolve a problem order.
    - order.status        → "shipped"   (leaves the active problem queue)
    - order.problem_notes → "resolved"  (still findable via the resolved filter)
    """
    order = db.query(Orders).filter(Orders.id == order_id).first()
    if not order:
        raise HTTPException(404, "Order not found")

    order.status        = "shipped"
    order.problem_notes = "resolved"
    db.commit()
    db.refresh(order)
    return {
        "message":       "Order resolved and moved to shipped",
        "problem_notes": order.problem_notes,
        "status":        order.status,
    }