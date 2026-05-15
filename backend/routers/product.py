"""
products_router.py  –  FastAPI router for Products

Key rules
─────────
• GET /            → active products only (storefront)
• GET /all         → all products (manager catalog)
• GET /by-sku/:sku → any product regardless of is_active (manager use)
• POST /           → creates product with is_active=False; must be approved
• PUT  /:id        → general update; is_active accepted from form (manager)
• PATCH /:id/ar    → updates ONLY AR/3D fields + resets valid_ar/valid_3d;
                     never touches is_active so the product stays live
• DELETE /:id      → hard delete (storefront; no admin gate here)
"""

from fastapi import APIRouter, Depends, HTTPException, Form, File, UploadFile
from sqlalchemy.orm import Session
from typing import Optional
from database import get_db
from models import Products, ProductColor, ProductImage, CartItems, OrderItems
from security.jwt_handler import verify_token
import os, uuid, shutil

router = APIRouter(prefix="/api/products", tags=["products"])

BASE_URL = "http://127.0.0.1:8000"
STATIC   = "static"


# ── helpers ───────────────────────────────────────────────────────────────────

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
        "image_url":   p.images[0].image_url if p.images else None,
        "images":      [img.image_url for img in p.images],
        "colors":      [c.color for c in p.colors],
        "created_at":  p.created_at,
    }


# ── GET  /  — storefront (approved/active only) ────────────────────────────────

@router.get("")
def get_products(db: Session = Depends(get_db)):
    products = (
        db.query(Products)
        .filter(Products.is_active == True)
        .order_by(Products.id.desc())
        .all()
    )
    result = [_serialize(p) for p in products]
    if result:
        result[0]["featured"] = True
    return result


# ── GET /all — manager catalog (every product) ─────────────────────────────────

@router.get("/all")
def get_all_products_manager(db: Session = Depends(get_db)):
    products = db.query(Products).order_by(Products.id.desc()).all()
    return [_serialize(p) for p in products]


# ── GET /:id ───────────────────────────────────────────────────────────────────

