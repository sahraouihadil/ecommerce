from datetime import timedelta,datetime
import re
from fastapi import HTTPException,Depends
from fastapi.security import OAuth2PasswordBearer
import secrets
from pathlib import Path
from dotenv import load_dotenv
import os
from passlib.context import CryptContext
from starlette import status
from jose import jwt,JWTError
import secrets
from models import Users

# Load environment variables from .env file
load_dotenv()

# Secure OAuth2 Password Bearer
oauth2_bearer =OAuth2PasswordBearer(tokenUrl="/login")

# Secure Password Hashing: Argon2 instead of bcrypt
pwd_context = CryptContext(schemes=["argon2"],deprecated="auto")

# Secure JWT Configration
SECRET_KEY = os.getenv("SECRET_KEY", secrets.token_hex(32))
ALGORITHM = os.getenv("ALGORITHM","RS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES",15))
REFRESH_TOKEN_EXPIRE_DAYS = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS",7))

# JWT Public/Private Key Paths (ensure they exist)
PRIVATE_KEY_PATH = Path(os.getenv("PRIVATE_KEY","keys/private.pem"))
PUBLIC_KEY_PATH = Path(os.getenv("PUBLIC_KEY","keys/public.pem"))

if not PRIVATE_KEY_PATH.exists() or not PUBLIC_KEY_PATH.exists():
  raise ValueError("RSA private/public keys not found! Check your .env settings.")

#In-memory Token Blacklist
TOKEN_BLACKLIST = set()

#Secure Password Hashing:Argon2 instead of bcrypt
pwd_context = CryptContext(schemes=["argon2"],deprecated="auto")

def hash_password(password: str)-> str:
  return pwd_context.hash(password)

def verify_password(plain_password,hashed_password) -> bool:
  return pwd_context.verify(plain_password,hashed_password)

def create_access_token(username: str, user_id: int , expires_delta: timedelta, role: str):
  encode = {'sub' : username,'id': user_id ,'role' : role}
  expires = datetime.utcnow() + (expires_delta or datetime.timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
  encode.update({'exp': expires})

  with open(PRIVATE_KEY_PATH, "r") as key_file:
    private_key = key_file.read()
  return jwt.encode(encode,private_key,algorithm=ALGORITHM)

def create_refresh_token(username: str, user_id: int , expires_delta: timedelta):
  encode = {'sub' : username,'id': user_id,'role' : role}
  expires = datetime.utcnow() + (expires_delta or datetime.timedelta(minutes=REFRESH_TOKEN_EXPIRE_DAYS))
  encode.update({'exp': expires})
  with open(PRIVATE_KEY_PATH, "r") as key_file:
    private_key = key_file.read()
  return jwt.encode(encode,private_key,algorithm=ALGORITHM)

def verify_token(token: str = Depends(oauth2_bearer)) -> dict:

  print("verify_token called")

  credentials_exception = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Could not validate credentials",
    headers={"WWW-Authenticate": "Bearer"},
  )
  try:
    with open(PUBLIC_KEY_PATH, "r") as key_file:
      public_key = key_file.read()
    payload = jwt.decode(token, public_key, algorithms=[ALGORITHM])

    print("Payload decoded:", payload)

    if "sub" not in payload or "role" not in payload:
      raise credentials_exception

#Check if token is blacklist (logout or revoked)
    if token in TOKEN_BLACKLIST:
      raise HTTPException(status_code=401,detail="Token has been revoked")
    return payload
  except jwt.ExpiredSignatureError:
    raise HTTPException(status_code=401,detail="Token has expired")
  except JWTError:
    raise credentials_exception

def revoke_token(token: str):
  TOKEN_BLACKLIST.add(token)

def admin_required(payload: dict =Depends(verify_token)) -> dict:
  if payload.get("role") != "admin":
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
  return payload

def developer_required(payload: dict =Depends(verify_token)) -> dict:
  if payload.get("role") != "developer":
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
  return payload

def marketing_manager_required(payload: dict =Depends(verify_token)) -> dict:
  if payload.get("role") != "marketing_manager":
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
  return payload

def stock_manager_required(payload: dict =Depends(verify_token)) -> dict:
  if payload.get("role") != "stock_manager":
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
  return payload

def deliveryman_required(payload: dict =Depends(verify_token)) -> dict:
  if payload.get("role") != "deliveryman":
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
  return payload

def custmer_required(payload: dict =Depends(verify_token)) -> dict:
  if payload.get("role") != "custmer":
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
  return payload

def validate_password(password: str):
  if len(password) < 8:
    raise HTTPException(
      status_code=status.HTTP_400_BAD_REQUEST,
      detail="Password must be at least 8 characters long"
    )
  if not re.search(r"[A-Z]",password):
    raise HTTPException(
      status_code=status.HTTP_400_BAD_REQUEST,
      detail="Password must contain at least one uppercase letter"
    )
  if not re.search(r"[a-z]",password):
    raise HTTPException(
      status_code=status.HTTP_400_BAD_REQUEST,
      detail="password must contain at least one lowercase letter"
    )
  if not re.search(r"\d",password):
    raise HTTPException(
      status_code=status.HTTP_400_BAD_REQUEST,
      detail="Password must contain at least one number"
    )
  if not re.search(r"[!@#$%^&*(),.?\":{}|<>]",password):
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

def authenticate_user(username:str, password: str, db):
  user = db.query(Users).filter(Users.username == username).first()
  if not user:
      return False
  if not verify_password(password,user.password):
      return False
  return user 