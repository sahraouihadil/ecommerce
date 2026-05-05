import asyncio, json
from fastapi import APIRouter, Depends, Query, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from database import get_db
from models import Notification
from security.jwt_handler import verify_token, PUBLIC_KEY_PATH, ALGORITHM, TOKEN_BLACKLIST
from jose import jwt, JWTError

router = APIRouter(prefix="/api/notifications", tags=["notifications"])

# FIX: Support multiple tabs — list of queues per user instead of one
active_connections: dict[int, list[asyncio.Queue]] = {}


def verify_raw_token(token: str) -> dict:
    try:
        with open(PUBLIC_KEY_PATH, "r") as f:
            public_key = f.read()
        payload = jwt.decode(token, public_key, algorithms=[ALGORITHM])
        if "sub" not in payload or "role" not in payload:
            raise HTTPException(status_code=401, detail="Invalid token payload")
        if token in TOKEN_BLACKLIST:
            raise HTTPException(status_code=401, detail="Token has been revoked")
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except JWTError:
        raise HTTPException(status_code=401, detail="Could not validate token")


async def push_notification(db: Session, user_id: int, type: str, title: str, body: str):
    notif = Notification(user_id=user_id, type=type, title=title, body=body)
    db.add(notif)
    db.commit()
    db.refresh(notif)

    if user_id in active_connections:
        data = {
            "id":         notif.id,
            "type":       notif.type,
            "title":      notif.title,
            "body":       notif.body,
            "is_read":    False,
            "created_at": notif.created_at.isoformat(),
        }
        for queue in active_connections[user_id]:
            await queue.put(data)


@router.get("")
def get_notifications(
    db: Session = Depends(get_db),
    payload: dict = Depends(verify_token)
):
    # "id" = user_id in the JWT payload (confirmed from jwt_handler.py)
    user_id = payload.get("id")
    notifs = (
        db.query(Notification)
        .filter(Notification.user_id == user_id)
        .order_by(Notification.created_at.desc())
        .limit(30)
        .all()
    )
    return [
        {
            "id":         n.id,
            "type":       n.type,
            "title":      n.title,
            "body":       n.body,
            "is_read":    n.is_read,
            "created_at": n.created_at.isoformat(),
        }
        for n in notifs
    ]


@router.patch("/read-all")
def mark_all_read(
    db: Session = Depends(get_db),
    payload: dict = Depends(verify_token)
):
    user_id = payload.get("id")
    db.query(Notification).filter_by(user_id=user_id, is_read=False).update({"is_read": True})
    db.commit()
    return {"ok": True}


@router.patch("/{notif_id}/read")
def mark_read(
    notif_id: int,
    db: Session = Depends(get_db),
    payload: dict = Depends(verify_token)
):
    user_id = payload.get("id")
    notif = db.query(Notification).filter_by(id=notif_id, user_id=user_id).first()
    if notif:
        notif.is_read = True
        db.commit()
    return {"ok": True}


@router.get("/stream")
async def notification_stream(
    token: str = Query(...),
    db: Session = Depends(get_db)
):
    payload = verify_raw_token(token)
    user_id = payload.get("id")

    queue = asyncio.Queue()

    # FIX: append to list — supports multiple tabs
    if user_id not in active_connections:
        active_connections[user_id] = []
    active_connections[user_id].append(queue)

    async def event_generator():
        try:
            while True:
                data = await queue.get()
                yield f"data: {json.dumps(data)}\n\n"
        except asyncio.CancelledError:
            pass
        finally:
            if user_id in active_connections:
                try:
                    active_connections[user_id].remove(queue)
                except ValueError:
                    pass
                if not active_connections[user_id]:
                    del active_connections[user_id]

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )