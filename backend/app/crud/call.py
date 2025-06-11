from sqlalchemy.orm import Session

from ..models.call import Call
from ..schemas.call import CallCreate, CallUpdate


def create_call(db: Session, call_in: CallCreate) -> Call:
    call = Call(title=call_in.title, description=call_in.description, is_open=call_in.is_open)
    db.add(call)
    db.commit()
    db.refresh(call)
    return call


def get_call(db: Session, call_id: int) -> Call | None:
    return db.query(Call).filter(Call.id == call_id).first()


def update_call(db: Session, call: Call, call_in: CallUpdate) -> Call:
    if call_in.title is not None:
        call.title = call_in.title
    if call_in.description is not None:
        call.description = call_in.description
    if call_in.is_open is not None:
        call.is_open = call_in.is_open
    db.add(call)
    db.commit()
    db.refresh(call)
    return call


def delete_call(db: Session, call: Call) -> None:
    db.delete(call)
    db.commit()
