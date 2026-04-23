"""
profile.py - User Profile & Order History
==========================================
  GET /profile              → User info + stats (orders, favorites, points, tier)
  GET /api/orders/history   → Paginated order history (delivered + canceled only)

All endpoints require authentication via verify_token.

POINTS: 1 pt per 1000 DA spent on Delivered orders
TIERS:  Bronze (0-499) · Silver (500-999) · Gold (1000-1999) · Platinum (2000+)
"""

import os, shutil, uuid
from fastapi import APIRouter, Depends, HTTPException, Body, UploadFile, File, Form
from typing import Optional
from sqlalchemy.orm import Session, joinedload
from database import get_db
from models import Users, Orders, OrderItems, Favorites, Products
from security.jwt_handler import verify_token

router = APIRouter(prefix="/api/profile", tags=["profile"], redirect_slashes=False)

AVATAR_DIR = "static/avatars"
os.makedirs(AVATAR_DIR, exist_ok=True)

# ── Tier config ───────────────────────────────────────────────────

TIERS = [
    {"name": "Bronze",   "min": 0,    "max": 499,  "color": "#b87333"},
    {"name": "Silver",   "min": 500,  "max": 999,  "color": "#9e9e9e"},
    {"name": "Gold",     "min": 1000, "max": 1999, "color": "#D97706"},
    {"name": "Platinum", "min": 2000, "max": None, "color": "#5c4a3a"},
]

def get_tier(points: int) -> dict:
    return next((t for t in reversed(TIERS) if points >= t["min"]), TIERS[0])

def calc_points(orders: list) -> int:
    return sum(int(float(o.totalamount) / 1000) for o in orders)

def get_user_or_401(db: Session, user_id: int) -> Users:
    user = db.query(Users).filter(Users.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


# ── GET /profile ──────────────────────────────────────────────────

@router.get("")
def get_profile(
    db: Session = Depends(get_db),
    payload: dict = Depends(verify_token),
):
    user_id = payload.get("id")
    user = get_user_or_401(db, user_id)

    orders = db.query(Orders)\
        .options(
            joinedload(Orders.items)
            .joinedload(OrderItems.product)
            .joinedload(Products.images)
        )\
        .filter(Orders.user_id == user_id)\
        .order_by(Orders.id.desc())\
        .all()

    favorites = db.query(Favorites)\
        .options(
            joinedload(Favorites.product)
            .joinedload(Products.images)
        )\
        .filter(Favorites.user_id == user_id)\
        .all()

    delivered_orders = [o for o in orders if o.status == "delivered"]
    points    = calc_points(delivered_orders)
    tier      = get_tier(points)
    next_tier = next((t for t in TIERS if t["min"] > points), None)

    progress = (
        min(100, round(( points*100 /2000)))
        if next_tier else 100
    )

    return {
        "id":         user.id,
        "username":   user.username,
        "email":      user.email,
        "phone":      getattr(user, "phone_num", None),
        "avatar_url": getattr(user, "avatar_url", None),
        "role":       getattr(user, "role", None),

        "stats": {
            "points":       points,
            "tier":         tier,
            "next_tier":    next_tier,
            "progress_pct": progress,
        },

        "orders": [
            {
                "id":          o.id,
                "status":      o.status,
                "total_price": o.totalamount,
                "created_at":  o.orderdate,
                "items": [
                    {
                        "id":         item.id,
                        "product_id": item.product_id,
                        "quantity":   item.quantity,
                        "price":      item.price,
                        "status":     o.status,
                        "product": {
                            "id":    item.product.id,
                            "name":  item.product.name,
                            "image": (
                                item.product.images[0].image_url
                                if item.product.images else None
                            ),
                        } if item.product else None,
                    }
                    for item in o.items
                ],
            }
            for o in orders
        ],

        "favorites": [
            {
                "id":         f.id,
                "product_id": f.product_id,
                "name":       f.product.name,
                "price":      f.product.price,
                "image":      (
                    f.product.images[0].image_url
                    if f.product.images else None
                ),
            }
            for f in favorites
        ],
    }


# ── PUT /profile — multipart: fields + optional avatar file ───────

@router.put("")
def update_profile(
    db:       Session  = Depends(get_db),
    payload:  dict     = Depends(verify_token),
    username: Optional[str]        = Form(None),
    email:    Optional[str]        = Form(None),
    phone:    Optional[str]        = Form(None),
    avatar:   Optional[UploadFile] = File(None),   # ← the image file, optional
):
    user_id = payload.get("id")
    user = get_user_or_401(db, user_id)

    if username:
        user.username = username

    if email:
        user.email = email

    if phone:
        user.phone_num = phone

    # ── Save avatar file if provided ──
    if avatar and avatar.filename:
        if not avatar.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="File must be an image")

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
            "avatar_url": getattr(user, "avatar_url", None),
        }
    }


# ── GET /history ──────────────────────────────────────────────────

@router.get("/history")
def user_history(
    db:      Session = Depends(get_db),
    payload: dict    = Depends(verify_token),
):
    user_id = payload.get("id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Authentication failed")

    orders = (
        db.query(Orders)
        .filter(Orders.user_id == user_id, Orders.status.in_(["Delivered", "Canceled"]))
        .order_by(Orders.orderdate.desc())
        .all()
    )

    return [
        {
            "id":           order.id,
            "orderdate":    order.orderdate,
            "deliverydate": order.deliverydate,
            "totalamount":  order.totalamount,
            "status":       order.status,
            "items": [
                {
                    "id":         i.id,
                    "product_id": i.product_id,
                    "price":      i.price,
                    "quantity":   i.quantity,
                }
                for i in db.query(OrderItems).filter(OrderItems.order_id == order.id).all()
            ],
        }
        for order in orders
    ]