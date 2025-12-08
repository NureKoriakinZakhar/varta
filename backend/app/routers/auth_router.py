from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from fastapi.security import OAuth2PasswordRequestForm
from app.db import models
from app.db.database import get_db
from app.core import security
from app.schemas import auth_schemas

router = APIRouter(prefix="/auth", tags=["Authorization"])
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

@router.post("/login", response_model=auth_schemas.AuthResponse)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db) ):
    email = form_data.username
    password = form_data.password

    user = None
    role = None

    # Штаб
    user = db.query(models.Headquarters).filter(models.Headquarters.email == email).first()
    if user and pwd_context.verify(password, user.password):
        role = "headquarters"

    # Госпіталь
    if not role:
        user = db.query(models.Hospital).filter(models.Hospital.email == email).first()
        if user and pwd_context.verify(password, user.password):
            role = "hospital"

    # Підрозділ
    if not role:
        user = db.query(models.ArmyUnit).filter(models.ArmyUnit.email == email).first()
        if user and pwd_context.verify(password, user.password):
            role = "army_unit"

    # Якщо користувача не знайдено або пароль невірний
    if not role:
        raise HTTPException(status_code=401, detail="Невірний email або пароль")

    # Створення токену
    token = security.create_access_token(data={"sub": str(user.id), "role": role})

    return auth_schemas.AuthResponse(access_token=token, token_type="bearer", role=role)
