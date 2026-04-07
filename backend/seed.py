from sqlalchemy.orm import Session
from database import SessionLocal, engine
import models

# 1. Furniture Data to "Plant" in the Database
FURNITURE_DATA = [
    {
        "name": "Velvet Cloud Sofa",
        "description": "A deep-seated, ultra-soft sofa in midnight blue velvet.",
        "price": 1200.00,
        "image_url": "https://example.com/sofa.jpg"
    },
    {
        "name": "Marble Coffee Table",
        "description": "Minimalist circular table with a solid Italian marble top.",
        "price": 450.00,
        "image_url": "https://example.com/table.jpg"
    },
    {
        "name": "Eames Lounge Chair Replica",
        "description": "Classic mid-century design with walnut veneer and black leather.",
        "price": 850.00,
        "image_url": "https://example.com/chair.jpg"
    },
    {
        "name": "Industrial Bookshelf",
        "description": "Oak wood shelves with a matte black steel frame.",
        "price": 300.00,
        "image_url": "https://example.com/shelf.jpg"
    }
]

def seed_database():
    db = SessionLocal()
    try:
        # 2. Check if we already have products (to avoid duplicates)
        existing_count = db.query(models.Product).count()
        if existing_count > 0:
            print(f"📊 Database already has {existing_count} products. Skipping seed.")
            return

        # 3. Add the furniture
        print("🌱 Seeding database with luxury furniture...")
        for item in FURNITURE_DATA:
            product = models.Product(**item)
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