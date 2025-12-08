from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, date
from sqlalchemy import func, and_
from datetime import datetime, timedelta
from app.db.database import get_db
from app.db import models
from app.schemas import army_units_schemas
from app.core.security import role_required

router = APIRouter(prefix="/army_units", tags=["Army Units"])

@router.post("/add_soldier", response_model=army_units_schemas.DetailResponse, status_code=status.HTTP_201_CREATED)
def add_soldier(request: army_units_schemas.AddSoldierRequest, db: Session = Depends(get_db), current_user: dict = Depends(role_required(["army_unit"]))):
    army_unit_id = current_user["user_id"]

    # Перевірка існування підрозділу
    army_unit = db.query(models.ArmyUnit).filter_by(id=army_unit_id).first()
    if not army_unit:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Підрозділу з таким ID не існує")

    # Перевірка валідності дати народження
    try:
        birth_date = date(request.birth_year, request.birth_month, request.birth_day)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Некоректна дата народження")

    today = date.today()
    if birth_date > today:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Дата народження не може бути в майбутньому")

    age = today.year - birth_date.year - ((today.month, today.day) < (birth_date.month, birth_date.day))
    if age < 18:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Військовослужбовець повинен бути старше 18 років")
    if age > 59:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Військовослужбовець повинен бути молодше 59 років")

    # Перевірка IoT пристрою
    existing_device = db.query(models.IoTDevice).filter_by(device_serial=request.iot_serial).first()
    if existing_device:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Цей IoT-пристрій вже закріплено за іншим військовослужбовцем")

    # Створення військовослужбовця
    new_soldier = models.Soldier(
        first_name=request.first_name,
        last_name=request.last_name,
        middle_name=request.middle_name,
        birth_year=request.birth_year,
        birth_month=request.birth_month,
        birth_day=request.birth_day,
        army_unit_id=army_unit_id,
        hospital_id=None,
        rank=request.rank,
        created_at=datetime.utcnow(),
    )
    db.add(new_soldier)
    db.commit()
    db.refresh(new_soldier)

    # Створення IoT пристрою
    new_device = models.IoTDevice(
        soldier_id=new_soldier.id,
        device_serial=request.iot_serial,
        created_at=datetime.utcnow(),
    )
    db.add(new_device)
    db.commit()

    return army_units_schemas.DetailResponse(detail="Військовослужбовця та IoT-пристрій створено успішно")

@router.delete("/delete_soldier", response_model=army_units_schemas.DetailResponse, status_code=status.HTTP_200_OK)
def delete_soldier(request: army_units_schemas.DeleteSoldierRequest, db: Session = Depends(get_db), current_user: dict = Depends(role_required(["army_unit"]))):
    army_unit_id = current_user["user_id"]

    # Пошук військовослужбовця, який належить цьому підрозділу
    soldier = db.query(models.Soldier).filter_by(id=request.soldier_id, army_unit_id=army_unit_id).first()
    if not soldier:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Військовослужбовця не знайдено або він не належить вашому підрозділу",
        )

    # Видаляємо його IoT-пристрій
    device = db.query(models.IoTDevice).filter_by(soldier_id=soldier.id).first()
    if device:
        db.query(models.IoTMetric).filter_by(iot_device_id=device.id).delete(synchronize_session=False)
        db.delete(device)

    # Видаляємо військовослужбовця
    db.delete(soldier)
    db.commit()

    return army_units_schemas.DetailResponse(detail=f"Військовослужбовця з ID {request.soldier_id} видалено")

@router.post("/add_evacuation_point", response_model=army_units_schemas.DetailResponse, status_code=status.HTTP_201_CREATED)
def create_evacuation_point(request: army_units_schemas.AddEvacuationPointRequest, db: Session = Depends(get_db), current_user: dict = Depends(role_required(["army_unit"]))):
    army_unit_id = current_user["user_id"]

    # Перевірка існування підрозділу
    army_unit = db.query(models.ArmyUnit).filter_by(id=army_unit_id).first()
    if not army_unit:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Підрозділ не знайдено")

    # Перевірка валідності координат
    try:
        lat_str, lon_str = [x.strip() for x in request.coordinates.split(",")]
        lat = float(lat_str)
        lon = float(lon_str)
        if not (-90 <= lat <= 90 and -180 <= lon <= 180):
            raise ValueError
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Некоректний формат координат. Використовуйте формат: 'широта, довгота', наприклад '49.9935, 36.2304'",
        )

    # Перевірка на унікальність назви точки
    existing_point = db.query(models.EvacuationPoint).filter_by(army_unit_id=army_unit_id, name=request.name).first()
    if existing_point:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Точка евакуації з такою назвою вже існує у підрозділі",
        )

    # Створення точки евакуації
    new_point = models.EvacuationPoint(
        army_unit_id=army_unit_id,
        name=request.name,
        coordinates=request.coordinates,
        description=request.description,
        created_at=datetime.utcnow(),
    )
    db.add(new_point)
    db.commit()

    return army_units_schemas.DetailResponse(detail="Точку евакуації створено успішно")

@router.delete("/delete_evacuation_point", response_model=army_units_schemas.DetailResponse, status_code=status.HTTP_200_OK)
def delete_evacuation_point(request: army_units_schemas.DeleteEvacuationPointRequest, db: Session = Depends(get_db), current_user: dict = Depends(role_required(["army_unit"])) ):
    army_unit_id = current_user["user_id"]

    # Пошук точки евакуації
    evacuation_point = db.query(models.EvacuationPoint).filter_by(id=request.evacuation_point_id, army_unit_id=army_unit_id).first()
    if not evacuation_point:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Точку евакуації не знайдено або вона не належить вашому підрозділу",
        )

    # Видалення точки евакуації
    db.delete(evacuation_point)
    db.commit()

    return army_units_schemas.DetailResponse(detail=f"Точку евакуації з ID {request.evacuation_point_id} видалено")

