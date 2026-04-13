"""
route.py - Authentication & Role Verification Routes
======================================================
This file handles the core authentication flow:
  - POST /register  → Create a new customer account
  - POST /login     → Log in and get a JWT token
  - GET  /profile   → Verify customer role (customer-only)
  - GET  /admin-dash, /accountant-dash, etc. → Verify role access

These endpoints are registered as a "router" and included in main.py.

AUTHENTICATION FLOW:
  1. User registers → password hashed → user saved → JWT token returned
  2. User logs in → password verified → JWT token returned
  3. User accesses protected page → token sent → role checked → access granted/denied
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from starlette import status
from datetime import timedelta
from dotenv import load_dotenv
from fastapi.security import OAuth2PasswordRequestForm
import os

# ── Our project imports ──
from database import get_db, db_dependency
from models import Users
from user_crud import create_user, get_user_by_username, get_user_by_email, update_role_name
from schema import CreateUserRequest, UserRoleUpdate
from security.settings import (
    validate_password, customer_required, admin_required,
    accountant_required, marketing_manager_required,
    stock_manager_required, deliveryman_required,
    create_access_token, authenticate_user, verify_token
)

# Load .env variables (for ACCESS_TOKEN_EXPIRE_MINUTES)
load_dotenv()

# Create the router — all endpoints defined here will be added to the main app
user_router = APIRouter()


# ======================================================================
# REGISTRATION
# ======================================================================

@user_router.post("/register")
def register_user(user: CreateUserRequest, db: Session = Depends(get_db)):
    """
    Creates a new customer account.

    Called by: SignupPage.jsx → POST /register

    Logic:
      1. Check if username or email already exists
      2. If user exists but isn't verified → redirect to verification page
      3. If user is new → validate password → create account → return JWT token

    Returns either:
      - {action: "verify", ...} if user needs to verify email first
      - {access_token: "...", token_type: "bearer"} on successful registration
    """
    # Check if username or email is already taken
    db_user_by_username = get_user_by_username(db, username=user.username)
    db_user_by_email = get_user_by_email(db, email=user.email)

    # Case 1: User exists but hasn't verified their email yet
    if db_user_by_username and not db_user_by_username.is_verified:
        return {
            "action": "verify",
            "message": "Please verify your email first",
            "redirect_url": "/verify-code",
            "user_name": user.username,
            "email": user.email
        }

    # Case 2: Username already taken (and verified)
    if db_user_by_username:
        raise HTTPException(status_code=400, detail="Username already exists")

    # Case 3: Email already taken
    if db_user_by_email:
        raise HTTPException(status_code=400, detail="Email already exists")

    # Case 4: New user — validate password strength
    if not user.password:
        raise HTTPException(status_code=400, detail="Password required")
    validate_password(user.password)

    # Create the user in the database (password gets hashed inside create_user)
    new_user = create_user(db=db, create_user_request=user)

    # Generate a JWT access token so the user is logged in immediately
    token_expiry = timedelta(minutes=int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES")))
    access_token = create_access_token(
        new_user.username, new_user.id, token_expiry, new_user.role
    )

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }


# ======================================================================
# LOGIN
# ======================================================================

@user_router.post("/login")
async def login_for_access_token(db: db_dependency, form_data: OAuth2PasswordRequestForm = Depends()):
    """
    Authenticates a user and returns a JWT token + their role.

    Called by: auth.js login() → POST /login

    Uses OAuth2PasswordRequestForm which expects form-encoded data:
      username=...&password=...
    (This is a standard format that works with FastAPI's /docs page too)

    Returns: {access_token: "...", token_type: "bearer", role: "customer"}
    """
    # Check username + password against the database
    user = authenticate_user(form_data.username, form_data.password, db)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password"
        )

    # Create the JWT token
    token_expiry = timedelta(minutes=int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES")))
    access_token = create_access_token(
        user.username, user.id, token_expiry, user.role
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user.role       # Frontend uses this to redirect to the right dashboard
    }


# ======================================================================
# ROLE VERIFICATION ENDPOINTS
# ======================================================================
# Each dashboard page calls its corresponding endpoint on load to verify
# that the user has the right role. If they don't, the endpoint returns
# a 403 Forbidden error and the frontend redirects them away.
#
# Example: When AdminDashboard.jsx loads, it calls GET /admin-dash.
# If the user isn't an admin, admin_required() throws a 403 error.

@user_router.get("/profile")
async def get_customer(payload: dict = Depends(customer_required)):
    """Verifies the user has the 'customer' role. Called by ProfilePage."""
    return {"sub": payload.get("sub")}


@user_router.get("/admin-dash")
async def get_admin(payload: dict = Depends(admin_required)):
    """Verifies the user has the 'admin' role. Called by AdminDashboard."""
    return {"sub": payload.get("sub")}


@user_router.get("/accountant-dash")
async def get_accountant(payload: dict = Depends(accountant_required)):
    """Verifies the user has the 'accountant' role. Called by AccountantDashboard."""
    return {"sub": payload.get("sub")}


@user_router.get("/marketing-manager-dash")
async def get_marketing_manager(payload: dict = Depends(marketing_manager_required)):
    """Verifies the user has the 'marketing manager' role."""
    return {"sub": payload.get("sub")}


@user_router.get("/stock-manager-dash")
async def get_stock_manager(payload: dict = Depends(stock_manager_required)):
    """Verifies the user has the 'stock manager' role."""
    return {"sub": payload.get("sub")}


@user_router.get("/deliveryman-dash")
async def get_deliveryman(payload: dict = Depends(deliveryman_required)):
    """Verifies the user has the 'deliveryman' role."""
    return {"sub": payload.get("sub")}


# ======================================================================
# ADMIN: CHANGE USER ROLE
# ======================================================================

@user_router.put("/setrole")
async def set_user_role(
    user_id: int,
    role_update: UserRoleUpdate,
    db: Session = Depends(get_db),
    payload: dict = Depends(admin_required)
):
    """
    Changes a user's role. Admin-only endpoint.
    Called by the admin dashboard when promoting/demoting users.

    Example: PUT /setrole?user_id=5  body: {"name": "accountant"}
    """
    user = update_role_name(db, user_id, role_update)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "user_id": user_id,
        "username": user.username,
        "new_role": role_update.name
    }
