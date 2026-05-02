from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import Optional, Literal
from pydantic import BaseModel, field_validator
from datetime import date
from models import Campaigns
from database import get_db
from schema import CampaignCreate,CampaignUpdate

router = APIRouter(prefix="/api/campaigns", tags=["Campaigns"])

# ======================================================================
# SERIALIZER
# ======================================================================

def campaign_dict(c: Campaigns) -> dict:
    return {
        "id":          c.id,
        "name":        c.name,
        "channel":     c.channel,
        "status":      c.status,
        "budget":      float(c.budget      or 0),
        "spent":       float(c.spent       or 0),
        "impressions": int(c.impressions   or 0),
        "clicks":      int(c.clicks        or 0),
        "start_date":  str(c.start_date)   if c.start_date  else None,
        "end_date":    str(c.end_date)     if c.end_date    else None,
        "created_at":  c.created_at.isoformat() if c.created_at else None,
    }


# ======================================================================
# ROUTES
# ======================================================================

@router.get("/")
def list_campaigns(db: Session = Depends(get_db)):
    """Returns all campaigns ordered newest first."""
    campaigns = (
        db.query(Campaigns)
        .order_by(Campaigns.created_at.desc())
        .all()
    )
    return [campaign_dict(c) for c in campaigns]


@router.get("/{campaign_id}")
def get_campaign(campaign_id: int, db: Session = Depends(get_db)):
    """Returns a single campaign by ID."""
    c = db.query(Campaigns).filter(Campaigns.id == campaign_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return campaign_dict(c)


@router.post("/", status_code=201)
def create_campaign(body: CampaignCreate, db: Session = Depends(get_db)):
    """Creates a new campaign."""
    data = body.model_dump()
    c = Campaigns(
        name        = data["name"],
        channel     = data["channel"],
        status      = data["status"],
        budget      = data["budget"],
        spent       = data["spent"],
        impressions = data["impressions"],
        clicks      = data["clicks"],
        start_date  = data["start_date"],
        end_date    = data["end_date"],
    )
    db.add(c)
    db.commit()
    db.refresh(c)
    return campaign_dict(c)


@router.put("/{campaign_id}")
def update_campaign(
    campaign_id: int,
    data: CampaignUpdate,
    db: Session = Depends(get_db),
):
    """Updates an existing campaign (partial update supported)."""
    c = db.query(Campaigns).filter(Campaigns.id == campaign_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Campaign not found")

    updates = data.model_dump(exclude_unset=True)

    # Cross-field date validation when both sides are present
    new_start = updates.get("start_date", c.start_date)
    new_end   = updates.get("end_date",   c.end_date)
    if new_start and new_end and new_end < new_start:
        raise HTTPException(status_code=422, detail="end_date must be on or after start_date")

    for k, v in updates.items():
        setattr(c, k, v)

    db.commit()
    db.refresh(c)
    return campaign_dict(c)


@router.delete("/{campaign_id}")
def delete_campaign(campaign_id: int, db: Session = Depends(get_db)):
    """Permanently deletes a campaign."""
    c = db.query(Campaigns).filter(Campaigns.id == campaign_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Campaign not found")
    db.delete(c)
    db.commit()
    return {"msg": "Campaign deleted successfully"}