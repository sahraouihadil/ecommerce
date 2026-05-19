"""
models.py - Database table definitions (SQLAlchemy ORM models)
"""

from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy import Enum as SQLAlchemyEnum
from sqlalchemy.orm import relationship
from database import Base
from enums import UserRole
from datetime import datetime


class Users(Base):
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

    vehicle           = Column(String, nullable=True)
    credit            = Column(String, nullable=True)

    orders     = relationship("Orders", foreign_keys="Orders.user_id")
    deliveries = relationship("Orders", foreign_keys="Orders.deliveryman_id")


class PendingVerification(Base):
    __tablename__ = "pending_verifications"

    id                = Column(Integer, primary_key=True, index=True)
    email             = Column(String, unique=True, index=True, nullable=False)
    username          = Column(String, nullable=False)
    phone_num         = Column(String, nullable=True)
    password          = Column(String, nullable=False)   
    verification_code = Column(String, nullable=False)
    created_at        = Column(DateTime, default=datetime.utcnow)

class Products(Base):
    __tablename__ = "products"

    id             = Column(Integer, primary_key=True, index=True)
    name           = Column(String, index=True, nullable=False)
    description    = Column(String)
    price          = Column(Float, nullable=False)
    discount_price = Column(Float, nullable=True)       # FIX: sale price
    on_sale        = Column(Boolean, default=False)     # FIX: sale flag
    new_arrival    = Column(Boolean, default=False)     # FIX: new arrival flag
    quantity       = Column(Integer, default=0)
    min_stock      = Column(Integer, default=10)
    sku            = Column(String, unique=True, index=True)
    category       = Column(String, index=True)
    badge          = Column(String)
    model_src      = Column(String)
    model_3d       = Column(String)
    ios_src        = Column(String)
    able_3d        = Column(Boolean, default=False)
    able_ar        = Column(Boolean, default=False)
    is_active      = Column(Boolean, default=False)
    valid_ar       = Column(Boolean, default=False)
    valid_3d       = Column(Boolean, default=False)
    created_at     = Column(DateTime, default=datetime.utcnow)

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
    __tablename__ = "orders"

    id             = Column(Integer, primary_key=True, index=True)
    user_id        = Column(Integer, ForeignKey("users.id"))
    orderdate      = Column(DateTime, default=datetime.utcnow)
    deliverydate   = Column(DateTime, nullable=True)
    deliverydates = Column(Text, nullable=True)  # JSON array of ISO strings
    totalamount    = Column(Float)
    status         = Column(String, default="pending")
    delivery_type  = Column(String)
    delivery_dow   = Column(String, nullable=True)

    wilaya         = Column(String)
    city           = Column(String)
    street_address = Column(String)
    notes          = Column(String, nullable=True)
    rating         = Column(String)

    problem_notes  = Column(String)
    problem_reason = Column(String)

    payment_method = Column(String)

    deliveryman_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    user_id        = Column(Integer, ForeignKey("users.id"))

    items = relationship("OrderItems", back_populates="order")


class CartItems(Base):
    __tablename__ = "cart_items"

    id         = Column(Integer, primary_key=True, index=True)
    user_id    = Column(Integer, ForeignKey("users.id"))
    product_id = Column(Integer, ForeignKey("products.id"))
    quantity   = Column(Integer, default=1)
    custom_order = Column(Text, nullable=True)


class Favorites(Base):
    __tablename__ = "favorites"

    id         = Column(Integer, primary_key=True, index=True)
    user_id    = Column(Integer, ForeignKey("users.id"))
    product_id = Column(Integer, ForeignKey("products.id"))

    product = relationship("Products")


class OrderItems(Base):
    __tablename__ = "orderitems"

    id            = Column(Integer, primary_key=True, index=True)
    price         = Column(Float)
    quantity      = Column(Integer)
    status        = Column(String, default="pending")
    return_reason = Column(String)
    order_id      = Column(Integer, ForeignKey("orders.id"))
    product_id    = Column(Integer, ForeignKey("products.id"))

    order   = relationship("Orders", back_populates="items")
    product = relationship("Products")


