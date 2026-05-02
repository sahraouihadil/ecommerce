"""
main.py - FastAPI Application Entry Point
"""

import random
import logging
from typing import Annotated

from fastapi import FastAPI, status, HTTPException, Depends, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware

from sqlalchemy.orm import Session, aliased
from sqlalchemy import or_, func, text

import models
import database
from database import db_dependency
from schema import (
    CreateUser, VerifyCode, SetPassword, UpdateUser,
    ForgotPasswordRequest, VerifyResetCodeRequest, ResetPasswordRequest,
)
from email_utils import send_verification_email, send_reset_email
from user_crud import get_current_user, create_user_by_admin
from security.settings import validate_password, hash_password, admin_required, verify_token

from routers import (
    chat, cart, orders, favorites,
    campaign, promotion, newsletter, blog,
    complaints, product, profile, stafProfile, deliveries,
    deliveryman, reviews, users,
)
from routers.users import router as user_router
import shutil
import os
import uuid
from fastapi.staticfiles import StaticFiles
from datetime import datetime

logger = logging.getLogger(__name__)


# ======================================================================
# APP SETUP
# ======================================================================

app = FastAPI(title="ARoom API")

app.mount("/static", StaticFiles(directory="static"), name="static")

origins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "https://aroom.com",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["Authorization", "Content-Type"],
)

models.Base.metadata.create_all(bind=database.engine)

app.include_router(users.router)
app.include_router(chat.router,        prefix="/api")
app.include_router(cart.router)
app.include_router(orders.router)
app.include_router(favorites.router)
app.include_router(complaints.router)
app.include_router(product.router)
app.include_router(profile.router)
app.include_router(stafProfile.router)
app.include_router(deliveries.router)
app.include_router(deliveryman.router)
app.include_router(campaign.router)
app.include_router(promotion.router)
app.include_router(newsletter.router)
app.include_router(blog.router)
app.include_router(reviews.router)

user_dependency = Annotated[dict, Depends(get_current_user)]


# ======================================================================
# HEALTH CHECK
# ======================================================================

@app.get("/", status_code=status.HTTP_200_OK)
async def home_page(db: db_dependency):
    return {"message": "ARoom API is running"}


# ======================================================================
# TOKEN VALIDATION
# ======================================================================

@app.get("/me")
async def get_me(payload: dict = Depends(verify_token)):
    return {
        "sub":  payload.get("sub"),
        "role": payload.get("role"),
    }


# ======================================================================
# USER MANAGEMENT
# ======================================================================

@app.get("/api/users")
def get_users(
    db: Session = Depends(database.get_db),
    payload: dict = Depends(admin_required),
):
    return db.query(models.Users).all()


@app.get("/api/users/{user_id}")
def get_users_by_id(
    user_id: int,
    db: Session = Depends(database.get_db),
    payload: dict = Depends(admin_required),
):
    return db.query(models.Users).filter(models.Users.id == user_id).first()


@app.post("/api/users")
def create_user(
    user: CreateUser,
    db: Session = Depends(database.get_db),
    payload: dict = Depends(admin_required),
):
    new_user = create_user_by_admin(db, user)
    verification_code = str(random.randint(100000, 999999))
    new_user.verification_code = verification_code
    db.commit()
    send_verification_email(user.email, verification_code)
    return user


