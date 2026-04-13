"""
password.py - Password hashing and validation utilities
========================================================
This file handles everything related to passwords:
  - Hashing passwords before storing them in the database
  - Verifying passwords during login
  - Validating password strength (minimum requirements)

We use Argon2 for hashing, which is more secure than bcrypt.
Argon2 won the Password Hashing Competition in 2015.
"""

import re
from fastapi import HTTPException
from passlib.context import CryptContext
from starlette import status

# ── Password Hashing Setup ──
# CryptContext manages the hashing algorithm for us.
# "argon2" is the algorithm, "deprecated=auto" means old hashes
# will still work but new ones always use the latest settings.
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")


def hash_password(password: str) -> str:
    """
    Takes a plain text password and returns a hashed version.
    This is called during registration and password reset.

    Example:
        hash_password("MyPass123!") → "$argon2id$v=19$m=65536..."
    """
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Compares a plain text password with a hashed one.
    This is called during login to check if the password is correct.

    Returns True if they match, False otherwise.
    """
    return pwd_context.verify(plain_password, hashed_password)


def validate_password(password: str):
    """
    Checks if a password meets our security requirements:
      - At least 8 characters long
      - Contains at least one uppercase letter (A-Z)
      - Contains at least one lowercase letter (a-z)
      - Contains at least one number (0-9)
      - Contains at least one special character (!@#$%^&*...)
      - No spaces allowed

    Raises HTTPException with a clear message if any rule is broken.
    Returns True if the password is valid.
    """
    if len(password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 8 characters long"
        )
    if not re.search(r"[A-Z]", password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must contain at least one uppercase letter"
        )
    if not re.search(r"[a-z]", password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must contain at least one lowercase letter"
        )
    if not re.search(r"\d", password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must contain at least one number"
        )
    if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must contain at least one special character"
        )
    if " " in password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password cannot contain spaces"
        )
    return True
