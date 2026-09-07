from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import HealthReport

router = APIRouter(prefix="/api/cases", tags=["cases"])

@router.get("")
def get_cases(db: Session = Depends(get_db)):
    return db.query(HealthReport).all()

@router.patch("/{case_id}")
def update_case_status(case_id: int, status: str, db: Session = Depends(get_db)):
    report = db.query(HealthReport).filter(HealthReport.id == case_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Case not found")
    # For now just returns the case
    return report
