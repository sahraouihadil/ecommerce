import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()
url = os.getenv("DATABASE_URL")
engine = create_engine(url)

with engine.connect() as conn:
    result = conn.execute(text("SELECT enumlabel FROM pg_enum JOIN pg_type ON pg_enum.enumtypid = pg_type.oid WHERE pg_type.typname = 'userrole';"))
    labels = [row[0] for row in result]
    print(f"Current enum labels for 'userrole': {labels}")
