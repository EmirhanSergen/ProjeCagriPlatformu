from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session

from app.dependencies import get_db
from ..dependencies import get_current_admin, get_current_user
from ..crud.call import get_call
from ..schemas.document import (
    DocumentDefinitionCreate,
    DocumentDefinitionOut,
    DocumentDefinitionUpdate,
)
from ..crud.document import (
    create_document_definition,
    list_document_definitions,
    update_document_definition,
    delete_document_definition,
)
from ..models.document import DocumentDefinition

router = APIRouter(tags=["documents"])


@router.post("/admin/calls/{call_id}/documents", response_model=list[DocumentDefinitionOut])
def create_definition(
    call_id: int,
    doc_in: DocumentDefinitionCreate,
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin),
):
    call = get_call(db, call_id)
    if not call:
        raise HTTPException(status_code=404, detail="Call not found")
    create_document_definition(
        db, call_id, doc_in.name, doc_in.allowed_formats, doc_in.description
    )
    return list_document_definitions(db, call_id)


@router.put(
    "/admin/calls/{call_id}/documents/{doc_id}",
    response_model=DocumentDefinitionOut,
)
def update_definition(
    call_id: int,
    doc_id: int,
    doc_in: DocumentDefinitionUpdate,
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin),
):
    call = get_call(db, call_id)
    if not call:
        raise HTTPException(status_code=404, detail="Call not found")
    doc = (
        db.query(DocumentDefinition)
        .filter(DocumentDefinition.id == doc_id, DocumentDefinition.call_id == call_id)
        .first()
    )
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    updated = update_document_definition(
        db,
        doc,
        name=doc_in.name,
        allowed_formats=doc_in.allowed_formats,
        description=doc_in.description,
    )
    return updated


@router.delete("/admin/calls/{call_id}/documents/{doc_id}", status_code=204)
def delete_definition(
    call_id: int,
    doc_id: int,
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin),
):
    call = get_call(db, call_id)
    if not call:
        raise HTTPException(status_code=404, detail="Call not found")
    doc = (
        db.query(DocumentDefinition)
        .filter(DocumentDefinition.id == doc_id, DocumentDefinition.call_id == call_id)
        .first()
    )
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    delete_document_definition(db, doc)
    return Response(status_code=204)


@router.get("/applications/{call_id}/documents", response_model=list[DocumentDefinitionOut])
def get_definitions(
    call_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    call = get_call(db, call_id)
    if not call:
        raise HTTPException(status_code=404, detail="Call not found")
    return list_document_definitions(db, call_id)
