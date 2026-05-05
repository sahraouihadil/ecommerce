from fastapi import APIRouter, Depends, HTTPException, Form, File, UploadFile
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
from models import Products, ProductColor, ProductImage, CartItems, OrderItems
from security.jwt_handler import verify_token
import os, uuid, shutil

router = APIRouter(prefix="/api/products", tags=["products"])

BASE_URL  = "http://127.0.0.1:8000"   # change for production
STATIC    = "static"


# ── helper ────────────────────────────────────────────────────────────────────
def _save_file(upload: UploadFile) -> str:
    os.makedirs(STATIC, exist_ok=True)
    ext  = os.path.splitext(upload.filename)[1]
    name = f"{uuid.uuid4().hex}{ext}"
    path = f"{STATIC}/{name}"
    with open(path, "wb") as buf:
        shutil.copyfileobj(upload.file, buf)
    return path


def _serialize(p: Products) -> dict:
    return {
        "id":          p.id,
        "name":        p.name,
        "description": p.description,
        "price":       p.price,
        "quantity":    p.quantity,
        "min_stock":   p.min_stock,
        "sku":         p.sku,
        "category":    p.category,
        "badge":       p.badge,
        "model_src":   p.model_src,
        "model_3d":    p.model_3d,
        "ios_src":     p.ios_src,
        "able_3d":     p.able_3d,
        "able_ar":     p.able_ar,
        "is_active":   p.is_active,
        "valid_ar":    p.valid_ar,
        "valid_3d":    p.valid_3d,
        # primary image (order=0) kept as image_url for backward compat
        "image_url":   p.images[0].image_url if p.images else None,
        "images":      [img.image_url for img in p.images],
        "colors":      [c.color for c in p.colors],
        "created_at":  p.created_at,
    }


# =============================================================================
# GET ALL — STOREFRONT (approved/active only)
# Used by the customer-facing home page / shop page.
# Only products with is_active=True are returned — meaning admin has approved them.
# =============================================================================
@router.get("")
def get_products(db: Session = Depends(get_db)):
    products = (
        db.query(Products)
        .filter(Products.is_active == True)          # ← approved products only
        .order_by(Products.id.desc())
        .all()
    )
    result = [_serialize(p) for p in products]
    if result:
        result[0]["featured"] = True
    return result


# =============================================================================
# GET ALL — MANAGER CATALOG (every product, regardless of approval status)
# Used exclusively by the stock-manager dashboard so managers can see pending
# products and submit them for validation.
# =============================================================================
@router.get("/all")
def get_all_products_manager(db: Session = Depends(get_db)):
    """
    Returns ALL products (active and inactive / pending approval).
    Intended for the stock-manager catalog page only — not the storefront.
    """
    products = (
        db.query(Products)
        .order_by(Products.id.desc())
        .all()
    )
    return [_serialize(p) for p in products]


