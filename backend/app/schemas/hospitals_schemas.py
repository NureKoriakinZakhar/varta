from pydantic import BaseModel, Field
from typing import List, Optional, Literal
from datetime import datetime

class PatientActionRequest(BaseModel):
    soldier_id: int

class PatientMetrics(BaseModel):
    battery_percent: int
    temperature: float
    heart_rate: int
    last_update: datetime

class PatientItem(BaseModel):
    soldier_id: int
    full_name: str
    birth_date: str
    rank: str
    status: str = Field(description="Good | Warning | Critical | Немає даних")
    iot_serial: str
    metrics: Optional[PatientMetrics] = None

class AddDiagnosisRequest(BaseModel):
    soldier_id: int
    diagnosis_text: str
    severity: str

class DiagnosisItem(BaseModel):
    id: int
    diagnosis_text: str
    severity: str
    date_diagnosed: datetime

class DetailResponse(BaseModel):
    detail: str
