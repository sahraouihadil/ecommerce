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
        "name":       n.name,
        "email":      n.email,
        "status":     n.status,
        "tags":       n.tags or "",
        "created_at": n.created_at.isoformat() if n.created_at else None,
    }


def customer_row(user: Users, newsletter: Optional[Newsletters]) -> dict:
    """
    Build the row the marketing dashboard table displays.
    Every customer appears here; status defaults to 'unsubscribed'
    until they actively subscribe.
    """
    return {
        # Use the newsletter id when it exists so edit/delete still work
        "id":         newsletter.id    if newsletter else None,
        "user_id":    user.id,
        "name":       user.username,
        "email":      user.email,
        "status":     newsletter.status     if newsletter else "unsubscribed",
        "tags":       newsletter.tags  or "" if newsletter else "",
        "created_at": (
            newsletter.created_at.isoformat()
            if newsletter and newsletter.created_at
            else user.created_at.isoformat() if user.created_at else None
        ),
    }


def _require_customer(payload: dict = Depends(verify_token)) -> dict:
    """Dependency: JWT must belong to a customer."""
    if payload.get("role") != "customer":
        raise HTTPException(
            status_code=403,
            detail="Only customers can subscribe to the newsletter.",
        )
    return payload


def _require_marketing(payload: dict = Depends(verify_token)) -> dict:
    """Dependency: JWT must belong to a marketing_manager or admin."""
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
    """
    customers = (
        db.query(Users)
        .filter(Users.role == "customer")
        .order_by(Users.created_at.desc())
        .all()
    )

    # Build a lookup: email → Newsletters row
    emails = [u.email for u in customers]
    subs   = db.query(Newsletters).filter(Newsletters.email.in_(emails)).all()
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
    - We use the email from the JWT (via the Users table) so they
      cannot subscribe on behalf of someone else.
    - If they are already subscribed, we re-activate them instead of
      returning an error (better UX).
    """
    user_name = payload.get("sub")          # "sub" holds the email in your JWT
    if not user_name:
        raise HTTPException(status_code=401, detail="Invalid token payload.")

    # Fetch the actual user record so we always use the DB email
    db_user = db.query(Users).filter(Users.username == user_name).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User account not found.")

    if body.email.strip().lower() != db_user.email.lower():
        raise HTTPException(status_code=403,detail="Email does not match authenticated user.")

    existing = db.query(Newsletters).filter(
        Newsletters.email == db_user.email
    ).first()

    if existing:
        if existing.status == "subscribed":
            raise HTTPException(
                status_code=400,
                detail=f"Email '{db_user.email}' is already subscribed.",
            )
        # Was unsubscribed — re-activate
        existing.status = "subscribed"
        # Optionally merge new tags without overwriting old ones
        if body.tags:
            old_tags = set(existing.tags.split(",")) if existing.tags else set()
            existing.tags = ",".join(old_tags | set(body.tags))
        db.commit()
        db.refresh(existing)
        return newsletter_dict(existing)
        print("name : ",user_name)
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


@router.put("/{newsletter_id}")
def update_newsletter(
    newsletter_id: int,
    data: NewsletterUpdate,
    db:   Session = Depends(get_db),
    _: dict = Depends(_require_marketing),
):
    n = db.query(Newsletters).filter(Newsletters.id == newsletter_id).first()
    if not n:
        raise HTTPException(status_code=404, detail="Subscriber not found")

    updates = data.model_dump(exclude_unset=True)
    
    if "tags" in updates:
        updates["tags"] = ",".join(updates["tags"])

    for k, v in updates.items():
        setattr(n, k, v)

    db.commit()
    db.refresh(n)
    return newsletter_dict(n)


@router.delete("/{newsletter_id}")
def delete_newsletter(
    newsletter_id: int,
    db: Session = Depends(get_db),
    _: dict = Depends(_require_marketing),
):
    n = db.query(Newsletters).filter(Newsletters.id == newsletter_id).first()
    if not n:
        raise HTTPException(status_code=404, detail="Subscriber not found")
    db.delete(n)
    db.commit()
    return {"msg": "Subscriber removed successfully"}