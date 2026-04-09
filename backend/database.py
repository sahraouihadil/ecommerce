import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv
from sqlalchemy.ext.declarative import declarative_base
from typing import List,Annotated
from sqlalchemy.orm import Session
from fastapi import Depends

# 1. Load the environment variables
load_dotenv()

# 2. Get the URL
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

# 3. SAFETY CHECK: If the URL is missing, stop and explain why
if SQLALCHEMY_DATABASE_URL is None:
    print("❌ ERROR: DATABASE_URL not found!")
    print("Make sure your .env file exists in the backend folder and contains DATABASE_URL=...")
    # Optional: Fallback to SQLite for testing if Postgres isn't ready
    SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
    print("⚠️ Falling back to SQLite: ./test.db")

# 4. Create the engine
engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

db_dependency = Annotated[Session, Depends(get_db)]