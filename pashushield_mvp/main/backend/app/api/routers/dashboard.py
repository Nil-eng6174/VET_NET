from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import HealthReport
from app.services.gis import detect_cluster

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])

@router.get("/summary")
def get_summary(db: Session = Depends(get_db)):
    reports = db.query(HealthReport).all()
    high_risk = [r for r in reports if r.risk_level == "HIGH"]
    
    # Very basic cluster detection over all reports for MVP demo
    clusters = []
    processed = set()
    for r in high_risk:
        if r.id in processed or not r.lat or not r.lng:
            continue
        is_cluster, nearby = detect_cluster(db, r.lat, r.lng)
        if is_cluster:
            clusters.append({
                "center": {"lat": r.lat, "lng": r.lng},
                "cases": len(nearby)
            })
            for n in nearby:
                processed.add(n['id'])
                
    return {
        "total_reports": len(reports),
        "high_risk_cases": len(high_risk),
        "active_clusters": len(clusters),
        "clusters": clusters
    }
