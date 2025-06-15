from sqlalchemy.orm import Session

from ..models.document import DocumentDefinition
from ..schemas.document import DocumentFormat, DocumentDefinitionUpdate


def create_document_definition(
    db: Session,
    call_id: int,
    name: str,
    allowed_formats: DocumentFormat,
    description: str | None = None,
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
    db: Session, doc: DocumentDefinition, doc_update: DocumentDefinitionUpdate
) -> DocumentDefinition:
    data = doc_update.model_dump(exclude_unset=True)
    for field, value in data.items():
        setattr(doc, field, value)
    db.commit()
    db.refresh(doc)
    return doc


def delete_document_definition(db: Session, doc: DocumentDefinition) -> None:
    db.delete(doc)
    db.commit()


def list_document_definitions(db: Session, call_id: int) -> list[DocumentDefinition]:
    return (
        db.query(DocumentDefinition).filter(DocumentDefinition.call_id == call_id).all()
    )
