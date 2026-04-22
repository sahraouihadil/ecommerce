from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from models import Blogs
from schema import BlogCreate, BlogUpdate
from database import get_db

router = APIRouter(prefix="/blogs", tags=["Blogs"])

def blog_dict(b):
    return {
        "id": b.id,
        "title": b.title,
        "category": b.category,
        "content": b.content,
        "excerpt": b.excerpt,
        "author": b.author,
        "views": b.views,
        "status": b.status,
        "published_at": b.published_at,
        "created_at": b.created_at,
    }

@router.get("/")
def list_blogs(db: Session = Depends(get_db)):
    return [blog_dict(b) for b in db.query(Blogs).all()]

@router.post("/")
def create_blog(body: BlogCreate, db: Session = Depends(get_db)):
    b = Blogs(**body.model_dump())
    db.add(b)
    db.commit()
    db.refresh(b)
    return blog_dict(b)

@router.put("/{blog_id}")
def update_blog(blog_id: int, data: BlogUpdate, db: Session = Depends(get_db)):
    b = db.query(Blogs).filter(Blogs.id == blog_id).first()
    if not b:
        raise HTTPException(404, "Blog not found")
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(b, k, v)
    db.commit()
    db.refresh(b)
    return blog_dict(b)

@router.delete("/{blog_id}")
def delete_blog(blog_id: int, db: Session = Depends(get_db)):
    b = db.query(Blogs).filter(Blogs.id == blog_id).first()
    if not b:
        raise HTTPException(404, "Blog not found")
    db.delete(b)
    db.commit()
    return {"msg": "Deleted"}