@router.get("/all_points", response_model=list[army_units_schemas.EvacuationPoint], status_code=status.HTTP_200_OK)
def get_all_points(db: Session = Depends(get_db), current_user: dict = Depends(role_required(["army_unit"]))):
    army_unit_id = current_user["user_id"]

    # Вивід точок евакуації
    points = db.query(models.EvacuationPoint).filter_by(army_unit_id=army_unit_id).all()
    return [
        army_units_schemas.EvacuationPoint(
            id=p.id,
            name=p.name,
            coordinates=p.coordinates
        )
        for p in points
    ]

@router.get( "/all_soldiers", response_model=army_units_schemas.AllSoldiersResponse, status_code=status.HTTP_200_OK)
def get_all_soldiers(db: Session = Depends(get_db), current_user: dict = Depends(role_required(["army_unit"]))):
    army_unit_id = current_user["user_id"]

    # Отримання військових разом з IoT-пристроями (як і було)
    soldiers_with_devices = (
        db.query(models.Soldier, models.IoTDevice)
        .join(models.IoTDevice, models.IoTDevice.soldier_id == models.Soldier.id)
        .filter(models.Soldier.army_unit_id == army_unit_id)
        .all()
    )

    if not soldiers_with_devices:
        return army_units_schemas.AllSoldiersResponse(soldiers=[])

    # Госпітальні випадки
    soldiers_out = []
    soldiers_needing_metrics = []

    for soldier, device in soldiers_with_devices:
        if soldier.hospital_id is not None:
            birth_date = f"{soldier.birth_day:02d}.{soldier.birth_month:02d}.{soldier.birth_year}"
            soldiers_out.append(
                army_units_schemas.SoldierItem(
                    soldier_id=soldier.id,
                    full_name=f"{soldier.last_name} {soldier.first_name}" + (
                        f" {soldier.middle_name}" if soldier.middle_name else ""),
                    birth_date=birth_date,
                    rank=soldier.rank,
                    iot_serial=device.device_serial,
                    status="На лікуванні",
                    coordinates=None,
                    metrics=None,
                    hospital_id=soldier.hospital_id,
                )
            )
        else:
            soldiers_needing_metrics.append((soldier, device))

    # Якщо всі у госпіталі
    if not soldiers_needing_metrics:
        return army_units_schemas.AllSoldiersResponse(soldiers=soldiers_out)

    device_ids = [dev.id for _, dev in soldiers_needing_metrics]

    has_metrics = (
        db.query(models.IoTMetric.id)
        .filter(models.IoTMetric.iot_device_id.in_(device_ids))
        .first()
        is not None
    )

    if not has_metrics:
        for soldier, device in soldiers_needing_metrics:
            birth_date = f"{soldier.birth_day:02d}.{soldier.birth_month:02d}.{soldier.birth_year}"
            soldiers_out.append(
                army_units_schemas.SoldierItem(
                    soldier_id=soldier.id,
                    full_name=f"{soldier.last_name} {soldier.first_name}" + (f" {soldier.middle_name}" if soldier.middle_name else ""),
                    rank=soldier.rank,
                    birth_date=birth_date,
                    coordinates=None,
                    status="Немає даних",
                    iot_serial=device.device_serial,
                    metrics=None,
                )
            )
        return army_units_schemas.AllSoldiersResponse(soldiers=soldiers_out)

    # Отримання останніх метрик
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

    # Функція для статусу
    def compute_status(m: models.IoTMetric | None) -> str:
        if m is None:
            return "Немає даних"

        score = 0
        now = datetime.utcnow()

        if m.last_update < now - timedelta(minutes=30):
            score = max(score, 2)
        elif m.last_update < now - timedelta(minutes=10):
            score = max(score, 1)

        if m.battery_percent <= 10:
            score = max(score, 2)
        elif m.battery_percent <= 20:
            score = max(score, 1)

        try:
            t = float(m.temperature)
            if t < 34.0 or t >= 39.5:
                score = max(score, 2)
            elif t < 35.0 or t >= 38.5:
                score = max(score, 1)
        except Exception:
            pass

        hr = m.heart_rate
        if hr is not None:
            if hr < 40 or hr > 130:
                score = max(score, 2)
            elif hr < 50 or hr > 110:
                score = max(score, 1)

        return ["Good", "Warning", "Critical"][score]

    # Додаємо решту солдатів з метриками
    for soldier, device in soldiers_needing_metrics:
        metric = metric_by_device.get(device.id)
        status = compute_status(metric)
        birth_date = f"{soldier.birth_day:02d}.{soldier.birth_month:02d}.{soldier.birth_year}"

        soldiers_out.append(
            army_units_schemas.SoldierItem(
                soldier_id=soldier.id,
                full_name=f"{soldier.last_name} {soldier.first_name}" + (f" {soldier.middle_name}" if soldier.middle_name else ""),
                birth_date=birth_date,
                rank=soldier.rank,
                coordinates=metric.gps_location if metric else None,
                status=status,
                iot_serial=device.device_serial,
                metrics=(
                    army_units_schemas.SoldierMetrics(
                        battery_percent=metric.battery_percent,
                        temperature=float(metric.temperature),
                        heart_rate=metric.heart_rate,
                        last_update=metric.last_update,
                    )
                    if metric
                    else None
                ),
            )
        )

    return army_units_schemas.AllSoldiersResponse(soldiers=soldiers_out)
