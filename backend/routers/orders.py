"""
orders.py - Order Management API endpoints
============================================
Handles the checkout process and order viewing:
  - POST   /api/orders         → Create an order from cart items (checkout)
  - GET    /api/orders         → View all of the user's orders
  - GET    /api/orders/{id}    → View a specific order with details

All endpoints require authentication.

CHECKOUT FLOW:
  1. User has items in their cart (managed by cart.py)
  2. User clicks "Place Order" → POST /api/orders
  3. Backend creates an Order + OrderItems from the cart items
  4. Cart items are deleted (moved to the order)
  5. Frontend redirects to the order confirmation page
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Orders, OrderItems, CartItems, Products
from security.jwt_handler import verify_token
from datetime import datetime
from schema import OrderCreate

router = APIRouter(prefix="/api/orders", tags=["orders"], redirect_slashes=False)


@router.post("")
def create_order(data: OrderCreate,db: Session = Depends(get_db), payload: dict = Depends(verify_token)):
    """
    Creates a new order from the user's cart items.
    This is the "checkout" endpoint.

    Steps:
      1. Get all items from the user's cart
      2. Calculate the total price
      3. Create an Order record
      4. Create OrderItem records for each cart item
      5. Delete the cart items (they've been "moved" to the order)

    Called by: CheckoutPage.jsx "Place Order" button
    """
    user_id = payload.get("id")

    # Step 1: Get cart items
    cart_items = db.query(CartItems).filter(CartItems.user_id == user_id).all()
    if not cart_items:
        raise HTTPException(status_code=400, detail="Cart is empty")

    # Step 2: Calculate total price
    total = 0
    for item in cart_items:
        product = db.query(Products).filter(Products.id == item.product_id).first()
        if product:
            total += product.price * item.quantity

    # Step 3: Create the Order
    order = Orders(
       user_id=user_id,
       totalamount=total,
       status="pending",
       orderdate=datetime.utcnow(),
       deliverydate=data.deliverydate,
       delivery_type=data.delivery_type,

       wilaya=data.wilaya,
       city=data.city,
       street_address=data.streetAddress,
    )
    db.add(order)
    db.flush()  # flush() assigns the order.id without committing yet

    # Step 4: Create OrderItems and delete CartItems
    for item in cart_items:
        product = db.query(Products).filter(Products.id == item.product_id).first()
        order_item = OrderItems(
            order_id=order.id,
            product_id=item.product_id,
            quantity=item.quantity,
            price=product.price if product else 0  # Save price at time of purchase
        )
        db.add(order_item)
        db.delete(item)     # Remove from cart

    # Step 5: Commit everything (order + items + cart cleanup)
    db.commit()

    return {"message": "Order placed successfully", "order_id": order.id, "total": total}


@router.get("")
def get_orders(db: Session = Depends(get_db), payload: dict = Depends(verify_token)):
    """
    Returns all orders for the current user, newest first.
    Each order includes a list of its items.

    Called by: OrderPage.jsx on page load
    """
    user_id = payload.get("id")

    # Get orders sorted by date (newest first)
    orders = db.query(Orders).filter(Orders.user_id == user_id).order_by(Orders.orderdate.desc()).all()

    result = []
    for order in orders:
        # Get the items for each order
        items = db.query(OrderItems).filter(OrderItems.order_id == order.id).all()
        result.append({
            "id": order.id,
            "orderdate": order.orderdate.isoformat() if order.orderdate else None,
            "deliverydate": order.deliverydate.isoformat() if order.deliverydate else None,
            "totalamount": order.totalamount,
            "status": order.status,
            "items": [{
                "id": i.id,
                "product_id": i.product_id,
                "price": i.price,
                "quantity": i.quantity
            } for i in items]
        })
    return result




@router.get("/all")
def get_all_orders(db: Session = Depends(get_db), payload: dict = Depends(verify_token)):
    """Returns all orders. For staff roles (stock manager, deliveryman, accountant)."""
    orders = db.query(Orders).order_by(Orders.orderdate.desc()).all()
    result = []
    for order in orders:
        items = db.query(OrderItems).filter(OrderItems.order_id == order.id).all()
        item_details = []
        for i in items:
            product = db.query(Products).filter(Products.id == i.product_id).first()
            item_details.append({
                "id": i.id,
                "product_id": i.product_id,
                "price": i.price,
                "quantity": i.quantity,
                "product_name": product.name if product else "Unknown",
            })
        result.append({
            "id": order.id,
            "user_id": order.user_id,
            "orderdate": order.orderdate.isoformat() if order.orderdate else None,
            "totalamount": order.totalamount,
            "status": order.status,
            "items": item_details
        })
    return result

@router.get("/history")
async def user_history(
    db: Session = Depends(get_db),
    payload: dict = Depends(verify_token)
):
    user = payload
    
    if user is None:
        raise HTTPException(status_code=401, detail="Authentication Failed")

    orders = db.query(Orders).filter(
        Orders.user_id == user["id"],
        Orders.status.in_(["delivered", "canceled"])
    ).all()
     
    result = []
    for order in orders:
        items = db.query(OrderItems).filter(
            OrderItems.order_id == order.id
        ).all()
        
        result.append({
            "id": order.id,
            "orderdate": order.orderdate,
            "deliverydate": order.deliverydate,
            "totalamount": order.totalamount,
            "status": order.status,
            "items": [
                {
                    "id": i.id,
                    "product_id": i.product_id,
                    "price": i.price,
                    "quantity": i.quantity
                }
                for i in items
            ]
        })

    return result

@router.get("/{order_id}")
def get_order(order_id: int, db: Session = Depends(get_db), payload: dict = Depends(verify_token)):
    """
    Returns detailed info about a specific order.
    Includes product names for each item (used by the tracking page).

    Called by: TrackingPage.jsx → GET /api/orders/{orderId}
    """
    user_id = payload.get("id")

    # Find the order (must belong to this user)
    order = db.query(Orders).filter(Orders.id == order_id, Orders.user_id == user_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # Get items with product names
    items = db.query(OrderItems).filter(OrderItems.order_id == order.id).all()
    item_details = []
    for i in items:
        product = db.query(Products).filter(Products.id == i.product_id).first()
        item_details.append({
            "id": i.id,
            "product_id": i.product_id,
            "price": i.price,
            "quantity": i.quantity,
            "product_name": product.name if product else "Unknown",
        })

    return {
        "id": order.id,
        "orderdate": order.orderdate.isoformat() if order.orderdate else None,
        "deliverydate": order.deliverydate.isoformat() if order.deliverydate else None,
        "totalamount": order.totalamount,
        "status": order.status,
        "items": item_details
    }

@router.put("/{order_id}/status")
def update_order_status(order_id: int, status: str, db: Session = Depends(get_db), payload: dict = Depends(verify_token)):
    """Updates order status. For stock manager and deliveryman."""
    order = db.query(Orders).filter(Orders.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    order.status = status
    db.commit()
    return {"message": "Status updated", "order_id": order_id, "status": status}