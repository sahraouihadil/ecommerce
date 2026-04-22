from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from models import Promotions
from database import get_db
from schema import PromotionCreate, PromotionUpdate

router = APIRouter(prefix="/promotions", tags=["Promotions"])


@router.get("/")
def list_promotions(db: Session = Depends(get_db)):
    promotions = db.query(Promotions).all()
    return [
        {
            "id": p.id,
            "title": p.title,
            "code": p.code,
            "discount": p.discount,
            "discount_type": p.discount_type,
            "usage_max": p.usage_max,
            "usage_current": p.usage_current,
            "expiry": p.expiry,
            "status": p.status,
            "created_at": p.created_at,
        }
        for p in promotions
    ]


@router.post("/")
def create_promotion(body: PromotionCreate, db: Session = Depends(get_db)):
    promo = Promotions(**body.model_dump())
    db.add(promo)
    db.commit()
    db.refresh(promo)
    return {
        "id": promo.id,
        "title": promo.title,
        "code": promo.code,
        "discount": promo.discount,
        "discount_type": promo.discount_type,
        "usage_max": promo.usage_max,
        "usage_current": promo.usage_current,
        "expiry": promo.expiry,
        "status": promo.status,
        "created_at": promo.created_at,
    }


@router.put("/{promo_id}")
def update_promotion(promo_id: int, data: PromotionUpdate, db: Session = Depends(get_db)):
    promo = db.query(Promotions).filter(Promotions.id == promo_id).first()
    if not promo:
        raise HTTPException(404, "Promotion not found")

    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(promo, k, v)

    db.commit()
    db.refresh(promo)
    return {
        "id": promo.id,
        "title": promo.title,
        "code": promo.code,
        "discount": promo.discount,
        "discount_type": promo.discount_type,
        "usage_max": promo.usage_max,
        "usage_current": promo.usage_current,
        "expiry": promo.expiry,
        "status": promo.status,
        "created_at": promo.created_at,
    }


@router.delete("/{promo_id}")
def delete_promotion(promo_id: int, db: Session = Depends(get_db)):
    promo = db.query(Promotions).filter(Promotions.id == promo_id).first()
    if not promo:
        raise HTTPException(404, "Promotion not found")

    db.delete(promo)
    db.commit()
    return {"msg": "Deleted"}