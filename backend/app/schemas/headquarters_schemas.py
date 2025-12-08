from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from datetime import datetime

class ArmyUnitCreate(BaseModel):
    name: str = Field(..., min_length=6, description="Назва підрозділу")
    email: EmailStr = Field(..., description="Унікальний email підрозділу")
    password: str = Field(..., min_length=6, description="Пароль має містити щонайменше 6 символів")
    coordinates: str = Field(..., description="Координати у форматі 'широта, довгота'")

class ArmyUnitUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=6)
    email: Optional[EmailStr] = None
    password: Optional[str] = Field(None, min_length=6)
    coordinates: Optional[str] = None

class ArmyUnitResponse(BaseModel):
    id: int
    name: str
    email: str
    coordinates: str
    created_at: datetime

    class Config:
        from_attributes = True

class HospitalCreate(BaseModel):
    name: str = Field(..., min_length=6, description="Назва госпіталю")
    email: EmailStr = Field(..., description="Унікальний email госпіталю")
    password: str = Field(..., min_length=6)
    address: str = Field(..., min_length=6, description="Адреса госпіталю")
    coordinates: str = Field(..., description="Координати у форматі 'широта, довгота'")
    capacity_total: int = Field(..., description="Загальна кількість місць у госпіталі")

class HospitalUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=6)
    email: Optional[EmailStr] = None
    password: Optional[str] = Field(None, min_length=6)
    address: Optional[str] = Field(None, min_length=6)
    coordinates: Optional[str] = None
    capacity_total: Optional[int] = None

class HospitalResponse(BaseModel):
    id: int
    name: str
    email: str
    address: str
    coordinates: str
    capacity_total: int
    created_at: datetime

    class Config:
        from_attributes = True

class EvacuationPointItem(BaseModel):
    id: int
    name: str
    type: str
    coordinates: str

    class Config:
        from_attributes = True

class DetailResponse(BaseModel):
    detail: str
