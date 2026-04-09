from sqlalchemy import Column, Integer, String, Float,String,Enum as SQLAlchemyEnum
from database import Base
from enums import UserRole


class Users(Base):
   __tablename__ = 'users'
 
   id = Column(Integer,primary_key=True,index=True)
   username = Column(String,index=True)
   email = Column(String,index=True)
   password = Column(String)
   phoneNum = Column(String)
   role = Column(SQLAlchemyEnum(UserRole), default=UserRole.custmer)

class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(String)
    price = Column(Float)
    image_url = Column(String)