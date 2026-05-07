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

        # ── Fix PostgreSQL userrole enum type ──────────────────────────────
        expected_roles = [
            'admin', 'accountant', 'marketing_manager', 'stock_manager',
            'deliveryman', 'customer', 'bot',
        ]
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

        # ── Users ──────────────────────────────────────────────────────────
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
                "created_at":        "ALTER TABLE users ADD COLUMN created_at TIMESTAMP DEFAULT NOW()",
            }
            for col, sql in migrations.items():
                if col not in user_cols:
                    print(f"  Adding users.{col}...")
                    conn.execute(text(sql))

        # ── Products ───────────────────────────────────────────────────────
        if "products" in existing_tables:
            prod_cols = {c["name"] for c in inspector.get_columns("products")}

            migrations = {
                "category":      "ALTER TABLE products ADD COLUMN category VARCHAR",
                "badge":         "ALTER TABLE products ADD COLUMN badge VARCHAR",
                "model_src":     "ALTER TABLE products ADD COLUMN model_src VARCHAR",
                "model_3d":      "ALTER TABLE products ADD COLUMN model_3d VARCHAR",
                "ios_src":       "ALTER TABLE products ADD COLUMN ios_src VARCHAR",
                "able_3d":       "ALTER TABLE products ADD COLUMN able_3d BOOLEAN DEFAULT FALSE",
                "able_ar":       "ALTER TABLE products ADD COLUMN able_ar BOOLEAN DEFAULT FALSE",
                "is_active":     "ALTER TABLE products ADD COLUMN is_active BOOLEAN DEFAULT FALSE",
                "valid_ar":      "ALTER TABLE products ADD COLUMN valid_ar BOOLEAN DEFAULT FALSE",
                "valid_3d":      "ALTER TABLE products ADD COLUMN valid_3d BOOLEAN DEFAULT FALSE",
                "min_stock":     "ALTER TABLE products ADD COLUMN min_stock INTEGER DEFAULT 10",
                "sku":           "ALTER TABLE products ADD COLUMN sku VARCHAR",
                "created_at":    "ALTER TABLE products ADD COLUMN created_at TIMESTAMP DEFAULT NOW()",
                # Campaign-related columns
                "on_sale":        "ALTER TABLE products ADD COLUMN on_sale BOOLEAN DEFAULT FALSE",
                "new_arrival":    "ALTER TABLE products ADD COLUMN new_arrival BOOLEAN DEFAULT FALSE",
                "discount_price": "ALTER TABLE products ADD COLUMN discount_price FLOAT",
            }
            for col, sql in migrations.items():
                if col not in prod_cols:
                    print(f"  Adding products.{col}...")
                    conn.execute(text(sql))

        # ── Orders ─────────────────────────────────────────────────────────
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

        # ── OrderItems ─────────────────────────────────────────────────────
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

        # ── Campaigns ──────────────────────────────────────────────────────
        if "campaigns" in existing_tables:
            camp_cols = {c["name"] for c in inspector.get_columns("campaigns")}

            migrations = {
                "name":          "ALTER TABLE campaigns ADD COLUMN name VARCHAR NOT NULL DEFAULT ''",
                "title":         "ALTER TABLE campaigns ADD COLUMN title VARCHAR NOT NULL DEFAULT ''",
                "channel":       "ALTER TABLE campaigns ADD COLUMN channel VARCHAR",
                "status":        "ALTER TABLE campaigns ADD COLUMN status VARCHAR DEFAULT 'draft'",
                "budget":        "ALTER TABLE campaigns ADD COLUMN budget FLOAT DEFAULT 0",
                "spent":         "ALTER TABLE campaigns ADD COLUMN spent FLOAT DEFAULT 0",
                "impressions":   "ALTER TABLE campaigns ADD COLUMN impressions INTEGER DEFAULT 0",
                "clicks":        "ALTER TABLE campaigns ADD COLUMN clicks INTEGER DEFAULT 0",
                "code":          "ALTER TABLE campaigns ADD COLUMN code VARCHAR",
                "discount":      "ALTER TABLE campaigns ADD COLUMN discount FLOAT",
                "discount_type": "ALTER TABLE campaigns ADD COLUMN discount_type VARCHAR",
                "usage_max":     "ALTER TABLE campaigns ADD COLUMN usage_max INTEGER DEFAULT 0",
                "usage_current": "ALTER TABLE campaigns ADD COLUMN usage_current INTEGER DEFAULT 0",
                "image_url":     "ALTER TABLE campaigns ADD COLUMN image_url VARCHAR",
                "start_date":    "ALTER TABLE campaigns ADD COLUMN start_date TIMESTAMP",
                "end_date":      "ALTER TABLE campaigns ADD COLUMN end_date TIMESTAMP",
                "created_at":    "ALTER TABLE campaigns ADD COLUMN created_at TIMESTAMP DEFAULT NOW()",
                # FIX: is_active as BOOLEAN (not String)
                "is_active":     "ALTER TABLE campaigns ADD COLUMN is_active BOOLEAN DEFAULT FALSE",
                # NEW: campaign type for storefront filtering
                "campaign_type": "ALTER TABLE campaigns ADD COLUMN campaign_type VARCHAR",
            }
            for col, sql in migrations.items():
                if col not in camp_cols:
                    print(f"  Adding campaigns.{col}...")
                    conn.execute(text(sql))

            # Fix is_active if it exists but is stored as String/VARCHAR
            try:
                result = conn.execute(text(
                    "SELECT data_type FROM information_schema.columns "
                    "WHERE table_name = 'campaigns' AND column_name = 'is_active'"
                ))
                row = result.fetchone()
                if row and row[0].lower() in ("character varying", "varchar", "text"):
                    print("  Fixing campaigns.is_active type (VARCHAR → BOOLEAN)...")
                    conn.execute(text("""
                        ALTER TABLE campaigns
                        ALTER COLUMN is_active TYPE BOOLEAN
                        USING CASE
                            WHEN is_active IS NULL   THEN FALSE
                            WHEN is_active = 'true'  THEN TRUE
                            WHEN is_active = '1'     THEN TRUE
                            ELSE FALSE
                        END
                    """))
                    conn.execute(text(
                        "ALTER TABLE campaigns ALTER COLUMN is_active SET DEFAULT FALSE"
                    ))
                    print("  campaigns.is_active fixed.")
            except Exception as e:
                print(f"  Warning fixing is_active type: {e}")
                conn.rollback()

        # ── Blogs ──────────────────────────────────────────────────────────
        if "blogs" in existing_tables:
            blog_cols = {c["name"] for c in inspector.get_columns("blogs")}

            migrations = {
                "category":     "ALTER TABLE blogs ADD COLUMN category VARCHAR(100)",
                "views":        "ALTER TABLE blogs ADD COLUMN views INTEGER DEFAULT 0",
                "published_at": "ALTER TABLE blogs ADD COLUMN published_at TIMESTAMP",
            }
            for col, sql in migrations.items():
                if col not in blog_cols:
                    print(f"  Adding blogs.{col}...")
                    conn.execute(text(sql))

        # ── Notifications ──────────────────────────────────────────────────
        if "notifications" in existing_tables:
            notif_cols = {c["name"] for c in inspector.get_columns("notifications")}

            migrations = {
                "user_id":  "ALTER TABLE notifications ADD COLUMN user_id INTEGER REFERENCES users(id)",
                "type":     "ALTER TABLE notifications ADD COLUMN type VARCHAR DEFAULT 'order'",
                "title":    "ALTER TABLE notifications ADD COLUMN title VARCHAR",
                "body":     "ALTER TABLE notifications ADD COLUMN body VARCHAR",
                "is_read":  "ALTER TABLE notifications ADD COLUMN is_read BOOLEAN DEFAULT FALSE",
            }
            for col, sql in migrations.items():
                if col not in notif_cols:
                    print(f"  Adding notifications.{col}...")
                    conn.execute(text(sql))

            # Make role, order_id, message nullable if they exist
            try:
                conn.execute(text("ALTER TABLE notifications ALTER COLUMN role     DROP NOT NULL"))
            except Exception:
                pass
            try:
                conn.execute(text("ALTER TABLE notifications ALTER COLUMN order_id DROP NOT NULL"))
            except Exception:
                pass
            try:
                conn.execute(text("ALTER TABLE notifications ALTER COLUMN message  DROP NOT NULL"))
            except Exception:
                pass

        conn.commit()
        print("  All column migrations done.")

    # ── Create any entirely new tables defined in models ──────────────────
    Base.metadata.create_all(bind=engine)
    print("  New tables created (if any were missing).")
    print("\n Migration complete!")


if __name__ == "__main__":
    print("Running database migrations...")
    run_migrations()