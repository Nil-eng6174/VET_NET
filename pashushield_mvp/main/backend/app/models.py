from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from geoalchemy2 import Geometry
from .database import Base
import datetime

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    role = Column(String)  # Farmer, Veterinarian, Lab, CommandCenter
    name = Column(String)
    aadhaar = Column(String, unique=True, index=True)
    mobile = Column(String)
    locality = Column(String)
    email = Column(String, nullable=True)

class HealthReport(Base):
    __tablename__ = "health_reports"
    id = Column(Integer, primary_key=True, index=True)
    farmer_id = Column(Integer, ForeignKey("users.id"))
    animal_type = Column(String)
    num_animals = Column(Integer, default=1)
    num_mortality = Column(Integer, default=0)
    main_symptom = Column(String)
    additional_symptoms = Column(String, nullable=True)
    duration = Column(String)
    notes = Column(Text, nullable=True)
    image_url = Column(String, nullable=True)
    
    # AI Risk fields
    risk_score = Column(Float, default=0.0)
    risk_level = Column(String)
    recommendation = Column(Text, nullable=True)
    suspected_category = Column(String, nullable=True)
    
    # Location
    location = Column(Geometry('POINT'), nullable=True)
    lat = Column(Float, nullable=True)
    lng = Column(Float, nullable=True)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    farmer = relationship("User")

class Sample(Base):
    __tablename__ = "lab_samples"
    id = Column(Integer, primary_key=True, index=True)
    report_id = Column(Integer, ForeignKey("health_reports.id"))
    sample_uid = Column(String, unique=True, index=True)  # e.g., SMP-00192
    status = Column(String, default="In Transit") # In Transit, Received, Result Pending, Resulted
    result = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    report = relationship("HealthReport")
