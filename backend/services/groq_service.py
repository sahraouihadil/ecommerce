"""
groq_service.py - Groq AI (LLaMA) Integration
================================================
This file connects to the Groq API to power our Roomie chatbot.

Groq is an AI inference provider that hosts LLaMA models.
We use the "llama-3.1-8b-instant" model for fast, concise responses.

HOW IT WORKS:
  1. Load our product catalog from products.json
  2. Build a system prompt that tells the AI who it is (Roomie) and what it sells
  3. Send the user's message + conversation history to Groq
  4. Return the AI's response

The system prompt changes based on the shopping context:
  - before_ar: Encourage the user to explore products and try AR
  - during_ar: Answer questions about the product they're viewing
  - after_ar: Suggest next steps (buy, compare, etc.)
"""

import os
import json
from dotenv import load_dotenv
from groq import Groq
from sqlalchemy.orm import Session
from database import SessionLocal
from models import Products

# Load the API key from .env
load_dotenv()

# Create the Groq client (like logging into the AI service)
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# ── System Prompts ──
# These tell the AI how to behave in each shopping context.
# The AI will follow these instructions for every message.
PROMPTS = {
    "before_ar": (
        "You are Roomie, a shopping assistant for ARoom, an AR furniture store. "
        "Be concise. Reply in 1-2 short sentences only. Never write long paragraphs. "
        "Help the customer find furniture. Suggest products and encourage 3D viewing and the AR viewer."
    ),
    "during_ar": (
        "You are Roomie, a shopping assistant for ARoom. "
        "Be concise. Reply in 1-2 short sentences only. Never write long paragraphs. "
        "The customer is viewing a product in AR. Answer questions briefly."
    ),
    "after_ar": (
        "You are Roomie, a shopping assistant for ARoom. "
        "Be concise. Reply in 1-2 short sentences only. Never write long paragraphs. "
        "The customer finished AR viewing. Briefly suggest next steps or complementary items."
    ),
}


def load_products():
    """
    Load products directly from PostgreSQL database
    instead of products.json
    """
    db: Session = SessionLocal()

    try:
        products = db.query(Products).all()

        return [
            {
                "id": p.id,
                "name": p.name,
                "description": p.description,
                "price": p.price,
                "stock": p.stock,
                "category": p.category,
            }
            for p in products
        ]

    except Exception as e:
        print("Error loading products:", e)
        return []

    finally:
        db.close()


def get_bot_response(message, context, history, product_name=""):
    """
    Sends a message to the Groq AI and returns the response.

    Parameters:
      - message: The user's latest message
      - context: Shopping context ("before_ar", "during_ar", "after_ar")
      - history: Previous messages in the conversation
      - product_name: Name of the product being viewed (if any)

    Returns: The AI's response text
    """
    # Load product catalog for context
    products = load_products()

    # Pick the right system prompt based on context
    system_prompt = PROMPTS.get(context, PROMPTS["before_ar"])

    # If the user is looking at a specific product, tell the AI about it
    if product_name:
        system_prompt += f" The customer is looking at: {product_name}."

    # Add product catalog to the prompt so the AI knows what we sell
    full_prompt = system_prompt + "\n\nAvailable products:\n" + json.dumps(products)

    # Build the message history for the AI
    # Format: [system prompt, ...previous messages, user's new message]
    messages = [{"role": "system", "content": full_prompt}]
    for h in history:
        role = "assistant" if h["role"] == "bot" else "user"
        messages.append({"role": role, "content": h["content"]})
    messages.append({"role": "user", "content": message})

    # Send to Groq and get the response
    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",   # Fast, lightweight LLaMA model
        messages=messages,
        max_tokens=80,                   # Keep responses short
    )

    return response.choices[0].message.content
