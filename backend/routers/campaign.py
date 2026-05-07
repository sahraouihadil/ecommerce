import os
import uuid
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from sqlalchemy import func, or_
from sqlalchemy.orm import Session
from models import Campaigns
from database import get_db
from schema import CampaignCreate, CampaignUpdate
from user_crud import get_current_user

UPLOAD_DIR = "uploads/campaigns"
os.makedirs(UPLOAD_DIR, exist_ok=True)

ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
MAX_SIZE_MB = 5

router = APIRouter(prefix="/api/campaigns", tags=["Campaigns"])


def campaign_dict(c: Campaigns) -> dict:
    return {
        "id":            c.id,
        "name":          c.name,
        "title":         c.title,
        "channel":       c.channel,
        "status":        c.status,
        "is_active":     bool(c.is_active) if c.is_active is not None else False,
        "campaign_type": c.campaign_type,
        "budget":        float(c.budget        or 0),
        "spent":         float(c.spent         or 0),
        "impressions":   int(c.impressions     or 0),
        "clicks":        int(c.clicks          or 0),
        "discount":      float(c.discount) if c.discount is not None else None,
        "discount_type": c.discount_type,
        "code":          c.code,
        "usage_max":     int(c.usage_max       or 0),
        "usage_current": int(c.usage_current   or 0),
        "start_date":    str(c.start_date)  if c.start_date  else None,
        "end_date":      str(c.end_date)    if c.end_date    else None,
        "image_url":     c.image_url,
        "created_at":    c.created_at.isoformat() if c.created_at else None,
        "validation_status": "approved",
    }


@router.get("/")
def list_campaigns(db: Session = Depends(get_db)):
    campaigns = (
        db.query(Campaigns)
        .order_by(Campaigns.created_at.desc())
        .all()
    )
    return [campaign_dict(c) for c in campaigns]


@router.get("/active")
def list_active_campaigns(db: Session = Depends(get_db)):
    campaigns = (
        db.query(Campaigns)
        .filter(Campaigns.is_active == True)
        .filter(
            or_(
                Campaigns.start_date == None,
                Campaigns.start_date <= func.now()
            )
        )
        .filter(
            or_(
                Campaigns.end_date == None,
                Campaigns.end_date >= func.now()
            )
        )
        .order_by(Campaigns.created_at.desc())
        .all()
    )
    return [campaign_dict(c) for c in campaigns]


