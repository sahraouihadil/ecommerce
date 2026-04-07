from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
import models, database

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], # Your React port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# This line creates the tables in PostgreSQL automatically
models.Base.metadata.create_all(bind=database.engine)

@app.get("/")
def read_root():
    return {"message": "ARoom API is running"}

@app.get("/api/products")
def get_products(db: Session = Depends(database.get_db)):
    return db.query(models.Product).all()
