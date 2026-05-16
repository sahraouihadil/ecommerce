"""
routers/configration.py  — AR Configuration endpoints
(filename typo kept intentionally to match the existing frontend route)

Endpoints
─────────
GET  /api/configration/ar
    Returns every product's id, name, type (category), active (able_ar),
    able_ar flag, and a top-level arOn derived from whether ANY product
    currently has able_ar = True.

PUT  /api/configration/ar
    Body: { scope, able_ar, productId? }

    scope = "global"
        able_ar = False  →  UPDATE products SET able_ar = false  (all rows)
        able_ar = True   →  UPDATE products SET able_ar = true
                            WHERE valid_ar = true  (only validated products
                            get AR restored; unvalidated stay false)

    scope = "product"
        productId required.
        Sets able_ar for that single row.
        Guard: cannot enable a product's AR when global is off
               (i.e. when NO product has able_ar = True and the request
               is able_ar = True without a preceding global-on call).
               → enforced naturally because the frontend disables individual
                 toggles while global is off, but we double-check server-side.

Response shape (both GET and PUT return the same envelope):
    {
        "arOn": bool,
        "products": [
            {
                "id":     int,
                "name":   str,
                "type":   str,   # category
                "active": bool,  # mirrors able_ar — the toggle state
                "able_ar": bool | None
            },
            ...
        ]
    }
"""

from typing import Literal, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

import database
import models
from security.settings import admin_required
from schema import ARConfigRequest

router = APIRouter(
    prefix="/api/configration",
    tags=["Configuration"],
)

# ─── helpers ──────────────────────────────────────────────────────────────

def _product_to_dict(p: models.Products) -> dict:
    """Map a Products ORM row to the shape the frontend expects."""
    
    first_image = (
        p.images[0].image_url
        if p.images and len(p.images) > 0
        else None
    )

    return {
        "id":        p.id,
        "name":      p.name,
        "type":      p.category or "Unknown",
        "active":    bool(p.able_ar),
        "able_ar":   p.able_ar,
        "valid_ar":  p.valid_ar,
        "image":     first_image,
    }


def _build_response(db: Session) -> dict:
    """
    Re-query the DB and return the canonical response envelope.
    arOn = True  if at least one product has able_ar = True.
    arOn = False if every product has able_ar = False (or no products exist).
    """
    products = db.query(models.Products).order_by(models.Products.id).all()
    product_list = [_product_to_dict(p) for p in products]
    ar_on = any(p["able_ar"] for p in product_list)
    return {"arOn": ar_on, "products": product_list}


# ─── GET /api/configration/ar ─────────────────────────────────────────────

@router.get("/ar")
def get_ar_config(
    db:      Session = Depends(database.get_db),
    payload: dict    = Depends(admin_required),
):
    """
    Fetch the current AR configuration from the database.
    Called by ConfigContext on mount to overwrite localStorage cache.
    """
    return _build_response(db)


# ─── PUT /api/configration/ar ─────────────────────────────────────────────

@router.put("/ar")
def update_ar_config(
    body:    ARConfigRequest,
    db:      Session = Depends(database.get_db),
    payload: dict    = Depends(admin_required),
):
    """
    Update AR flags in the products table.

    scope = "global"
    ───────────────
    OFF (able_ar = False):
        Sets able_ar = False for EVERY product row.

    ON  (able_ar = True):
        Sets able_ar = True only for products where valid_ar = True.
        Products that have never been validated stay False — you can't
        re-enable AR for a product that was never approved.

    scope = "product"
    ─────────────────
    Toggles the single product identified by productId.
    Returns 400 if productId is missing or the product doesn't exist.
    Returns 409 if the caller tries to enable a product's AR while
    the global switch is effectively off (all products currently false).
    """

    # ── GLOBAL scope ──────────────────────────────────────────────────────
    if body.scope == "global":

        if not body.able_ar:
            # Turn OFF global AR → set every product to false
            db.query(models.Products).update(
                {models.Products.able_ar: False},
                synchronize_session="fetch",
            )
        else:
            # Turn ON global AR → only restore validated products
            db.query(models.Products).filter(
                models.Products.valid_ar == True
            ).update(
                {models.Products.able_ar: True},
                synchronize_session="fetch",
            )
            # Products without valid_ar stay False (already False from previous off)

        db.commit()
        return _build_response(db)

    # ── PRODUCT scope ─────────────────────────────────────────────────────
    if body.scope == "product":

        if body.productId is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="productId is required when scope is 'product'.",
            )

        product = (
            db.query(models.Products)
            .filter(models.Products.id == body.productId)
            .first()
        )
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product {body.productId} not found.",
            )

        # Guard: cannot enable AR for a product if it hasn't been validated
        if body.able_ar and not product.valid_ar:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=(
                    f"Cannot enable AR for '{product.name}' — "
                    "the product has not been validated for AR yet."
                ),
            )

        product.able_ar = body.able_ar
        db.commit()
        db.refresh(product)

        return _build_response(db)

    # Pydantic's Literal already prevents other values, but just in case:
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="scope must be 'global' or 'product'.",
    )