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


def get_application_by_user_and_call(
    db: Session, user_id: int, call_id: int
) -> Application | None:
    """Return application for a given user and call."""
    return (
        db.query(Application)
        .filter(Application.user_id == user_id, Application.call_id == call_id)
        .first()
    )


def confirm_documents(db: Session, application: Application) -> Application:
    """Mark documents for an application as confirmed."""
    application.documents_confirmed = True
    db.add(application)
    db.commit()
    db.refresh(application)
    return application


def get_applications_by_call(db: Session, call_id: int) -> list[Application]:
    """Return all applications submitted for the given call."""
    return db.query(Application).filter(Application.call_id == call_id).all()
