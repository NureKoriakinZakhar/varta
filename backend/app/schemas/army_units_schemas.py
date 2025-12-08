from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class AddSoldierRequest(BaseModel):
    first_name: str
    last_name: str
    middle_name: str
    birth_year: int
    birth_month: int
    birth_day: int
    rank: str
    iot_serial: str

class AddEvacuationPointRequest(BaseModel):
    name: str
    coordinates: str
    description: str

class DeleteEvacuationPointRequest(BaseModel):
    evacuation_point_id: int

class DeleteSoldierRequest(BaseModel):
    soldier_id: int

class EvacuationPoint(BaseModel):
    id: int
    name: str
    coordinates: str  # формат: "lat, lon"

class SoldierMetrics(BaseModel):
    battery_percent: int
    temperature: float
    heart_rate: int
    last_update: datetime

class SoldierItem(BaseModel):
    soldier_id: int
    full_name: str
    birth_date: str
    rank: str
    iot_serial: str
    status: str = Field(description="Good | Warning | Critical | Немає даних | На лікуванні")
    coordinates: Optional[str] = None
    metrics: Optional[SoldierMetrics] = None
    hospital_id: Optional[int] = None

class AllPointsResponse(BaseModel):
    points: List[EvacuationPoint]

class AllSoldiersResponse(BaseModel):
    soldiers: List[SoldierItem]

class DetailResponse(BaseModel):
    detail: str