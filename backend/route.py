from fastapi import APIRouter, Depends,HTTPException
from database import get_db, db_dependency
from models import Users
from user_crud import create_user, get_user_by_username,update_role_name
from schema import CreateUserRequest,UserRoleUpdate
from security.settings import validate_password,custmer_required,admin_required,developer_required,marketing_manager_required,stock_manager_required,deliveryman_required,create_access_token,authenticate_user,verify_token
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm
from starlette import status
from datetime import timedelta,datetime
from dotenv import load_dotenv
import os

load_dotenv()

user_router=APIRouter()

@user_router.post('/register')
def register_user(user:CreateUserRequest,db: Session = Depends(get_db)):
  db_user = get_user_by_username(db,username=user.username)
  if db_user:
    raise HTTPException(status_code=400,detail="Username already existe")
  validate_password(user.password)
  new_user=create_user(db=db,create_user_request=user)
  access_token = create_access_token(new_user.username,new_user.id,timedelta(minutes=int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES"))),new_user.role)
  return {
    "access_token": access_token,
    "token_type": "brearer"
  }

@user_router.post("/login")
async def login_for_access_token(db: db_dependency,form_data:OAuth2PasswordRequestForm = Depends()):
   user =authenticate_user(form_data.username, form_data.password, db)
   if not user:
       raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,detail='could not validate user.')
   access_token =create_access_token(user.username, user.id, timedelta(minutes=int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES"))),user.role)
   return {'access_token': access_token, 'token_type': 'bearer',"role": user.role}

@user_router.get("/profile")
async def get_custmer(payload: dict = Depends(custmer_required)):
 try:
  return {"sub": payload.get("sub")}
 except HTTPException as e:
  raise e
 except Exception as e:
  raise HTTPException(status_code=500,detail=str(e))

@user_router.get("/admin-dash")
async def get_admin(payload: dict = Depends(admin_required)):
 try:
  return {"sub": payload.get("sub")}
 except HTTPException as e:
  raise e
 except Exception as e:
  raise HTTPException(status_code=500,detail=str(e))

@user_router.get("/developer-dash")
async def get_developer(payload: dict = Depends(developer_required)):
 try:
  return {"sub": payload.get("sub")}
 except HTTPException as e:
  raise e
 except Exception as e:
  raise HTTPException(status_code=500,detail=str(e))

@user_router.get("/marketing-manager-dash")
async def get_marketing_manager(payload: dict = Depends(marketing_manager_required)):
 try:
  return {"sub": payload.get("sub")}
 except HTTPException as e:
  raise e
 except Exception as e:
  raise HTTPException(status_code=500,detail=str(e))

@user_router.get("/stock-manager-dash")
async def get_stock_manager(payload: dict = Depends(stock_manager_required)):
 try:
  return {"sub": payload.get("sub")}
 except HTTPException as e:
  raise e
 except Exception as e:
  raise HTTPException(status_code=500,detail=str(e))

@user_router.get("/deliveryman-dash")
async def get_deliveryman(payload: dict = Depends(deliveryman_required)):
 try:
  return {"sub": payload.get("sub")}
 except HTTPException as e:
  raise e
 except Exception as e:
  raise HTTPException(status_code=500,detail=str(e))

@user_router.put("/setrole")
async def get_admin(user_id:int ,role_update:UserRoleUpdate,db: Session = Depends(get_db), payload: dict = Depends(admin_required)):
 try:
  user = update_role_name(db,user_id,role_update)
  if user is None:
    raise HTTPException(status_code=404, detail=" User not found")
  return {"user id": user_id,"username": user.username,"new role": role_update.name}
 except HTTPException as e:
  raise e
 except Exception as e:
  raise HTTPException(status_code=500,detail=str(e))