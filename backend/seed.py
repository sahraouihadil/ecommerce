"""
seed.py - Database Seeder
==========================
This script fills the database with sample furniture products so you
don't start with an empty store.

HOW TO RUN:
  cd backend
  python seed.py

WHAT IT DOES:
  1. Checks if products already exist in the database
  2. If YES  -> updates existing products with any new fields (category, model_url)
  3. If NO   -> inserts all sample products as new rows

WHY THIS EXISTS:
  During development you need test data to see the app working.
  Instead of manually adding products through the API, this script
  does it automatically in one step.
"""

from sqlalchemy.orm import Session
from database import SessionLocal, engine
import models

# ── Sample product data ──
# Each dictionary becomes one row in the "products" table.
# Fields must match the columns defined in models.Products.
FURNITURE_DATA = [
    {
        "name": "The Cloud Lounger",
        "description": "A sofa so soft you'll forget gravity exists. Inspired by cumulus clouds, designed for endless naps.",
        "price": 1299.00,
        "image_url": "https://via.placeholder.com/150",
        "category": "seating",
        "model_url": "/models/sofa.glb"
    },
    {
        "name": "Jellyfish Glow Lamp",
        "description": "Bioluminescent-inspired table lamp that pulses with soft color. Like having a tiny ocean on your desk.",
        "price": 189.00,
        "image_url": "https://via.placeholder.com/150",
        "category": "lighting",
        "model_url": "/models/lamp.glb"
    },
    {
        "name": "The Hug Chair",
        "description": "An armchair that wraps around you like a warm embrace. Curved cocoon design with memory foam core.",
        "price": 749.00,
        "image_url": "https://via.placeholder.com/150",
        "category": "seating",
        "model_url": "/models/chair.glb"
    },
    {
        "name": "Mushroom Side Table",
        "description": "A whimsical side table inspired by forest fungi. Solid wood cap with a sculptural tapered stem.",
        "price": 420.00,
        "image_url": "https://via.placeholder.com/150",
        "category": "tables",
        "model_url": "/models/table.glb"
    },
]
def seed_database():
    """
    Main seeding function.
    Opens a database session, inserts or updates products, then closes it.
    """
    db = SessionLocal()
    try:
        # Check if we already have products (to avoid duplicates on re-run)
        existing_count = db.query(models.Products).count()
        if existing_count > 0:
            print(f"📊 Database already has {existing_count} products. Updating with new fields...")
            for item in FURNITURE_DATA:
                product = db.query(models.Products).filter(models.Products.name == item["name"]).first()
                if product:
                    product.category = item.get("category")
                    product.model_url = item.get("model_url")
            db.commit()
            print("✅ Existing products updated with category and model_url.")
            return

        # 3. Add the furniture
        print("🌱 Seeding database with luxury furniture...")
        for item in FURNITURE_DATA:
            product = models.Products(**item)
            db.add(product)
        
        db.commit()
        print("✅ Success! Database is now full.")
    except Exception as e:
        print(f"❌ Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()