from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, TIMESTAMP, Text, Numeric
from sqlalchemy.orm import relationship
from app.db.database import Base


class Headquarters(Base):
    __tablename__ = "headquarters"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)
    region = Column(String, nullable=False)
    coordinates = Column(String, nullable=False)
    created_at = Column(TIMESTAMP, nullable=False)

    hospitals = relationship("Hospital", back_populates="headquarters", cascade="all, delete")
    army_units = relationship("ArmyUnit", back_populates="headquarters", cascade="all, delete")


class Hospital(Base):
    __tablename__ = "hospitals"

    id = Column(Integer, primary_key=True, index=True)
    headquarters_id = Column(Integer, ForeignKey("headquarters.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)
    address = Column(String, nullable=False)
    coordinates = Column(String, nullable=False)
    capacity_total = Column(Integer, nullable=False)
    created_at = Column(TIMESTAMP, nullable=False)

    headquarters = relationship("Headquarters", back_populates="hospitals")
    soldiers = relationship("Soldier", back_populates="hospital", cascade="all, delete")
    diagnoses = relationship("Diagnosis", back_populates="hospital", cascade="all, delete")


class ArmyUnit(Base):
    __tablename__ = "army_units"

    id = Column(Integer, primary_key=True, index=True)
    headquarters_id = Column(Integer, ForeignKey("headquarters.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)
    coordinates = Column(String, nullable=False)
    created_at = Column(TIMESTAMP, nullable=False)

    headquarters = relationship("Headquarters", back_populates="army_units")
    soldiers = relationship("Soldier", back_populates="army_unit", cascade="all, delete")
    evacuation_points = relationship("EvacuationPoint", back_populates="army_unit", cascade="all, delete")


class Soldier(Base):
    __tablename__ = "soldiers"

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    middle_name = Column(String)
    birth_year = Column(Integer, nullable=False)
    birth_month = Column(Integer, nullable=False)
    birth_day = Column(Integer, nullable=False)
    army_unit_id = Column(Integer, ForeignKey("army_units.id", ondelete="CASCADE"))
    hospital_id = Column(Integer, ForeignKey("hospitals.id", ondelete="CASCADE"))
    rank = Column(String, nullable=False)
    created_at = Column(TIMESTAMP, nullable=False)

    army_unit = relationship("ArmyUnit", back_populates="soldiers")
    hospital = relationship("Hospital", back_populates="soldiers")
    iot_device = relationship("IoTDevice", back_populates="soldier", uselist=False, cascade="all, delete")
    diagnoses = relationship("Diagnosis", back_populates="soldier", cascade="all, delete")


class IoTDevice(Base):
    __tablename__ = "iot_devices"

    id = Column(Integer, primary_key=True, index=True)
    soldier_id = Column(Integer, ForeignKey("soldiers.id", ondelete="CASCADE"), unique=True, nullable=False)
    device_serial = Column(String, unique=True, nullable=False)
    created_at = Column(TIMESTAMP, nullable=False)

    soldier = relationship("Soldier", back_populates="iot_device")
    metrics = relationship("IoTMetric", back_populates="device", cascade="all, delete")


class IoTMetric(Base):
    __tablename__ = "iot_metrics"

    id = Column(Integer, primary_key=True, index=True)
    iot_device_id = Column(Integer, ForeignKey("iot_devices.id", ondelete="CASCADE"), nullable=False)
    battery_percent = Column(Integer, nullable=False)
    temperature = Column(Numeric, nullable=False)
    heart_rate = Column(Integer, nullable=False)
    gps_location = Column(String, nullable=False)
    last_update = Column(TIMESTAMP, nullable=False)

    device = relationship("IoTDevice", back_populates="metrics")


class Diagnosis(Base):
    __tablename__ = "diagnoses"

    id = Column(Integer, primary_key=True, index=True)
    soldier_id = Column(Integer, ForeignKey("soldiers.id", ondelete="CASCADE"), nullable=False)
    hospital_id = Column(Integer, ForeignKey("hospitals.id", ondelete="CASCADE"), nullable=False)
    diagnosis_text = Column(Text, nullable=False)
    date_diagnosed = Column(TIMESTAMP, nullable=False)
    severity = Column(String, nullable=False)

    soldier = relationship("Soldier", back_populates="diagnoses")
    hospital = relationship("Hospital", back_populates="diagnoses")


class EvacuationPoint(Base):
    __tablename__ = "evacuation_points"

    id = Column(Integer, primary_key=True, index=True)
    army_unit_id = Column(Integer, ForeignKey("army_units.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=False)
    coordinates = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    created_at = Column(TIMESTAMP, nullable=False)

    army_unit = relationship("ArmyUnit", back_populates="evacuation_points")
