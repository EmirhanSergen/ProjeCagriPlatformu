from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import SessionLocal, Base, engine
from ..schemas.application import ApplicationCreate, ApplicationOut
from ..crud.application import create_application

router = APIRouter(prefix="/applications", tags=["applications"])

Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/", response_model=ApplicationOut)
def submit_application(app_in: ApplicationCreate, db: Session = Depends(get_db)):
    try:
        application = create_application(db, app_in)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    return application
