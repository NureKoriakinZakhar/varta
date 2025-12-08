from typing import List, Optional, Callable
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from app.core.config import settings
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db import models

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

def create_access_token(data: dict, expires_delta=None):
    from datetime import datetime, timedelta
    from jose import jwt

    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(hours=12))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt

def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        user_id = payload.get("sub")
        role = payload.get("role")
        if user_id is None or role is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")
        return {"user_id": int(user_id), "role": role}
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")

def get_current_user_db(db: Session = Depends(get_db), token_data: dict = Depends(get_current_user)):
    role = token_data["role"]
    user_id = token_data["user_id"]

    if role == "headquarters":
        user = db.query(models.Headquarters).filter(models.Headquarters.id == user_id).first()
    elif role == "hospital":
        user = db.query(models.Hospital).filter(models.Hospital.id == user_id).first()
    elif role == "army_unit":
        user = db.query(models.ArmyUnit).filter(models.ArmyUnit.id == user_id).first()
    else:
        user = None

    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return {"user": user, "role": role, "user_id": user_id}

def role_required(required_roles: List[str]):
    def _inner(current_user = Depends(get_current_user)):
        if current_user["role"] not in required_roles:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access forbidden: insufficient role")
        return current_user
    return _inner

def role_or_roles(required_roles: List[str]):
    return role_required(required_roles)
