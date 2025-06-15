from sqlalchemy.orm import Session

from ..models.application import Application
from ..models.call import Call
from ..crud.attachment import get_attachments_by_application, attachments_confirmed
from sqlalchemy.orm import joinedload
from app.models import Application, User
from app.schemas.application import ApplicationDetail, ReviewerShort
from app.models.application_reviewer import ApplicationReviewer


def is_reviewer_assigned(db: Session, application_id: int, user_id: int) -> bool:
    """Return True if the given user is assigned as reviewer to the application."""
    return (
        db.query(ApplicationReviewer)
        .filter_by(application_id=application_id, user_id=user_id)
        .first()
        is not None
    )


def create_application(db: Session, call_id: int, content: str, user_id: int) -> Application:
    # 1) Çağrı var mı ve açık mı?
    call = db.query(Call).filter(Call.id == call_id, Call.is_open == True).first()
    if not call:
        raise ValueError("Call not found or not open")

    # 2) Kullanıcı daha önce başvurmuş mu?
    existing = db.query(Application).filter_by(user_id=user_id, call_id=call_id).first()
    if existing:
        raise ValueError("You have already applied to this call")

    # 3) Yeni başvuru
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


def get_application_for_user(
    db: Session, application_id: int, user_id: int
) -> Application | None:
    """Return application by id belonging to the given user."""
    return (
        db.query(Application)
        .filter(Application.id == application_id, Application.user_id == user_id)
        .first()
    )


def confirm_documents(db: Session, application: Application) -> Application:
    """Mark documents for an application as confirmed."""
    application.documents_confirmed = True
    db.add(application)
    db.commit()
    db.refresh(application)
    return application


def _build_application_detail(db: Session, app: Application) -> ApplicationDetail:
    """Helper to convert an Application model to ApplicationDetail"""
    return ApplicationDetail(
        id=app.id,
        user_id=app.user_id,
        call_id=app.call_id,
        content=app.content,
        created_at=app.created_at,
        documents_confirmed=attachments_confirmed(db, app.id),
        user_email=app.user.email if app.user else "",
        user_first_name=app.user.first_name if app.user else None,
        user_last_name=app.user.last_name if app.user else None,
        attachments=get_attachments_by_application(db, app.id),
        reviewers=[
            ReviewerShort(id=r.user.id, name=f"{r.user.first_name} {r.user.last_name}")
            for r in getattr(app, "review_assignments", [])
            if r.user
        ],
    )


def get_applications_by_call(db: Session, call_id: int) -> list[ApplicationDetail]:
    applications = db.query(Application).options(
        joinedload(Application.review_assignments).joinedload(ApplicationReviewer.user)
    ).filter(Application.call_id == call_id).all()
    result = []
    for app in applications:
        result.append(_build_application_detail(db, app))
    return result


def get_application_detail(db: Session, application_id: int) -> ApplicationDetail | None:
    app = (
        db.query(Application)
        .options(joinedload(Application.review_assignments).joinedload(ApplicationReviewer.user))
        .filter(Application.id == application_id)
        .first()
    )
    if not app:
        return None
    return _build_application_detail(db, app)


def assign_reviewer(db: Session, application_id: int, reviewer_id: int) -> Application:
    """Assign a reviewer to an application with many-to-many support.

    Ensures no more than 3 distinct reviewers are assigned to a single
    application and prevents duplicate assignments.
    """

    application = db.query(Application).filter(Application.id == application_id).first()
    if not application:
        raise ValueError("Application not found")

    # Check existing assignments
    existing = db.query(ApplicationReviewer).filter_by(
        application_id=application_id, user_id=reviewer_id
    ).first()
    if existing:
        raise ValueError("Reviewer already assigned")

    count = db.query(ApplicationReviewer).filter_by(application_id=application_id).count()
    if count >= 3:
        raise ValueError("Maximum number of reviewers reached")

    assignment = ApplicationReviewer(application_id=application_id, user_id=reviewer_id)
    db.add(assignment)
    db.commit()

    db.refresh(application)
    return application

def get_applications_by_user(db: Session, user_id: int) -> list[Application]:
    """Return all applications for a given user."""
    return db.query(Application).filter(Application.user_id == user_id).all()

def delete_application_by_id(db: Session, application_id: int):
    application = db.query(Application).filter(Application.id == application_id).first()
    if not application:
        return None
    db.delete(application)
    db.commit()
    return application
