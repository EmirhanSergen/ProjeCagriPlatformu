from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.dependencies import get_db
from ..dependencies import get_current_admin, get_current_user
from ..schemas.document import DocumentDefinitionCreate, DocumentDefinitionOut
from ..crud.document import create_document_definition, list_document_definitions

router = APIRouter(tags=["documents"])


@router.post("/admin/calls/{call_id}/documents", response_model=list[DocumentDefinitionOut])
def create_definition(
    call_id: int,
    doc_in: DocumentDefinitionCreate,
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin),
):
    create_document_definition(db, call_id, doc_in.name, doc_in.allowed_formats)
    return list_document_definitions(db, call_id)


@router.get("/applications/{call_id}/documents", response_model=list[DocumentDefinitionOut])
def get_definitions(
    call_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return list_document_definitions(db, call_id)
