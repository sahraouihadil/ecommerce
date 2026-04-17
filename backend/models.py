"""
models.py - Database table definitions (SQLAlchemy ORM models)
===============================================================
Each class here represents a table in the PostgreSQL database.
SQLAlchemy automatically creates/manages these tables for us.

TABLE RELATIONSHIPS:
  Users ──┬── Orders (one user can have many orders)
          ├── CartItems (one user can have many cart items)
          ├── Favorites (one user can have many favorites)
          └── Complaints (one user can file many complaints)

  Products ──┬── OrderItems (one product can appear in many orders)
             ├── CartItems (one product can be in many carts)
             └── Favorites (one product can be favorited by many users)

  Orders ── OrderItems (one order contains many items)
"""

from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey
from sqlalchemy import Enum as SQLAlchemyEnum
from sqlalchemy.orm import relationship
from database import Base
from enums import UserRole
from datetime import datetime


class Users(Base):
    """
    The users table - stores all registered users.
    Each user has a role that determines what they can access.
    """
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)  # Unique user ID (auto-incremented)
    username = Column(String, nullable=False, unique=True, index=True)  # Must be unique
    email = Column(String, nullable=False, unique=True, index=True)     # Must be unique
    password = Column(String, nullable=True)         # Hashed with Argon2 (null until set via /set-password)
    phone_num = Column(String, nullable=True)         # Optional phone number
    role = Column(SQLAlchemyEnum(UserRole), default=UserRole.customer, nullable=False)  # Default: customer
    active = Column(Boolean, default=True)           # Whether the account is active
    last = Column(String, default="Now")             # Last activity timestamp
    verification_code = Column(String, nullable=True)  # 6-digit email verification code
    is_verified = Column(Boolean, default=False)     # True after email verification
    created_at = Column(DateTime, default=datetime.utcnow) 

class Products(Base):
    """
    Products table - furniture items with 3D support + variants
    """
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    description = Column(String)
    price = Column(Float, nullable=False)
    quantity = Column(Integer, default=0)

    image_url = Column(String)
    category = Column(String)

    badge = Column(String)  
    
    # 3D MODEL
    model_src = Column(String)   # GLB (web)
    ios_src = Column(String)     # USDZ (iOS)
    
    able_ar = Column(Boolean,default=False)
    able_3d = Column(Boolean,default=False)



    
    variants = relationship("ProductVariant", back_populates="product", cascade="all, delete")

class ProductVariant(Base):
    __tablename__ = "product_variants"

    id = Column(Integer, primary_key=True, index=True)

    product_id = Column(Integer, ForeignKey("products.id"))
    name = Column(String)
    color = Column(String)

    product = relationship("Products", back_populates="variants")

class Orders(Base):
    """
    The orders table - stores completed orders.
    Created when a customer checks out their cart.
    """
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))    # Which user placed this order
    orderdate = Column(DateTime, default=datetime.utcnow)  # When the order was placed
    deliverydate = Column(DateTime)                       # Expected delivery date (set later)
    totalamount = Column(Float)                           # Total price of all items
    status = Column(String, default="pending")            # "pending", "confirmed", "shipped", "delivered"


class CartItems(Base):
    """
    The cart_items table - stores items in a user's shopping cart.
    When the user checks out, these become OrderItems and are deleted from the cart.
    """
    __tablename__ = "cart_items"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))      # Whose cart this belongs to
    product_id = Column(Integer, ForeignKey("products.id"))  # Which product
    quantity = Column(Integer, default=1)                    # How many of this product


class Favorites(Base):
    """
    The favorites table - stores a user's wishlist/favorite products.
    """
    __tablename__ = "favorites"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    product_id = Column(Integer, ForeignKey("products.id"))


class OrderItems(Base):
    """
    The orderitems table - stores individual items within an order.
    This is a junction table between Orders and Products.
    One order can have many items, and one product can appear in many orders.
    """
    __tablename__ = "orderitems"

    id = Column(Integer, primary_key=True, index=True)
    price = Column(Float)        # Price at the time of purchase (may differ from current product price)
    quantity = Column(Integer)   # How many of this product in this order
    order_id = Column(Integer, ForeignKey("orders.id"))      # Which order this belongs to
    product_id = Column(Integer, ForeignKey("products.id"))  # Which product


class Complaints(Base):
    """
    The complaints table - stores customer complaints/feedback.
    Visible to admins in the admin dashboard.
    """
    __tablename__ = "complaints"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)                                # Brief complaint title
    description = Column(String)                          # Full complaint text
    date = Column(DateTime, default=datetime.utcnow)      # When filed
    type_c = Column(String)                               # Complaint type/category
    priority = Column(String)                             # "HIGH", "MEDIUM", "LOW"
    status = Column(String)                               # "Pending", "Resolved", "Rejected"
    user_id = Column(Integer, ForeignKey("users.id"))     # Who filed the complaint
