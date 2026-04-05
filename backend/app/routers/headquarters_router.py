from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session
from datetime import datetime
import bcrypt
from app.db import models
from app.db.database import get_db
from app.schemas import headquarters_schemas, army_units_schemas
from app.core.security import role_required
from app.services import army_unit_data

router = APIRouter(prefix="/headquarters", tags=["Headquarters"])


def _percent(part: int, total: int) -> float:
    if total <= 0:
        return 0.0
    return round(100.0 * part / total, 2)


@router.get("/forces/overview", response_model=headquarters_schemas.ForcesOverviewResponse, status_code=status.HTTP_200_OK)
def forces_overview(db: Session = Depends(get_db), current_user: dict = Depends(role_required(["headquarters"]))):
    hq_id = current_user["user_id"]
    unit_ids = [row[0] for row in db.query(models.ArmyUnit.id).filter_by(headquarters_id=hq_id).all()]
    army_units_count = len(unit_ids)
    hospitals_count = db.query(func.count(models.Hospital.id)).filter_by(headquarters_id=hq_id).scalar() or 0
    if not unit_ids:
        return headquarters_schemas.ForcesOverviewResponse(
            total_soldiers=0,
            soldiers_in_hospital=0,
            soldiers_not_in_hospital=0,
            soldiers_in_hospital_percent=0.0,
            soldiers_not_in_hospital_percent=0.0,
            army_units_count=0,
            hospitals_count=hospitals_count,
        )
    total = db.query(func.count(models.Soldier.id)).filter(models.Soldier.army_unit_id.in_(unit_ids)).scalar() or 0
    in_hospital = (
        db.query(func.count(models.Soldier.id))
        .filter(models.Soldier.army_unit_id.in_(unit_ids), models.Soldier.hospital_id.isnot(None))
        .scalar()
        or 0
    )
    not_in_hospital = total - in_hospital
    return headquarters_schemas.ForcesOverviewResponse(
        total_soldiers=total,
        soldiers_in_hospital=in_hospital,
        soldiers_not_in_hospital=not_in_hospital,
        soldiers_in_hospital_percent=_percent(in_hospital, total),
        soldiers_not_in_hospital_percent=_percent(not_in_hospital, total),
        army_units_count=army_units_count,
        hospitals_count=hospitals_count,
    )


@router.get("/army_units/{unit_id}/summary", response_model=headquarters_schemas.ArmyUnitSummaryResponse, status_code=status.HTTP_200_OK)
def army_unit_summary(
    unit_id: int, db: Session = Depends(get_db), current_user: dict = Depends(role_required(["headquarters"]))
):
    unit = db.query(models.ArmyUnit).filter_by(id=unit_id, headquarters_id=current_user["user_id"]).first()
    if not unit:
        raise HTTPException(status_code=404, detail="Підрозділ не знайдено")
    total = db.query(func.count(models.Soldier.id)).filter_by(army_unit_id=unit_id).scalar() or 0
    in_hospital = (
        db.query(func.count(models.Soldier.id))
        .filter_by(army_unit_id=unit_id)
        .filter(models.Soldier.hospital_id.isnot(None))
        .scalar()
        or 0
    )
    not_in_hospital = total - in_hospital
    return headquarters_schemas.ArmyUnitSummaryResponse(
        army_unit_id=unit.id,
        army_unit_name=unit.name,
        total_soldiers=total,
        soldiers_in_hospital=in_hospital,
        soldiers_not_in_hospital=not_in_hospital,
        soldiers_in_hospital_percent=_percent(in_hospital, total),
        soldiers_not_in_hospital_percent=_percent(not_in_hospital, total),
    )


@router.get(
    "/army_units/{unit_id}/soldiers",
    response_model=list[army_units_schemas.SoldierItem],
    status_code=status.HTTP_200_OK,
)
def army_unit_soldiers_for_hq(
    unit_id: int, db: Session = Depends(get_db), current_user: dict = Depends(role_required(["headquarters"]))
):
    unit = db.query(models.ArmyUnit).filter_by(id=unit_id, headquarters_id=current_user["user_id"]).first()
    if not unit:
        raise HTTPException(status_code=404, detail="Підрозділ не знайдено")
    return army_unit_data.list_soldier_items_for_unit(db, unit_id)


