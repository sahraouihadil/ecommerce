"""
validation_crud.py - Database operations for the Validation queue
=================================================================
All database queries are isolated here so the router stays thin.

Side-effects on status change
──────────────────────────────
  Approve  →  _activate_item()    sets  is_active=True  /  status="active"  /  status="published"
  Reject   →  _deactivate_item()  sets  is_active=False /  status="inactive" /  status="draft"
"""

from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime
from typing import Optional

from models import ValidationRequest
from schema import ValidationSubmit


# ── Allowed types ────────────────────────────────────────────────────────────

VALID_TYPES = {"Products", "AR", "Campaigns", "Promotions", "Blogs"}


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
        raise ValueError(f"item_type must be one of: {', '.join(VALID_TYPES)}")

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
    counts = {row[0]: row[1] for row in rows}
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
    Mark a request as Approved.
    Side-effect: sets item.is_active = True (or equivalent) in its own table.
    Raises ValueError if it's already been reviewed (Approved or Rejected).
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

    # ── Side-effect: activate the item in its own table ──────────────────
    _activate_item(db, req.item_type, req.item_id)

    return req


def reject(
    db:             Session,
    request_id:     int,
    rejection_note: str,
    reviewed_by:    Optional[int] = None,
) -> ValidationRequest:
    """
    Mark a request as Rejected with a note visible to the submitter.
    Side-effect: sets item.is_active = False (or equivalent) in its own table.
    Raises ValueError if it's already been reviewed.
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

    # ── Side-effect: deactivate the item in its own table ────────────────
    _deactivate_item(db, req.item_type, req.item_id)

    return req


# ── Private helpers ──────────────────────────────────────────────────────────

def _activate_item(db: Session, item_type: str, item_id: int) -> None:
    """
    After approval, flip the item's status/active flag in its own table
    so it becomes publicly visible on the storefront.

    Mapping
    ───────
    Products   →  is_active = True
    AR         →  is_active = True   (AR items are Products)
    Campaigns  →  status    = "active"
    Promotions →  status    = "active"
    Blogs      →  status    = "published"
    """
    from models import Products, Campaigns, Promotions, Blogs   # local import avoids circular

    table_map = {
        "Products":   (Products,   "is_active", True),
        "AR":         (Products,   "is_active", True),
        "Campaigns":  (Campaigns,  "status",    "active"),
        "Promotions": (Promotions, "status",    "active"),
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
    After rejection, flip the item's status/active flag in its own table
    so it is hidden from the storefront until resubmitted.

    Mapping
    ───────
    Products   →  is_active = False
    AR         →  is_active = False   (AR items are Products)
    Campaigns  →  status    = "inactive"
    Promotions →  status    = "inactive"
    Blogs      →  status    = "draft"
    """
    from models import Products, Campaigns, Promotions, Blogs   # local import avoids circular

    table_map = {
        "Products":   (Products,   "is_active", False),
        "AR":         (Products,   "is_active", False),
        "Campaigns":  (Campaigns,  "status",    "inactive"),
        "Promotions": (Promotions, "status",    "inactive"),
        "Blogs":      (Blogs,      "status",    "draft"),
    }

    if item_type not in table_map:
        return

    model_cls, field, value = table_map[item_type]
    item = db.query(model_cls).filter(model_cls.id == item_id).first()
    if item:
        setattr(item, field, value)
        db.commit()