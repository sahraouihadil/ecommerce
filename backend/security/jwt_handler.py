"""
jwt_handler.py - JSON Web Token (JWT) creation and verification
"""

import os
import secrets
from datetime import timedelta, datetime
from pathlib import Path

from dotenv import load_dotenv
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from starlette import status

load_dotenv()

oauth2_bearer = OAuth2PasswordBearer(tokenUrl="/login")

SECRET_KEY = os.getenv("SECRET_KEY", secrets.token_hex(32))
ALGORITHM = os.getenv("ALGORITHM", "RS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))
REFRESH_TOKEN_EXPIRE_DAYS = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", 7))

PRIVATE_KEY_PATH = Path(os.getenv("PRIVATE_KEY", "keys/private.pem"))
PUBLIC_KEY_PATH = Path(os.getenv("PUBLIC_KEY", "keys/public.pem"))

if not PRIVATE_KEY_PATH.exists() or not PUBLIC_KEY_PATH.exists():
    raise ValueError(
        "RSA private/public keys not found! "
        "Run 'python generate_keys.py' to create them."
    )

TOKEN_BLACKLIST = set()


def create_access_token(username: str, user_id: int, expires_delta: timedelta, role: str) -> str:
    # FIX: removed the stray `"sub": str(user.id)` that was on this line causing issues
    """
    Creates a JWT access token.
    Payload contains: sub (username), id (user_id), role, exp (expiry)
    """
    payload = {
        "sub":  username,   # username string
        "id":   user_id,    # integer user ID — used by all endpoints
        "role": role,
    }
    expires = datetime.utcnow() + expires_delta
    payload.update({"exp": expires})

    with open(PRIVATE_KEY_PATH, "r") as key_file:
        private_key = key_file.read()
    return jwt.encode(payload, private_key, algorithm=ALGORITHM)


def create_refresh_token(username: str, user_id: int, expires_delta: timedelta, role: str) -> str:
    payload = {
        "sub":  username,
        "id":   user_id,
        "role": role,
    }
    expires = datetime.utcnow() + expires_delta
    payload.update({"exp": expires})

    with open(PRIVATE_KEY_PATH, "r") as key_file:
        private_key = key_file.read()
    return jwt.encode(payload, private_key, algorithm=ALGORITHM)


def verify_token(token: str = Depends(oauth2_bearer)) -> dict:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        with open(PUBLIC_KEY_PATH, "r") as key_file:
            public_key = key_file.read()

        payload = jwt.decode(token, public_key, algorithms=[ALGORITHM])

        if "sub" not in payload or "role" not in payload:
            raise credentials_exception

        if token in TOKEN_BLACKLIST:
            raise HTTPException(status_code=401, detail="Token has been revoked")

        return payload

    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except JWTError:
        raise credentials_exception


def revoke_token(token: str):
    TOKEN_BLACKLIST.add(token)