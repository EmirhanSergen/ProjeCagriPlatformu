from sqlalchemy.orm import Session

from ..models.attachment import Attachment


def create_attachment(db: Session, application_id: int, file_path: str, document_id: int | None = None) -> Attachment:
    attachment = Attachment(application_id=application_id, file_path=file_path, document_id=document_id)
    db.add(attachment)
    db.commit()
    db.refresh(attachment)
    return attachment

def get_attachments_by_application(db: Session, application_id: int) -> list[Attachment]:
    return db.query(Attachment).filter(Attachment.application_id == application_id).all()


def confirm_attachments(db: Session, application_id: int) -> None:
    """Mark all attachments for an application as confirmed."""
    db.query(Attachment).filter(Attachment.application_id == application_id).update(
        {Attachment.is_confirmed: True}
    )
    db.commit()


def confirm_attachment(db: Session, attachment_id: int) -> None:
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
