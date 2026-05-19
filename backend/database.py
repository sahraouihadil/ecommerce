"""
database.py - Database connection and session management
=========================================================
This file sets up the connection between our FastAPI app and the PostgreSQL database.

HOW IT WORKS:
  1. We load DATABASE_URL from the .env file (e.g., "postgresql://user:pass@localhost/aroom_db")
  2. SQLAlchemy creates an "engine" — this is the actual connection to the database
  3. Sessions are created from the engine — each API request gets its own session
  4. When the request is done, the session is closed automatically

KEY CONCEPTS:
  - Engine: The database connection (like opening a phone line)
  - Session: A conversation on that phone line (one per request)
  - Base: The parent class that all our database models inherit from
  - db_dependency: A shortcut type used in FastAPI endpoints to get a database session
"""

import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base, Session
from dotenv import load_dotenv
from typing import Annotated
from fastapi import Depends

# Load environment variables from the .env file
load_dotenv()

# Get the database URL from the environment
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

# Safety check — if the URL is missing, fall back to SQLite
# SQLite is a simple file-based database that doesn't need a server.
# Good for testing, but not for production.
if SQLALCHEMY_DATABASE_URL is None:
    print("WARNING: DATABASE_URL not found in .env file!")
    print("Falling back to SQLite (./test.db) for testing...")
    SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

# Create the database engine (connection)
engine = create_engine(SQLALCHEMY_DATABASE_URL)

# Create a session factory
# Each call to SessionLocal() creates a new database session.
# autocommit=False means we must explicitly call db.commit() to save changes.
# autoflush=False means changes aren't sent to the DB until we commit.
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create the Base class for our models
# All database models (Users, Products, etc.) will inherit from this.
Base = declarative_base()


def get_db():
    """
    Creates a database session for a single API request.

    This is a "generator" function — it yields a session, lets the
    endpoint use it, and then closes it when the request is done.

    Used as a FastAPI dependency:
        @app.get("/users")
        def get_users(db: Session = Depends(get_db)):
            return db.query(Users).all()
    """
    db = SessionLocal()
    try:
        yield db      # Give the session to the endpoint
    finally:
        db.close()    # Always close when done (even if there's an error)


# This is a type alias that combines Session + Depends(get_db)
# so we don't have to write "db: Session = Depends(get_db)" every time.
# Instead, we just write "db: db_dependency" — cleaner and shorter.
db_dependency = Annotated[Session, Depends(get_db)]
