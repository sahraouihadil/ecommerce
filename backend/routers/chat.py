"""
chat.py - AI Chatbot API endpoint
====================================
POST /api/chat
Called by: ChatWidget.jsx

Queries the DB for relevant products based on context,
then passes them to the Groq service.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from services.groq_service import get_bot_response
from schema import ChatRequest, ChatResponse
from database import get_db
from models import Products  # adjust import to match your project structure

router = APIRouter(prefix="/chat", tags=["chat"])


def fetch_products_for_context(context: str, product_name: str, db: Session):
    """
    Fetches the right products depending on the shopping phase.

    before_ar → full active catalog (id, name, price, category, able_ar, able_3d, badges)
    during_ar → only the product being viewed (full details)
    after_ar  → the viewed product + up to 4 products in the same category
    """
    base_query = db.query(Products).filter(Products.is_active == True)

    if context == "during_ar" and product_name:
        products = base_query.filter(Products.name.ilike(f"%{product_name}%")).limit(1).all()

    elif context == "after_ar" and product_name:
        viewed = base_query.filter(Products.name.ilike(f"%{product_name}%")).first()
        if viewed:
            related = (
                base_query
                .filter(Products.category == viewed.category, Products.name != viewed.name)
                .limit(4)
                .all()
            )
            products = [viewed] + related
        else:
            products = base_query.limit(10).all()

    else:  # before_ar or fallback
        products = base_query.limit(12).all()

    return [
        {
            "id": p.id,
            "name": p.name,
            "description": p.description,
            "price": p.discount_price if p.on_sale and p.discount_price else p.price,
            "original_price": p.price if p.on_sale else None,
            "on_sale": p.on_sale,
            "new_arrival": p.new_arrival,
            "category": p.category,
            "able_ar": p.able_ar,
            "able_3d": p.able_3d,
            "badge": p.badge,
        }
        for p in products
    ]


@router.post("/", response_model=ChatResponse)
async def chat(request: ChatRequest, db: Session = Depends(get_db)):
    try:
        products = fetch_products_for_context(request.context, request.product_name, db)

        reply = get_bot_response(
            message=request.message,
            context=request.context,
            history=request.history,
            product_name=request.product_name,
            products=products,
        )
        return ChatResponse(reply=reply)
    except Exception as e:
        return ChatResponse(reply=f"Sorry, something went wrong: {str(e)}")