from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import SessionLocal, Base, engine
from ..dependencies import get_current_admin
from ..models.user import User

from ..models.call import Call
from ..schemas.call import CallCreate, CallOut
from ..crud.call import create_call, get_call

router = APIRouter(prefix="/calls", tags=["calls"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/", response_model=CallOut)
def create_new_call(
    call_in: CallCreate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
):
    call = create_call(db, call_in)
    return call


@router.get("/", response_model=list[CallOut])
def list_calls(only_open: bool = False, db: Session = Depends(get_db)):
    """Return all calls. Optionally filter by open status."""
    query = db.query(Call)
    if only_open:
        query = query.filter(Call.is_open == True)  # noqa: E712
    return query.all()


@router.get("/{call_id}", response_model=CallOut)
def read_call(call_id: int, db: Session = Depends(get_db)):
    call = get_call(db, call_id)
    if not call:
        raise HTTPException(status_code=404, detail="Call not found")
    return call
