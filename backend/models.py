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

from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey,Text
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

    id                = Column(Integer, primary_key=True, index=True)
    username          = Column(String, nullable=False, unique=True, index=True)
    email             = Column(String, nullable=False, unique=True, index=True)
    password          = Column(String, nullable=True)
    phone_num         = Column(String, nullable=True)
    role              = Column(SQLAlchemyEnum(UserRole), default=UserRole.customer, nullable=False)
    active            = Column(Boolean, default=True)
    last              = Column(String, default="Now")
    verification_code = Column(String, nullable=True)
    is_verified       = Column(Boolean, default=False)
    created_at        = Column(DateTime, default=datetime.utcnow)
    avatar_url        = Column(String, nullable=True)

    orders     = relationship("Orders", foreign_keys="Orders.user_id")
    deliveries = relationship("Orders", foreign_keys="Orders.deliveryman_id")


class Products(Base):
    __tablename__ = "products"

    id          = Column(Integer, primary_key=True, index=True)
    name        = Column(String, index=True, nullable=False)
    description = Column(String)
    price       = Column(Float, nullable=False)
    quantity    = Column(Integer, default=0)
    min_stock   = Column(Integer, default=10)
    sku         = Column(String, unique=True, index=True)
    category    = Column(String, index=True)
    badge       = Column(String)
    model_src   = Column(String)
    model_3d    = Column(String)
    ios_src     = Column(String)
    able_3d     = Column(Boolean, default=False)
    able_ar     = Column(Boolean, default=False)
    is_active   = Column(Boolean, default=True)
    created_at  = Column(DateTime, default=datetime.utcnow)

    colors = relationship("ProductColor", back_populates="product",
                          cascade="all, delete-orphan")
    images = relationship("ProductImage", back_populates="product",
                          cascade="all, delete-orphan",
                          order_by="ProductImage.order")


class ProductColor(Base):
    __tablename__ = "product_colors"

    id         = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"),
                        nullable=False, index=True)
    color      = Column(String, nullable=False)

    product = relationship("Products", back_populates="colors")


class ProductImage(Base):
    __tablename__ = "product_images"

    id         = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"),
                        nullable=False, index=True)
    image_url  = Column(String, nullable=False)
    order      = Column(Integer, default=0)

    product = relationship("Products", back_populates="images")


class Orders(Base):
    """
    The orders table - stores completed orders.
    Created when a customer checks out their cart.
    """
    __tablename__ = "orders"

    id             = Column(Integer, primary_key=True, index=True)
    user_id        = Column(Integer, ForeignKey("users.id"))
    orderdate      = Column(DateTime, default=datetime.utcnow)
    deliverydate   = Column(DateTime, nullable=True)
    totalamount    = Column(Float)
    status         = Column(String, default="pending")  # pending / confirmed / shipped / delivered
    delivery_type  = Column(String)                     # anytime / specific_date / day_of_week
    delivery_dow   = Column(String, nullable=True)      # Monday–Sunday (only for day_of_week)

    wilaya         = Column(String)
    city           = Column(String)
    street_address = Column(String)
    notes          = Column(String, nullable=True)

    payment_method = Column(String)                     # cod / cib / pickup

    deliveryman_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    user_id        = Column(Integer, ForeignKey("users.id")) 

    items       = relationship("OrderItems", back_populates="order")


class CartItems(Base):
    """
    The cart_items table - stores items in a user's shopping cart.
    When the user checks out, these become OrderItems and are deleted from the cart.
    """
    __tablename__ = "cart_items"

    id         = Column(Integer, primary_key=True, index=True)
    user_id    = Column(Integer, ForeignKey("users.id"))
    product_id = Column(Integer, ForeignKey("products.id"))
    quantity   = Column(Integer, default=1)


class Favorites(Base):
    """
    The favorites table - stores a user's wishlist/favorite products.
    """
    __tablename__ = "favorites"

    id         = Column(Integer, primary_key=True, index=True)
    user_id    = Column(Integer, ForeignKey("users.id"))
    product_id = Column(Integer, ForeignKey("products.id"))

    product = relationship("Products")


class OrderItems(Base):
    """
    The orderitems table - stores individual items within an order.
    Junction table between Orders and Products.
    """
    __tablename__ = "orderitems"

    id         = Column(Integer, primary_key=True, index=True)
    price      = Column(Float)
    quantity   = Column(Integer)
    status         = Column(String, default="pending")
    return_reason = Column(String)
    order_id   = Column(Integer, ForeignKey("orders.id"))
    product_id = Column(Integer, ForeignKey("products.id"))

    order   = relationship("Orders", back_populates="items")
    product = relationship("Products")


class Complaints(Base):
    """
    The complaints table - stores customer complaints/feedback.
    Visible to admins in the admin dashboard.
    """
    __tablename__ = "complaints"

    id            = Column(Integer, primary_key=True, index=True)
    title         = Column(String)
    description   = Column(String)
    date          = Column(DateTime, default=datetime.utcnow)
    type_c        = Column(String)
    priority      = Column(String)
    status        = Column(String, default='pending')
    internal_note = Column(String)
    user_id       = Column(Integer, ForeignKey("users.id"))


class Campaigns(Base):
    __tablename__ = "campaigns"

    id          = Column(Integer, primary_key=True, index=True)
    name        = Column(String, nullable=False)
    channel     = Column(String)
    status      = Column(String, default="draft")
    budget      = Column(Float, default=0)
    spent       = Column(Float, default=0)
    impressions = Column(Integer, default=0)
    clicks      = Column(Integer, default=0)
    start_date  = Column(DateTime)
    end_date    = Column(DateTime)
    created_at  = Column(DateTime, default=datetime.utcnow)


class Promotions(Base):
    __tablename__ = "promotions"

    id               = Column(Integer, primary_key=True, index=True)
    title            = Column(String, nullable=False)
    code             = Column(String, unique=True, index=True)
    discount         = Column(Float)
    discount_type    = Column(String)
    usage_max        = Column(Integer, default=0)
    usage_current    = Column(Integer, default=0)
    expiry           = Column(DateTime)
    status           = Column(String, default="upcoming")
    created_at       = Column(DateTime, default=datetime.utcnow)


class Newsletters(Base):
    __tablename__ = "newsletters"

    id         = Column(Integer, primary_key=True, index=True)
    name       = Column(String)
    email      = Column(String, unique=True, index=True)
    status     = Column(String, default="subscribed")
    tags       = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)


class Blogs(Base):
    __tablename__ = "blogs"

    id           = Column(Integer, primary_key=True, index=True)
    title        = Column(String, nullable=False)
    category     = Column(String, index=True)
    image        = Column(String, nullable=False)
    content      = Column(String)
    excerpt      = Column(String)
    tag          = Column(String)
    author       = Column(String)
    views        = Column(Integer, default=0)
    status       = Column(String, default="draft")
    published_at = Column(DateTime)
    created_at   = Column(DateTime, default=datetime.utcnow)


class Review(Base):
    __tablename__ = "reviews"

    id         = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    user_id    = Column(Integer, ForeignKey("users.id"), nullable=False)
    user_name  = Column(String, nullable=False)
    rating     = Column(Integer, nullable=False)
    comment    = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False) 