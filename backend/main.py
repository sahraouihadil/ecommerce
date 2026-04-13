"""
main.py - FastAPI Application Entry Point
===========================================
This is the main file that starts the ARoom backend server.

WHAT THIS FILE DOES:
  1. Creates the FastAPI app
  2. Configures CORS (allows the frontend to talk to the backend)
  3. Creates database tables on startup
  4. Registers all route handlers (routers)
  5. Defines endpoints for: user management, email verification,
     product search, user profile, and data retrieval

HOW TO RUN:
  cd backend
  python -m uvicorn main:app --reload

API DOCUMENTATION:
  Once running, visit http://localhost:8000/docs for Swagger UI
  (interactive API docs where you can test every endpoint)
"""

# ── Standard library imports ──
import random
import logging
from typing import Annotated

# ── FastAPI imports ──
from fastapi import FastAPI, status, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware

# ── SQLAlchemy imports ──
from sqlalchemy.orm import Session
from sqlalchemy import or_

# ── Our project imports ──
import models
import database
from database import db_dependency
from schema import CreateUser, VerifyCode, SetPassword, UpdateUser
from email_utils import send_email
from user_crud import get_current_user, create_user_by_admin
from security.settings import validate_password, hash_password, admin_required, verify_token

# ── Router imports (each router handles a group of related endpoints) ──
from route import user_router                     # Auth: /register, /login, /admin-dash, etc.
from routers import chat, cart, orders, favorites  # Feature routers

# ── Logging setup ──
logger = logging.getLogger(__name__)


# ======================================================================
# APP SETUP
# ======================================================================

# Create the FastAPI application instance
app = FastAPI(title="ARoom API")

