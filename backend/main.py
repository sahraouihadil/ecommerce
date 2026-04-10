from fastapi import FastAPI, status, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import Annotated
from fastapi.middleware.cors import CORSMiddleware

import models
import database
from database import engine, SessionLocal, db_dependency
from enums import UserRole
from route import user_router
from user_crud import get_current_user
from routers import chat

# Create FastAPI app
app = FastAPI(title="ARoomX API")

# CORS middleware
origins = [
    "http://localhost:5173",
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


@app.get("/search")
async def search_products(keyword: str, db: db_dependency):
    products = db.query(models.Product).all()
    results = [
        p for p in products
        if keyword.lower() in p.name.lower() or keyword.lower() in p.description.lower()
    ]
    return results


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
    return db.query(models.Product).all()