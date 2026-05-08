"""
blog_router.py  –  FastAPI router for Blog Posts
Validation flow
───────────────
  CREATE  →  blog saved as status="draft"  →  ValidationRequest submitted (Blogs)
             Admin approves  →  validation_crud._activate_item sets status="published"
             Admin rejects   →  validation_crud._deactivate_item sets status="draft"

  UPDATE  →  blog updated in-place (no re-validation trigger; admin edits go live directly)
             If you want re-validation on every edit, call upsert_for_validation here too.

  DELETE  →  direct hard-delete (no validation gate; add Blogs_Delete if needed later)
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
def create_blog(
    body:    BlogCreate,
    db:      Session = Depends(get_db),
    # Uncomment the line below once you wire up auth on this route:
    # current_user: dict = Depends(get_current_user),
):
    """
    Creates a new blog post and submits it for admin validation.

    The blog is always saved with status='draft' regardless of what the
    caller sends.  Once an admin approves the ValidationRequest, the
    validation_crud._activate_item helper automatically flips the status
    to 'published'.

    Response includes a 'validation_status' key so the frontend can inform
    the author that the post is awaiting review.
    """
    data = body.model_dump()

    # Always start as draft — publishing happens via admin approval
    b = Blogs(
        title      = data["title"],
        excerpt    = data["excerpt"],
        category   = data["category"],
        status     = "draft",           # ← enforced regardless of payload
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

    # Submit to the validation queue
    try:
        validation_crud.upsert_for_validation(
            db           = db,
            payload      = ValidationSubmit(
                item_type = "Blogs",
                item_id   = b.id,
                title     = b.title,
            ),
            # submitted_by = current_user["id"],  # uncomment with auth
        )
    except ValueError:
        # Already pending — harmless, swallow silently
        pass

    result = blog_dict(b)
    result["validation_status"] = "pending"   # extra field for the UI
    return result


@router.put("/{blog_id}")
def update_blog(
    blog_id: int,
    data:    BlogUpdate,
    db:      Session = Depends(get_db),
):
    """
    Updates an existing blog post in-place.

    This does NOT trigger a new validation request by default.  If you want
    every edit to go back through admin review, uncomment the
    upsert_for_validation block below and set status back to 'draft'.
    """
    b = db.query(Blogs).filter(Blogs.id == blog_id).first()
    if not b:
        raise HTTPException(status_code=404, detail="Blog post not found")

    updates = data.model_dump(exclude_unset=True)
    for k, v in updates.items():
        setattr(b, k, v)

    # Auto-set created_at when first publishing (e.g. admin edits directly)
    if updates.get("status") == "published" and not b.created_at:
        b.created_at = datetime.utcnow()

    db.commit()
    db.refresh(b)

    # ── Optional: re-validate on every edit ──────────────────────────────
    # Uncomment the block below to send the post back to admin review
    # every time it is edited.
    #
    # b.status = "draft"
    # db.commit()
    # db.refresh(b)
    # try:
    #     validation_crud.upsert_for_validation(
    #         db      = db,
    #         payload = ValidationSubmit(
    #             item_type = "Blogs",
    #             item_id   = b.id,
    #             title     = b.title,
    #         ),
    #     )
    # except ValueError:
    #     pass
    # ─────────────────────────────────────────────────────────────────────

    return blog_dict(b)


@router.delete("/{blog_id}")
def delete_blog(blog_id: int, db: Session = Depends(get_db)):
    """Permanently deletes a blog post and its pending validation request (if any)."""
    b = db.query(Blogs).filter(Blogs.id == blog_id).first()
    if not b:
        raise HTTPException(status_code=404, detail="Blog post not found")

    # Clean up any pending/existing validation rows for this blog
    from models import ValidationRequest
    db.query(ValidationRequest).filter(
        ValidationRequest.item_type == "Blogs",
        ValidationRequest.item_id   == blog_id,
    ).delete(synchronize_session=False)

    db.delete(b)
    db.commit()
    return {"msg": "Blog post deleted successfully"}