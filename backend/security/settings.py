"""
settings.py - Security module re-exports
==========================================
This file re-exports everything from the split security modules so that
existing imports like `from security.settings import hash_password` still work.

The actual code lives in 3 separate files for clarity:
  - security/password.py    → Password hashing and validation
  - security/jwt_handler.py → JWT token creation and verification
  - security/roles.py       → Role-based access control (admin_required, etc.)

You can import from here OR directly from the specific files:
  from security.settings import hash_password          # works (re-export)
  from security.password import hash_password          # also works (direct)
"""

# ── Password utilities ──
from security.password import (
    hash_password,
    verify_password,
    validate_password,
)

# ── JWT token utilities ──
from security.jwt_handler import (
    oauth2_bearer,
    ALGORITHM,
    PUBLIC_KEY_PATH,
    PRIVATE_KEY_PATH,
    ACCESS_TOKEN_EXPIRE_MINUTES,
    REFRESH_TOKEN_EXPIRE_DAYS,
    create_access_token,
    create_refresh_token,
    verify_token,
    revoke_token,
)

# ── Role-based access control ──
from security.roles import (
    admin_required,
    accountant_required,
    marketing_manager_required,
    stock_manager_required,
    deliveryman_required,
    customer_required,
)

# ── Authentication (login check) ──
from models import Users


def authenticate_user(username: str, password: str, db):
    """
    Checks if a username/password combination is valid.
    Used by the /login endpoint.

    Steps:
      1. Find the user by username in the database
      2. If not found, return False
      3. If found, compare the plain password with the stored hash
      4. If they match, return the user object; otherwise return False
    """
    user = db.query(Users).filter(Users.username == username).first()
    if not user:
        return False
    if not verify_password(password, user.password):
        return False
    return user
