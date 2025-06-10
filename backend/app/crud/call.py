from sqlalchemy.orm import Session

from ..models.call import Call
from ..schemas.call import CallCreate


def create_call(db: Session, call_in: CallCreate) -> Call:
    call = Call(title=call_in.title, description=call_in.description, is_open=call_in.is_open)
    db.add(call)
    db.commit()
    db.refresh(call)
    return call


def get_call(db: Session, call_id: int) -> Call | None:
    return db.query(Call).filter(Call.id == call_id).first()