@router.get("/{product_id}")
def get_product(product_id: int, db: Session = Depends(get_db)):
    p = db.query(Products).filter(Products.id == product_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Product not found")
    return {**_serialize(p), "best_seller": True}


# ── POST / — create (always is_active=False, awaits admin approval) ────────────

@router.post("")
def add_product(
    name:        str            = Form(...),
    description: Optional[str] = Form(None),
    price:       float          = Form(...),
    quantity:    int            = Form(...),
    sku:         str            = Form(...),
    category:    Optional[str] = Form(None),
    colors:      Optional[str] = Form(None),
    min_stock:   int            = Form(5),
    badge:       Optional[str] = Form(None),
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

    product = Products(
        name=name, description=description, price=price,
        quantity=quantity, sku=sku, category=category,
        min_stock=min_stock, badge=badge or "new",
        model_src=model_src, model_3d=model_3d, ios_src=ios_src,
        able_3d=able_3d, able_ar=able_ar,
        is_active=False,   # always inactive until admin approves
        valid_ar=False,
        valid_3d=False,
    )
    db.add(product)
    db.commit()
    db.refresh(product)

    color_list = []
    if colors:
        try:
            color_list = json.loads(colors)
        except Exception:
            color_list = [c.strip() for c in colors.split(",") if c.strip()]
    for color in color_list:
        db.add(ProductColor(product_id=product.id, color=color))

    for order, upload in enumerate([image_1, image_2, image_3]):
        if upload and upload.filename:
            path = _save_file(upload)
            db.add(ProductImage(product_id=product.id, image_url=path, order=order))

    db.commit()
    db.refresh(product)
    return _serialize(product)


# ── GET /by-sku/:sku — manager lookup (all products, not just active) ──────────

@router.get("/by-sku/{sku}")
def get_product_by_sku(sku: str, db: Session = Depends(get_db)):
    """
    Look up any product by SKU regardless of is_active status.
    Used by the AR/3D management page so managers can configure
    products that haven't been approved yet.
    """
    product = db.query(Products).filter(Products.sku == sku).first()
    if not product:
        raise HTTPException(status_code=404, detail=f"Product with SKU '{sku}' not found")
    return _serialize(product)


# ── PUT /:id — general update (manager catalog) ────────────────────────────────

@router.put("/{product_id}")
def update_product(
    product_id:  int,
    name:        str            = Form(...),
    description: Optional[str] = Form(None),
    price:       float          = Form(...),
    quantity:    int            = Form(...),
    sku:         str            = Form(...),
    category:    Optional[str] = Form(None),
    colors:      Optional[str] = Form(None),
    is_active:   bool           = Form(...),
    min_stock:   int            = Form(5),
    model_src:   Optional[str] = Form(None),
    model_3d:    Optional[str] = Form(None),
    ios_src:     Optional[str] = Form(None),
    able_3d:     bool           = Form(False),
    able_ar:     bool           = Form(False),
    valid_3d:    bool          = Form(False),
    valid_ar:    bool          = Form(False),
    image_1:     UploadFile     = File(None),
    image_2:     UploadFile     = File(None),
    image_3:     UploadFile     = File(None),
    db:          Session        = Depends(get_db),
):
    import json

    product = db.query(Products).filter(Products.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

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
    product.valid_3d     = valid_3d
    product.valid_ar     = valid_ar
    product.is_active   = is_active

    if colors is not None:
        db.query(ProductColor).filter(ProductColor.product_id == product_id).delete()
        try:
            color_list = json.loads(colors)
        except Exception:
            color_list = [c.strip() for c in colors.split(",") if c.strip()]
        for color in color_list:
            db.add(ProductColor(product_id=product_id, color=color))

    uploads  = {0: image_1, 1: image_2, 2: image_3}
    existing = {img.order: img for img in product.images}
    for order, upload in uploads.items():
        if upload and upload.filename:
            path = _save_file(upload)
            if order in existing:
                existing[order].image_url = path
            else:
                db.add(ProductImage(product_id=product_id, image_url=path, order=order))

    db.commit()
    db.refresh(product)
    return _serialize(product)


# ── PATCH /:id/ar — update ONLY AR/3D fields, never touches is_active ─────────

@router.patch("/{product_id}/ar")
def patch_product_ar(
    product_id: int,
    model_src:  Optional[str] = Form(None),
    model_3d:   Optional[str] = Form(None),
    ios_src:    Optional[str] = Form(None),
    able_3d:    bool           = Form(False),
    able_ar:    bool           = Form(False),
    valid_ar:   bool           = Form(False),
    valid_3d:   bool           = Form(False),
    db:         Session        = Depends(get_db),
):
    """
    Patch only the AR/3D fields of a product.

    Critically, this endpoint:
      • Does NOT touch is_active — an approved/active product stays live.
      • Always resets valid_ar=False and valid_3d=False so the new config
        must be reviewed by an admin before AR/3D features render on the
        storefront.
      • The frontend must submit separate ValidationRequests (type AR and 3D)
        after calling this endpoint.
    """
    product = db.query(Products).filter(Products.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Update only AR/3D fields
    product.model_src = model_src or None
    product.model_3d  = model_3d  or None
    product.ios_src   = ios_src   or None
    product.able_3d   = able_3d
    product.able_ar   = able_ar

    # Always reset validation flags — admin must re-approve
    product.valid_ar  = valid_ar
    product.valid_3d  = valid_3d

    db.commit()
    db.refresh(product)
    return _serialize(product)


# ── PATCH /:id/ar/clear — remove AR config (submit delete request instead) ────

@router.patch("/{product_id}/ar/clear")
def clear_product_ar(
    product_id: int,
    db:         Session = Depends(get_db),
):
    """
    Clear all AR/3D fields from a product (admin-approved deletion path).
    Called by validation_crud._activate_item when a Products_AR_Delete
    request is approved, or directly when the manager confirms removal.

    Does NOT touch is_active.
    """
    product = db.query(Products).filter(Products.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    product.model_src = None
    product.model_3d  = None
    product.ios_src   = None
    product.able_3d   = False
    product.able_ar   = False
    product.valid_ar  = False
    product.valid_3d  = False

    db.commit()
    db.refresh(product)
    return _serialize(product)


# ── DELETE /:id ────────────────────────────────────────────────────────────────

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


# ── POST /checkout ─────────────────────────────────────────────────────────────

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