"""
chat.py - AI Chatbot API endpoint
====================================
Handles the Roomie AI chatbot feature.
Roomie is an AI shopping assistant powered by Groq's LLaMA 3.1 model.

The chatbot has 3 contexts:
  - "before_ar": User is browsing, hasn't viewed any product in AR yet
  - "during_ar": User is currently viewing a product in AR
  - "after_ar": User finished AR viewing, considering purchase

Endpoint: POST /api/chat
Called by: ChatWidget.jsx (the lamp mascot in the corner of the page)
"""

from fastapi import APIRouter
from pydantic import BaseModel
from services.groq_service import get_bot_response

# This router is included in main.py with prefix="/api",
# so the full endpoint path is /api/chat
router = APIRouter(prefix="/chat", tags=["chat"])


class ChatRequest(BaseModel):
    """
    The data sent by the frontend when the user sends a chat message.
    """
    message: str              # The user's message text
    context: str = "before_ar"  # Shopping context (before_ar, during_ar, after_ar)
    product_name: str = ""    # Name of the product being viewed (if any)
    history: list = []        # Previous messages in the conversation


class ChatResponse(BaseModel):
    """The AI's reply sent back to the frontend."""
    reply: str


@router.post("/", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Sends the user's message to the Groq AI and returns the response.

    The AI (Roomie) knows about all available products and can:
    - Recommend furniture based on preferences
    - Answer questions about products
    - Suggest complementary items
    """
    try:
        reply = get_bot_response(
            request.message,
            request.context,
            request.history,
            request.product_name
        )
        return ChatResponse(reply=reply)
    except Exception as e:
        return ChatResponse(reply=f"Sorry, something went wrong: {str(e)}")
