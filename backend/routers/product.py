from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Products, CartItems
from security.jwt_handler import verify_token

router = APIRouter(prefix="/api/products", tags=["products"], redirect_slashes=False)


# =========================
# GET ALL PRODUCTS
# =========================
@router.get("")
def get_products(db: Session = Depends(get_db)):

    products = db.query(Products).order_by(Products.id.desc()).all()

    return [
        {
            "id": p.id,
            "name": p.name,
            "description": p.description,
            "price": p.price,
            "quantity": p.quantity,
            "image_url": p.image_url,
            "category": p.category,
            "badge": p.badge,
            "model_src": p.model_src,
            "ios_src": p.ios_src,
            "able_ar": p.able_ar,
            "able_3d": p.able_3d
        }
        for p in products
    ]


# =========================
# CHECKOUT (USING PRODUCTS ONLY)
# =========================
@router.post("/checkout")
def checkout(db: Session = Depends(get_db), payload: dict = Depends(verify_token)):

    user_id = payload.get("id")

    cart_items = db.query(CartItems).filter(CartItems.user_id == user_id).all()

    if not cart_items:
        raise HTTPException(status_code=400, detail="Cart is empty")

    total = 0

    # 1. check stock + calculate total
    for item in cart_items:
        product = db.query(Products).filter(Products.id == item.product_id).first()

        if not product:
            raise HTTPException(status_code=404, detail="Product not found")

        if product.quantity < item.quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Not enough stock for {product.name}"
            )

        total += product.price * item.quantity

    # 2. decrease stock + clear cart
    for item in cart_items:
        product = db.query(Products).filter(Products.id == item.product_id).first()

        product.quantity -= item.quantity
        db.delete(item)

    db.commit()

    return {
        "message": "checkout successful",
        "total": total
    }


# =========================
# GET SINGLE PRODUCT
# =========================
@router.get("/{product_id}")
def get_product(product_id: int, db: Session = Depends(get_db)):

    product = db.query(Products).filter(Products.id == product_id).first()

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    return {
        "id": product.id,
        "name": product.name,
        "description": product.description,
        "price": product.price,
        "quantity": product.quantity,
        "image_url": product.image_url,
        "category": product.category,
        "badge": product.badge,
        "model_src": product.model_src,
        "ios_src": product.ios_src,
        "able_ar": product.able_ar,
        "able_3d": product.able_3d
    }