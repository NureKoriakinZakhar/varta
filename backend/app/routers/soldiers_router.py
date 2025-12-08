from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
from app.db.database import get_db
from app.db import models
from app.schemas import soldiers_schemas

router = APIRouter(prefix="/soldiers", tags=["Soldiers"])

@router.post("/send_metrics", response_model=soldiers_schemas.IoTMetricResponse, status_code=status.HTTP_201_CREATED)
def send_metrics(request: soldiers_schemas.IoTMetricRequest, db: Session = Depends(get_db)):

    # Знайти пристрій за серійним номером
    device = db.query(models.IoTDevice).filter_by(device_serial=request.device_serial).first()
    if not device:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="IoT-пристрій не знайдено")

    # Зберегти показники
    new_metric = models.IoTMetric(
        iot_device_id=device.id,
        battery_percent=request.battery_percent,
        temperature=request.temperature,
        heart_rate=request.heart_rate,
        gps_location=request.gps_location,
        last_update=datetime.utcnow()
    )
    db.add(new_metric)
    db.commit()

    return soldiers_schemas.IoTMetricResponse(detail="Дані від IoT-пристрою успішно збережено")
