"""
validation_crud.py - Database operations for the Validation queue
=================================================================
All database queries are isolated here so the router stays thin.

Side-effects on status change
──────────────────────────────
  Approve  →  _activate_item()
               Products   → is_active = True
               AR         → valid_ar  = True          ← AR flag only
               3D         → valid_3d  = True          ← 3D flag only
               Campaigns  → status = "active"
               Blogs      → status = "published"

  Reject   →  _deactivate_item()
               Products   → is_active = False
               AR         → valid_ar  = False
               3D         → valid_3d  = False
               Campaigns  → status = "inactive"
               Blogs      → status = "draft"
"""

from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime
from typing import Optional

from models import ValidationRequest
from schema import ValidationSubmit


# ── Allowed types ────────────────────────────────────────────────────────────

VALID_TYPES = {"Products", "AR", "3D", "Campaigns", "Blogs"}


# ── Create ───────────────────────────────────────────────────────────────────

def submit_for_validation(
    db:           Session,
    payload:      ValidationSubmit,
    submitted_by: Optional[int] = None,
) -> ValidationRequest:
    """
    Create a new Pending validation request.
    Raises ValueError if the same item is already awaiting review.
    """
    if payload.item_type not in VALID_TYPES:
        raise ValueError(f"item_type must be one of: {', '.join(sorted(VALID_TYPES))}")

    # Prevent duplicate pending submissions for the same item
    existing = (
        db.query(ValidationRequest)
        .filter(
            ValidationRequest.item_type == payload.item_type,
            ValidationRequest.item_id   == payload.item_id,
            ValidationRequest.status    == "Pending",
        )
        .first()
    )
    if existing:
        raise ValueError("This item already has a pending validation request.")

    request = ValidationRequest(
        item_type    = payload.item_type,
        item_id      = payload.item_id,
        title        = payload.title,
        status       = "Pending",
        submitted_by = submitted_by,
    )
    db.add(request)
    db.commit()
    db.refresh(request)
    return request


# ── Read ─────────────────────────────────────────────────────────────────────

def get_all(
    db:          Session,
    status:      Optional[str] = None,
    item_type:   Optional[str] = None,
    skip:        int = 0,
    limit:       int = 50,
) -> list[ValidationRequest]:
    """Return validation requests, optionally filtered."""
    q = db.query(ValidationRequest)
    if status:
        q = q.filter(ValidationRequest.status == status)
    if item_type and item_type != "All":
        q = q.filter(ValidationRequest.item_type == item_type)
    return q.order_by(ValidationRequest.submitted_at.desc()).offset(skip).limit(limit).all()


def get_by_id(db: Session, request_id: int) -> Optional[ValidationRequest]:
    return db.query(ValidationRequest).filter(ValidationRequest.id == request_id).first()


def get_stats(db: Session) -> dict:
    """Aggregate counts for the stat cards."""
    rows = (
        db.query(ValidationRequest.status, func.count(ValidationRequest.id))
        .group_by(ValidationRequest.status)
        .all()
    )
    counts   = {row[0]: row[1] for row in rows}
    pending  = counts.get("Pending",  0)
    approved = counts.get("Approved", 0)
    rejected = counts.get("Rejected", 0)
    return {
        "pending":  pending,
        "approved": approved,
        "rejected": rejected,
        "total":    pending + approved + rejected,
    }


# ── Update ───────────────────────────────────────────────────────────────────

def approve(
    db:          Session,
    request_id:  int,
    reviewed_by: Optional[int] = None,
) -> ValidationRequest:
    """
    Mark a request as Approved and trigger the item's activation side-effect.
    Raises ValueError if already reviewed.
    """
    req = get_by_id(db, request_id)
    if not req:
        raise LookupError("Validation request not found.")
    if req.status != "Pending":
        raise ValueError(f"Cannot approve a request that is already '{req.status}'.")

    req.status      = "Approved"
    req.reviewed_by = reviewed_by
    req.reviewed_at = datetime.utcnow()
    db.commit()
    db.refresh(req)

    _activate_item(db, req.item_type, req.item_id)

    return req


