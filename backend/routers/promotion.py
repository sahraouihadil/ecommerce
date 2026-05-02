from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import Optional
from datetime import date
from models import Promotions
from database import get_db
from schema import PromotionCreate,PromotionUpdate

router = APIRouter(prefix="/api/promotions", tags=["Promotions"])


# ======================================================================
# SERIALIZER
# ======================================================================

def promo_dict(p: Promotions) -> dict:
    return {
        "id":            p.id,
        "title":         p.title,
        "code":          p.code,
        "discount":      float(p.discount      or 0),
        "discount_type": p.discount_type,
        "usage_max":     int(p.usage_max       or 0),
        "usage_current": int(p.usage_current   or 0),
        "expiry":        str(p.expiry)         if p.expiry     else None,
        "status":        p.status,
        "created_at":    p.created_at.isoformat() if p.created_at else None,
    }


# ======================================================================
# ROUTES
# ======================================================================

@router.get("/")
def list_promotions(db: Session = Depends(get_db)):
    """Returns all promotions ordered newest first."""
    promos = db.query(Promotions).order_by(Promotions.created_at.desc()).all()
    return [promo_dict(p) for p in promos]


@router.get("/{promo_id}")
def get_promotion(promo_id: int, db: Session = Depends(get_db)):
    p = db.query(Promotions).filter(Promotions.id == promo_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Promotion not found")
    return promo_dict(p)


@router.post("/", status_code=201)
def create_promotion(body: PromotionCreate, db: Session = Depends(get_db)):
    # Prevent duplicate codes
    existing = db.query(Promotions).filter(Promotions.code == body.code.upper()).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Code '{body.code}' already exists.")

    data = body.model_dump()
    p = Promotions(
        title         = data["title"],
        code          = data["code"],
        discount      = data["discount"],
        discount_type = data["discount_type"],
        usage_max     = data["usage_max"],
        usage_current = data["usage_current"],
        expiry        = data["expiry"],
        status        = data["status"],
    )
    db.add(p)
    db.commit()
    db.refresh(p)
    return promo_dict(p)


@router.put("/{promo_id}")
def update_promotion(promo_id: int, data: PromotionUpdate, db: Session = Depends(get_db)):
    p = db.query(Promotions).filter(Promotions.id == promo_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Promotion not found")

    updates = data.model_dump(exclude_unset=True)

    # Check code uniqueness if code is being changed
    if "code" in updates and updates["code"] != p.code:
        conflict = db.query(Promotions).filter(
            Promotions.code == updates["code"],
            Promotions.id   != promo_id,
        ).first()
        if conflict:
            raise HTTPException(status_code=400, detail=f"Code '{updates['code']}' already exists.")

    for k, v in updates.items():
        setattr(p, k, v)

    db.commit()
    db.refresh(p)
    return promo_dict(p)


@router.delete("/{promo_id}")
def delete_promotion(promo_id: int, db: Session = Depends(get_db)):
    p = db.query(Promotions).filter(Promotions.id == promo_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Promotion not found")
    db.delete(p)
    db.commit()
    return {"msg": "Promotion deleted successfully"}