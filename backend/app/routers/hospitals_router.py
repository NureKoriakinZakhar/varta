from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from sqlalchemy import func, and_
from app.db.database import get_db
from app.db import models
from app.schemas import hospitals_schemas
from app.core.security import role_required

router = APIRouter(prefix="/hospitals", tags=["Hospitals"])

@router.post("/accept_patient", response_model=hospitals_schemas.DetailResponse, status_code=status.HTTP_200_OK)
def accept_patient(request: hospitals_schemas.PatientActionRequest, db: Session = Depends(get_db), current_user: dict = Depends(role_required(["hospital"]))):
    hospital_id = current_user["user_id"]

    # Перевірка існування військовослужбовця
    soldier = db.query(models.Soldier).filter_by(id=request.soldier_id).first()
    if not soldier:
        raise HTTPException(status_code=404, detail="Військовослужбовця не знайдено")

    # Перевірка чи вже знаходиться у госпіталі
    if soldier.hospital_id == hospital_id:
        raise HTTPException(status_code=400, detail="Цей військовослужбовець вже перебуває у вашому госпіталі")

    # Якщо прикріплений до будь-якого іншого госпіталю — не приймаємо
    if soldier.hospital_id is not None:
        raise HTTPException(status_code=400, detail="Цей військовослужбовець вже перебуває у іншому госпіталі")

    # Прийом до госпіталю
    soldier.hospital_id = hospital_id
    db.commit()

    return hospitals_schemas.DetailResponse(detail="Пацієнта прийнято до госпіталю")

@router.post("/discharge_patient", response_model=hospitals_schemas.DetailResponse, status_code=status.HTTP_200_OK)
def discharge_patient(request: hospitals_schemas.PatientActionRequest, db: Session = Depends(get_db), current_user: dict = Depends(role_required(["hospital"]))):
    hospital_id = current_user["user_id"]

    # Перевірка чи пацієнт дійсно у цьому госпіталі
    soldier = db.query(models.Soldier).filter_by(id=request.soldier_id, hospital_id=hospital_id).first()
    if not soldier:
        raise HTTPException(status_code=404, detail="Цей військовослужбовець не перебуває у вашому госпіталі")

    # Виписка
    soldier.hospital_id = None
    db.commit()

    return hospitals_schemas.DetailResponse(detail="Пацієнта виписано з госпіталю")

@router.get("/all_patients", response_model=list[hospitals_schemas.PatientItem], status_code=status.HTTP_200_OK)
def get_all_patients(db: Session = Depends(get_db), current_user: dict = Depends(role_required(["hospital"]))):
    hospital_id = current_user["user_id"]

    patients_with_devices = (
        db.query(models.Soldier, models.IoTDevice)
        .join(models.IoTDevice, models.IoTDevice.soldier_id == models.Soldier.id)
        .filter(models.Soldier.hospital_id == hospital_id)
        .all()
    )

    if not patients_with_devices:
        return []

    device_ids = [device.id for _, device in patients_with_devices]

    subq = (
        db.query(
            models.IoTMetric.iot_device_id,
            func.max(models.IoTMetric.last_update).label("max_last_update"),
        )
        .filter(models.IoTMetric.iot_device_id.in_(device_ids))
        .group_by(models.IoTMetric.iot_device_id)
        .subquery()
    )

    latest_metrics = (
        db.query(models.IoTMetric)
        .join(
            subq,
            and_(
                models.IoTMetric.iot_device_id == subq.c.iot_device_id,
                models.IoTMetric.last_update == subq.c.max_last_update,
            ),
        )
        .all()
    )

    metric_by_device = {m.iot_device_id: m for m in latest_metrics}

    def compute_status(m: models.IoTMetric | None) -> str:
        if m is None: return "Немає даних"
        score = 0
        now = datetime.utcnow()
        if m.last_update < now - timedelta(minutes=30): score = max(score, 2)
        elif m.last_update < now - timedelta(minutes=10): score = max(score, 1)
        if m.battery_percent <= 10: score = max(score, 2)
        elif m.battery_percent <= 20: score = max(score, 1)
        try:
            t = float(m.temperature)
            if t < 34.0 or t >= 39.5: score = max(score, 2)
            elif t < 35.0 or t >= 38.5: score = max(score, 1)
        except: pass
        hr = m.heart_rate
        if hr:
            if hr < 40 or hr > 130: score = max(score, 2)
            elif hr < 50 or hr > 110: score = max(score, 1)
        return ["Good", "Warning", "Critical"][score]

    patients_out = []
    for soldier, device in patients_with_devices:
        metric = metric_by_device.get(device.id)
        birth_date = f"{soldier.birth_day:02d}.{soldier.birth_month:02d}.{soldier.birth_year}"

        patients_out.append(
            hospitals_schemas.PatientItem(
                soldier_id=soldier.id,
                full_name=f"{soldier.last_name} {soldier.first_name}" + (f" {soldier.middle_name}" if soldier.middle_name else ""),
                birth_date=birth_date,
                rank=soldier.rank,
                status=compute_status(metric),
                iot_serial=device.device_serial,
                metrics=(
                    hospitals_schemas.PatientMetrics(
                        battery_percent=metric.battery_percent,
                        temperature=float(metric.temperature),
                        heart_rate=metric.heart_rate,
                        last_update=metric.last_update,
                    )
                    if metric else None
                )
            )
        )

    return patients_out