def reject(
    db:             Session,
    request_id:     int,
    rejection_note: str,
    reviewed_by:    Optional[int] = None,
) -> ValidationRequest:
    """
    Mark a request as Rejected and trigger the item's deactivation side-effect.
    Raises ValueError if already reviewed.
    """
    req = get_by_id(db, request_id)
    if not req:
        raise LookupError("Validation request not found.")
    if req.status != "Pending":
        raise ValueError(f"Cannot reject a request that is already '{req.status}'.")

    req.status         = "Rejected"
    req.rejection_note = rejection_note
    req.reviewed_by    = reviewed_by
    req.reviewed_at    = datetime.utcnow()
    db.commit()
    db.refresh(req)

    _deactivate_item(db, req.item_type, req.item_id)

    return req


# ── Private helpers ──────────────────────────────────────────────────────────

def _activate_item(db: Session, item_type: str, item_id: int) -> None:
    """
    After approval, flip the relevant flag(s) on the item's own table.

    Mapping
    ───────
    Products   →  is_active = True
    AR         →  valid_ar  = True   ← AR flag only (independent from 3D)
    3D         →  valid_3d  = True   ← 3D flag only (independent from AR)
    Campaigns  →  status    = "active"
    Blogs      →  status    = "published"
    """
    from models import Products, Campaigns, Blogs   # local import avoids circular

    # ── AR: flip only the AR validation flag ──────────────────────────────
    if item_type == "AR":
        item = db.query(Products).filter(Products.id == item_id).first()
        if item:
            item.valid_ar = True
            item.is_active = True
            db.commit()
        return

    # ── 3D: flip only the 3D validation flag ──────────────────────────────
    if item_type == "3D":
        item = db.query(Products).filter(Products.id == item_id).first()
        if item:
            item.valid_3d = True
            item.is_active = True
            db.commit()
        return

    # ── All other types: single-field mapping ─────────────────────────────
    table_map = {
        "Products":   (Products,   "is_active", True),
        "Campaigns":  (Campaigns,  "status",    "active"),
        "Blogs":      (Blogs,      "status",    "published"),
    }

    if item_type not in table_map:
        return

    model_cls, field, value = table_map[item_type]
    item = db.query(model_cls).filter(model_cls.id == item_id).first()
    if item:
        setattr(item, field, value)
        db.commit()


def _deactivate_item(db: Session, item_type: str, item_id: int) -> None:
    """
    After rejection, flip the relevant flag(s) on the item's own table.

    Mapping
    ───────
    Products   →  is_active = False
    AR         →  valid_ar  = False  ← AR flag only (independent from 3D)
    3D         →  valid_3d  = False  ← 3D flag only (independent from AR)
    Campaigns  →  status    = "inactive"
    Blogs      →  status    = "draft"
    """
    from models import Products, Campaigns, Blogs   # local import avoids circular

    # ── AR: reset only the AR validation flag ─────────────────────────────
    if item_type == "AR":
        item = db.query(Products).filter(Products.id == item_id).first()
        if item:
            item.valid_ar = False
            item.is_active = True
            db.commit()
        return

    # ── 3D: reset only the 3D validation flag ─────────────────────────────
    if item_type == "3D":
        item = db.query(Products).filter(Products.id == item_id).first()
        if item:
            item.valid_3d = False
            item.is_active = True
            db.commit()
        return

    # ── All other types: single-field mapping ─────────────────────────────
    table_map = {
        "Products":   (Products,   "is_active", False),
        "Campaigns":  (Campaigns,  "status",    "inactive"),
        "Blogs":      (Blogs,      "status",    "draft"),
    }

    if item_type not in table_map:
        return

    model_cls, field, value = table_map[item_type]
    item = db.query(model_cls).filter(model_cls.id == item_id).first()
    if item:
        setattr(item, field, value)
        db.commit()