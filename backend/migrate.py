"""
Database migration script - adds missing columns and tables.
Run this once: python migrate.py

This handles the case where the PostgreSQL DB was created with an older
version of the models and is now missing columns/tables.
"""
from sqlalchemy import text, inspect
from database import engine, Base
import models  # ensures all models are registered with Base

def run_migrations():
    inspector = inspect(engine)
    existing_tables = inspector.get_table_names()

    with engine.connect() as conn:
        # ── Fix PostgreSQL userrole enum type ──
        # The DB enum may be missing values that were added to enums.py later.
        # PostgreSQL enums are strict - we must add any missing values.
        expected_roles = ['admin', 'accountant', 'marketing manager', 'stock manager',
                          'deliveryman', 'customer', 'bot']
        try:
            result = conn.execute(text(
                "SELECT enumlabel FROM pg_enum "
                "JOIN pg_type ON pg_enum.enumtypid = pg_type.oid "
                "WHERE pg_type.typname = 'userrole'"
            ))
            existing_roles = {row[0] for row in result}
            if existing_roles:  # only if the enum type exists
                for role in expected_roles:
                    if role not in existing_roles:
                        print(f"  Adding enum value '{role}' to userrole...")
                        conn.execute(text(f"ALTER TYPE userrole ADD VALUE IF NOT EXISTS '{role}'"))
                conn.commit()  # enum changes need their own commit
                print("  Enum values synced.")
            else:
                print("  userrole enum type not found, will be created with tables.")
        except Exception as e:
            print(f"  Warning checking enum: {e}")
            conn.rollback()

        # ── Users table: add missing columns ──
        if "users" in existing_tables:
            user_cols = {c["name"] for c in inspector.get_columns("users")}

            if "active" not in user_cols:
                print("  Adding users.active...")
                conn.execute(text("ALTER TABLE users ADD COLUMN active BOOLEAN DEFAULT TRUE"))

            if "last" not in user_cols:
                print("  Adding users.last...")
                conn.execute(text("ALTER TABLE users ADD COLUMN last VARCHAR DEFAULT 'Now'"))

            if "verification_code" not in user_cols:
                print("  Adding users.verification_code...")
                conn.execute(text("ALTER TABLE users ADD COLUMN verification_code VARCHAR"))

            if "is_verified" not in user_cols:
                print("  Adding users.is_verified...")
                conn.execute(text("ALTER TABLE users ADD COLUMN is_verified BOOLEAN DEFAULT FALSE"))

            if "phoneNum" not in user_cols:
                print('  Adding users."phoneNum"...')
                conn.execute(text('ALTER TABLE users ADD COLUMN "phoneNum" VARCHAR'))

            if "password" not in user_cols:
                print("  Adding users.password...")
                conn.execute(text("ALTER TABLE users ADD COLUMN password VARCHAR"))

        # ── Products table: add missing columns ──
        if "products" in existing_tables:
            prod_cols = {c["name"] for c in inspector.get_columns("products")}

            if "category" not in prod_cols:
                print("  Adding products.category...")
                conn.execute(text("ALTER TABLE products ADD COLUMN category VARCHAR"))

            if "model_url" not in prod_cols:
                print("  Adding products.model_url...")
                conn.execute(text("ALTER TABLE products ADD COLUMN model_url VARCHAR"))

        # ── Orders table: add missing columns ──
        if "orders" in existing_tables:
            order_cols = {c["name"] for c in inspector.get_columns("orders")}

            if "user_id" not in order_cols:
                print("  Adding orders.user_id...")
                conn.execute(text("ALTER TABLE orders ADD COLUMN user_id INTEGER REFERENCES users(id)"))

            if "status" not in order_cols:
                print("  Adding orders.status...")
                conn.execute(text("ALTER TABLE orders ADD COLUMN status VARCHAR DEFAULT 'pending'"))

        conn.commit()
        print("  Column migrations done.")

    # ── Create any entirely new tables ──
    # This will create cart_items, favorites, and any other missing tables
    # without touching existing ones.
    Base.metadata.create_all(bind=engine)
    print("  New tables created (if any were missing).")

    print("\nMigration complete!")


if __name__ == "__main__":
    print("Running database migrations...")
    run_migrations()
