from sqlalchemy.orm import Session
from database import SessionLocal, engine
import models

# 1. Furniture Data to "Plant" in the Database
FURNITURE_DATA = [
    {
        "name": "The Cloud Lounger",
        "description": "A sofa so soft you'll forget gravity exists. Inspired by cumulus clouds, designed for endless naps.",
        "price": 1299.00,
        "image_url": "https://via.placeholder.com/150"
    },
    {
        "name": "Jellyfish Glow Lamp",
        "description": "Bioluminescent-inspired table lamp that pulses with soft color. Like having a tiny ocean on your desk.",
        "price": 189.00,
        "image_url": "https://via.placeholder.com/150"
    },
    {
        "name": "The Hug Chair",
        "description": "An armchair that wraps around you like a warm embrace. Curved cocoon design with memory foam core.",
        "price": 749.00,
        "image_url": "https://via.placeholder.com/150"
    },
    {
        "name": "Mushroom Side Table",
        "description": "A whimsical side table inspired by forest fungi. Solid wood cap with a sculptural tapered stem.",
        "price": 420.00,
        "image_url": "https://via.placeholder.com/150"
    },
]
def seed_database():
    db = SessionLocal()
    try:
        # 2. Check if we already have products (to avoid duplicates)
        existing_count = db.query(models.Products).count()
        if existing_count > 0:
            print(f"📊 Database already has {existing_count} products. Skipping seed.")
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