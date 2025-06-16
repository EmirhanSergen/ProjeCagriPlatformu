from sqlalchemy.orm import Session
from fastapi import HTTPException

from ..models.call import Call as CallModel, CallStatus
from ..models.application import Application
from ..schemas.call import CallCreate, CallUpdate

def create_call(db: Session, call_in: CallCreate) -> CallModel:
    """
    Create a new Call using only supported fields and a valid enum status.
    Always starts in DRAFT status to avoid invalid INSERT values.
    """
    db_call = CallModel(
        title=call_in.title,
        description=call_in.description,
        is_open=call_in.is_open,
        status=CallStatus.DRAFT,               # Start in draft status
        start_date=call_in.start_date,
        end_date=call_in.end_date,
        category=call_in.category,
        max_applications=call_in.max_applications,
    )
    db.add(db_call)
    db.commit()
    db.refresh(db_call)
    return db_call

def get_call(db: Session, call_id: int) -> CallModel | None:
    """Fetch a call by its ID."""
    return db.query(CallModel).filter(CallModel.id == call_id).first()

def update_call(db: Session, call_id: int, call_in: CallUpdate) -> CallModel | None:
    """
    Update mutable fields of an existing call.
    Only updates fields that are provided in the update schema.
    """
    db_call = db.query(CallModel).filter(CallModel.id == call_id).first()
    if not db_call:
        return None    # Update fields that were included in the update request
    data = call_in.model_dump(exclude_unset=True)
    for field, value in data.items():
        setattr(db_call, field, value)

    db.commit()
    db.refresh(db_call)
    return db_call

def delete_call(db: Session, call_id: int) -> bool:
    """Delete a call by ID. Returns True if it existed."""
    db_call = db.query(CallModel).filter(CallModel.id == call_id).first()
    if not db_call:
        return False
    # Prevent deleting calls that still have applications
    has_apps = (
        db.query(Application).filter(Application.call_id == call_id).first() is not None
    )
    if has_apps:
        raise HTTPException(status_code=409, detail="Call has active applications")
    db.delete(db_call)
    db.commit()
    return True

def list_calls(db: Session, skip: int = 0, limit: int = 100) -> list[CallModel]:
    """Return a paginated list of all calls."""
    return db.query(CallModel).offset(skip).limit(limit).all()

def list_open_calls(db: Session, skip: int = 0, limit: int = 100) -> list[CallModel]:
    """Return a paginated list of only open calls."""
    return (
        db.query(CallModel)
        .filter(CallModel.is_open == True)
        .offset(skip)
        .limit(limit)
        .all()
    )
