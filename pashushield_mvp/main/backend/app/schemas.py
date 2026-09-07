from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class UserBase(BaseModel):
    role: str
    name: str
    aadhaar: str
    mobile: str
    locality: str
    email: Optional[str] = None

class UserCreate(UserBase):
    pass

class UserResponse(UserBase):
    id: int
    class Config:
        from_attributes = True

class ReportCreate(BaseModel):
    farmer_id: int
    animal_type: str
    num_animals: int = 1
    num_mortality: int = 0
    main_symptom: str
    additional_symptoms: Optional[str] = None
    duration: str
    notes: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None

class ReportResponse(ReportCreate):
    id: int
    risk_score: float
    risk_level: str
    recommendation: Optional[str] = None
    suspected_category: Optional[str] = None
    created_at: datetime
    class Config:
        from_attributes = True

class SampleUpdate(BaseModel):
    status: str
    result: Optional[str] = None
