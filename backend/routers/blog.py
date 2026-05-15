"""
blog_router.py  –  FastAPI router for Blog Posts

Validation flow
───────────────
  CREATE (status="draft")
             → blog saved as status="draft", NO validation request submitted.
               The manager can edit and re-submit later.

  CREATE (status="published")
             → blog saved as status="draft" (pending approval)
               ValidationRequest (Blogs) submitted → pending admin review
               Admin approves  → _activate_item sets status="published" + sets created_at
               Admin rejects   → _deactivate_item keeps status="draft"

  UPDATE (status="draft")
             → blog fields updated in-place, status kept/set to "draft".
               Any existing Pending validation request is cancelled (reset to
               Rejected) so the admin queue is not polluted.
               No new validation request is submitted.

  UPDATE (status="published")
             → blog fields updated in-place, status reset to "draft"
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

from models import Blogs, ValidationRequest
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
    Creates a new blog post.

    - status="draft"     → saved as draft, NO validation request submitted.
    - status="published" → saved as draft (pending approval), validation
                           request submitted to admin queue.

    Response includes a 'validation_status' key:
      - "pending" when submitted for review
      - "draft"   when saved as draft with no review request
    """
    data = body.model_dump()
    wants_publish = data.get("status") == "published"

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

    validation_status = "draft"

    if wants_publish:
        # Only submit for admin review when the manager explicitly chose "published"
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
            validation_status = "pending"
        except ValueError:
            pass   # already pending — harmless

    result = blog_dict(b)
    result["validation_status"] = validation_status
    return result


@router.put("/{blog_id}")
def update_blog(
    blog_id: int,
    data:    BlogUpdate,
    db:      Session = Depends(get_db),
    # current_user: dict = Depends(get_current_user),
):
    """
    Updates an existing blog post in-place.

    - status="draft"     → saved as draft, any existing pending validation
                           request is withdrawn (reset), no new request submitted.
    - status="published" → reset to draft, new validation request upserted
                           so an admin must re-approve before changes go live.

    Response includes a 'validation_status' key ('pending' or 'draft').
    """
    b = db.query(Blogs).filter(Blogs.id == blog_id).first()
    if not b:
        raise HTTPException(status_code=404, detail="Blog post not found")

    # Check if there's already a pending delete request for this blog
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
    wants_publish = updates.get("status") == "published"

    for k, v in updates.items():
        setattr(b, k, v)

    # Always store as draft — published state is only granted by admin approval
    b.status = "draft"
    db.commit()
    db.refresh(b)

    validation_status = "draft"

    if wants_publish:
        # Submit / reset a validation request for admin review
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
            validation_status = "pending"
        except ValueError:
            pass
    else:
        # Manager saved as draft — withdraw any existing pending validation
        # request so it doesn't sit in the admin queue unnecessarily.
        existing_pending = (
            db.query(ValidationRequest)
            .filter(
                ValidationRequest.item_type == "Blogs",
                ValidationRequest.item_id   == blog_id,
                ValidationRequest.status    == "Pending",
            )
            .first()
        )
        if existing_pending:
            existing_pending.status         = "Rejected"
            existing_pending.rejection_note = "Withdrawn by author (saved as draft)."
            existing_pending.reviewed_at    = datetime.utcnow()
            db.commit()

    result = blog_dict(b)
    result["validation_status"] = validation_status
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