@router.get("/{campaign_id}")
def get_campaign(campaign_id: int, db: Session = Depends(get_db)):
    c = db.query(Campaigns).filter(Campaigns.id == campaign_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return campaign_dict(c)


@router.post("/", status_code=201)
def create_campaign(
    body: CampaignCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    data = body.model_dump()

    c = Campaigns(
        name          = data["name"],
        title         = data["title"],
        channel       = data["channel"],
        status        = data.get("status", "active"),
        is_active     = True,  # ✅ تفعيل مباشر
        campaign_type = data.get("campaign_type"),
        budget        = data["budget"],
        spent         = data.get("spent", 0),
        impressions   = data.get("impressions", 0),
        clicks        = data.get("clicks", 0),
        discount      = data.get("discount"),
        discount_type = data.get("discount_type"),
        code          = data.get("code"),
        usage_max     = data.get("usage_max", 0),
        usage_current = data.get("usage_current", 0),
        start_date    = data["start_date"],
        end_date      = data["end_date"],
        image_url     = None,
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
    current_user: dict = Depends(get_current_user),
):
    c = db.query(Campaigns).filter(Campaigns.id == campaign_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Campaign not found")

    updates = data.model_dump(exclude_unset=True)
    updates.pop("is_active", None)

    new_start = updates.get("start_date", c.start_date)
    new_end   = updates.get("end_date",   c.end_date)
    if new_start and new_end and new_end < new_start:
        raise HTTPException(status_code=422, detail="end_date must be on or after start_date")

    new_usage_max     = updates.get("usage_max",     c.usage_max)
    new_usage_current = updates.get("usage_current", c.usage_current)
    if new_usage_max is not None and new_usage_current is not None:
        if new_usage_max > 0 and new_usage_current > new_usage_max:
            raise HTTPException(status_code=422, detail="usage_max cannot be less than current usage count.")

    for k, v in updates.items():
        setattr(c, k, v)

    # ✅ is_active تبقى كما هي — ما نحطوهاش False
    db.commit()
    db.refresh(c)
    return campaign_dict(c)


@router.patch("/{campaign_id}/activate")
def toggle_campaign_active(
    campaign_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Toggle is_active on/off."""
    c = db.query(Campaigns).filter(Campaigns.id == campaign_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Campaign not found")
    c.is_active = not bool(c.is_active)
    db.commit()
    db.refresh(c)
    return campaign_dict(c)


@router.post("/{campaign_id}/redeem")
def redeem_campaign_code(
    campaign_id: int,
    db: Session = Depends(get_db),
):
    from sqlalchemy import text
    now = db.execute(text("SELECT NOW()")).fetchone()[0]

    c = db.query(Campaigns).filter(Campaigns.id == campaign_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Campaign not found")
    if not c.is_active:
        raise HTTPException(status_code=400, detail="Campaign is not active")
    if c.start_date and c.start_date > now:
        raise HTTPException(status_code=400, detail="Campaign has not started yet")
    if c.end_date and c.end_date < now:
        raise HTTPException(status_code=400, detail="Campaign has expired")
    if c.usage_max and c.usage_current >= c.usage_max:
        raise HTTPException(status_code=400, detail="Campaign usage limit reached")

    c.usage_current = (c.usage_current or 0) + 1
    db.commit()
    db.refresh(c)
    return {
        "valid":         True,
        "discount":      c.discount,
        "discount_type": c.discount_type,
        "code":          c.code,
        "usage_current": c.usage_current,
        "usage_max":     c.usage_max,
    }


@router.post("/{campaign_id}/image")
async def upload_campaign_image(
    campaign_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    c = db.query(Campaigns).filter(Campaigns.id == campaign_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Campaign not found")

    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=415, detail=f"Unsupported file type '{file.content_type}'.")

    contents = await file.read()
    if len(contents) > MAX_SIZE_MB * 1024 * 1024:
        raise HTTPException(status_code=413, detail=f"File too large. Max {MAX_SIZE_MB} MB.")

    if c.image_url:
        old_path = c.image_url.lstrip("/")
        if os.path.isfile(old_path):
            os.remove(old_path)

    ext      = os.path.splitext(file.filename or "")[-1].lower() or ".jpg"
    filename = f"{uuid.uuid4().hex}{ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)

    with open(filepath, "wb") as f:
        f.write(contents)

    c.image_url = f"/uploads/campaigns/{filename}"
    db.commit()
    db.refresh(c)
    return campaign_dict(c)


@router.delete("/{campaign_id}/image")
def delete_campaign_image(campaign_id: int, db: Session = Depends(get_db)):
    c = db.query(Campaigns).filter(Campaigns.id == campaign_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Campaign not found")

    if c.image_url:
        old_path = c.image_url.lstrip("/")
        if os.path.isfile(old_path):
            os.remove(old_path)

    c.image_url = None
    db.commit()
    db.refresh(c)
    return campaign_dict(c)


@router.delete("/{campaign_id}")
def delete_campaign(
    campaign_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    c = db.query(Campaigns).filter(Campaigns.id == campaign_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Campaign not found")

    import validation_crud as vcrud
    from schema import ValidationSubmit
    try:
        vcrud.submit_delete_request(
            db,
            campaign_id   = c.id,
            campaign_name = c.name,
            submitted_by  = current_user["id"],
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    return {"msg": "Deletion request submitted. Awaiting admin approval."}