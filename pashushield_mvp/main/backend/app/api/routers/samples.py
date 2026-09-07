from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Sample
from app.schemas import SampleUpdate
import uuid

router = APIRouter(prefix="/api/samples", tags=["samples"])

@router.post("")
def create_sample(report_id: int, db: Session = Depends(get_db)):
    uid = f"SMP-{str(uuid.uuid4())[:6].upper()}"
    sample = Sample(report_id=report_id, sample_uid=uid)
    db.add(sample)
    db.commit()
    db.refresh(sample)
    return sample

@router.get("")
def get_samples(db: Session = Depends(get_db)):
    return db.query(Sample).all()

@router.patch("/{sample_id}")
def update_sample(sample_id: int, update: SampleUpdate, db: Session = Depends(get_db)):
    sample = db.query(Sample).filter(Sample.id == sample_id).first()
    if not sample:
        raise HTTPException(status_code=404, detail="Sample not found")
    
    sample.status = update.status
    if update.result is not None:
        sample.result = update.result
        
    db.commit()
    db.refresh(sample)
    return sample