@router.post("/add_diagnosis", response_model=hospitals_schemas.DetailResponse, status_code=status.HTTP_201_CREATED)
def add_diagnosis(request: hospitals_schemas.AddDiagnosisRequest, db: Session = Depends(get_db), current_user: dict = Depends(role_required(["hospital"]))):
    hospital_id = current_user["user_id"]

    # Перевірка чи пацієнт належить цьому госпіталю
    soldier = db.query(models.Soldier).filter_by(id=request.soldier_id, hospital_id=hospital_id).first()
    if not soldier:
        raise HTTPException(status_code=404, detail="Цей військовослужбовець не перебуває у вашому госпіталі")

    # Перевірка тяжкості
    allowed_severities = ["Легке", "Середнє", "Важке", "Критичне"]
    if request.severity not in allowed_severities:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Неправильне значення тяжкості. Дозволені: {', '.join(allowed_severities)}"
        )

    # Створення нового запису діагнозу
    new_diag = models.Diagnosis(
        soldier_id=soldier.id,
        hospital_id=hospital_id,
        diagnosis_text=request.diagnosis_text,
        severity=request.severity,
        date_diagnosed=datetime.utcnow(),
    )
    db.add(new_diag)
    db.commit()

    return hospitals_schemas.DetailResponse(detail="Діагноз додано успішно")

@router.get("/diagnoses/{soldier_id}", response_model=list[hospitals_schemas.DiagnosisItem], status_code=status.HTTP_200_OK)
def get_diagnoses(soldier_id: int, db: Session = Depends(get_db), current_user: dict = Depends(role_required(["hospital"]))):
    hospital_id = current_user["user_id"]

    # Перевірка чи пацієнт належить цьому госпіталю
    soldier = db.query(models.Soldier).filter_by(id=soldier_id, hospital_id=hospital_id).first()
    if not soldier:
        raise HTTPException(status_code=404, detail="Цей військовослужбовець не перебуває у вашому госпіталі")

    # Отримання всіх діагнозів пацієнта
    diagnoses = (
        db.query(models.Diagnosis)
        .filter_by(soldier_id=soldier.id)
        .order_by(models.Diagnosis.date_diagnosed.desc())
        .all()
    )

    # Повертаємо список об'єктів напряму
    return [
        hospitals_schemas.DiagnosisItem(
            id=d.id,
            diagnosis_text=d.diagnosis_text,
            severity=d.severity,
            date_diagnosed=d.date_diagnosed,
        )
        for d in diagnoses
    ]

@router.delete("/diagnosis/{diagnosis_id}", response_model=hospitals_schemas.DetailResponse, status_code=status.HTTP_200_OK)
def delete_diagnosis(diagnosis_id: int, db: Session = Depends(get_db), current_user: dict = Depends(role_required(["hospital"]))):
    hospital_id = current_user["user_id"]

    diagnosis = db.query(models.Diagnosis).filter_by(id=diagnosis_id, hospital_id=hospital_id).first()
    if not diagnosis:
        raise HTTPException(status_code=404, detail="Діагноз не знайдено")

    db.delete(diagnosis)
    db.commit()

    return hospitals_schemas.DetailResponse(detail="Діагноз видалено успішно")
