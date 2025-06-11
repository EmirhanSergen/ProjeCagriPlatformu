from sqlalchemy.orm import Session

from ..models.application import Application
from ..models.call import Call



def create_application(db: Session, call_id: int, content: str, user_id: int) -> Application:
    call = db.query(Call).filter(Call.id == call_id).first()
    if not call or not call.is_open:
        raise ValueError("Call not available")
    application = Application(user_id=user_id, call_id=call_id, content=content)
    db.add(application)
    db.commit()
    db.refresh(application)
    return application
