from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import Optional, List
from pydantic import BaseModel, field_validator, EmailStr
from models import Newsletters
from database import get_db
from schema import NewsletterCreate,NewsletterUpdate

router = APIRouter(prefix="/api/newsletters", tags=["Newsletters"])

# ======================================================================
# SERIALIZER
# ======================================================================

def newsletter_dict(n: Newsletters) -> dict:
    return {
        "id":         n.id,
        "name":       n.name,
        "email":      n.email,
        "status":     n.status,
        # Always return tags as a plain string so the frontend .split(',') works
        "tags":       n.tags or "",
        "created_at": n.created_at.isoformat() if n.created_at else None,
    }


# ======================================================================
# ROUTES
# ======================================================================

@router.get("/")
def list_newsletters(db: Session = Depends(get_db)):
    """Returns all subscribers ordered newest first."""
    rows = db.query(Newsletters).order_by(Newsletters.created_at.desc()).all()
    return [newsletter_dict(n) for n in rows]


@router.get("/{newsletter_id}")
def get_newsletter(newsletter_id: int, db: Session = Depends(get_db)):
    n = db.query(Newsletters).filter(Newsletters.id == newsletter_id).first()
    if not n:
        raise HTTPException(status_code=404, detail="Subscriber not found")
    return newsletter_dict(n)


@router.post("/", status_code=201)
def create_newsletter(body: NewsletterCreate, db: Session = Depends(get_db)):
    # Prevent duplicate emails
    existing = db.query(Newsletters).filter(Newsletters.email == body.email).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Email '{body.email}' is already subscribed.")

    n = Newsletters(
        name   = body.name.strip(),
        email  = body.email,
        status = body.status,
        tags   = ",".join(body.tags),   # stored as comma-separated string in DB
    )
    db.add(n)
    db.commit()
    db.refresh(n)
    return newsletter_dict(n)


@router.put("/{newsletter_id}")
def update_newsletter(newsletter_id: int, data: NewsletterUpdate, db: Session = Depends(get_db)):
    n = db.query(Newsletters).filter(Newsletters.id == newsletter_id).first()
    if not n:
        raise HTTPException(status_code=404, detail="Subscriber not found")

    updates = data.model_dump(exclude_unset=True)

    # Check email uniqueness if email is being changed
    if "email" in updates and updates["email"] != n.email:
        conflict = db.query(Newsletters).filter(
            Newsletters.email == updates["email"],
            Newsletters.id    != newsletter_id,
        ).first()
        if conflict:
            raise HTTPException(status_code=400, detail=f"Email '{updates['email']}' is already in use.")

    # Convert tags list → comma-separated string for DB storage
    if "tags" in updates:
        updates["tags"] = ",".join(updates["tags"])

    for k, v in updates.items():
        setattr(n, k, v)

    db.commit()
    db.refresh(n)
    return newsletter_dict(n)


@router.delete("/{newsletter_id}")
def delete_newsletter(newsletter_id: int, db: Session = Depends(get_db)):
    n = db.query(Newsletters).filter(Newsletters.id == newsletter_id).first()
    if not n:
        raise HTTPException(status_code=404, detail="Subscriber not found")
    db.delete(n)
    db.commit()
    return {"msg": "Subscriber removed successfully"}