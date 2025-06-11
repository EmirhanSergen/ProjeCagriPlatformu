from sqlalchemy.orm import Session

from ..models.document import DocumentDefinition


def create_document_definition(db: Session, call_id: int, name: str, allowed_formats: str) -> DocumentDefinition:
    doc = DocumentDefinition(call_id=call_id, name=name, allowed_formats=allowed_formats)
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return doc


def list_document_definitions(db: Session, call_id: int) -> list[DocumentDefinition]:
    return db.query(DocumentDefinition).filter(DocumentDefinition.call_id == call_id).all()
