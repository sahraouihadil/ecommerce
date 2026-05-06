import os
import uuid
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from sqlalchemy.orm import Session
from models import Campaigns
from database import get_db
from schema import CampaignCreate, CampaignUpdate

# ─── Upload directory setup ───────────────────────────────────────────────────
# Make sure to mount this in your main.py:
#   app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

UPLOAD_DIR = "uploads/campaigns"
os.makedirs(UPLOAD_DIR, exist_ok=True)

ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
MAX_SIZE_MB = 5

router = APIRouter(prefix="/api/campaigns", tags=["Campaigns"])


# ======================================================================
# SERIALIZER
# ======================================================================

def campaign_dict(c: Campaigns) -> dict:
    return {
        "id":            c.id,
        "name":          c.name,
        "title":         c.title,
        "channel":       c.channel,
        "status":        c.status,
        "budget":        float(c.budget        or 0),
        "spent":         float(c.spent         or 0),
        "impressions":   int(c.impressions     or 0),
        "clicks":        int(c.clicks          or 0),
        # ── discount / coupon fields ──
        "discount":      float(c.discount) if c.discount is not None else None,
        "discount_type": c.discount_type,
        "code":          c.code,
        "usage_max":     int(c.usage_max       or 0),
        "usage_current": int(c.usage_current   or 0),
        # ── dates ──
        "start_date":    str(c.start_date)  if c.start_date  else None,
        "end_date":      str(c.end_date)    if c.end_date    else None,
        "image_url":     c.image_url,
        "created_at":    c.created_at.isoformat() if c.created_at else None,
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
        name          = data["name"],
        title         = data["title"],
        channel       = data["channel"],
        status        = data["status"],
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

    # usage_max must be >= usage_current
    new_usage_max     = updates.get("usage_max",     c.usage_max)
    new_usage_current = updates.get("usage_current", c.usage_current)
    if new_usage_max is not None and new_usage_current is not None:
        if new_usage_max > 0 and new_usage_current > new_usage_max:
            raise HTTPException(
                status_code=422,
                detail="usage_max cannot be less than current usage count."
            )

    for k, v in updates.items():
        setattr(c, k, v)

    db.commit()
    db.refresh(c)
    return campaign_dict(c)


@router.post("/{campaign_id}/image")
async def upload_campaign_image(
    campaign_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    """
    Upload or replace the banner image for a campaign.
    Accepts: JPEG, PNG, WebP, GIF — max 5 MB.
    Returns the updated campaign dict including the new image_url.
    """
    c = db.query(Campaigns).filter(Campaigns.id == campaign_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Campaign not found")

    # Validate content type
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=415,
            detail=f"Unsupported file type '{file.content_type}'. Allowed: JPEG, PNG, WebP, GIF.",
        )

    # Read and size-check
    contents = await file.read()
    if len(contents) > MAX_SIZE_MB * 1024 * 1024:
        raise HTTPException(
            status_code=413,
            detail=f"File too large. Maximum allowed size is {MAX_SIZE_MB} MB.",
        )

    # Delete old image file if one existed
    if c.image_url:
        old_path = c.image_url.lstrip("/")
        if os.path.isfile(old_path):
            os.remove(old_path)

    # Save new file with a unique name
    ext      = os.path.splitext(file.filename or "")[-1].lower() or ".jpg"
    filename = f"{uuid.uuid4().hex}{ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)

    with open(filepath, "wb") as f:
        f.write(contents)

    # Persist URL (served via the /uploads static mount)
    c.image_url = f"/uploads/campaigns/{filename}"
    db.commit()
    db.refresh(c)
    return campaign_dict(c)


@router.delete("/{campaign_id}/image")
def delete_campaign_image(campaign_id: int, db: Session = Depends(get_db)):
    """Removes the banner image from a campaign."""
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
def delete_campaign(campaign_id: int, db: Session = Depends(get_db)):
    """Permanently deletes a campaign (also removes its image file)."""
    c = db.query(Campaigns).filter(Campaigns.id == campaign_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Campaign not found")

    # Clean up image file on disk
    if c.image_url:
        old_path = c.image_url.lstrip("/")
        if os.path.isfile(old_path):
            os.remove(old_path)

    db.delete(c)
    db.commit()
    return {"msg": "Campaign deleted successfully"}