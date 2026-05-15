"""
validation_crud.py - Database operations for the Validation queue
"""

from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime
from typing import Optional, Union

from models import ValidationRequest
from schema import ValidationSubmit


VALID_TYPES = {
    "Products", "AR", "3D", "Campaigns", "Blogs",
    "Campaigns_Delete", "Products_Delete", "Blogs_Delete",
    "AR_Delete", "3D_Delete",
}


# ── Create (stock / marketing manager) ──────────────────────────────────────────

def submit_for_validation(
    db:           Session,
    payload:      ValidationSubmit,
    submitted_by: Optional[int] = None,
) -> ValidationRequest:
    if payload.item_type not in VALID_TYPES:
        raise ValueError(f"item_type must be one of: {', '.join(sorted(VALID_TYPES))}")

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


def upsert_for_validation(
    db:           Session,
    payload:      ValidationSubmit,
    submitted_by: Optional[int] = None,
) -> ValidationRequest:
    """Create or reset a validation request.

    Used when a manager edits a campaign/product that may already have a
    Pending or Rejected record — prevents the 400 "already pending" error.
    """
    if payload.item_type not in VALID_TYPES:
        raise ValueError(f"item_type must be one of: {', '.join(sorted(VALID_TYPES))}")

    db.expire_all()

    existing = (
        db.query(ValidationRequest)
        .filter(
            ValidationRequest.item_type == payload.item_type,
            ValidationRequest.item_id   == payload.item_id,
        )
        .order_by(ValidationRequest.id.desc())
        .first()
    )

    if existing:
        existing.status         = "Pending"
        existing.title          = payload.title
        existing.rejection_note = None
        existing.reviewed_at    = None
        existing.reviewed_by    = None
        existing.submitted_by   = submitted_by
        existing.submitted_at   = datetime.utcnow()
        db.commit()
        db.refresh(existing)
        return existing

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


def submit_delete_request(
    db:            Session,
    campaign_id:   int,
    campaign_name: str,
    submitted_by:  Optional[int] = None,
) -> ValidationRequest:
    """Convenience wrapper used by the campaigns router to request deletion."""
    return submit_for_validation(
        db,
        ValidationSubmit(
            item_type = "Campaigns_Delete",
            item_id   = campaign_id,
            title     = campaign_name,
        ),
        submitted_by = submitted_by,
    )


# ── Read ─────────────────────────────────────────────────────────────────────

def get_all(
    db:        Session,
    status:    Optional[str] = None,
    item_type: Optional[str] = None,
    skip:      int = 0,
    limit:     int = 50,
) -> list[ValidationRequest]:
    q = db.query(ValidationRequest)
    if status:
        q = q.filter(ValidationRequest.status == status)
    if item_type and item_type != "All":
        q = q.filter(ValidationRequest.item_type == item_type)
    return q.order_by(ValidationRequest.submitted_at.desc()).offset(skip).limit(limit).all()


def get_by_id(db: Session, request_id: int) -> Optional[ValidationRequest]:
    return db.query(ValidationRequest).filter(ValidationRequest.id == request_id).first()


def get_stats(db: Session) -> dict:
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


# ── Update (admin) ───────────────────────────────────────────────────────────

