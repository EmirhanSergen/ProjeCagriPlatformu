from sqlalchemy.orm import Session

from ..models.call import Call as CallModel, CallStatus
from ..schemas.call import CallCreate

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

def update_call(db: Session, call_id: int, call_in: CallCreate) -> CallModel | None:
    """
    Update mutable fields of an existing call.
    Excludes any incoming `status` so we never write an invalid enum.
    """
    db_call = db.query(CallModel).filter(CallModel.id == call_id).first()
    if not db_call:
        return None

    # Drop any 'status' key from the incoming payload
    data = call_in.model_dump(exclude={'status'})
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
