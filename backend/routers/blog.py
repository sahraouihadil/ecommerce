"""
blog_router.py  –  FastAPI router for Blog Posts

Validation flow
───────────────
  CREATE  →  blog saved as status="draft"
             ValidationRequest (Blogs) submitted → pending admin review
             Admin approves  → _activate_item sets status="published" + sets created_at
             Admin rejects   → _deactivate_item keeps status="draft"

  UPDATE  →  blog fields updated in-place, status reset to "draft"
             New ValidationRequest (Blogs) upserted → pending admin review
             Admin approves  → _activate_item sets status="published"
             Admin rejects   → _deactivate_item sets status="draft"

  DELETE  →  ValidationRequest (Blogs_Delete) submitted → pending admin review
             Blog is NOT deleted yet; it stays as-is until admin decides
             Admin approves  → _activate_item hard-deletes the blog
             Admin rejects   → _deactivate_item does nothing (blog stays)
"""

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from datetime import datetime

from models import Blogs
from database import get_db
from schema import BlogCreate, BlogUpdate, ValidationSubmit
import validation_crud

router = APIRouter(prefix="/api/blogs", tags=["Blogs"])


# ── Serializer ────────────────────────────────────────────────────────────────

def blog_dict(b: Blogs) -> dict:
    return {
        "id":       b.id,
        "title":    b.title,
        "image":    b.image,
        "tag":      b.tag,
        "category": b.category,
        "body":     b.content,          # frontend reads "body"
        "excerpt":  b.excerpt,
        "readTime": "5 min read",
        "date":     b.created_at.isoformat() if b.created_at else None,
        "author":   b.author,
        "views":    b.views or 0,
        "status":   b.status,
    }


# ── Routes ────────────────────────────────────────────────────────────────────

@router.get("/")
def list_blogs(db: Session = Depends(get_db)):
    """
    Returns all blog posts ordered newest first.
    The marketing-manager dashboard calls this to show ALL posts (draft + published).
    The public Journal page should call /published instead.
    """
    blogs = db.query(Blogs).order_by(Blogs.created_at.desc()).all()
    return [blog_dict(b) for b in blogs]


@router.get("/published")
def list_published_blogs(db: Session = Depends(get_db)):
    """
    Returns only published blog posts, ordered newest first.
    Used by the public-facing Journal page — draft / pending posts are hidden.
    """
    blogs = (
        db.query(Blogs)
        .filter(Blogs.status == "published")
        .order_by(Blogs.created_at.desc())
        .all()
    )
    return [blog_dict(b) for b in blogs]


@router.get("/{blog_id}")
def get_blog(blog_id: int, db: Session = Depends(get_db)):
    """Returns a single blog post by ID."""
    b = db.query(Blogs).filter(Blogs.id == blog_id).first()
    if not b:
        raise HTTPException(status_code=404, detail="Blog post not found")
    return blog_dict(b)


@router.post("/", status_code=201)
def create_blog(
    body: BlogCreate,
    db:   Session = Depends(get_db),
    # current_user: dict = Depends(get_current_user),   # ← uncomment with auth
):
    """
    Creates a new blog post and submits it for admin validation.

    The blog is always saved with status='draft'.  Once an admin approves
    the ValidationRequest the helper _activate_item sets status='published'
    and stamps created_at.

    Response includes a 'validation_status' key so the frontend can inform
    the author that the post is awaiting review.
    """
    data = body.model_dump()

    b = Blogs(
        title      = data["title"],
        excerpt    = data["excerpt"],
        category   = data["category"],
        status     = "draft",           # always start as draft
        author     = data["author"],
        image      = data.get("image"),
        tag        = data.get("tag"),
        content    = data.get("content"),
        views      = 0,
        created_at = None,              # set by _activate_item on approval
    )
    db.add(b)
    db.commit()
    db.refresh(b)

    try:
        validation_crud.upsert_for_validation(
            db      = db,
            payload = ValidationSubmit(
                item_type = "Blogs",
                item_id   = b.id,
                title     = b.title,
            ),
            # submitted_by = current_user["id"],
        )
    except ValueError:
        pass   # already pending — harmless

    result = blog_dict(b)
    result["validation_status"] = "pending"
    return result


@router.put("/{blog_id}")
def update_blog(
    blog_id: int,
    data:    BlogUpdate,
    db:      Session = Depends(get_db),
    # current_user: dict = Depends(get_current_user),
):
    """
    Updates an existing blog post in-place, then resets it to 'draft' and
    submits a new validation request so an admin must re-approve before the
    changes go live on the Journal.

    Response includes a 'validation_status' key ('pending') so the frontend
    can immediately reflect the awaiting-review state.
    """
    b = db.query(Blogs).filter(Blogs.id == blog_id).first()
    if not b:
        raise HTTPException(status_code=404, detail="Blog post not found")

    # Check if there's already a pending delete request for this blog
    from models import ValidationRequest
    pending_delete = (
        db.query(ValidationRequest)
        .filter(
            ValidationRequest.item_type == "Blogs_Delete",
            ValidationRequest.item_id   == blog_id,
            ValidationRequest.status    == "Pending",
        )
        .first()
    )
    if pending_delete:
        raise HTTPException(
            status_code=409,
            detail="Cannot edit this blog post — a deletion request is currently pending admin approval.",
        )

    updates = data.model_dump(exclude_unset=True)
    for k, v in updates.items():
        setattr(b, k, v)

    # Always reset to draft after an edit — re-validation required
    b.status = "draft"
    db.commit()
    db.refresh(b)

    # Upsert the validation request (resets if one already exists)
    try:
        validation_crud.upsert_for_validation(
            db      = db,
            payload = ValidationSubmit(
                item_type = "Blogs",
                item_id   = b.id,
                title     = b.title,
            ),
            # submitted_by = current_user["id"],
        )
    except ValueError:
        pass

    result = blog_dict(b)
    result["validation_status"] = "pending"
    return result


@router.delete("/{blog_id}", status_code=202)
def delete_blog(
    blog_id: int,
    db:      Session = Depends(get_db),
    # current_user: dict = Depends(get_current_user),
):
    """
    Submits a deletion request for admin approval instead of immediately
    deleting the blog.  The blog remains in the database (with its current
    status) until an admin approves or rejects the request.

    Returns HTTP 202 Accepted with a 'validation_status': 'pending' payload.
    """
    b = db.query(Blogs).filter(Blogs.id == blog_id).first()
    if not b:
        raise HTTPException(status_code=404, detail="Blog post not found")

    # Don't allow a second delete request if one is already pending
    try:
        validation_crud.submit_blog_delete_request(
            db           = db,
            blog_id      = blog_id,
            blog_title   = b.title,
            # submitted_by = current_user["id"],
        )
    except ValueError as exc:
        raise HTTPException(status_code=409, detail=str(exc))

    return {
        "msg":               "Deletion request submitted for admin review.",
        "blog_id":           blog_id,
        "validation_status": "pending",
    }