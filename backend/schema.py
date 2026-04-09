from pydantic import BaseModel
from models import UserRole

class CreateUserRequest(BaseModel):
   username: str
   password: str
   email: str
   phoneNum: str

class LoginUserRequest(BaseModel):
  username: str
  password: str

class Token(BaseModel):
  access_token: str
  token_type: str

class UserRoleUpdate(BaseModel):
  name: str