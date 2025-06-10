from sqlalchemy.orm import Session

from ..models.application import Application
from ..models.call import Call
from ..schemas.application import ApplicationCreate


def create_application(db: Session, app_in: ApplicationCreate) -> Application:
    call = db.query(Call).filter(Call.id == app_in.call_id).first()
    if not call or not call.is_open:
        raise ValueError("Call not available")
    application = Application(user_id=app_in.user_id, call_id=app_in.call_id, content=app_in.content)
    db.add(application)
    db.commit()
    db.refresh(application)
    return application
