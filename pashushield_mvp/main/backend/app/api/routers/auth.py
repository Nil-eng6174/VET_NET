from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User
from app.schemas import UserCreate, UserResponse

router = APIRouter(prefix="/api/auth", tags=["auth"])

@router.post("/register", response_model=UserResponse)
def register(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.aadhaar == user.aadhaar).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Aadhaar already registered")
    
    new_user = User(**user.dict())
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/login", response_model=UserResponse)
def login(role: str, aadhaar: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.aadhaar == aadhaar, User.role == role).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
