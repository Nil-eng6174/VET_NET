from sqlalchemy.orm import Session
from sqlalchemy import text
from app.models import HealthReport
import json

def find_nearby_cases(db: Session, lat: float, lng: float, radius_km: float = 10, days: int = 2):
    """
    Find nearby cases within a given radius using PostGIS ST_DWithin
    and a specific time window.
    """
    # Assuming lat and lng are provided, and geometry column is stored as SRID 4326.
    # We use geography cast for distance in meters.
    query = text(f"""
        SELECT id, lat, lng, risk_level, suspected_category, created_at
        FROM health_reports
        WHERE ST_DWithin(
            location::geography, 
            ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography, 
            :radius_meters
        )
        AND created_at >= NOW() - INTERVAL '{days} days'
    """)
    
    result = db.execute(query, {
        "lng": lng,
        "lat": lat,
        "radius_meters": radius_km * 1000
    }).fetchall()
    
    return [dict(row._mapping) for row in result]

def detect_cluster(db: Session, lat: float, lng: float):
    nearby = find_nearby_cases(db, lat, lng, radius_km=10, days=2)
    # Simple rule: if more than 3 cases in 10km within 48 hours, it's a cluster.
    if len(nearby) >= 3:
        return True, nearby
    return False, nearby
