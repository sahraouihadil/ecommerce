from sqlalchemy.orm import Session
from models import Users
from schema import CreateUserRequest
from security.settings import hash_password,oauth2_bearer,PUBLIC_KEY_PATH,ALGORITHM
from fastapi import Depends
from jose import jwt,JWTError

def create_user(db: db_dependency,create_user_request: CreateUserRequest):
  create_user_model = Users(
     username=create_user_request.username,
     password=hash_password(create_user_request.password),
     email=create_user_request.email,
     phoneNum=create_user_request.phoneNum,
  ) 
  db.add(create_user_model)
  db.commit()
  return create_user_model


def get_user_by_username(db: Session,username: str):
  return db.query(Users).filter(Users.username == username).first() 

async def get_current_user(token: str = Depends(oauth2_bearer)):
  try:
    with open(PUBLIC_KEY_PATH,"r") as f:
      public_key = f.read()

    payload = jwt.decode(token, public_key,algorithms=[ALGORITHM])
    username: str = payload.get('sub')
    user_id: int = payload.get('id')

    if username is None or user_id is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,detail='Could not validate user.')
    return {'username': username, 'id': user_id}
  except JWTError:
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,detail='Could not validate user.')

def update_role_name(db:Session,user_id: int,role_update:UserRoleUpdate):
  user=db.query(Users).filter(Users.id == user_id).first()
  if not user:
    return None
  user.role = role_update.name
  db.commit()
  db.refresh(user)
  return user