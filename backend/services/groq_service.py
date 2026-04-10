import os
import json
from dotenv import load_dotenv
from groq import Groq

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

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
    try:
        path = os.path.join(os.path.dirname(__file__), "..", "data", "products.json")
        with open(path, "r") as f:
            return json.load(f)
    except Exception:
        return []

def get_bot_response(message, context, history, product_name=""):
    products = load_products()
    system_prompt = PROMPTS.get(context, PROMPTS["before_ar"])
    if product_name:
        system_prompt += f" The customer is looking at: {product_name}."
    full_prompt = system_prompt + "\n\nAvailable products:\n" + json.dumps(products)

    messages = [{"role": "system", "content": full_prompt}]
    for h in history:
        role = "assistant" if h["role"] == "bot" else "user"
        messages.append({"role": role, "content": h["content"]})
    messages.append({"role": "user", "content": message})

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=messages,
        max_tokens=80,
    )
    return response.choices[0].message.content