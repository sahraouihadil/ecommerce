from fastapi import FastAPI ,status,HTTPException,Depends
from pydantic import BaseModel
from typing import List,Annotated
import models
from database import engine,SessionLocal,db_dependency
from sqlalchemy.orm import Session 
from enums import UserRole
from route import user_router,register_user
from fastapi.middleware.cors import CORSMiddleware
from user_crud import get_current_user,create_user_by_admin
from fastapi.middleware.cors import CORSMiddleware
from schema import CreateUser,VerifyCode,SetPassword
from email_utils import send_email
from security.settings import validate_password,hash_password
import random
import models, database

app = FastAPI()

origins = [
   "http://localhost:5173",
   "https://aroom.com"
]
# CROS midlleware for developement
app.add_middleware(
  CORSMiddleware,
  allow_origins=origins,
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"],
)
# This line creates the tables in PostgreSQL automatically
models.Base.metadata.create_all(bind=database.engine)

# Include routes
app.include_router(user_router)

user_dependency = Annotated[dict, Depends(get_current_user)]   


@app.get("/",status_code=status.HTTP_200_OK)
async def home_page(db: db_dependency):
  return {"Hello everyone!!"}

@app.get("/api/products")
def get_products(db: Session = Depends(database.get_db)):
    products = db.query(models.Products).all()
    return products

@app.get("/api/users")
def get_users(db: Session = Depends(database.get_db)):
    users = db.query(models.Users).all()
    return users

@app.post("/api/users")
def create_user(user:CreateUser,db: Session = Depends(database.get_db)):
    print("user:",user)
    new_user = create_user_by_admin(db,user)
    verification_code= random.randint(100000,999999)
    new_user.verification_code= verification_code
    db.commit()

    send_email(user.email,f"Your code is:{verification_code}")

    return user

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
async def search_products(keyword: str,db: Session = Depends(database.get_db)):
    
 products = db.query(models.Products).all()

 results = [
  p for p in products
  if keyword.lower() in p.name.lower() or keyword.lower() in p.description.lower()
   ]
 return results

@app.get("/profile/history",status_code=status.HTTP_200_OK)
async def user(user:user_dependency,db:db_dependency):
  if user is None:
      raise HTTPException(status_code=401,detail='Authentication Failed')
  return {"User": user}

@app.get("/profile")
async def user(user:user_dependency, db:db_dependency):
    if user is None:
        raise HTTPException(status_code=401, detail='Authentication Failed')
    
    return {
        "message": "User authenticated successfully",
        "user": user
    }
    


