from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from models import Campaigns
from schema import CampaignCreate, CampaignUpdate
from database import get_db

router = APIRouter(prefix="/campaigns", tags=["Campaigns"])

def campaign_dict(c):
    return {
        "id": c.id,
        "name": c.name,
        "channel": c.channel,
        "status": c.status,
        "budget": c.budget,
        "spent": c.spent,
        "impressions": c.impressions,
        "clicks": c.clicks,
        "start_date": c.start_date,
        "end_date": c.end_date,
        "created_at": c.created_at,
    }

@router.get("/")
def list_campaigns(db: Session = Depends(get_db)):
    return [campaign_dict(c) for c in db.query(Campaigns).all()]

@router.get("/{campaign_id}")
def get_campaign(campaign_id: int, db: Session = Depends(get_db)):
    c = db.query(Campaigns).filter(Campaigns.id == campaign_id).first()
    if not c:
        raise HTTPException(404, "Campaign not found")
    return campaign_dict(c)

@router.post("/")
def create_campaign(body: CampaignCreate, db: Session = Depends(get_db)):
    c = Campaigns(**body.model_dump())
    db.add(c)
    db.commit()
    db.refresh(c)
    return campaign_dict(c)

@router.put("/{campaign_id}")
def update_campaign(campaign_id: int, data: CampaignUpdate, db: Session = Depends(get_db)):
    c = db.query(Campaigns).filter(Campaigns.id == campaign_id).first()
    if not c:
        raise HTTPException(404, "Campaign not found")
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(c, k, v)
    db.commit()
    db.refresh(c)
    return campaign_dict(c)

@router.delete("/{campaign_id}")
def delete_campaign(campaign_id: int, db: Session = Depends(get_db)):
    c = db.query(Campaigns).filter(Campaigns.id == campaign_id).first()
    if not c:
        raise HTTPException(404, "Campaign not found")
    db.delete(c)
    db.commit()
    return {"msg": "Deleted"}