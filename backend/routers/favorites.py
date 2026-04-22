"""
favorites.py - Wishlist/Favorites API endpoints
=================================================
Handles the user's favorite/wishlist products:
  - GET    /api/favorites         → View all favorites
  - POST   /api/favorites         → Add a product to favorites
  - DELETE /api/favorites/{id}    → Remove from favorites

All endpoints require authentication.
Each user has their own favorites list.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Favorites, Products
from security.jwt_handler import verify_token

router = APIRouter(prefix="/api/favorites", tags=["favorites"], redirect_slashes=False)


@router.get("")
def get_favorites(db: Session = Depends(get_db), payload: dict = Depends(verify_token)):
    """
    Returns all products in the user's favorites list.
    Each favorite includes the product details (name, price, image).

    Called by: FavoritePage.jsx on page load
    """
    user_id = payload.get("id")

    # Get all favorites for this user
    favs = db.query(Favorites).filter(Favorites.user_id == user_id).all()

    # Build response with product details
    result = []
    for fav in favs:
        product = db.query(Products).filter(Products.id == fav.product_id).first()
        if product:
            # Primary image = ProductImage with the lowest order value (order=0)
            primary_image = (
                sorted(product.images, key=lambda img: img.order)[0].image_url
                if product.images else None
            )
            result.append({
                "id":         fav.id,
                "product_id": fav.product_id,
                "product": {
                    "id":        product.id,
                    "name":      product.name,
                    "price":     product.price,
                    "category":  product.category,
                    "badge":     product.badge,
                    "model_src": product.model_src,
                    "model_3d":  product.model_3d,
                    "ios_src":   product.ios_src,
                    "able_3d":   product.able_3d,
                    "able_ar":   product.able_ar,
                    "image_url": primary_image,
                    "images":    [img.image_url for img in sorted(product.images, key=lambda img: img.order)],
                    "colors":    [c.color for c in product.colors],
                }
            })
    return result


@router.post("")
def add_favorite(product_id: int, db: Session = Depends(get_db), payload: dict = Depends(verify_token)):
    """
    Adds a product to the user's favorites.
    If already favorited, returns a message instead of creating a duplicate.

    Called by: ProductPage.jsx "Favorite" button
    Query params: ?product_id=3
    """
    user_id = payload.get("id")

    # Check if already in favorites (prevent duplicates)
    existing = db.query(Favorites).filter(
        Favorites.user_id == user_id,
        Favorites.product_id == product_id
    ).first()
    if existing:
        return {"message": "Already in favorites"}

    # Make sure the product exists
    product = db.query(Products).filter(Products.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Add to favorites
    fav = Favorites(user_id=user_id, product_id=product_id)
    db.add(fav)
    db.commit()
    return {"message": "Added to favorites", "id": fav.id}


@router.delete("/{favorite_id}")
def remove_favorite(favorite_id: int, db: Session = Depends(get_db), payload: dict = Depends(verify_token)):
    """
    Removes a product from the user's favorites.

    Called by: FavoritePage.jsx "Remove" button
    """
    user_id = payload.get("id")

    fav = db.query(Favorites).filter(Favorites.id == favorite_id, Favorites.user_id == user_id).first()
    if not fav:
        raise HTTPException(status_code=404, detail="Favorite not found")

    db.delete(fav)
    db.commit()
    return {"message": "Removed from favorites"}