# =============================================================================
# GET ONE
# =============================================================================
@router.get("/{product_id}")
def get_product(product_id: int, db: Session = Depends(get_db)):
    p = db.query(Products).filter(Products.id == product_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Product not found")
    return {**_serialize(p), "best_seller": True}


# =============================================================================
# CREATE
# New products are created with is_active=False by default so they must go
# through the validation / approval flow before appearing on the storefront.
# =============================================================================
@router.post("")
def add_product(
    name:        str            = Form(...),
    description: Optional[str] = Form(None),
    price:       float          = Form(...),
    quantity:    int            = Form(...),
    sku:         str            = Form(...),
    category:    Optional[str] = Form(None),
    colors:      Optional[str] = Form(None),   # JSON array string  e.g. '["Red","Blue"]'
    min_stock:   int            = Form(5),
    badge:       Optional[str] = Form(None),
    model_src:   Optional[str] = Form(None),
    model_3d:    Optional[str] = Form(None),
    ios_src:     Optional[str] = Form(None),
    able_3d:     bool           = Form(False),
    able_ar:     bool           = Form(False),
    # is_active is intentionally NOT accepted from the form —
    # products start as inactive and are activated only by admin approval.
    image_1:     UploadFile     = File(None),
    image_2:     UploadFile     = File(None),
    image_3:     UploadFile     = File(None),
    db:          Session        = Depends(get_db),
):
    import json

    # 1 — create product row; always starts inactive (pending admin approval)
    product = Products(
        name=name, description=description, price=price,
        quantity=quantity, sku=sku, category=category,
        min_stock=min_stock, badge=badge or "new",
        model_src=model_src, model_3d=model_3d, ios_src=ios_src,
        able_3d=able_3d, able_ar=able_ar,
        is_active=False,                             # ← always starts as inactive
    )
    db.add(product)
    db.commit()
    db.refresh(product)

    # 2 — colors
    color_list = []
    if colors:
        try:
            color_list = json.loads(colors)
        except Exception:
            color_list = [c.strip() for c in colors.split(",") if c.strip()]

    for color in color_list:
        db.add(ProductColor(product_id=product.id, color=color))

    # 3 — images (up to 3)
    for order, upload in enumerate([image_1, image_2, image_3]):
        if upload and upload.filename:
            path = _save_file(upload)
            db.add(ProductImage(product_id=product.id, image_url=path, order=order))

    db.commit()
    db.refresh(product)
    return _serialize(product)


@router.get("/by-sku/{sku}")
def get_product_by_sku(sku: str, db: Session = Depends(get_db)):
    """
    Look up a single product by its SKU.
    Used by the AR/3D management page to find a product before patching AR fields.
    """
    product = (
        db.query(Products)
        .filter(Products.sku == sku)
        .filter(Products.is_active == True) 
        .first()
    )
    if not product:
        raise HTTPException(status_code=404, detail=f"Product with SKU '{sku}' not found")

    return _serialize(product)


# =============================================================================
# UPDATE
# Editing a product resets is_active to False so it must be re-approved after
# significant changes. This prevents unapproved edits from going live silently.
# =============================================================================
@router.put("/{product_id}")
def update_product(
    product_id:  int,
    name:        str            = Form(...),
    description: Optional[str] = Form(None),
    price:       float          = Form(...),
    quantity:    int            = Form(...),
    sku:         str            = Form(...),
    category:    Optional[str] = Form(None),
    colors:      Optional[str] = Form(None),   # JSON array string
    is_active:   bool          =Form(...),
    min_stock:   int            = Form(5),
    model_src:   Optional[str] = Form(None),
    model_3d:    Optional[str] = Form(None),
    ios_src:     Optional[str] = Form(None),
    able_3d:     bool           = Form(False),
    able_ar:     bool           = Form(False),
    image_1:     UploadFile     = File(None),
    image_2:     UploadFile     = File(None),
    image_3:     UploadFile     = File(None),
    db:          Session        = Depends(get_db),
):
    import json

    product = db.query(Products).filter(Products.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # — scalar fields
    product.name        = name
    product.description = description
    product.price       = price
    product.quantity    = quantity
    product.sku         = sku
    product.category    = category
    product.min_stock   = min_stock
    product.model_src   = model_src
    product.model_3d    = model_3d
    product.ios_src     = ios_src
    product.able_3d     = able_3d
    product.able_ar     = able_ar
    product.is_active   = is_active      # ← reset to inactive; must be re-approved

    # — replace colors
    if colors is not None:
        db.query(ProductColor).filter(ProductColor.product_id == product_id).delete()
        try:
            color_list = json.loads(colors)
        except Exception:
            color_list = [c.strip() for c in colors.split(",") if c.strip()]
        for color in color_list:
            db.add(ProductColor(product_id=product_id, color=color))

    # — replace only the slots that received a new file
    uploads = {0: image_1, 1: image_2, 2: image_3}
    existing = {img.order: img for img in product.images}

    for order, upload in uploads.items():
        if upload and upload.filename:
            path = _save_file(upload)
            if order in existing:
                existing[order].image_url = path   # update in place
            else:
                db.add(ProductImage(product_id=product_id,
                                    image_url=path, order=order))

    db.commit()
    db.refresh(product)
    return _serialize(product)


# =============================================================================
# DELETE
# =============================================================================
@router.delete("/{id}")
def delete_product(id: int, db: Session = Depends(get_db)):
    product = db.query(Products).filter(Products.id == id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    in_cart  = db.query(CartItems).filter(CartItems.product_id   == id).first()
    in_order = db.query(OrderItems).filter(OrderItems.product_id == id).first()
    if in_cart or in_order:
        return {"success": False,
                "message": "Cannot delete: product exists in cart or orders"}

    db.delete(product)
    db.commit()
    return {"success": True, "message": "Product deleted successfully"}


# =============================================================================
# CHECKOUT
# =============================================================================
@router.post("/checkout")
def checkout(db: Session = Depends(get_db),
             payload: dict = Depends(verify_token)):
    user_id    = payload.get("id")
    cart_items = db.query(CartItems).filter(CartItems.user_id == user_id).all()
    if not cart_items:
        raise HTTPException(status_code=400, detail="Cart is empty")

    total = 0
    for item in cart_items:
        p = db.query(Products).filter(Products.id == item.product_id).first()
        if not p:
            raise HTTPException(status_code=404, detail="Product not found")
        if p.quantity < item.quantity:
            raise HTTPException(status_code=400,
                                detail=f"Not enough stock for {p.name}")
        total += p.price * item.quantity

    for item in cart_items:
        p = db.query(Products).filter(Products.id == item.product_id).first()
        p.quantity -= item.quantity
        db.delete(item)

    db.commit()
    return {"message": "checkout successful", "total": total}