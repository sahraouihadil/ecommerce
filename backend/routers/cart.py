"""
cart.py - Shopping Cart API endpoints
=======================================
Handles all shopping cart operations:
  - GET    /api/cart         → View cart items
  - POST   /api/cart         → Add a product to cart
  - PUT    /api/cart/{id}    → Update item quantity
  - DELETE /api/cart/{id}    → Remove item from cart

All endpoints require authentication (verify_token).
Each user has their own cart — they can only see/modify their own items.

FLOW: User adds items to cart → Views cart → Proceeds to checkout
      (checkout is handled by orders.py)
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import CartItems, Products
from security.jwt_handler import verify_token
from pydantic import BaseModel
import json

# Create a router with prefix /api/cart
# redirect_slashes=False prevents FastAPI from redirecting /api/cart to /api/cart/
router = APIRouter(prefix="/api/cart", tags=["cart"], redirect_slashes=False)

class CustomOrderRequest(BaseModel):
    type: str
    material: str
    width: float
    height: float
    depth: float
    shelves: int
    price: float = 0

@router.post("/custom")
def add_custom_to_cart(order: CustomOrderRequest, db: Session = Depends(get_db), payload: dict = Depends(verify_token)):
    user_id = payload.get("id")
    item = CartItems(
        user_id      = user_id,
        product_id   = None,
        quantity     = 1,
        custom_order = json.dumps(order.dict()),
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return {"message": "Custom order added to cart", "item_id": item.id}

@router.get("")
def get_cart(db: Session = Depends(get_db), payload: dict = Depends(verify_token)):
    """
    Returns all items in the current user's cart.
    Each item includes the product details (name, price, image).

    Called by: CartPage.jsx on page load
    """
    user_id = payload.get("id")

    # Get all cart items for this user
    items = db.query(CartItems).filter(CartItems.user_id == user_id).all()

    # Build the response with product details included
    result = []
    for item in items:
        # ── Custom order ──
        if item.custom_order:
            custom = json.loads(item.custom_order)
            result.append({
                "id":           item.id,
                "product_id":   None,
                "quantity":     item.quantity,
                "custom_order": custom,
                "product": {
                    "id":        None,
                    "name":      f"Custom {custom.get('type', 'Furniture').title()}",
                    "price":     custom.get('price', 0),
                    "category":  "Custom Order",
                    "badge":     "Custom",
                    "image_url": None,
                    "images":    [],
                    "colors":    [],
                    "model_src": None,
                    "model_3d":  None,
                    "ios_src":   None,
                    "able_3d":   False,
                    "able_ar":   False,
                }
            })
            continue

        # ── Regular product ──
        product = db.query(Products).filter(Products.id == item.product_id).first()
        if product:
            primary_image = (
                sorted(product.images, key=lambda img: img.order)[0].image_url
                if product.images else None
            )
            product_data = {
                "id":          product.id,
                "name":        product.name,
                "price":       product.price,
                "category":    product.category,
                "badge":       product.badge,
                "model_src":   product.model_src,
                "model_3d":    product.model_3d,
                "ios_src":     product.ios_src,
                "able_3d":     product.able_3d,
                "able_ar":     product.able_ar,
                "image_url":   primary_image,
                "images":      [img.image_url for img in sorted(product.images, key=lambda img: img.order)],
                "colors":      [c.color for c in product.colors],
            }
        else:
            product_data = None

        result.append({
            "id":         item.id,
            "product_id": item.product_id,
            "quantity":   item.quantity,
            "product":    product_data,
        })

    return result


@router.post("")
def add_to_cart(product_id: int, quantity: int = 1, db: Session = Depends(get_db), payload: dict = Depends(verify_token)):
    """
    Adds a product to the user's cart.
    If the product is already in the cart, increases the quantity instead.

    Called by: ProductPage.jsx "Add to Cart" button
    Query params: ?product_id=3&quantity=1
    """
    user_id = payload.get("id")

    # Make sure the product exists
    product = db.query(Products).filter(Products.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Check if this product is already in the user's cart
    existing = db.query(CartItems).filter(
        CartItems.user_id == user_id,
        CartItems.product_id == product_id
    ).first()

    if existing:
        # Product already in cart — just increase the quantity
        existing.quantity += quantity
    else:
        # New product — create a new cart item
        existing = CartItems(user_id=user_id, product_id=product_id, quantity=quantity)
        db.add(existing)

    db.commit()
    db.refresh(existing)
    return {"message": "Added to cart", "item_id": existing.id, "quantity": existing.quantity}


@router.put("/{item_id}")
def update_cart_item(item_id: int, quantity: int, db: Session = Depends(get_db), payload: dict = Depends(verify_token)):
    """
    Updates the quantity of a cart item.
    If quantity is 0 or less, removes the item entirely.

    Called by: CartPage.jsx +/- buttons
    """
    user_id = payload.get("id")

    # Find the cart item (must belong to this user)
    item = db.query(CartItems).filter(CartItems.id == item_id, CartItems.user_id == user_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Cart item not found")

    # If quantity is 0 or negative, remove the item
    if quantity <= 0:
        db.delete(item)
        db.commit()
        return {"message": "Item removed from cart"}

    # Otherwise, update the quantity
    item.quantity = quantity
    db.commit()
    return {"message": "Cart updated", "quantity": item.quantity}

class CustomOrderRequest(BaseModel):
    type: str
    material: str
    width: float
    height: float
    depth: float
    shelves: int

@router.post("/custom")
def add_custom_to_cart(order: CustomOrderRequest, db: Session = Depends(get_db), payload: dict = Depends(verify_token)):
    user_id = payload.get("id")
    return {"message": "Custom order received", "order": order.dict()}

@router.delete("/{item_id}")
def remove_from_cart(item_id: int, db: Session = Depends(get_db), payload: dict = Depends(verify_token)):
    """
    Removes an item from the cart entirely.

    Called by: CartPage.jsx "Remove" button
    """
    user_id = payload.get("id")

    item = db.query(CartItems).filter(CartItems.id == item_id, CartItems.user_id == user_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Cart item not found")

    db.delete(item)
    db.commit()
    return {"message": "Item removed from cart"}