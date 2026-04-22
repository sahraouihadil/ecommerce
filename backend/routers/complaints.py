# routes/complaints.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Complaints,Users

router = APIRouter(prefix="/api/complaints", tags=["Complaints"])


@router.get("/")
def get_complaints(db: Session = Depends(get_db)):
    results = (
        db.query(Complaints, Users)
        .join(Users, Complaints.user_id == Users.id)
        .all()
    )

    return [
        {
            "id": c.id,
            "title": c.title,
            "description": c.description,
            "date": c.date,
            "type": c.type_c,
            "priority": c.priority,
            "status": c.status,
            "note": c.internal_note,

          # user info
            "user": u.username,
            "email": u.email,
        }
        for c, u in results
    ]


# UPDATE status
@router.put("/{complaint_id}/status")
def update_complaint_status(complaint_id: int, status: str, db: Session = Depends(get_db)):
    complaint = db.query(Complaints).filter(Complaints.id == complaint_id).first()

    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")

    complaint.status = status
    db.commit()
    db.refresh(complaint)

    return complaint

@router.put("/{complaint_id}/note")
def update_note(complaint_id: int, note: str, db: Session = Depends(get_db)):
    complaint = db.query(Complaints).filter(Complaints.id == complaint_id).first()

    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")

    complaint.internal_note = note
    db.commit()
    db.refresh(complaint)

    return complaint