# ── CORS Configuration ──
# CORS (Cross-Origin Resource Sharing) allows the frontend (localhost:5173)
# to make requests to the backend (localhost:8000).
# Without this, the browser would block all API calls from the frontend.
origins = [
    "http://localhost:5173",    # Vite dev server (default port)
    "http://localhost:5174",    # Vite dev server (alternate port)
    "https://aroom.com"        # Production domain (future)
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,          # Which frontend URLs can make requests
    allow_credentials=True,         # Allow cookies/auth headers
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

# ── Database Setup ──
# This creates all database tables defined in models.py if they don't exist yet.
# NOTE: It won't add new columns to existing tables — use migrate.py for that.
models.Base.metadata.create_all(bind=database.engine)

# ── Register Routers ──
# Each router handles a group of related API endpoints.
# Think of routers like chapters in a book — each one covers a topic.
app.include_router(user_router)                   # Auth & role verification endpoints
app.include_router(chat.router, prefix="/api")    # AI chatbot: /api/chat
app.include_router(cart.router)                   # Shopping cart: /api/cart
app.include_router(orders.router)                 # Orders: /api/orders
app.include_router(favorites.router)              # Favorites: /api/favorites

# ── Type alias for protected endpoints ──
# Any endpoint that uses "user: user_dependency" will require a valid JWT token.
# The get_current_user function extracts {username, id} from the token.
user_dependency = Annotated[dict, Depends(get_current_user)]


# ======================================================================
# HEALTH CHECK
# ======================================================================

@app.get("/", status_code=status.HTTP_200_OK)
async def home_page(db: db_dependency):
    """
    Health check endpoint — just confirms the API is running.
    Visit http://localhost:8000/ to see this.
    """
    return {"message": "ARoom API is running"}


# ======================================================================
# USER MANAGEMENT (Admin only)
# ======================================================================
# These endpoints let admins create, view, edit, and delete user accounts.
# All require admin_required — only users with role="admin" can access them.

@app.get("/api/users")
def get_users(db: Session = Depends(database.get_db), payload: dict = Depends(admin_required)):
    """Returns a list of ALL users. Used by the admin AccountsPage."""
    return db.query(models.Users).all()


@app.get("/api/users/{user_id}")
def get_users_by_id(user_id: int, db: Session = Depends(database.get_db), payload: dict = Depends(admin_required)):
    """Returns a single user by their ID. Used when editing a user."""
    return db.query(models.Users).filter(models.Users.id == user_id).first()


@app.post("/api/users")
def create_user(user: CreateUser, db: Session = Depends(database.get_db), payload: dict = Depends(admin_required)):
    """
    Admin creates a new user account.
    The new user gets a verification code by email to set their password.
    """
    new_user = create_user_by_admin(db, user)

    # Generate a random 6-digit verification code
    verification_code = random.randint(100000, 999999)
    new_user.verification_code = str(verification_code)
    db.commit()

    # Send the code to the user's email
    send_email(user.email, f"Your verification code is: {verification_code}")

    return user


@app.put("/api/users/{user_id}")
def update_user(user_id: int, user: UpdateUser, db: Session = Depends(database.get_db), payload: dict = Depends(admin_required)):
    """Admin updates a user's username, email, or role."""
    db_user = db.query(models.Users).filter(models.Users.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    db_user.username = user.username
    db_user.email = user.email
    db_user.role = user.role

    db.commit()
    db.refresh(db_user)   # Reload from DB to get updated values
    return db_user


@app.delete("/api/users/{user_id}")
def delete_users_by_id(user_id: int, db: Session = Depends(database.get_db), payload: dict = Depends(admin_required)):
    """Admin deletes a user account permanently."""
    db_user = db.query(models.Users).filter(models.Users.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    db.delete(db_user)
    db.commit()
    return {"message": "User deleted successfully"}


# ======================================================================
# EMAIL VERIFICATION (Part of the signup flow)
# ======================================================================
# Flow: Register → Receive email code → Enter code at /verify-code → Set password

@app.get("/verify-code")
def verify_code(email: str, code: str, db: Session = Depends(database.get_db)):
    """
    Verifies the 6-digit code sent to the user's email during registration.
    If the code matches, the user's account is marked as verified.

    Called by: VerifyCode.jsx → GET /verify-code?email=...&code=...
    """
    # Find the user by email
    user = db.query(models.Users).filter(models.Users.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Compare the submitted code with the stored one
    if str(user.verification_code) != str(code):
        raise HTTPException(status_code=400, detail="Invalid verification code")

    # Mark as verified and clear the code (one-time use)
    user.is_verified = True
    user.verification_code = None
    db.commit()

    return {"msg": "Email verified successfully", "user_name": user.username}


@app.post("/set-password")
def set_password(data: SetPassword, db: Session = Depends(database.get_db)):
    """
    Sets the user's password after email verification.
    The password is validated for strength, then hashed before storing.

    Called by: SetPassword.jsx → POST /set-password
    """
    user = db.query(models.Users).filter(models.Users.username == data.user_name).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if not user.is_verified:
        raise HTTPException(status_code=400, detail="User not verified")

    # Validate password strength (throws HTTPException if too weak)
    validate_password(data.password)

    # Hash the password and save
    user.password = hash_password(data.password)
    db.commit()

    return {"msg": "Password set successfully"}


# ======================================================================
# SEARCH
# ======================================================================

@app.get("/search")
async def search_products(keyword: str, db: db_dependency):
    """
    Searches products by name or description.
    Returns all products that contain the keyword (case-insensitive).

    Called by: Search.jsx → GET /search?keyword=lamp
    """
    products = db.query(models.Products).all()
    results = [
        p for p in products
        if keyword.lower() in p.name.lower() or keyword.lower() in p.description.lower()
    ]
    return results


@app.get("/search-users")
def search_users(keyword: str, db: db_dependency):
    """
    Searches users by username or email (admin feature).
    Uses SQL ILIKE for case-insensitive matching.

    Called by: AccountsPage.jsx → GET /search-users?keyword=hadil
    """
    return db.query(models.Users).filter(
        or_(
            models.Users.username.ilike(f"%{keyword}%"),
            models.Users.email.ilike(f"%{keyword}%")
        )
    ).all()


# ======================================================================
# USER PROFILE (Requires authentication)
# ======================================================================

@app.get("/profile")
async def user(user: user_dependency, db: db_dependency):
    """
    Returns the current user's profile information.
    Requires a valid JWT token (sent automatically by the frontend).

    Called by: ProfilePage.jsx → GET /profile
    """
    if user is None:
        raise HTTPException(status_code=401, detail="Authentication Failed")

    # Look up the full user record from the database
    db_user = db.query(models.Users).filter(models.Users.id == user["id"]).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "id": db_user.id,
        "username": db_user.username,
        "email": db_user.email,
        "phoneNum": db_user.phoneNum,
        "role": db_user.role,
        "active": db_user.active,
    }


@app.get("/profile/history")
async def user_history(user: user_dependency, db: db_dependency):
    """
    Returns the current user's order history.
    Each order includes its items (product_id, price, quantity).

    Called by: HistoryPage.jsx → GET /profile/history
    """
    if user is None:
        raise HTTPException(status_code=401, detail="Authentication Failed")

    # Get all orders for this user, with their items
    orders = db.query(models.Orders).filter(models.Orders.user_id == user["id"]).all()
    result = []
    for order in orders:
        items = db.query(models.OrderItems).filter(models.OrderItems.order_id == order.id).all()
        result.append({
            "id": order.id,
            "orderdate": order.orderdate,
            "deliverydate": order.deliverydate,
            "totalamount": order.totalamount,
            "status": order.status,
            "items": [
                {"id": i.id, "product_id": i.product_id, "price": i.price, "quantity": i.quantity}
                for i in items
            ]
        })
    return result


# ======================================================================
# DATA ENDPOINTS (Public — used by admin dashboard)
# ======================================================================

@app.get("/api/products")
def get_products(db: Session = Depends(database.get_db)):
    """Returns all products. Used by FurniturePage and the admin dashboard."""
    return db.query(models.Products).all()


@app.get("/api/order-items")
def get_order_items(db: Session = Depends(database.get_db)):
    """Returns all order items. Used by the admin dashboard for revenue calculations."""
    return db.query(models.OrderItems).all()


@app.get("/api/complaints")
def get_complaints(db: Session = Depends(database.get_db)):
    """Returns all complaints. Used by the admin ComplaintsPage."""
    return db.query(models.Complaints).all()
