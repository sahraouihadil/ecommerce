"""
routers/newsletter.py
=====================
- GET  /api/newsletters/        → Marketing manager: all customers + their subscription status
- GET  /api/newsletters/{id}    → Single subscriber record
- POST /api/newsletters/        → Logged-in customer only: subscribe themselves
- PUT  /api/newsletters/{id}    → Marketing manager: edit a subscriber record
- DELETE /api/newsletters/{id}  → Marketing manager: remove a subscriber record
"""

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import Optional, List

from models import Newsletters, Users
from database import get_db
from schema import NewsletterCreate, NewsletterUpdate
from security.settings import verify_token        # returns the JWT payload dict
from enums import UserRole

router = APIRouter(prefix="/api/newsletters", tags=["Newsletters"])


# ======================================================================
# HELPERS
# ======================================================================

def newsletter_dict(n: Newsletters) -> dict:
    """Serialise a Newsletters row."""
    return {
        "id":         n.id,
        "user_id":    None,          # not relevant for a pure newsletter row
        "name":       n.name,
        "email":      n.email,
        "status":     n.status,
        "tags":       n.tags or "",
        "created_at": n.created_at.isoformat() if n.created_at else None,
    }


def customer_row(user: Users, newsletter: Optional[Newsletters]) -> dict:
    """
    Build the row the marketing dashboard table displays.

    KEY FIX:
      - `id`      → always the newsletter row id when it exists, otherwise
                    use a negative sentinel (-user.id) so the frontend always
                    has a non-None, unique, stable value per row.
      - `user_id` → always the Users.id so the frontend/backend can look up
                    the user when no newsletter row exists yet.

    Using -user.id as the sentinel keeps the value unique and lets the
    backend distinguish "this is a user id, not a newsletter id" by sign.
    """
    return {
        # FIXED: never None — real newsletter id when subscribed,
        # negative user id as a stable sentinel when not.
        "id":         newsletter.id if newsletter else -user.id,
        "user_id":    user.id,
        "name":       user.username,
        "email":      user.email,
        "status":     newsletter.status          if newsletter else "unsubscribed",
        "tags":       (newsletter.tags or "")    if newsletter else "",
        "created_at": (
            newsletter.created_at.isoformat()
            if newsletter and newsletter.created_at
            else user.created_at.isoformat() if user.created_at else None
        ),
    }


def _require_customer(payload: dict = Depends(verify_token)) -> dict:
    if payload.get("role") != "customer":
        raise HTTPException(
            status_code=403,
            detail="Only customers can subscribe to the newsletter.",
        )
    return payload


def _require_marketing(payload: dict = Depends(verify_token)) -> dict:
    role = payload.get("role", "")
    if role not in ("marketing_manager", "admin"):
        raise HTTPException(status_code=403, detail="Not authorised.")
    return payload


# ======================================================================
# ROUTES
# ======================================================================

@router.get("/")
def list_newsletters(
    db: Session = Depends(get_db),
    _: dict = Depends(_require_marketing),
):
    """
    Returns every customer account merged with their newsletter record.
    Customers who never subscribed still appear, with status='unsubscribed'.
    Row ids are never None — unsubscribed users get id = -user.id.
    """
    customers = (
        db.query(Users)
        .filter(Users.role == "customer")
        .order_by(Users.created_at.desc())
        .all()
    )

    emails  = [u.email for u in customers]
    subs    = db.query(Newsletters).filter(Newsletters.email.in_(emails)).all()
    sub_map = {s.email: s for s in subs}

    return [customer_row(u, sub_map.get(u.email)) for u in customers]


@router.get("/{newsletter_id}")
def get_newsletter(
    newsletter_id: int,
    db: Session = Depends(get_db),
    _: dict = Depends(_require_marketing),
):
    n = db.query(Newsletters).filter(Newsletters.id == newsletter_id).first()
    if not n:
        raise HTTPException(status_code=404, detail="Subscriber not found")
    return newsletter_dict(n)


@router.post("/", status_code=201)
def create_newsletter(
    body: NewsletterCreate,
    db:   Session = Depends(get_db),
    payload: dict = Depends(_require_customer),
):
    """
    A logged-in customer subscribes themselves.
    """
    user_name = payload.get("sub")
    if not user_name:
        raise HTTPException(status_code=401, detail="Invalid token payload.")

    db_user = db.query(Users).filter(Users.username == user_name).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User account not found.")

    if body.email.strip().lower() != db_user.email.lower():
        raise HTTPException(status_code=403, detail="Email does not match authenticated user.")

    existing = db.query(Newsletters).filter(
        Newsletters.email == db_user.email
    ).first()

    if existing:
        if existing.status == "subscribed":
            raise HTTPException(
                status_code=400,
                detail=f"Email '{db_user.email}' is already subscribed.",
            )
        existing.status = "subscribed"
        if body.tags:
            old_tags = set(existing.tags.split(",")) if existing.tags else set()
            existing.tags = ",".join(old_tags | set(body.tags))
        db.commit()
        db.refresh(existing)
        return newsletter_dict(existing)

    n = Newsletters(
        name   = user_name,
        email  = db_user.email,
        status = "subscribed",
        tags   = ",".join(body.tags) if body.tags else "",
    )
    db.add(n)
    db.commit()
    db.refresh(n)
    return newsletter_dict(n)


@router.put("/{record_id}")
def update_newsletter(
    record_id: int,
    data: NewsletterUpdate,
    db:   Session = Depends(get_db),
    _: dict = Depends(_require_marketing),
):
    """
    Update a subscriber record.

    FIXED: record_id may be either:
      - A real newsletter id  (positive)  → look up Newsletters directly.
      - A sentinel user id    (negative)  → the user has no newsletter row yet;
        create one so the tags/status update can be persisted.
    """
    if record_id > 0:
        # Normal case — real newsletter row
        n = db.query(Newsletters).filter(Newsletters.id == record_id).first()
        if not n:
            raise HTTPException(status_code=404, detail="Subscriber not found")
    else:
        # Sentinel: -user.id means this user has no newsletter row yet
        user_id = -record_id
        user = db.query(Users).filter(Users.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # Create the newsletter row on first edit
        n = Newsletters(
            name   = user.username,
            email  = user.email,
            status = "unsubscribed",
            tags   = "",
        )
        db.add(n)
        db.flush()   # assign n.id without committing yet

    updates = data.model_dump(exclude_unset=True)

    if "tags" in updates:
        updates["tags"] = ",".join(updates["tags"])

    for k, v in updates.items():
        setattr(n, k, v)

    db.commit()
    db.refresh(n)
    return newsletter_dict(n)


@router.delete("/{record_id}")
def delete_newsletter(
    record_id: int,
    db: Session = Depends(get_db),
    _: dict = Depends(_require_marketing),
):
    """
    FIXED: same sentinel logic as PUT.
    Deleting an unsubscribed user (no newsletter row) is a no-op — nothing to delete.
    """
    if record_id > 0:
        n = db.query(Newsletters).filter(Newsletters.id == record_id).first()
        if not n:
            raise HTTPException(status_code=404, detail="Subscriber not found")
        db.delete(n)
        db.commit()
    # else: negative id = user has no newsletter row — nothing to delete, return success

    return {"msg": "Subscriber removed successfully"}