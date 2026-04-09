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

products = [
    {"id": 1, "name": "Royal Bedroom Set", "price": 120000, "image": "https://via.placeholder.com/150", "description": "Complete master suite with a king-size bed and a 6-door wardrobe."},
    {"id": 2, "name": "Modern Living Room Sofa", "price": 85000, "image": "https://via.placeholder.com/150", "description": "Very comfortable L-shaped sofa, washable gray fabric."},
    {"id": 3, "name": "Wooden Dining Table", "price": 45000, "image": "https://via.placeholder.com/150", "description": "Round table with 6 chairs for a classic dining room."},
    {"id": 4, "name": "Office Cabinet", "price": 25000, "image": "https://via.placeholder.com/150", "description": "Professional storage for files and supplies."},
    {"id": 5, "name": "Ergonomic Gaming Chair", "price": 32000, "image": "https://via.placeholder.com/150", "description": "Comfortable gamer chair with lumbar support."},
    {"id": 6, "name": "Minimalist TV Stand", "price": 18000, "image": "https://via.placeholder.com/150", "description": "Sleek white wood design with shelves."},
    {"id": 7, "name": "Single Bed for Kids", "price": 35000, "image": "https://via.placeholder.com/150", "description": "Sturdy colorful bed for a child's bedroom."},
    {"id": 8, "name": "Living Room Coffee Table", "price": 12000, "image": "https://via.placeholder.com/150", "description": "Small modern table made of glass and metal."},
    {"id": 9, "name": "Kitchen Buffet", "price": 55000, "image": "https://via.placeholder.com/150", "description": "Spacious kitchen cabinet for dishes."},
    {"id": 10, "name": "Relaxation Armchair", "price": 42000, "image": "https://via.placeholder.com/150", "description": "Reclining black leather armchair for resting."},
    {"id": 11, "name": "Oak Desk", "price": 28000, "image": "https://via.placeholder.com/150", "description": "Large, solid, and elegant work desk."},
    {"id": 12, "name": "4-Drawer Dresser", "price": 22000, "image": "https://via.placeholder.com/150", "description": "Practical storage for clothes in light wood."},
    {"id": 13, "name": "Bookshelf", "price": 15000, "image": "https://via.placeholder.com/150", "description": "Open wall library for decoration."},
    {"id": 14, "name": "Nightstand", "price": 7500, "image": "https://via.placeholder.com/150", "description": "Small bedside table with one drawer."},
    {"id": 15, "name": "Convertible Sofa Bed", "price": 68000, "image": "https://via.placeholder.com/150", "description": "Ideal for guests, transforms into a double bed."},
    {"id": 16, "name": "Bedroom Mirror", "price": 9000, "image": "https://via.placeholder.com/150", "description": "Large full-length mirror with a gold frame."},
    {"id": 17, "name": "Bar Stool", "price": 11000, "image": "https://via.placeholder.com/150", "description": "High metal stool for kitchen counter."},
    {"id": 18, "name": "Entryway Cabinet", "price": 20000, "image": "https://via.placeholder.com/150", "description": "Furniture for shoes and coats."},
    {"id": 19, "name": "Bunk Bed", "price": 58000, "image": "https://via.placeholder.com/150", "description": "Space saver for shared kids' bedroom."},
    {"id": 20, "name": "Decorative Console", "price": 16000, "image": "https://via.placeholder.com/150", "description": "Slim furniture for entry or hallway."},
    {"id": 21, "name": "Vintage Sideboard", "price": 75000, "image": "https://via.placeholder.com/150", "description": "Antique style for luxury dining room."},
    {"id": 22, "name": "Corner Desk", "price": 34000, "image": "https://via.placeholder.com/150", "description": "Space optimization for remote work."},
    {"id": 23, "name": "Dining Room Chair", "price": 8000, "image": "https://via.placeholder.com/150", "description": "Velvet chair with black legs."},
    {"id": 24, "name": "Living Room Ottoman", "price": 5000, "image": "https://via.placeholder.com/150", "description": "Small comfortable extra seat."},
    {"id": 25, "name": "Open Dressing Room", "price": 48000, "image": "https://via.placeholder.com/150", "description": "Modern storage system without doors."},
    {"id": 26, "name": "Vanity Table with Mirror", "price": 38000, "image": "https://via.placeholder.com/150", "description": "Makeup space with LEDs and drawers."},
    {"id": 27, "name": "Garden Table", "price": 19000, "image": "https://via.placeholder.com/150", "description": "Outdoor furniture resistant to weather."},
    {"id": 28, "name": "3-Seater Leather Sofa", "price": 110000, "image": "https://via.placeholder.com/150", "description": "High quality genuine Italian leather."},
    {"id": 29, "name": "Designer Coat Rack", "price": 6000, "image": "https://via.placeholder.com/150", "description": "Elegant vertical support for entry hall."},
    {"id": 30, "name": "Built-in Library", "price": 85000, "image": "https://via.placeholder.com/150", "description": "Large custom library for living room."},
    {"id": 31, "name": "Kitchen Island", "price": 42000, "image": "https://via.placeholder.com/150", "description": "Central work plan with storage."},
    {"id": 32, "name": "Office Swivel Chair", "price": 14000, "image": "https://via.placeholder.com/150", "description": "Swivel chair for daily use."},
    {"id": 33, "name": "Iron Bed Frame", "price": 27000, "image": "https://via.placeholder.com/150", "description": "Industrial style in sturdy black metal."},
    {"id": 34, "name": "Bathroom Cabinet", "price": 31000, "image": "https://via.placeholder.com/150", "description": "Under-sink storage resistant to humidity."},
    {"id": 35, "name": "Corner Lounge Chair", "price": 24000, "image": "https://via.placeholder.com/150", "description": "Modular element to compose your living room."},
    {"id": 36, "name": "Wooden Secretary Desk", "price": 45000, "image": "https://via.placeholder.com/150", "description": "Small classic retractable desk furniture."},
    {"id": 37, "name": "Shoe Rack", "price": 4500, "image": "https://via.placeholder.com/150", "description": "Storage for 10 pairs of shoes."},
    {"id": 38, "name": "Baby Crib", "price": 18000, "image": "https://via.placeholder.com/150", "description": "Secure bed for newborns in white wood."},
    {"id": 39, "name": "Decorative Screen", "price": 12000, "image": "https://via.placeholder.com/150", "description": "Stylish wooden room divider."},
    {"id": 40, "name": "Cheval Mirror", "price": 13500, "image": "https://via.placeholder.com/150", "description": "Long pivoting mirror to see yourself in full length."}
    ]

@app.get("/",status_code=status.HTTP_200_OK)
async def home_page(db: db_dependency):
  return {"products": products}

@app.get("/search")
async def search_products(keyword: str):
 results = [
  p for p in products
  if keyword.lower() in p["name"].lower() or keyword.lower() in p["description"].lower()
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
    

@app.get("/")
def read_root():
    return {"message": "ARoom API is running"}

@app.get("/api/products")
def get_products(db: Session = Depends(database.get_db)):
    return db.query(models.Product).all()
