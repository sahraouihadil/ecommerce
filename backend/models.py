from sqlalchemy import Column, Integer, String, Float,String,Boolean,DateTime,ForeignKey,Enum as SQLAlchemyEnum
from database import Base
from enums import UserRole
from datetime import datetime


class Users(Base):
   __tablename__ = 'users'
 
   id = Column(Integer,primary_key=True,index=True)
   username = Column(String,nullable=False,unique=True,index=True)
   email = Column(String,nullable=False,unique=True,index=True)
   password = Column(String,nullable=True)
   phoneNum = Column(String,nullable=True)
   role = Column(SQLAlchemyEnum(UserRole), default=UserRole.customer,nullable=False)
   active = Column(Boolean,default=True)
   last = Column(String, default="Now")
   verification_code = Column(String,nullable=True)
   is_verified = Column(Boolean, default=False)

class Products(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(String)
    price = Column(Float)
    image_url = Column(String)

class Orders(Base):
   __tablename__ = "orders"
   
   id = Column(Integer, primary_key=True, index=True)
   orderdate = Column(DateTime, default=datetime.utcnow)
   deliverydate = Column(DateTime)
   totalamount = Column(Float)
   status = Column(String)


class OrderItems(Base):
    __tablename__ = "orderitems"

    id = Column(Integer, primary_key=True, index=True)
    price = Column(Float)
    quantity = Column(Integer)

    order_id = Column(Integer, ForeignKey("orders.id"))
    product_id = Column(Integer, ForeignKey("products.id"))
    
class Complaints(Base):
   __tablename__ = "complaints"
   
   id = Column(Integer, primary_key=True, index=True)
   title = Column(String)
   description = Column(String)
   date = Column(DateTime,default=datetime.utcnow)
   type_c = Column(String)
   priority = Column(String)
   status = Column(String)

   user_id = Column(Integer, ForeignKey("users.id"))