from sqlalchemy.orm import Session

from ..models.attachment import Attachment


def create_attachment(db: Session, application_id: int, file_path: str) -> Attachment:
    attachment = Attachment(application_id=application_id, file_path=file_path)
    db.add(attachment)
    db.commit()
    db.refresh(attachment)
    return attachment


def get_attachments_by_application(
    db: Session, application_id: int
) -> list[Attachment]:
    """Return all attachments belonging to an application."""
    return (
        db.query(Attachment)
        .filter(Attachment.application_id == application_id)
        .all()
    )
