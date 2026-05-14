"""
validation_router.py - FastAPI router for the Validation Queue
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime

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


def _serialize_datetime(obj):
    """Recursively convert datetime objects to ISO strings for JSONResponse."""
    if isinstance(obj, dict):
        return {k: _serialize_datetime(v) for k, v in obj.items()}
    if isinstance(obj, datetime):
        return obj.isoformat()
    return obj


@router.get("/stats", response_model=ValidationStats)
def get_stats(db: Session = Depends(get_db)):
    return crud.get_stats(db)


@router.get("/")
def list_requests(
    status:    Optional[str] = Query(None),
    item_type: Optional[str] = Query(None),
    skip:      int           = Query(0,  ge=0),
    limit:     int           = Query(50, ge=1, le=500),
    db:        Session       = Depends(get_db),
):
    requests = crud.get_all(db, status=status, item_type=item_type, skip=skip, limit=limit)
    return [_to_list_item(r) for r in requests]


@router.get("/{request_id}", response_model=ValidationOut)
def get_request(request_id: int, db: Session = Depends(get_db)):
    req = crud.get_by_id(db, request_id)
    if not req:
        raise HTTPException(status_code=404, detail="Validation request not found.")
    return req


@router.post("/", response_model=ValidationOut, status_code=status.HTTP_201_CREATED)
def submit_request(
    payload:      ValidationSubmit,
    db:           Session = Depends(get_db),
    current_user: dict    = Depends(get_current_user),
):
    """
    Create a brand-new validation request.
    Returns 400 if a Pending request already exists for this item — use
    /upsert instead when re-submitting after an edit.
    """
    try:
        req = crud.submit_for_validation(db, payload, submitted_by=current_user["id"])
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return req


@router.post("/upsert", response_model=ValidationOut, status_code=status.HTTP_200_OK)
def upsert_request(
    payload:      ValidationSubmit,
    db:           Session = Depends(get_db),
    current_user: dict    = Depends(get_current_user),
):
    """
    Create or reset a validation request for the given item.

    Used by the stock-manager after editing a product:
    - If no validation record exists yet → creates one (status = Pending).
    - If a record already exists (Pending **or** Rejected) → resets it to
      Pending, clears the rejection note, and updates the submitter/timestamp.

    This prevents the 400 "already has a pending request" error that the plain
    POST / endpoint would return when a manager edits a product that was
    already submitted (or previously rejected) for approval.
    """
    try:
        req = crud.upsert_for_validation(db, payload, submitted_by=current_user["id"])
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return req


@router.put("/{request_id}/approve")
def approve_request(
    request_id:   int,
    db:           Session = Depends(get_db),
    current_user: dict    = Depends(get_current_user),
):
    """
    Approve a validation request.
    For Campaigns_Delete: returns a plain JSON snapshot because the DB row
    is deleted as part of the approval — no ORM object remains to serialize.
    For all other types: returns the standard ValidationOut schema.
    """
    try:
        result = crud.approve(db, request_id, reviewed_by=current_user["id"])
    except LookupError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    # If approve() returned a plain dict (Campaigns_Delete / Products_Delete
    # case), send it directly because the DB row has already been removed.
    if isinstance(result, dict):
        return JSONResponse(content=_serialize_datetime(result))

    # Otherwise it's a normal ORM object — let FastAPI serialize via ValidationOut
    return result


@router.put("/{request_id}/reject", response_model=ValidationOut)
def reject_request(
    request_id:   int,
    payload:      RejectionPayload,
    db:           Session = Depends(get_db),
    current_user: dict    = Depends(get_current_user),
):
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