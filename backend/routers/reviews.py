from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from datetime import datetime
from database import get_db
from models import Review, Users
from user_crud import get_current_user
from schema import ReviewCreate,ReviewOut

router = APIRouter()

# ── GET /api/products/{product_id}/reviews ────────────────────────────────────

@router.get("/api/products/{product_id}/reviews", response_model=list[ReviewOut])
def get_product_reviews(product_id: int, db: Session = Depends(get_db)):
    reviews = (
        db.query(Review)
        .filter(Review.product_id == product_id)
        .order_by(Review.created_at.desc())
        .all()
    )
    return reviews


# ── POST /api/products/{product_id}/reviews ───────────────────────────────────

@router.post("/api/products/{product_id}/reviews", response_model=ReviewOut, status_code=201)
def create_review(
    product_id: int,
    body: ReviewCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),  # returns dict {"id": ..., "username": ...}
):
    existing = db.query(Review).filter(
        Review.product_id == product_id,
        Review.user_id == current_user["id"],         # dict access
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="You have already reviewed this product.")

    # fetch full user record to get username
    user = db.query(Users).filter(Users.id == current_user["id"]).first()

    review = Review(
        product_id=product_id,
        user_id=current_user["id"],                   # dict access
        user_name=user.username if user else "Anonymous",
        rating=body.rating,
        comment=body.comment,
    )
    db.add(review)
    db.commit()
    db.refresh(review)
    return review