from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import SessionLocal, Base, engine
from ..schemas.user import UserCreate, UserOut
from ..crud.user import get_user_by_email, create_user

router = APIRouter(prefix="/users", tags=["users"])

# Ensure tables created (simplified)
Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=UserOut)
def register_user(user_in: UserCreate, db: Session = Depends(get_db)):
    """Register a new user with the provided role."""
    if get_user_by_email(db, user_in.email):
        raise HTTPException(status_code=400, detail="Email already registered")
    user = create_user(db, user_in)
    return user
