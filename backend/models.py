from sqlalchemy import Column, Integer, String, Float,String,Boolean,Enum as SQLAlchemyEnum
from database import Base
from enums import UserRole


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