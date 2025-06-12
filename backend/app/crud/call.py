from sqlalchemy import and_
from sqlalchemy.orm import Session

from ..models.attachment import Attachment
from ..models.call import Call
from ..schemas.attachment import AttachmentCreate
from ..schemas.call import CallCreate


def create_attachment(db: Session, application_id: int, file_path: str, document_id: int | None = None) -> Attachment:
    # Create and store a file attachment
    attachment = Attachment(application_id=application_id, file_path=file_path, document_id=document_id)
    db.add(attachment)
    db.commit()
    db.refresh(attachment)
    return attachment


def get_attachments_by_application(db: Session, application_id: int) -> list[Attachment]:
    # Return all attachments linked to an application
    return db.query(Attachment).filter(Attachment.application_id == application_id).all()


def confirm_attachments(db: Session, application_id: int) -> None:
    """Mark all attachments for an application as confirmed."""
    db.query(Attachment).filter(Attachment.application_id == application_id).update(
        {Attachment.is_confirmed: True}
    )
    db.commit()


def confirm_attachment(db: Session, attachment_id: int) -> None:
    # Mark a single attachment as confirmed
    db.query(Attachment).filter(Attachment.id == attachment_id).update({Attachment.is_confirmed: True})
    db.commit()


def attachments_confirmed(db: Session, application_id: int) -> bool:
    """Return True if any attachment for application is confirmed."""
    return (
        db.query(Attachment)
        .filter(
            Attachment.application_id == application_id,
            Attachment.is_confirmed == True,
        )
        .first()
        is not None
    )


def delete_attachment(db: Session, attachment_id: int) -> None:
    # Delete an attachment by its ID
    attachment = db.query(Attachment).filter(Attachment.id == attachment_id).first()
    if attachment:
        db.delete(attachment)
        db.commit()


def get_attachment(db: Session, attachment_id: int) -> Attachment | None:
    # Retrieve a single attachment by ID
    return db.query(Attachment).filter(Attachment.id == attachment_id).first()


def create_call(db: Session, call: CallCreate) -> Call:
    db_call = Call(**call.model_dump())
    db.add(db_call)
    db.commit()
    db.refresh(db_call)
    return db_call


def get_call(db: Session, call_id: int) -> Call | None:
    return db.query(Call).filter(Call.id == call_id).first()


def update_call(db: Session, call_id: int, call: CallCreate) -> Call | None:
    db_call = db.query(Call).filter(Call.id == call_id).first()
    if db_call:
        for key, value in call.model_dump().items():
            setattr(db_call, key, value)
        db.commit()
        db.refresh(db_call)
    return db_call


def delete_call(db: Session, call_id: int) -> bool:
    db_call = db.query(Call).filter(Call.id == call_id).first()
    if db_call:
        db.delete(db_call)
        db.commit()
        return True
    return False


def list_calls(db: Session, skip: int = 0, limit: int = 100) -> list[Call]:
    return db.query(Call).offset(skip).limit(limit).all()


def list_open_calls(db: Session, skip: int = 0, limit: int = 100) -> list[Call]:
    return db.query(Call).filter(Call.is_open == True).offset(skip).limit(limit).all()
