from fastapi import FastAPI ,status,HTTPException,Depends
from pydantic import BaseModel
from typing import List,Annotated
import models
from database import engine,SessionLocal,db_dependency
from sqlalchemy.orm import Session 
from enums import UserRole
from route import user_router
from fastapi.middleware.cors import CORSMiddleware
from user_crud import get_current_user
from fastapi.middleware.cors import CORSMiddleware
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
    


