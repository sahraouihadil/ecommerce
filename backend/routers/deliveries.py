from fastapi import APIRouter,HTTPException,Depends
from sqlalchemy import func
from sqlalchemy.orm import aliased
from pydantic import BaseModel
from typing import Optional
from database import get_db
from schema import PatchDeliveryRequest
import models

router = APIRouter(prefix="/api/deliveries", tags=["deliveries"])

# ─── GET /api/deliveries ──────────────────────────────────────────────────────
# Returns all orders enriched with customer info, item count, and deliveryman
# username (so the frontend can match d.deliveryman === dm.username directly).

@router.get("")
def get_deliveries(db: Session = Depends(get_db)):

    # Alias the Users table a second time for the deliveryman join
    DeliverymanUser = aliased(models.Users)

    deliveries = (
        db.query(
            models.Orders.id.label("order_id"),
            models.Orders.orderdate,
            models.Orders.deliverydate,
            models.Orders.totalamount,
            models.Orders.status,
            models.Orders.delivery_type,
            models.Orders.wilaya,
            models.Orders.city,
            models.Orders.street_address,
            models.Orders.deliveryman_id,

            # Customer fields
            models.Users.username.label("customer_name"),
            models.Users.phone_num.label("customer_phone"),
            models.Users.email.label("customer_email"),

            # Deliveryman username (None when unassigned)
            DeliverymanUser.username.label("deliveryman"),

            func.count(models.OrderItems.id).label("items_count"),
        )
        # Customer join (inner — every order has a customer)
        .join(models.Users, models.Users.id == models.Orders.user_id)
        # Deliveryman join (outer — deliveryman may not be assigned yet)
        .outerjoin(DeliverymanUser, DeliverymanUser.id == models.Orders.deliveryman_id)
        # Items join
        .outerjoin(models.OrderItems, models.OrderItems.order_id == models.Orders.id)
        .group_by(
            models.Orders.id,
            models.Users.username,
            models.Users.phone_num,
            models.Users.email,
            DeliverymanUser.username,
        )
        .all()
    )

    return [
        {
            "order_id":       d.order_id,
            "orderdate":      d.orderdate,
            "deliverydate":   d.deliverydate,
            "totalamount":    d.totalamount,
            "status":         d.status,
            "delivery_type":  d.delivery_type,
            "wilaya":         d.wilaya,
            "commune":           d.city,
            "street_address": d.street_address,
            "deliveryman_id": d.deliveryman_id,
            "deliveryman":    d.deliveryman,     
            "items_count":    d.items_count,
            "customer_name":  d.customer_name,
            "customer_phone": d.customer_phone,
            "customer_email": d.customer_email,
        }
        for d in deliveries
    ]


# ─── GET /api/deliverymen ─────────────────────────────────────────────────────
deliverymen_router = APIRouter(prefix="/api/deliverymen", tags=["deliverymen"])
@deliverymen_router.get("")
def get_deliverymen(db: Session = Depends(get_db)):
    deliverymen = (
        db.query(models.Users)
        .filter(models.Users.role == "deliveryman")
        .all()
    )

    return [
        {
            "id":          u.id,
            "username":    u.username,
            "email":       u.email,
            "phone_num":   u.phone_num,
            "active":      u.active,
            "activeCount": 14,
        }
        for u in deliverymen
    ]


# ─── PATCH /api/deliveries/{order_id} ────────────────────────────────────────
# Handles two independent operations (can be sent together or separately):
#
#   { "deliveryman": "john_doe" }  → assign by username
#   { "deliveryman": ""          }  → unassign (set deliveryman_id to NULL)
#   { "status": "processing"     }  → update order status
#   { "deliveryman": "x",
#     "status": "shipped"        }  → both at once

@router.patch("/{order_id}")
def patch_delivery(
    order_id: int,
    body: PatchDeliveryRequest,
    db: Session = Depends(get_db),
):
    order = db.query(models.Orders).filter(models.Orders.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # ── Deliveryman assignment ────────────────────────────────────────────────
    if body.deliveryman is not None:
        if body.deliveryman == "":
            order.deliveryman_id = None
        else:
            dm_user = (
                db.query(models.Users)
                .filter(
                    models.Users.username == body.deliveryman,
                    models.Users.role == "deliveryman",
                )
                .first()
            )
            if not dm_user:
                raise HTTPException(
                    status_code=404,
                    detail=f"Deliveryman '{body.deliveryman}' not found",
                )
            order.deliveryman_id = dm_user.id

    # ── Status update ─────────────────────────────────────────────────────────
    if body.status is not None:
        allowed_statuses = {"pending", "processing", "shipped", "delivered", "canceled","problem"}
        normalized = body.status.lower()

        if normalized not in allowed_statuses:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid status '{body.status}'. Allowed: {allowed_statuses}",
            )

        # update order status
        order.status = normalized

        # update all items status (except canceled ones if you want)
        for item in order.items:
            if item.status != "canceled":  # optional rule
                item.status = normalized

    # ── Delivery date update ──────────────────────────────────────────────────
    raw = body.model_dump(exclude_unset=True)
    if "deliverydate" in raw:
        order.deliverydate = raw["deliverydate"]

    # ── Persist ───────────────────────────────────────────────────────────────
    db.commit()
    db.refresh(order)

    return {
        "message": "Order + items updated successfully",
        "order_id": order_id
    }
    order = db.query(models.Orders).filter(models.Orders.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # ── Deliveryman assignment ────────────────────────────────────────────────
    if body.deliveryman is not None:
        if body.deliveryman == "":
            order.deliveryman_id = None
        else:
            dm_user = (
                db.query(models.Users)
                .filter(
                    models.Users.username == body.deliveryman,
                    models.Users.role == "deliveryman",
                )
                .first()
            )
            if not dm_user:
                raise HTTPException(
                    status_code=404,
                    detail=f"Deliveryman '{body.deliveryman}' not found",
                )
            order.deliveryman_id = dm_user.id

    # ── Status update ─────────────────────────────────────────────────────────
    if body.status is not None:
        allowed_statuses = {"pending", "processing", "shipped", "delivered", "canceled"}
        normalized = body.status.lower()
        if normalized not in allowed_statuses:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid status '{body.status}'. Allowed: {allowed_statuses}",
            )
        order.status = normalized

    # ── Delivery date update ──────────────────────────────────────────────────
    # We check the raw dict so we can distinguish "field not sent" (skip)
    # from "field sent as null" (clear) and "field sent with a date" (update).
    raw = body.model_dump(exclude_unset=True)
    if "deliverydate" in raw:
        order.deliverydate = raw["deliverydate"]   # None clears it, date sets it

    # ── Persist ───────────────────────────────────────────────────────────────
    db.commit()
    db.refresh(order)

    return {"message": "Order updated successfully", "order_id": order_id}