@router.get(
    "/army_units/{unit_id}/evacuation_points",
    response_model=list[army_units_schemas.EvacuationPoint],
    status_code=status.HTTP_200_OK,
)
def army_unit_evacuation_points_for_hq(
    unit_id: int, db: Session = Depends(get_db), current_user: dict = Depends(role_required(["headquarters"]))
):
    unit = db.query(models.ArmyUnit).filter_by(id=unit_id, headquarters_id=current_user["user_id"]).first()
    if not unit:
        raise HTTPException(status_code=404, detail="Підрозділ не знайдено")
    return army_unit_data.list_evacuation_points_for_unit(db, unit_id)


@router.get("/army_units", response_model=list[headquarters_schemas.ArmyUnitResponse])
def get_all_army_units(db: Session = Depends(get_db), current_user: dict = Depends(role_required(["headquarters"]))):
    return db.query(models.ArmyUnit).all()

@router.post("/army_units", response_model=headquarters_schemas.DetailResponse, status_code=status.HTTP_201_CREATED)
def create_army_unit(request: headquarters_schemas.ArmyUnitCreate, db: Session = Depends(get_db), current_user: dict = Depends(role_required(["headquarters"]))):

    # Перевірка унікальності email
    if db.query(models.ArmyUnit).filter_by(email=request.email).first():
        raise HTTPException(status_code=400, detail="Email вже використовується")

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

    # Хешування пароля
    hashed_pw = bcrypt.hashpw(request.password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

    new_unit = models.ArmyUnit(
        headquarters_id=current_user["user_id"],
        name=request.name,
        email=request.email,
        password=hashed_pw,
        coordinates=request.coordinates,
        created_at=datetime.utcnow()
    )
    db.add(new_unit)
    db.commit()

    return headquarters_schemas.DetailResponse(detail="Підрозділ успішно створено")

@router.patch("/army_units/{unit_id}", response_model=headquarters_schemas.DetailResponse)
def patch_army_unit(unit_id: int, request: headquarters_schemas.ArmyUnitUpdate, db: Session = Depends(get_db), current_user: dict = Depends(role_required(["headquarters"]))):

    unit = db.query(models.ArmyUnit).filter_by(id=unit_id, headquarters_id=current_user["user_id"]).first()
    if not unit:
        raise HTTPException(status_code=404, detail="Підрозділ не знайдено")

    update_data = request.dict(exclude_unset=True)


    if "email" in update_data and update_data["email"] != unit.email:
        if db.query(models.ArmyUnit).filter_by(email=update_data["email"]).first():
            raise HTTPException(status_code=400, detail="Email вже використовується")

    if "coordinates" in update_data and update_data["coordinates"]:
        try:
            lat_str, lon_str = [x.strip() for x in update_data["coordinates"].split(",")]
            lat = float(lat_str)
            lon = float(lon_str)
            if not (-90 <= lat <= 90 and -180 <= lon <= 180):
                raise ValueError
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Некоректний формат координат. Формат: 'широта, довгота'",
            )

    if "password" in update_data:
        hashed_password = bcrypt.hashpw(update_data["password"].encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
        unit.password = hashed_password
        del update_data["password"]

    for field, value in update_data.items():
        setattr(unit, field, value)

    db.commit()
    return headquarters_schemas.DetailResponse(detail="Підрозділ оновлено")

@router.delete("/army_units/{unit_id}", response_model=headquarters_schemas.DetailResponse)
def delete_army_unit(unit_id: int, db: Session = Depends(get_db), current_user: dict = Depends(role_required(["headquarters"]))):

    unit = db.query(models.ArmyUnit).filter_by(id=unit_id, headquarters_id=current_user["user_id"]).first()
    if not unit:
        raise HTTPException(status_code=404, detail="Підрозділ не знайдено")

    # Перевірка, чи є солдати у цьому підрозділі
    has_soldiers = db.query(models.Soldier).filter_by(army_unit_id=unit_id).first()
    if has_soldiers:
        raise HTTPException(status_code=400, detail="Неможливо видалити підрозділ — до нього прикріплені військовослужбовці")

    db.delete(unit)
    db.commit()
    return headquarters_schemas.DetailResponse(detail="Підрозділ видалено")

@router.get("/hospitals", response_model=list[headquarters_schemas.HospitalResponse])
def get_all_hospitals(db: Session = Depends(get_db), current_user: dict = Depends(role_required(["headquarters"]))):
    return db.query(models.Hospital).all()

@router.post("/hospitals", response_model=headquarters_schemas.DetailResponse, status_code=status.HTTP_201_CREATED)
def create_hospital(request: headquarters_schemas.HospitalCreate, db: Session = Depends(get_db), current_user: dict = Depends(role_required(["headquarters"]))):

    # Перевірка унікальності email
    if db.query(models.Hospital).filter_by(email=request.email).first():
        raise HTTPException(status_code=400, detail="Email вже використовується")

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

    # Перевірка кількості місць
    if request.capacity_total < 10:
        raise HTTPException(status_code=400, detail="Мінімальна кількість місць у госпіталі — 10")

    # Хешування пароля
    hashed_pw = bcrypt.hashpw(request.password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

    new_hospital = models.Hospital(
        headquarters_id=current_user["user_id"],
        name=request.name,
        email=request.email,
        password=hashed_pw,
        address=request.address,
        coordinates=request.coordinates,
        capacity_total=request.capacity_total,
        created_at=datetime.utcnow()
    )
    db.add(new_hospital)
    db.commit()
    return headquarters_schemas.DetailResponse(detail="Госпіталь успішно створено")

@router.patch("/hospitals/{hospital_id}", response_model=headquarters_schemas.DetailResponse)
def patch_hospital(hospital_id: int, request: headquarters_schemas.HospitalUpdate, db: Session = Depends(get_db), current_user: dict = Depends(role_required(["headquarters"]))):
    hospital = db.query(models.Hospital).filter_by(id=hospital_id, headquarters_id=current_user["user_id"]).first()
    if not hospital:
        raise HTTPException(status_code=404, detail="Госпіталь не знайдено")

    update_data = request.dict(exclude_unset=True)

    if "email" in update_data and update_data["email"] != hospital.email:
        if db.query(models.Hospital).filter_by(email=update_data["email"]).first():
            raise HTTPException(status_code=400, detail="Email вже використовується")

    if "coordinates" in update_data and update_data["coordinates"]:
        try:
            lat_str, lon_str = [x.strip() for x in update_data["coordinates"].split(",")]
            lat = float(lat_str)
            lon = float(lon_str)
            if not (-90 <= lat <= 90 and -180 <= lon <= 180):
                raise ValueError
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Некоректний формат координат. Формат: 'широта, довгота'",
            )

    if "capacity_total" in update_data:
        if update_data["capacity_total"] < 10:
            raise HTTPException(status_code=400, detail="Мінімальна кількість місць у госпіталі — 10")

    if "password" in update_data:
        hashed_password = bcrypt.hashpw(update_data["password"].encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
        hospital.password = hashed_password
        del update_data["password"]

    for field, value in update_data.items():
        setattr(hospital, field, value)

    db.commit()
    return headquarters_schemas.DetailResponse(detail="Дані госпіталю оновлено")

@router.delete("/hospitals/{hospital_id}", response_model=headquarters_schemas.DetailResponse)
def delete_hospital(hospital_id: int, db: Session = Depends(get_db), current_user: dict = Depends(role_required(["headquarters"]))):

    hospital = db.query(models.Hospital).filter_by(id=hospital_id, headquarters_id=current_user["user_id"]).first()
    if not hospital:
        raise HTTPException(status_code=404, detail="Госпіталь не знайдено")

    # Перевірка, чи є пацієнти у цьому госпіталі
    has_soldiers = db.query(models.Soldier).filter_by(hospital_id=hospital_id).first()
    if has_soldiers:
        raise HTTPException(status_code=400, detail="Неможливо видалити госпіталь — у ньому є пацієнти")

    db.delete(hospital)
    db.commit()
    return headquarters_schemas.DetailResponse(detail="Госпіталь видалено")

@router.get("/infrastructure")
def get_infrastructure(db: Session = Depends(get_db),current_user: dict = Depends(role_required(["headquarters"]))):

    data = []

    # Штаби
    for hq in db.query(models.Headquarters).all():
        data.append({
            "id": hq.id,
            "name": hq.name,
            "type": "Штаб",
            "coordinates": hq.coordinates
        })

    # Підрозділи
    for unit in db.query(models.ArmyUnit).all():
        data.append({
            "id": unit.id,
            "name": unit.name,
            "type": "Підрозділ",
            "coordinates": unit.coordinates
        })

    # Госпіталі
    for hospital in db.query(models.Hospital).all():
        data.append({
            "id": hospital.id,
            "name": hospital.name,
            "type": "Госпіталь",
            "coordinates": hospital.coordinates
        })

    # Точки евакуації
    for p in db.query(models.EvacuationPoint).all():
        data.append({
            "id": p.id,
            "name": p.name,
            "type": "Точка евакуації",
            "coordinates": p.coordinates
        })

    return data
