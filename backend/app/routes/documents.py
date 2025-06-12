from fastapi import APIRouter, Depends, HTTPException, Response, status, Path
from sqlalchemy.orm import Session

from app.dependencies import get_db
from ..dependencies import get_current_admin, get_current_user
from ..crud.document import (
    create_document_definition,
    list_document_definitions,
    update_document_definition,
    delete_document_definition,
)
from ..models.document import DocumentDefinition
from ..crud.call import get_call
from ..schemas.document import (
    DocumentDefinitionCreate,
    DocumentDefinitionUpdate,
    DocumentDefinitionOut,
)

router = APIRouter(prefix="/admin/calls/{call_id}/documents", tags=["documents"])

@router.post("/", response_model=list[DocumentDefinitionOut], status_code=status.HTTP_201_CREATED)
def create_definition(
    call_id: int = Path(..., description="ID of the call"),
    doc_in: DocumentDefinitionCreate = ...,
    db: Session = Depends(get_db),
    current_admin = Depends(get_current_admin),
):
    # Verify call exists, then add new document definitions
    call = get_call(db, call_id)
    if not call:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Call not found")
    create_document_definition(db, call_id, doc_in.name, doc_in.allowed_formats, doc_in.description)
    return list_document_definitions(db, call_id)

@router.get("/", response_model=list[DocumentDefinitionOut])
def get_definitions(
    call_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
):
    # Any authenticated user can view definitions for an open call
    call = get_call(db, call_id)
    if not call:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Call not found")
    return list_document_definitions(db, call_id)

@router.put("/{doc_id}", response_model=DocumentDefinitionOut)
def update_definition(
    call_id: int = Path(...),
    doc_id: int = Path(...),
    doc_in: DocumentDefinitionUpdate = ...,
    db: Session = Depends(get_db),
    current_admin = Depends(get_current_admin),
):
    # Update existing document definition by ID
    call = get_call(db, call_id)
    if not call:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Call not found")
    updated = update_document_definition(db, 
        db.query(DocumentDefinition).filter(DocumentDefinition.id==doc_id, DocumentDefinition.call_id==call_id).first(),
        name=doc_in.name, allowed_formats=doc_in.allowed_formats, description=doc_in.description
    )
    return updated

@router.delete("/{doc_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_definition(
    call_id: int = Path(...),
    doc_id: int = Path(...),
    db: Session = Depends(get_db),
    current_admin = Depends(get_current_admin),
):
    # Delete a document definition
    delete_document_definition(db, db.query(DocumentDefinition).filter(
        DocumentDefinition.id==doc_id, DocumentDefinition.call_id==call_id).first()
    )
    return Response(status_code=status.HTTP_204_NO_CONTENT)
