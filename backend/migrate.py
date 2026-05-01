"""
Database migration script - adds missing columns and tables.
Run this once: python migrate.py
"""
from sqlalchemy import text, inspect
from database import engine, Base
import models

def run_migrations():
    inspector = inspect(engine)
    existing_tables = inspector.get_table_names()

    with engine.connect() as conn:

        # ── Fix PostgreSQL userrole enum type ──
        expected_roles = ['admin', 'accountant', 'marketing_manager', 'stock_manager',
                          'deliveryman', 'customer', 'bot']
        try:
            result = conn.execute(text(
                "SELECT enumlabel FROM pg_enum "
                "JOIN pg_type ON pg_enum.enumtypid = pg_type.oid "
                "WHERE pg_type.typname = 'userrole'"
            ))
            existing_roles = {row[0] for row in result}
            if existing_roles:
                for role in expected_roles:
                    if role not in existing_roles:
                        print(f"  Adding enum value '{role}' to userrole...")
                        conn.execute(text(f"ALTER TYPE userrole ADD VALUE IF NOT EXISTS '{role}'"))
                conn.commit()
                print("  Enum values synced.")
        except Exception as e:
            print(f"  Warning checking enum: {e}")
            conn.rollback()

        # ── Users table ──
        if "users" in existing_tables:
            user_cols = {c["name"] for c in inspector.get_columns("users")}

            migrations = {
                "active":            "ALTER TABLE users ADD COLUMN active BOOLEAN DEFAULT TRUE",
                "last":              "ALTER TABLE users ADD COLUMN last VARCHAR DEFAULT 'Now'",
                "verification_code": "ALTER TABLE users ADD COLUMN verification_code VARCHAR",
                "is_verified":       "ALTER TABLE users ADD COLUMN is_verified BOOLEAN DEFAULT FALSE",
                "password":          "ALTER TABLE users ADD COLUMN password VARCHAR",
                "avatar_url":        "ALTER TABLE users ADD COLUMN avatar_url VARCHAR",
                "vehicle":           "ALTER TABLE users ADD COLUMN vehicle VARCHAR",
                "credit":            "ALTER TABLE users ADD COLUMN credit VARCHAR",
                "phone_num":         "ALTER TABLE users ADD COLUMN phone_num VARCHAR",
            }
            for col, sql in migrations.items():
                if col not in user_cols:
                    print(f"  Adding users.{col}...")
                    conn.execute(text(sql))

        # ── Products table ──
        if "products" in existing_tables:
            prod_cols = {c["name"] for c in inspector.get_columns("products")}

            migrations = {
                "category":    "ALTER TABLE products ADD COLUMN category VARCHAR",
                "badge":       "ALTER TABLE products ADD COLUMN badge VARCHAR",
                "model_src":   "ALTER TABLE products ADD COLUMN model_src VARCHAR",
                "model_3d":    "ALTER TABLE products ADD COLUMN model_3d VARCHAR",
                "ios_src":     "ALTER TABLE products ADD COLUMN ios_src VARCHAR",
                "able_3d":     "ALTER TABLE products ADD COLUMN able_3d BOOLEAN DEFAULT FALSE",
                "able_ar":     "ALTER TABLE products ADD COLUMN able_ar BOOLEAN DEFAULT FALSE",
                "min_stock":   "ALTER TABLE products ADD COLUMN min_stock INTEGER DEFAULT 10",
            }
            for col, sql in migrations.items():
                if col not in prod_cols:
                    print(f"  Adding products.{col}...")
                    conn.execute(text(sql))

        # ── Orders table ──
        if "orders" in existing_tables:
            order_cols = {c["name"] for c in inspector.get_columns("orders")}

            migrations = {
                "status":          "ALTER TABLE orders ADD COLUMN status VARCHAR DEFAULT 'pending'",
                "delivery_type":   "ALTER TABLE orders ADD COLUMN delivery_type VARCHAR",
                "delivery_dow":    "ALTER TABLE orders ADD COLUMN delivery_dow VARCHAR",
                "wilaya":          "ALTER TABLE orders ADD COLUMN wilaya VARCHAR",
                "city":            "ALTER TABLE orders ADD COLUMN city VARCHAR",
                "street_address":  "ALTER TABLE orders ADD COLUMN street_address VARCHAR",
                "notes":           "ALTER TABLE orders ADD COLUMN notes VARCHAR",
                "rating":          "ALTER TABLE orders ADD COLUMN rating VARCHAR",
                "problem":         "ALTER TABLE orders ADD COLUMN problem VARCHAR",
                "problem_notes":   "ALTER TABLE orders ADD COLUMN problem_notes VARCHAR",
                "problem_reason":  "ALTER TABLE orders ADD COLUMN problem_reason VARCHAR",
                "payment_method":  "ALTER TABLE orders ADD COLUMN payment_method VARCHAR",
                "deliveryman_id":  "ALTER TABLE orders ADD COLUMN deliveryman_id INTEGER REFERENCES users(id)",
                "deliverydate":    "ALTER TABLE orders ADD COLUMN deliverydate TIMESTAMP",
            }
            for col, sql in migrations.items():
                if col not in order_cols:
                    print(f"  Adding orders.{col}...")
                    conn.execute(text(sql))

        # ── OrderItems table ──
        if "orderitems" in existing_tables:
            item_cols = {c["name"] for c in inspector.get_columns("orderitems")}

            migrations = {
                "status":        "ALTER TABLE orderitems ADD COLUMN status VARCHAR DEFAULT 'pending'",
                "return_reason": "ALTER TABLE orderitems ADD COLUMN return_reason VARCHAR",
            }
            for col, sql in migrations.items():
                if col not in item_cols:
                    print(f"  Adding orderitems.{col}...")
                    conn.execute(text(sql))

        conn.commit()
        print("  Column migrations done.")

    # ── Create any entirely new tables ──
    Base.metadata.create_all(bind=engine)
    print("  New tables created (if any were missing).")
    print("\nMigration complete!")


if __name__ == "__main__":
    print("Running database migrations...")
    run_migrations()