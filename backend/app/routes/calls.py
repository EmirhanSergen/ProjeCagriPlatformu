from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from ..database import SessionLocal, Base, engine
from ..models.user import User
from ..schemas.call import CallCreate, CallOut
from ..crud.call import create_call

router = APIRouter(prefix="/calls", tags=["calls"])

Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/", response_model=CallOut)
def create_new_call(call_in: CallCreate, admin_id: int = Query(...), db: Session = Depends(get_db)):
    admin = db.query(User).filter(User.id == admin_id).first()
    if not admin or admin.role != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    call = create_call(db, call_in)
    return call
