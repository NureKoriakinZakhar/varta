from datetime import datetime, timedelta

from sqlalchemy import and_, func
from sqlalchemy.orm import Session

from app.db import models
from app.schemas import army_units_schemas


def list_evacuation_points_for_unit(db: Session, army_unit_id: int) -> list[army_units_schemas.EvacuationPoint]:
    points = db.query(models.EvacuationPoint).filter_by(army_unit_id=army_unit_id).all()
    return [
        army_units_schemas.EvacuationPoint(
            id=p.id,
            name=p.name,
            coordinates=p.coordinates,
            description=p.description,
        )
        for p in points
    ]


def list_soldier_items_for_unit(db: Session, army_unit_id: int) -> list[army_units_schemas.SoldierItem]:
    soldiers_with_devices = (
        db.query(models.Soldier, models.IoTDevice)
        .join(models.IoTDevice, models.IoTDevice.soldier_id == models.Soldier.id)
        .filter(models.Soldier.army_unit_id == army_unit_id)
        .all()
    )

    if not soldiers_with_devices:
        return []

    soldiers_out: list[army_units_schemas.SoldierItem] = []
    soldiers_needing_metrics: list[tuple[models.Soldier, models.IoTDevice]] = []

    for soldier, device in soldiers_with_devices:
        birth_date = f"{soldier.birth_day:02d}.{soldier.birth_month:02d}.{soldier.birth_year}"
        full_name = f"{soldier.last_name} {soldier.first_name}" + (
            f" {soldier.middle_name}" if soldier.middle_name else ""
        )

        if soldier.hospital_id is not None:
            soldiers_out.append(
                army_units_schemas.SoldierItem(
                    soldier_id=soldier.id,
                    full_name=full_name,
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

    if not soldiers_needing_metrics:
        return soldiers_out

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
                    full_name=f"{soldier.last_name} {soldier.first_name}"
                    + (f" {soldier.middle_name}" if soldier.middle_name else ""),
                    rank=soldier.rank,
                    birth_date=birth_date,
                    coordinates=None,
                    status="Немає даних",
                    iot_serial=device.device_serial,
                    metrics=None,
                )
            )
        return soldiers_out

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
            temp = float(m.temperature)
            if temp < 34.0 or temp >= 39.5:
                score = max(score, 2)
            elif temp < 35.0 or temp >= 38.5:
                score = max(score, 1)
        except Exception:
            pass
        hr = m.heart_rate
        if hr:
            if hr < 40 or hr > 130:
                score = max(score, 2)
            elif hr < 50 or hr > 110:
                score = max(score, 1)
        return ["Good", "Warning", "Critical"][score]

    for soldier, device in soldiers_needing_metrics:
        metric = metric_by_device.get(device.id)
        birth_date = f"{soldier.birth_day:02d}.{soldier.birth_month:02d}.{soldier.birth_year}"

        soldiers_out.append(
            army_units_schemas.SoldierItem(
                soldier_id=soldier.id,
                full_name=f"{soldier.last_name} {soldier.first_name}"
                + (f" {soldier.middle_name}" if soldier.middle_name else ""),
                birth_date=birth_date,
                rank=soldier.rank,
                coordinates=metric.gps_location if metric else None,
                status=compute_status(metric),
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

    return soldiers_out
