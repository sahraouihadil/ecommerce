from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from models import Newsletters
from schema import NewsletterCreate, NewsletterUpdate
from database import get_db

router = APIRouter(prefix="/newsletters", tags=["Newsletters"])


@router.get("/")
def list_newsletters(db: Session = Depends(get_db)):
    newsletters = db.query(Newsletters).all()
    return [
        {
            "id": n.id,
            "name": n.name,
            "email": n.email,
            "status": n.status,
            "tags": n.tags,
            "created_at": n.created_at,
        }
        for n in newsletters
    ]


@router.post("/")
def create_newsletter(body: NewsletterCreate, db: Session = Depends(get_db)):  # ← Pydantic in
    data = body.model_dump()
    data["tags"] = ",".join(data.get("tags", []))           # ← tags is stored as a string in the DB
    newsletter = Newsletters(**data)
    db.add(newsletter)
    db.commit()
    db.refresh(newsletter)
    return {
        "id": newsletter.id,
        "name": newsletter.name,
        "email": newsletter.email,
        "status": newsletter.status,
        "tags": newsletter.tags,
        "created_at": newsletter.created_at,
    }


@router.put("/{newsletter_id}")
def update_newsletter(newsletter_id: int, data: NewsletterUpdate, db: Session = Depends(get_db)):
    newsletter = db.query(Newsletters).filter(Newsletters.id == newsletter_id).first()
    if not newsletter:
        raise HTTPException(404, "Newsletter not found")

    update_data = data.model_dump(exclude_unset=True)
    if "tags" in update_data:
        update_data["tags"] = ",".join(update_data["tags"])  # ← same conversion on update

    for k, v in update_data.items():
        setattr(newsletter, k, v)

    db.commit()
    db.refresh(newsletter)
    return {
        "id": newsletter.id,
        "name": newsletter.name,
        "email": newsletter.email,
        "status": newsletter.status,
        "tags": newsletter.tags,
        "created_at": newsletter.created_at,
    }


@router.delete("/{newsletter_id}")
def delete_newsletter(newsletter_id: int, db: Session = Depends(get_db)):
    newsletter = db.query(Newsletters).filter(Newsletters.id == newsletter_id).first()
    if not newsletter:
        raise HTTPException(404, "Newsletter not found")

    db.delete(newsletter)
    db.commit()
    return {"msg": "Deleted"}