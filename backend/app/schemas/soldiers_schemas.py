from pydantic import BaseModel, Field

class IoTMetricRequest(BaseModel):
    device_serial: str
    battery_percent: int
    temperature: float
    heart_rate: int
    gps_location: str

class IoTMetricResponse(BaseModel):
    detail: str
