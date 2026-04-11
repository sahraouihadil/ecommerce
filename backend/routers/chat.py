from fastapi import APIRouter
from pydantic import BaseModel
from services.groq_service import get_bot_response

router = APIRouter(prefix="/chat", tags=["chat"])


# Request body for chat endpoint
class ChatRequest(BaseModel):
    message: str
    context: str = "before_ar"
    product_name: str = ""
    history: list = []


# Response body for chat endpoint
class ChatResponse(BaseModel):
    reply: str


# Handle chat messages — sends to Groq and returns AI reply
@router.post("/", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        reply = get_bot_response(
            request.message, request.context, request.history, request.product_name
        )
        return ChatResponse(reply=reply)
    except Exception as e:
        return ChatResponse(reply=f"Sorry, something went wrong: {str(e)}")
