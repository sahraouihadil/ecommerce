from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime
from pydantic import BaseModel
from models import Blogs
from database import get_db
from schema import BlogCreate,BlogUpdate

router = APIRouter(prefix="/api/blogs", tags=["Blogs"])



# ======================================================================
# SERIALIZER
# ======================================================================

def blog_dict(b: Blogs) -> dict:
    return {
        "id":       b.id,
        "title":    b.title,
        "image":    b.image,
        "tag":      b.tag,
        "category": b.category,
        "body":     b.content,        # frontend reads "body"
        "excerpt":  b.excerpt,
        "readTime": "5 min read",
        "date":     (b.created_at).isoformat() if (b.created_at) else None,
        "author":   b.author,
        "views":    b.views or 0,
        "status":   b.status,
    }


# ======================================================================
# ROUTES
# ======================================================================

@router.get("/")
def list_blogs(db: Session = Depends(get_db)):
    """Returns all blog posts ordered newest first."""
    blogs = db.query(Blogs).order_by(Blogs.created_at.desc()).all()
    return [blog_dict(b) for b in blogs]


@router.get("/{blog_id}")
def get_blog(blog_id: int, db: Session = Depends(get_db)):
    """Returns a single blog post by ID."""
    b = db.query(Blogs).filter(Blogs.id == blog_id).first()
    if not b:
        raise HTTPException(status_code=404, detail="Blog post not found")
    return blog_dict(b)


@router.post("/", status_code=201)
def create_blog(body: BlogCreate, db: Session = Depends(get_db)):
    """
    Creates a new blog post.
    Sets created_at automatically when status is 'published'.
    """
    data = body.model_dump()

    # Auto-set created_at when publishing
    created_at = datetime.utcnow() if data.get("status") == "published" else None

    b = Blogs(
        title        = data["title"],
        excerpt      = data["excerpt"],
        category     = data["category"],
        status       = data["status"],
        author       = data["author"],
        image        = data.get("image"),
        tag          = data.get("tag"),
        content      = data.get("content"),
        views        = 0,
        created_at = created_at,
    )
    db.add(b)
    db.commit()
    db.refresh(b)
    return blog_dict(b)


@router.put("/{blog_id}")
def update_blog(blog_id: int, data: BlogUpdate, db: Session = Depends(get_db)):
    """
    Updates an existing blog post.
    If status changes to 'published' and created_at isn't set yet, sets it now.
    """
    b = db.query(Blogs).filter(Blogs.id == blog_id).first()
    if not b:
        raise HTTPException(status_code=404, detail="Blog post not found")

    updates = data.model_dump(exclude_unset=True)

    for k, v in updates.items():
        setattr(b, k, v)

    # Auto-set created_at when first publishing
    if updates.get("status") == "published" and not b.created_at:
        b.created_at = datetime.utcnow()

    db.commit()
    db.refresh(b)
    return blog_dict(b)


@router.delete("/{blog_id}")
def delete_blog(blog_id: int, db: Session = Depends(get_db)):
    """Permanently deletes a blog post."""
    b = db.query(Blogs).filter(Blogs.id == blog_id).first()
    if not b:
        raise HTTPException(status_code=404, detail="Blog post not found")
    db.delete(b)
    db.commit()
    return {"msg": "Blog post deleted successfully"}