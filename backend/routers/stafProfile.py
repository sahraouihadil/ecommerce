"""
staff_profile.py  –  Backend for AProfilePage.jsx
==================================================
Serves every field the profile page renders for staff roles
(Admin, Marketing Manager, Stock Manager, Deliveryman).

Mount in main.py:
    from staff_profile import router as staff_profile_router
    app.include_router(staff_profile_router)

Endpoints
---------
GET  /api/staff/profile          → full profile payload
PUT  /api/staff/profile          → update username / email / phone / avatar
POST /api/staff/profile/signout  → placeholder — invalidate all sessions
"""

import os, shutil, uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import Optional

from database import get_db
from models import Users, Notifications, Orders, Campaigns, Newsletters, Blogs
from security.jwt_handler import verify_token

router = APIRouter(prefix="/api/staff", tags=["staff-profile"])

AVATAR_DIR = "static/avatars"
os.makedirs(AVATAR_DIR, exist_ok=True)


# ── helpers ───────────────────────────────────────────────────────────────────

def _get_user(db: Session, user_id: int) -> Users:
    user = db.query(Users).filter(Users.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


def _format_dt(dt: datetime | None) -> str | None:
    """'Jan 2022' for member-since, ISO string for last-login."""
    return dt.strftime("%b %Y") if dt else None


def _recent_activity(db: Session, user_id: int, role: str) -> list[dict]:
    """
    Pull the 5 most recent notifications scoped to this user's role.
    Falls back to an empty list if the notifications table has no rows yet.
    """
    rows = (
        db.query(Notifications)
        .filter(Notifications.role == role)
        .order_by(Notifications.created_at.desc())
        .limit(5)
        .all()
    )

    def _age(dt: datetime) -> str:
        delta = datetime.utcnow() - dt
        if delta.days >= 1:
            return f"{delta.days} day{'s' if delta.days > 1 else ''} ago"
        hours = delta.seconds // 3600
        if hours >= 1:
            return f"{hours} hour{'s' if hours > 1 else ''} ago"
        minutes = delta.seconds // 60
        return f"{minutes} minute{'s' if minutes > 1 else ''} ago"

    return [
        {
            "id":       n.id,
            "message":  n.message,
            "is_read":  n.is_read,
            "time":     _age(n.created_at),
            "order_id": n.order_id,
        }
        for n in rows
    ]


def _role_stats(db: Session, role: str) -> dict:
    """
    Return lightweight role-specific counters shown in the profile header grid.
    Shown fields: Role, Member Since (handled above), Last Login, Sessions.
    We add a bonus 'activity_count' so the UI can optionally display it.
    """
    stats: dict = {}

    if role in ("admin", "super_admin"):
        stats["total_users"]    = db.query(Users).count()
        stats["open_campaigns"] = db.query(Campaigns).filter(Campaigns.status == "active").count()

    elif role == "marketing_manager":
        stats["active_campaigns"]  = db.query(Campaigns).filter(Campaigns.status == "active").count()
        stats["newsletter_subs"]   = db.query(Newsletters).filter(Newsletters.status == "subscribed").count()
        stats["published_blogs"]   = db.query(Blogs).filter(Blogs.status == "published").count()

    elif role == "stock_manager":
        from models import Products
        stats["total_products"] = db.query(Products).count()
        stats["ar_enabled"]     = db.query(Products).filter(Products.able_ar == True).count()

    elif role == "deliveryman":
        stats["delivered_orders"] = (
            db.query(Orders)
            .filter(Orders.status == "delivered")
            .count()
        )
        stats["pending_orders"] = (
            db.query(Orders)
            .filter(Orders.status == "pending")
            .count()
        )

    return stats


# ── GET /api/staff/profile ────────────────────────────────────────────────────

@router.get("/profile")
def get_staff_profile(
    db:      Session = Depends(get_db),
    payload: dict    = Depends(verify_token),
):
    user_id = payload.get("id")
    user    = _get_user(db, user_id)

    role_str = user.role.value if hasattr(user.role, "value") else str(user.role)

    return {
        # ── identity ──────────────────────────────────────────────
        "id":         user.id,
        "username":   user.username,
        "email":      user.email,
        "phone":      user.phone_num,
        "avatar_url": user.avatar_url,
        "role":       role_str,
        "is_active":  user.active,

        # ── header grid ───────────────────────────────────────────
        "member_since": _format_dt(user.created_at),   # "Jan 2022"
        "last_login":   user.last or "Just now",        # stored as string in your model

        # ── contact card ──────────────────────────────────────────
        "contact": {
            "email":    user.email,
            "phone":    user.phone_num   or "—",
            "location": "—",            # no location column on Users; extend if needed
            "timezone": "UTC+1 (CET)",  # static — add a column when required
        },

        # ── role-specific counters ────────────────────────────────
        "role_stats": _role_stats(db, role_str),

        # ── recent activity (last 5 notifications for this role) ──
        "recent_activity": _recent_activity(db, user_id, role_str),
    }


# ── PUT /api/staff/profile ────────────────────────────────────────────────────

@router.put("/profile")
def update_staff_profile(
    db:       Session  = Depends(get_db),
    payload:  dict     = Depends(verify_token),
    username: Optional[str]        = Form(None),
    email:    Optional[str]        = Form(None),
    phone:    Optional[str]        = Form(None),
    avatar:   Optional[UploadFile] = File(None),
):
    user_id = payload.get("id")
    user    = _get_user(db, user_id)

    if username:
        # Check uniqueness
        clash = db.query(Users).filter(Users.username == username, Users.id != user_id).first()
        if clash:
            raise HTTPException(status_code=409, detail="Username already taken")
        user.username = username

    if email:
        clash = db.query(Users).filter(Users.email == email, Users.id != user_id).first()
        if clash:
            raise HTTPException(status_code=409, detail="Email already in use")
        user.email = email

    if phone:
        user.phone_num = phone

    if avatar and avatar.filename:
        if not avatar.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="File must be an image")

        # Remove old avatar file if it exists on disk
        if user.avatar_url:
            old_path = user.avatar_url
            if os.path.exists(old_path):
                os.remove(old_path)

        ext      = os.path.splitext(avatar.filename)[-1] or ".jpg"
        filename = f"{uuid.uuid4().hex}{ext}"
        filepath = os.path.join(AVATAR_DIR, filename)

        with open(filepath, "wb") as f:
            shutil.copyfileobj(avatar.file, f)

        user.avatar_url = f"static/avatars/{filename}"

    db.commit()
    db.refresh(user)

    return {
        "message": "Profile updated successfully",
        "user": {
            "id":         user.id,
            "username":   user.username,
            "email":      user.email,
            "phone":      user.phone_num,
            "avatar_url": user.avatar_url,
        },
    }


# ── POST /api/staff/profile/signout ──────────────────────────────────────────

@router.post("/profile/signout")
def signout_all_devices(
    payload: dict    = Depends(verify_token),
    db:      Session = Depends(get_db),
):
    """
    If you implement a token-blacklist / session table later, invalidate all
    tokens for this user here.  For now it returns a success response that
    the frontend can use to clear localStorage and redirect to /login.
    """
    user_id = payload.get("id")
    user    = _get_user(db, user_id)

    # TODO: insert user_id into a token_blacklist table when ready
    return {"message": f"All sessions for '{user.username}' have been signed out"}


# ── DELETE /api/staff/profile (deactivate) ────────────────────────────────────

@router.delete("/profile")
def deactivate_account(
    payload: dict    = Depends(verify_token),
    db:      Session = Depends(get_db),
):
    """Soft-delete: sets active = False. Account can be reactivated by admin."""
    user_id = payload.get("id")
    user    = _get_user(db, user_id)

    if not user.active:
        raise HTTPException(status_code=400, detail="Account is already deactivated")

    user.active = False
    db.commit()

    return {"message": "Account deactivated successfully"}