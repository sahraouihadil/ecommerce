"""
user_crud.py - User database operations (CRUD = Create, Read, Update, Delete)
===============================================================================
This file contains helper functions for working with the Users table.
These functions are called by the route handlers (route.py, main.py).

WHY A SEPARATE FILE?
  Keeping database queries in their own file makes the code easier to:
  - Test (you can test database operations independently)
  - Reuse (multiple routes can call the same function)
  - Read (route files stay focused on HTTP logic, not SQL queries)
"""

from sqlalchemy.orm import Session
from models import Users
from schema import CreateUserRequest, CreateUser, UserRoleUpdate
from security.jwt_handler import oauth2_bearer, PUBLIC_KEY_PATH, ALGORITHM
from fastapi import Depends, HTTPException
from starlette import status
from jose import jwt, JWTError


def create_user(db: Session, create_user_request: CreateUserRequest):
    """
    Creates a new user account (called during customer registration).

    Steps:
      1. Hash the password (never store plain text!)
      2. Create a new Users row with the provided info
      3. Save it to the database
      4. Return the created user object (includes the auto-generated ID)
    """
    from security.password import hash_password  # Import here to avoid circular imports

    create_user_model = Users(
        username=create_user_request.username,
        password=hash_password(create_user_request.password),
        email=create_user_request.email,
        phone_num=create_user_request.phone_num,
    )
    db.add(create_user_model)     # Stage the new row
    db.commit()                    # Save to database
    return create_user_model


def create_user_by_admin(db: Session, create_user: CreateUser):
    """
    Creates a new user account via the admin dashboard.

    Unlike create_user(), this does NOT set a password because:
    - Admin creates the account with just username, email, and role
    - The new user receives a verification code by email
    - They set their own password via the /set-password endpoint
    """
    create_user_model = Users(
        username=create_user.username,
        email=create_user.email,
        role=create_user.role
    )
    db.add(create_user_model)
    db.commit()
    return create_user_model


def get_user_by_username(db: Session, username: str):
    """
    Finds a user by their username.
    Returns the user object if found, None if not.
    Used during registration (to check for duplicates) and login.
    """
    return db.query(Users).filter(Users.username == username).first()


def get_user_by_email(db: Session, email: str):
    """
    Finds a user by their email address.
    Returns the user object if found, None if not.
    Used during registration to prevent duplicate emails.
    """
    return db.query(Users).filter(Users.email == email).first()


async def get_current_user(token: str = Depends(oauth2_bearer)):
    """
    Extracts the current user's info from their JWT token.

    This is used as a FastAPI dependency for protected endpoints:
        @app.get("/profile")
        async def profile(user: user_dependency):
            # user = {"username": "hadil", "id": 1}

    Steps:
      1. Read the public key to verify the token
      2. Decode the JWT token
      3. Extract username and user_id from the payload
      4. Return a dict with the user's basic info
    """
    try:
        with open(PUBLIC_KEY_PATH, "r") as f:
            public_key = f.read()

        payload = jwt.decode(token, public_key, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        user_id: int = payload.get("id")

        if username is None or user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate user."
            )
        return {"username": username, "id": user_id}

    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate user."
        )


def update_role_name(db: Session, user_id: int, role_update: UserRoleUpdate):
    """
    Changes a user's role (admin-only operation).

    Example: Promoting a customer to accountant
      update_role_name(db, user_id=5, role_update={"name": "accountant"})
    """
    user = db.query(Users).filter(Users.id == user_id).first()
    if not user:
        return None
    user.role = role_update.name
    db.commit()
    db.refresh(user)    # Refresh to get the updated data from the database
    return user