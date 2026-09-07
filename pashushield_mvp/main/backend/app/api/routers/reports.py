from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import HealthReport
from app.schemas import ReportCreate, ReportResponse
from app.services.triage import calculate_risk, get_recommendation
from geoalchemy2.elements import WKTElement

router = APIRouter(prefix="/api/reports", tags=["reports"])

@router.post("", response_model=ReportResponse)
def create_report(report: ReportCreate, db: Session = Depends(get_db)):
    # 1. Triaging
    score, risk_level, reasons, image_desc = calculate_risk(
        animal=report.animal_type,
        symptom=report.main_symptom,
        additional_symptoms=report.additional_symptoms,
        duration=report.duration,
        num_mortality=report.num_mortality,
        notes=report.notes
    )
    
    recommendation = get_recommendation(
        risk_level=risk_level, 
        symptom=report.main_symptom,
        additional_symptoms=report.additional_symptoms,
        notes=report.notes,
        image_description=image_desc
    )
    
    # 2. Map coordinates to geometry if provided
    location = None
    if report.lng is not None and report.lat is not None:
        # PostGIS expects 'POINT(lon lat)'
        location = WKTElement(f'POINT({report.lng} {report.lat})', srid=4326)

    # 3. Save to DB
    new_report = HealthReport(
        **report.dict(exclude={"lat", "lng"}),
        lat=report.lat,
        lng=report.lng,
        location=location,
        risk_score=score,
        risk_level=risk_level,
        recommendation=recommendation,
        suspected_category=", ".join(reasons) if reasons else "Unknown"
    )
    db.add(new_report)
    db.commit()
    db.refresh(new_report)
    return new_report

@router.get("", response_model=list[ReportResponse])
def get_reports(db: Session = Depends(get_db)):
    return db.query(HealthReport).order_by(HealthReport.created_at.desc()).all()
