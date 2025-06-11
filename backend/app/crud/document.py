from sqlalchemy.orm import Session

from ..models.document import DocumentDefinition


def create_document_definition(
    db: Session, call_id: int, name: str, allowed_formats: str, description: str | None = None
) -> DocumentDefinition:
    doc = DocumentDefinition(
        call_id=call_id,
        name=name,
        allowed_formats=allowed_formats,
        description=description,
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return doc


def update_document_definition(
    db: Session,
    doc: DocumentDefinition,
    name: str | None = None,
    allowed_formats: str | None = None,
    description: str | None = None,
) -> DocumentDefinition:
    if name is not None:
        doc.name = name
    if allowed_formats is not None:
        doc.allowed_formats = allowed_formats
    if description is not None:
        doc.description = description
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return doc


def delete_document_definition(db: Session, doc: DocumentDefinition) -> None:
    db.delete(doc)
    db.commit()


def list_document_definitions(db: Session, call_id: int) -> list[DocumentDefinition]:
    return db.query(DocumentDefinition).filter(DocumentDefinition.call_id == call_id).all()