class Complaints(Base):
    __tablename__ = "complaints"

    id            = Column(Integer, primary_key=True, index=True)
    title         = Column(String)
    description   = Column(String)
    type_c        = Column(String)
    priority      = Column(String)
    status        = Column(String, default='pending')
    internal_note = Column(String)
    created_at    = Column(DateTime, default=datetime.utcnow)
    user_id       = Column(Integer, ForeignKey("users.id"))


class Campaigns(Base):
    __tablename__ = "campaigns"

    id            = Column(Integer, primary_key=True, index=True)
    name          = Column(String, nullable=False)
    title         = Column(String, nullable=False)
    channel       = Column(String)
    status        = Column(String, default="draft")
    budget        = Column(Float, default=0)
    spent         = Column(Float, default=0)
    impressions   = Column(Integer, default=0)
    clicks        = Column(Integer, default=0)
    code          = Column(String)
    discount      = Column(Float)
    discount_type = Column(String)
    usage_max     = Column(Integer, default=0)
    usage_current = Column(Integer, default=0)
    image_url     = Column(String)
    start_date    = Column(DateTime)
    end_date      = Column(DateTime)
    campaign_type = Column(String, nullable=True)       # "sale" | "new"
    is_active     = Column(Boolean)
    created_at    = Column(DateTime, default=datetime.utcnow)


class Newsletters(Base):
    __tablename__ = "newsletters"

    id         = Column(Integer, primary_key=True, index=True)
    name       = Column(String)
    email      = Column(String, unique=True, index=True)
    status     = Column(String)
    tags       = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)


class Blogs(Base):
    __tablename__ = "blogs"

    id         = Column(Integer, primary_key=True, index=True)
    title      = Column(String, nullable=False)
    category   = Column(String, index=True)
    image      = Column(String, nullable=False)
    content    = Column(String)
    excerpt    = Column(String)
    tag        = Column(String)
    author     = Column(String)
    views      = Column(Integer, default=0)
    status     = Column(String, default="draft")
    is_active  = Column(Boolean)
    created_at = Column(DateTime, default=datetime.utcnow)


class Notification(Base):
    __tablename__ = "notifications"
    __table_args__ = {"extend_existing": True}

    id         = Column(Integer, primary_key=True, index=True)
    user_id    = Column(Integer, ForeignKey("users.id"), nullable=True)
    type       = Column(String, default="order", nullable=True)
    title      = Column(String, nullable=True)
    body       = Column(String, nullable=True)
    is_read    = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    role       = Column(String, nullable=True)
    order_id   = Column(Integer, ForeignKey("orders.id"), nullable=True)
    message    = Column(String, nullable=True)


class Review(Base):
    __tablename__ = "reviews"

    id         = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    user_id    = Column(Integer, ForeignKey("users.id"), nullable=False)
    user_name  = Column(String, nullable=False)
    rating     = Column(Integer, nullable=False)
    comment    = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


class ValidationRequest(Base):
    __tablename__ = "validation_requests"

    id             = Column(Integer, primary_key=True, index=True)
    item_type      = Column(String, nullable=False, index=True)
    item_id        = Column(Integer, nullable=False, index=True)
    title          = Column(String, nullable=False)
    status         = Column(String, default="Pending", index=True)
    rejection_note = Column(Text, nullable=True)

    submitted_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    reviewed_by  = Column(Integer, ForeignKey("users.id"), nullable=True)

    submitted_at = Column(DateTime, default=datetime.utcnow)
    reviewed_at  = Column(DateTime, nullable=True)

    submitter = relationship("Users", foreign_keys=[submitted_by])
    reviewer  = relationship("Users", foreign_keys=[reviewed_by])