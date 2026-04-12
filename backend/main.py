from fastapi import FastAPI, status, HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import Annotated
from fastapi.middleware.cors import CORSMiddleware
from database import engine, SessionLocal, db_dependency
from enums import UserRole

from route import user_router,register_user
from fastapi.middleware.cors import CORSMiddleware
from user_crud import get_current_user,create_user_by_admin
from fastapi.middleware.cors import CORSMiddleware
from schema import CreateUser,VerifyCode,SetPassword,UpdateUser
from email_utils import send_email
from security.settings import validate_password,hash_password
import random
import models, database
from routers import chat


# Create FastAPI app
app = FastAPI(title="ARoom API")

# CORS middleware
origins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "https://aroom.com"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create database tables
models.Base.metadata.create_all(bind=database.engine)

# Include routers
app.include_router(user_router)
app.include_router(chat.router, prefix="/api")

user_dependency = Annotated[dict, Depends(get_current_user)]


@app.get("/", status_code=status.HTTP_200_OK)
async def home_page(db: db_dependency):
    return {"message": "ARoom API is running"}

@app.get("/api/users")
def get_users(db: Session = Depends(database.get_db)):
    return db.query(models.Users).all()

@app.get("/api/users/{user_id}")
def get_users_by_id(user_id: int ,db: Session = Depends(database.get_db)):
    return db.query(models.Users).filter(models.Users.id == user_id).first()

@app.post("/api/users")
def create_user(user:CreateUser,db: Session = Depends(database.get_db)):
    print("user:",user)
    new_user = create_user_by_admin(db,user)
    verification_code= random.randint(100000,999999)
    new_user.verification_code= verification_code
    db.commit()

    send_email(user.email,f"Your code is:{verification_code}")

    return user

@app.put("/api/users/{user_id}")
def update_user(user_id:int,user:UpdateUser,db: Session = Depends(database.get_db)):
    db_user= db.query(models.Users).filter(models.Users.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    db_user.username=user.username
    db_user.email=user.email
    db_user.role=user.role

    db.commit()
    db.refresh(db_user)
    return db_user

@app.delete("/api/users/{user_id}")
def delete_users_by_id(user_id: int ,db: Session = Depends(database.get_db)):
    db_user= db.query(models.Users).filter(models.Users.id == user_id).first()

    if not db_user:
        raise HTTPException(status_code=404,detail="User not found")
    db.delete(db_user)
    db.commit()
    return {"message": "User deleted successfully"}


@app.get("/verify-code")
def verify_code(email: str,code: str,db: Session = Depends(database.get_db)):
    user = db.query(models.Users).filter(models.Users.email == email).first()
    print("user:",user)
    print("email:",email)
    if not user:
        return {"error": "User not found"}
    if str(user.verification_code) != str(code):
        return {"error": "Invalid code"}
    user.is_verified = True
    user.verification_code = None

    db.commit()
    return{"msg": "Email verified successfully","user_name": user.username}

@app.post("/set-password")
def set_password(data: SetPassword,db: Session = Depends(database.get_db)):
    user = db.query(models.Users).filter(models.Users.username == data.user_name).first()

    if not user:
        return {"error":"User not found"}
    if not user.is_verified:
        return {"error":"User not verified"}

    try:
        validate_password(data.password)
        user.password = hash_password(data.password) 
   

        db.commit()

        return {"msg": "Password set successfully"}

    except Exception as e:
        return {"error": str(e)}

@app.get("/search")
async def search_products(keyword: str, db: db_dependency):
    products = db.query(models.Products).all()
    results = [
        p for p in products
        if keyword.lower() in p.name.lower() or keyword.lower() in p.description.lower()
    ]
    return results


@app.get("/search-users")
def search_users(keyword: str, db: db_dependency):
    return db.query(models.Users).filter(
        or_(
            models.Users.username.ilike(f"%{keyword}%"),
            models.Users.email.ilike(f"%{keyword}%")
        )
    ).all()


@app.get("/profile")
async def user(user: user_dependency, db: db_dependency):
    if user is None:
        raise HTTPException(status_code=401, detail="Authentication Failed")
    return {
        "message": "User authenticated successfully",
        "user": user
    }


@app.get("/api/products")
def get_products(db: Session = Depends(database.get_db)):
    return db.query(models.Products).all()

@app.get("/api/order-items")
def get_order_items(db: Session = Depends(database.get_db)):
    return db.query(models.OrderItems).all()

@app.get("/api/complaints")
def get_order_items(db: Session = Depends(database.get_db)):
    return db.query(models.Complaints).all()