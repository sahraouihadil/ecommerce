"""
groq_service.py - Groq AI (LLaMA) Integration
"""

import os
import json
from groq import Groq
from dotenv import load_dotenv

load_dotenv()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

BASE_PERSONA = (
    "You are Roomie, a friendly AI shopping assistant for ARoom, an AR furniture store. "
    "Be concise — reply in 1 to 2 short sentences only. Never write long paragraphs. "
    "Detect the language the customer writes in and always reply in that same language. "
    "If they write in Arabic (including Algerian Darija), reply in Arabic. "
    "If French, reply in French. Default to English otherwise. "
    "IMPORTANT: Only recommend products that exist in the catalog provided to you. "
    "If a customer asks about a product not in the catalog, politely say we don't carry it "
    "and suggest the closest available alternative from the catalog."
)

PHASE_INSTRUCTIONS = {
    "before_ar": (
        "The customer is browsing. Your goal: understand what they need and recommend specific products "
        "from the catalog below. Mention AR/3D viewing when relevant. "
        "If a product is on sale or is a new arrival, highlight it naturally."
    ),
    "during_ar": (
        "The customer is currently viewing a product in AR. "
        "Answer questions about it concisely. If they seem interested, encourage adding to cart. "
        "Only mention other products if they explicitly ask for alternatives."
    ),
    "after_ar": (
        "The customer just finished AR viewing. "
        "Briefly affirm their choice and suggest 1 complementary item from the catalog if available. "
        "Gently nudge toward purchase without being pushy."
    ),
}


def get_bot_response(message: str, context: str, history: list, product_name: str, products: list) -> str:
    phase = PHASE_INSTRUCTIONS.get(context, PHASE_INSTRUCTIONS["before_ar"])
    system_prompt = BASE_PERSONA + "\n\n" + phase

    if product_name:
        system_prompt += f"\n\nThe customer is looking at: {product_name}."

    if products:
        system_prompt += "\n\nAvailable products:\n" + json.dumps(products, ensure_ascii=False)

    messages = [{"role": "system", "content": system_prompt}]

    for h in history:
        role = "assistant" if h["role"] == "bot" else "user"
        messages.append({"role": role, "content": h["content"]})

    messages.append({"role": "user", "content": message})

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=messages,
        max_tokens=100,
    )

    return response.choices[0].message.content