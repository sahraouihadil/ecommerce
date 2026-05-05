"""
validation_router.py - FastAPI router for the Validation Queue
==============================================================

Mount this in main.py:
    from validation_router import router as validation_router
    app.include_router(validation_router, prefix="/api/validation", tags=["Validation"])

Endpoints
─────────
GET    /api/validation/              List all requests (filterable by status & item_type)
GET    /api/validation/stats         Stat card counts
GET    /api/validation/{id}          Get single request detail
POST   /api/validation/              Submit a new item for review
PUT    /api/validation/{id}/approve  Approve:
                                       AR  → valid_ar  = True   (3D untouched)
                                       3D  → valid_3d  = True   (AR untouched)
                                       Products → is_active = True
PUT    /api/validation/{id}/reject   Reject:
                                       AR  → valid_ar  = False  (3D untouched)
                                       3D  → valid_3d  = False  (AR untouched)
                                       Products → is_active = False
                                       Stores rejection_note
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional

from database import get_db
from user_crud import get_current_user
import validation_crud as crud
from schema import (
    ValidationSubmit,
    RejectionPayload,
    ValidationOut,
    ValidationStats,
)

router = APIRouter(prefix="/api/validation", tags=["validation"], redirect_slashes=False)


# ── Helper: build the list-row dict the frontend expects ─────────────────────

def _to_list_item(req) -> dict:
    return {
        "id":             req.id,
        "item_type":      req.item_type,
        "item_id":        req.item_id,
        "title":          req.title,
        "status":         req.status,
        "submitted_at":   req.submitted_at,
        "reviewed_at":    req.reviewed_at,
        "rejection_note": req.rejection_note,
        "user":           req.submitter.username if req.submitter else None,
    }


# ── GET /api/validation/stats ─────────────────────────────────────────────────

@router.get("/stats", response_model=ValidationStats)
def get_stats(db: Session = Depends(get_db)):
    return crud.get_stats(db)


# ── GET /api/validation/ ──────────────────────────────────────────────────────

@router.get("/")
def list_requests(
    status:    Optional[str] = Query(None, description="Pending | Approved | Rejected"),
    item_type: Optional[str] = Query(None, description="Products | AR | 3D | Campaigns | Promotions | Blogs"),
    skip:      int           = Query(0,    ge=0),
    limit:     int           = Query(50,   ge=1, le=500),
    db:        Session       = Depends(get_db),
):
    requests = crud.get_all(db, status=status, item_type=item_type, skip=skip, limit=limit)
    return [_to_list_item(r) for r in requests]


# ── GET /api/validation/{id} ──────────────────────────────────────────────────

@router.get("/{request_id}", response_model=ValidationOut)
def get_request(request_id: int, db: Session = Depends(get_db)):
    req = crud.get_by_id(db, request_id)
    if not req:
        raise HTTPException(status_code=404, detail="Validation request not found.")
    return req


# ── POST /api/validation/ ─────────────────────────────────────────────────────

@router.post("/", response_model=ValidationOut, status_code=status.HTTP_201_CREATED)
def submit_request(
    payload:      ValidationSubmit,
    db:           Session = Depends(get_db),
    current_user: dict    = Depends(get_current_user),
):
    try:
        req = crud.submit_for_validation(db, payload, submitted_by=current_user["id"])
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return req


# ── PUT /api/validation/{id}/approve ─────────────────────────────────────────

@router.put("/{request_id}/approve", response_model=ValidationOut)
def approve_request(
    request_id:   int,
    db:           Session = Depends(get_db),
    current_user: dict    = Depends(get_current_user),
):
    """
    AR         →  valid_ar  = True   (valid_3d is NOT touched)
    3D         →  valid_3d  = True   (valid_ar is NOT touched)
    Products   →  is_active = True
    Campaigns / Promotions  →  status = "active"
    Blogs      →  status = "published"
    Locks the request. Returns 400 if already reviewed.
    """
    try:
        req = crud.approve(db, request_id, reviewed_by=current_user["id"])
    except LookupError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return req


# ── PUT /api/validation/{id}/reject ──────────────────────────────────────────

@router.put("/{request_id}/reject", response_model=ValidationOut)
def reject_request(
    request_id:   int,
    payload:      RejectionPayload,
    db:           Session = Depends(get_db),
    current_user: dict    = Depends(get_current_user),
):
    """
    AR         →  valid_ar  = False  (valid_3d is NOT touched)
    3D         →  valid_3d  = False  (valid_ar is NOT touched)
    Products   →  is_active = False
    Stores rejection_note visible to the manager. Locks the request.
    Returns 400 if already reviewed.
    """
    try:
        req = crud.reject(
            db,
            request_id,
            rejection_note = payload.rejection_note,
            reviewed_by    = current_user["id"],
        )
    except LookupError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return req