@app.put("/api/users/{user_id}")
def update_user(
    user_id: int,
    user: UpdateUser,
    db: Session = Depends(database.get_db),
    payload: dict = Depends(admin_required),
):
    db_user = db.query(models.Users).filter(models.Users.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    db_user.username = user.username
    db_user.email    = user.email
    db_user.role     = user.role
    db.commit()
    db.refresh(db_user)
    return db_user


@app.delete("/api/users/{user_id}")
def delete_users_by_id(
    user_id: int,
    db: Session = Depends(database.get_db),
    payload: dict = Depends(admin_required),
):
    db_user = db.query(models.Users).filter(models.Users.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(db_user)
    db.commit()
    return {"message": "User deleted successfully"}


# ======================================================================
# EMAIL VERIFICATION
# ======================================================================

@app.get("/verify-code")
def verify_code(email: str, code: str, db: Session = Depends(database.get_db)):
    user = db.query(models.Users).filter(
        func.lower(models.Users.email) == email.strip().lower()
    ).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if str(user.verification_code) != str(code).strip():
        raise HTTPException(status_code=400, detail="Invalid verification code")
    user.is_verified       = True
    user.verification_code = None
    db.commit()
    return {"msg": "Email verified successfully", "user_name": user.username}


@app.post("/resend-code")
def resend_code(request: ForgotPasswordRequest, db: Session = Depends(database.get_db)):
    user = db.query(models.Users).filter(
        func.lower(models.Users.email) == request.email.strip().lower()
    ).first()
    if not user:
        raise HTTPException(status_code=404, detail="No account found for this email.")
    if user.is_verified:
        raise HTTPException(status_code=400, detail="This account is already verified.")
    code = str(random.randint(100000, 999999))
    user.verification_code = code
    db.commit()
    send_verification_email(user.email, code)
    return {"message": "A new verification code has been sent."}


@app.post("/set-password")
def set_password(data: SetPassword, db: Session = Depends(database.get_db)):
    user = db.query(models.Users).filter(models.Users.username == data.user_name).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if not user.is_verified:
        raise HTTPException(status_code=400, detail="User not verified")
    validate_password(data.password)
    user.password = hash_password(data.password)
    db.commit()
    return {"msg": "Password set successfully"}


# ======================================================================
# FORGOT PASSWORD
# ======================================================================

@app.post("/forgot-password")
def forgot_password(request: ForgotPasswordRequest, db: Session = Depends(database.get_db)):
    user = db.query(models.Users).filter(
        func.lower(models.Users.email) == request.email.strip().lower()
    ).first()
    if user:
        code = str(random.randint(100000, 999999))
        user.verification_code = code
        db.commit()
        send_reset_email(request.email, code)
    return {"message": "If that email is registered, a reset code has been sent."}


@app.post("/verify-reset-code")
def verify_reset_code(request: VerifyResetCodeRequest, db: Session = Depends(database.get_db)):
    user = db.query(models.Users).filter(
        func.lower(models.Users.email) == request.email.strip().lower()
    ).first()
    if not user or not user.verification_code or user.verification_code != request.code:
        raise HTTPException(status_code=400, detail="Invalid or expired code.")
    return {"message": "Code verified. You may now set a new password."}


@app.post("/reset-password")
def reset_password(request: ResetPasswordRequest, db: Session = Depends(database.get_db)):
    user = db.query(models.Users).filter(
        func.lower(models.Users.email) == request.email.strip().lower()
    ).first()
    if not user or not user.verification_code or user.verification_code != request.code:
        raise HTTPException(status_code=400, detail="Invalid or expired code.")
    validate_password(request.new_password)
    user.password          = hash_password(request.new_password)
    user.verification_code = None
    db.commit()
    return {"message": "Password reset successfully."}


# ======================================================================
# SEARCH  ✅ fixed — returns image_url
# ======================================================================

@app.get("/search")
def search_products(keyword: str, db: db_dependency):
    products = db.query(models.Products).filter(
        or_(
            models.Products.name.ilike(f"%{keyword}%"),
            models.Products.description.ilike(f"%{keyword}%"),
            models.Products.category.ilike(f"%{keyword}%"),
        ),
        models.Products.is_active == True,
    ).all()

    return [
        {
            "id":          p.id,
            "name":        p.name,
            "description": p.description,
            "price":       p.price,
            "category":    p.category,
            "badge":       p.badge,
            "image_url":   p.images[0].image_url if p.images else None,
        }
        for p in products
    ]


@app.get("/search-users")
def search_users(keyword: str, db: db_dependency):
    return db.query(models.Users).filter(
        or_(
            models.Users.username.ilike(f"%{keyword}%"),
            models.Users.email.ilike(f"%{keyword}%"),
        )
    ).all()


# ======================================================================
# USER PROFILE
# ======================================================================

@app.get("/profile")
async def user(user: user_dependency, db: db_dependency):
    if user is None:
        raise HTTPException(status_code=401, detail="Authentication Failed")
    db_user = db.query(models.Users).filter(models.Users.id == user["id"]).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "id":        db_user.id,
        "username":  db_user.username,
        "email":     db_user.email,
        "phone_num": db_user.phone_num,
        "role":      db_user.role,
        "active":    db_user.active,
    }


# ======================================================================
# DATA ENDPOINTS
# ======================================================================

@app.get("/api/order-items")
def get_order_items(db: Session = Depends(database.get_db)):
    return db.query(models.OrderItems).all()


@app.get("/stats")
def get_stats(db: Session = Depends(database.get_db)):
    orders = (
        db.query(
            func.date(models.Orders.orderdate).label("day"),
            func.count(models.Orders.id).label("orders_count"),
            func.sum(models.Orders.totalamount).label("orders_totalamount"),
        )
        .group_by(func.date(models.Orders.orderdate))
        .all()
    )
    users = (
        db.query(
            func.date(models.Users.created_at).label("day"),
            func.count(models.Users.id).label("users_count"),
        )
        .group_by(func.date(models.Users.created_at))
        .all()
    )
    return {
        "orders": [
            {
                "day":                str(o.day),
                "orders_count":       o.orders_count,
                "orders_totalamount": o.orders_totalamount,
            }
            for o in orders
        ],
        "users": [
            {
                "day":         str(u.day),
                "users_count": u.users_count,
            }
            for u in users
        ],
    }


@app.get("/api/returns")
def get_returns(db: Session = Depends(database.get_db)):
    CustomerUser = aliased(models.Users)
    first_image = (
        db.query(
            models.ProductImage.product_id,
            func.min(models.ProductImage.image_url).label("image_url"),
        )
        .filter(models.ProductImage.order == 0)
        .group_by(models.ProductImage.product_id)
        .subquery()
    )
    results = (
        db.query(
            models.OrderItems.id.label("item_id"),
            models.Orders.id.label("order_id_raw"),
            models.Products.name.label("product_name"),
            first_image.c.image_url.label("image"),
            models.OrderItems.quantity.label("quantity"),
            models.OrderItems.price.label("price"),
            models.OrderItems.status.label("status"),
            models.Orders.orderdate.label("date"),
            models.OrderItems.return_reason.label("reason"),
            CustomerUser.username.label("customer_name"),
        )
        .join(models.Orders,   models.Orders.id   == models.OrderItems.order_id)
        .join(models.Products, models.Products.id == models.OrderItems.product_id)
        .outerjoin(first_image, first_image.c.product_id == models.Products.id)
        .join(CustomerUser,    CustomerUser.id    == models.Orders.user_id)
        .filter(func.lower(models.OrderItems.status) == "canceled")
        .order_by(models.Orders.orderdate.desc())
        .all()
    )
    return [
        {
            "id":            r.item_id,
            "return_id":     f"RET-{str(r.item_id).zfill(3)}",
            "order_id":      f"ORD-{str(r.order_id_raw).zfill(3)}",
            "customer_name": r.customer_name or "Unknown",
            "product_name":  r.product_name,
            "image":         r.image,
            "quantity":      int(r.quantity or 0),
            "amount":        float((r.quantity or 0) * (r.price or 0)),
            "reason":        r.reason or "No reason provided",
            "date":          r.date.strftime("%Y-%m-%d") if r.date else None,
            "status":        r.status.lower() if r.status else "canceled",
        }
        for r in results
    ]


@app.get("/api/deliverymen")
def get_deliverymen(db: Session = Depends(database.get_db)):
    deliverymen = (
        db.query(models.Users)
        .filter(models.Users.role == "deliveryman")
        .all()
    )
    return [
        {
            "id":          u.id,
            "username":    u.username,
            "email":       u.email,
            "phone_num":   u.phone_num,
            "active":      u.active,
            "activeCount": 14,
        }
        for u in deliverymen
    ]


@app.get("/api/overview", tags=["Overview"])
def get_overview(db: Session = Depends(database.get_db)):
    now = datetime.utcnow()
    cur_start  = datetime(now.year, now.month, 1)
    prev_month = now.month - 1 if now.month > 1 else 12
    prev_year  = now.year      if now.month > 1 else now.year - 1
    prv_start  = datetime(prev_year, prev_month, 1)
    prv_end    = cur_start

    def revenue_in(start, end) -> float:
        val = (
            db.query(func.coalesce(func.sum(models.Orders.totalamount), 0))
            .filter(models.Orders.orderdate >= start,
                    models.Orders.orderdate <  end,
                    models.Orders.status    == "delivered")
            .scalar()
        )
        return float(val)

    cur_rev = revenue_in(cur_start, now)
    prv_rev = revenue_in(prv_start, prv_end)

    def pct(cur, prv):
        if prv == 0:
            return "+0.0%"
        p = (cur - prv) / prv * 100
        return f"{'+' if p >= 0 else ''}{p:.1f}%"

    all_campaigns = db.query(models.Campaigns).all()
    cur_active = sum(1 for c in all_campaigns if c.status == "active")
    prv_active = (
        db.query(func.count(models.Campaigns.id))
        .filter(models.Campaigns.status     == "active",
                models.Campaigns.created_at <  cur_start)
        .scalar() or 0
    )

    cur_subs = (
        db.query(func.count(models.Newsletters.id))
        .filter(models.Newsletters.status == "subscribed")
        .scalar() or 0
    )
    prv_subs = (
        db.query(func.count(models.Newsletters.id))
        .filter(models.Newsletters.status     == "subscribed",
                models.Newsletters.created_at <  cur_start)
        .scalar() or 0
    )

    cur_ar = (
        db.query(func.count(models.Products.id))
        .filter(models.Products.able_ar == True)
        .scalar() or 0
    )
    prv_ar = (
        db.query(func.count(models.Products.id))
        .filter(models.Products.able_ar    == True,
                models.Products.created_at <  cur_start)
        .scalar() or 0
    )

    performance = []
    for offset in range(6, -1, -1):
        m, y = now.month - offset, now.year
        while m <= 0:
            m += 12
            y -= 1
        m_start = datetime(y, m, 1)
        m_end   = datetime(y + 1, 1, 1) if m == 12 else datetime(y, m + 1, 1)
        m_rev = revenue_in(m_start, m_end)
        m_eng = (
            db.query(func.count(models.Newsletters.id))
            .filter(models.Newsletters.created_at >= m_start,
                    models.Newsletters.created_at <  m_end)
            .scalar() or 0
        )
        performance.append({"month": m_start.strftime("%b"), "revenue": round(m_rev, 2), "engagement": m_eng})

    channel_rows = (
        db.query(models.Campaigns.channel,
                 func.coalesce(func.sum(models.Campaigns.clicks), 0))
        .group_by(models.Campaigns.channel)
        .all()
    )
    channel_engagement = [{"channel": ch, "value": int(clicks)} for ch, clicks in channel_rows]

    return {
        "total_revenue":      round(cur_rev, 2),
        "revenue_change":     pct(cur_rev,    prv_rev),
        "active_campaigns":   cur_active,
        "campaigns_change":   pct(cur_active, prv_active),
        "newsletter_subs":    cur_subs,
        "subs_change":        pct(cur_subs,   prv_subs),
        "ar_experiences":     cur_ar,
        "ar_change":          pct(cur_ar,     prv_ar),
        "campaign_status": {
            "active":    sum(1 for c in all_campaigns if c.status == "active"),
            "draft":     sum(1 for c in all_campaigns if c.status == "draft"),
            "paused":    sum(1 for c in all_campaigns if c.status == "paused"),
            "completed": sum(1 for c in all_campaigns if c.status == "completed"),
        },
        "performance":        performance,
        "channel_engagement": channel_engagement,
    }


@app.get("/api/health", tags=["System"])
def health(db: Session = Depends(database.get_db)):
    db.execute(text("SELECT 1"))
    return {"status": "ok"}