def approve(
    db:          Session,
    request_id:  int,
    reviewed_by: Optional[int] = None,
) -> Union[ValidationRequest, dict]:
    """
    Approve a validation request.

    Campaigns type:
      - Sets campaign.is_active = True → campaign appears on the storefront.

    Campaigns_Delete type:
      - Deletes the campaign row and cleans up all related validation rows,
        then returns a plain snapshot dict (ORM row is gone).

    All other *_Delete types: executes the delete/clear logic and returns a
    snapshot dict. All other types: returns the updated ValidationRequest ORM.
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

    # Build a snapshot for types whose rows will be deleted during activation
    if req.item_type in ("Campaigns_Delete", "Products_Delete", "Blogs_Delete",
                          "AR_Delete", "3D_Delete"):
        snapshot = {
            "id":             req.id,
            "item_type":      req.item_type,
            "item_id":        req.item_id,
            "title":          req.title,
            "status":         req.status,
            "rejection_note": req.rejection_note,
            "submitted_at":   req.submitted_at,
            "reviewed_at":    req.reviewed_at,
            "submitted_by":   req.submitted_by,
            "reviewed_by":    req.reviewed_by,
            "submitter":      None,
            "reviewer":       None,
        }
        _activate_item(db, req.item_type, req.item_id)
        return snapshot

    _activate_item(db, req.item_type, req.item_id)
    return req


def reject(
    db:             Session,
    request_id:     int,
    rejection_note: str,
    reviewed_by:    Optional[int] = None,
) -> ValidationRequest:
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
    from models import Products, Campaigns, Blogs

    # ── AR_Delete: clear AR fields, remove AR & AR_Delete validation rows ─────
    if item_type == "AR_Delete":
        item = db.query(Products).filter(Products.id == item_id).first()
        if item:
            item.model_src = None
            item.ios_src   = None
            item.able_ar   = False
            item.valid_ar  = False
            db.commit()
        db.query(ValidationRequest).filter(
            ValidationRequest.item_id   == item_id,
            ValidationRequest.item_type.in_(["AR", "AR_Delete"]),
        ).delete(synchronize_session=False)
        db.commit()
        return

    # ── 3D_Delete: clear 3D fields, remove 3D & 3D_Delete validation rows ────
    if item_type == "3D_Delete":
        item = db.query(Products).filter(Products.id == item_id).first()
        if item:
            item.model_3d = None
            item.able_3d  = False
            item.valid_3d = False
            db.commit()
        db.query(ValidationRequest).filter(
            ValidationRequest.item_id   == item_id,
            ValidationRequest.item_type.in_(["3D", "3D_Delete"]),
        ).delete(synchronize_session=False)
        db.commit()
        return

    if item_type == "AR":
        item = db.query(Products).filter(Products.id == item_id).first()
        if item:
            item.valid_ar  = True
            item.is_active = True
            db.commit()
        return

    if item_type == "3D":
        item = db.query(Products).filter(Products.id == item_id).first()
        if item:
            item.valid_3d  = True
            item.is_active = True
            db.commit()
        return

    if item_type == "Campaigns":
        # Admin approved → make the campaign visible on the storefront.
        # The marketing manager already set status="active"; we just flip is_active.
        item = db.query(Campaigns).filter(Campaigns.id == item_id).first()
        if item:
            item.is_active = True
            db.commit()
        return

    if item_type == "Campaigns_Delete":
        import os
        item = db.query(Campaigns).filter(Campaigns.id == item_id).first()
        if item:
            if item.image_url:
                old_path = item.image_url.lstrip("/")
                if os.path.isfile(old_path):
                    os.remove(old_path)
            db.delete(item)
            db.commit()
        db.query(ValidationRequest).filter(
            ValidationRequest.item_id.in_([item_id]),
            ValidationRequest.item_type.in_(["Campaigns", "Campaigns_Delete"]),
        ).delete(synchronize_session=False)
        db.commit()
        return

    if item_type == "Products_Delete":
        import os
        from models import CartItems, OrderItems

        item = db.query(Products).filter(Products.id == item_id).first()
        if item:
            in_cart  = db.query(CartItems).filter(CartItems.product_id   == item_id).first()
            in_order = db.query(OrderItems).filter(OrderItems.product_id == item_id).first()
            if not in_cart and not in_order:
                for img in item.images:
                    path = img.image_url.lstrip("/")
                    if os.path.isfile(path):
                        os.remove(path)
                db.delete(item)
                db.commit()
        db.query(ValidationRequest).filter(
            ValidationRequest.item_id.in_([item_id]),
            ValidationRequest.item_type.in_(["Products", "Products_Delete"]),
        ).delete(synchronize_session=False)
        db.commit()
        return

    if item_type == "Blogs":
        item = db.query(Blogs).filter(Blogs.id == item_id).first()
        if item:
            item.status = "published"
            if not item.created_at:
                item.created_at = datetime.utcnow()
            db.commit()
        return

    if item_type == "Blogs_Delete":
        item = db.query(Blogs).filter(Blogs.id == item_id).first()
        if item:
            db.delete(item)
            db.commit()
        db.query(ValidationRequest).filter(
            ValidationRequest.item_id   == item_id,
            ValidationRequest.item_type.in_(["Blogs", "Blogs_Delete"]),
        ).delete(synchronize_session=False)
        db.commit()
        return

    if item_type == "Products":
        item = db.query(Products).filter(Products.id == item_id).first()
        if item:
            item.is_active = True
            db.commit()
        return


def _deactivate_item(db: Session, item_type: str, item_id: int) -> None:
    from models import Products, Campaigns, Blogs

    # ── AR_Delete rejected: keep AR data intact, nothing to revert ───────────
    if item_type == "AR_Delete":
        return

    # ── 3D_Delete rejected: keep 3D data intact, nothing to revert ───────────
    if item_type == "3D_Delete":
        return

    if item_type == "AR":
        item = db.query(Products).filter(Products.id == item_id).first()
        if item:
            item.valid_ar  = False
            item.is_active = True
            db.commit()
        return

    if item_type == "3D":
        item = db.query(Products).filter(Products.id == item_id).first()
        if item:
            item.valid_3d  = False
            item.is_active = True
            db.commit()
        return

    if item_type == "Campaigns":
        # Admin rejected → campaign stays hidden from the storefront.
        # status remains "active" (manager's intent), but is_active=False
        # until they re-edit and re-submit.
        item = db.query(Campaigns).filter(Campaigns.id == item_id).first()
        if item:
            item.is_active = False
            db.commit()
        return

    # Rejection of a delete request means "don't delete" — no state change needed.
    if item_type == "Campaigns_Delete":
        return

    if item_type == "Products_Delete":
        return

    if item_type == "Blogs":
        item = db.query(Blogs).filter(Blogs.id == item_id).first()
        if item:
            item.status = "draft"
            db.commit()
        return

    if item_type == "Blogs_Delete":
        return

    if item_type == "Products":
        item = db.query(Products).filter(Products.id == item_id).first()
        if item:
            item.is_active = False
            db.commit()
        return