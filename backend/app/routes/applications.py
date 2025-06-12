from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Path, Query, status,Response
from sqlalchemy.orm import Session
from typing import List
from pathlib import Path as Pathlib
import os
import shutil

from app.dependencies import get_db
from ..dependencies import get_current_user, get_current_admin, get_current_admin_or_reviewer
from ..models.user import User
from ..models.attachment import Attachment
from ..models.application import Application
from ..schemas.application import ApplicationCreate, ApplicationOut, ApplicationDetail
from ..schemas.attachment import AttachmentOut
from ..crud.application import (
    create_application,
    get_application_by_user_and_call,
    get_applications_by_call,
)
from ..crud.attachment import (
    create_attachment,
    confirm_attachments,
    confirm_attachment,
    attachments_confirmed,
    get_attachments_by_application,
    delete_attachment,
)
from ..crud.application import assign_reviewer

router = APIRouter(prefix="/applications", tags=["applications"])

# Endpoint: Submit a new application
@router.post("/", response_model=ApplicationOut, status_code=status.HTTP_201_CREATED)
def submit_application(
    app_in: ApplicationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        application = create_application(
            db, app_in.call_id, app_in.content, current_user.id
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
    return application

# Endpoint: Upload multiple files for an application
@router.post("/{call_id}/upload", response_model=List[AttachmentOut])
def upload_application_files(
    call_id: int = Path(..., description="The call ID for the application"),
    document_id: int | None = Query(None, description="Optional document definition ID"),
    files: List[UploadFile] = File(..., description="Upload one or more files"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    application = get_application_by_user_and_call(db, current_user.id, call_id)
    if not application:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")
    if attachments_confirmed(db, application.id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Attachments already confirmed")

    upload_dir = Pathlib("uploads")
    upload_dir.mkdir(exist_ok=True)

    attachments: List[Attachment] = []
    for file in files:
        filename = os.path.basename(file.filename)
        # Ensure filename is secure
        if Pathlib(filename).is_absolute() or ".." in filename:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid filename")
        target = upload_dir / filename
        with target.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        att = create_attachment(db, application.id, str(target), document_id)
        attachments.append(att)
    return attachments

# Endpoint: Confirm all uploaded files
@router.post("/{call_id}/confirm", status_code=status.HTTP_200_OK)
def confirm_application_files(
    call_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    application = get_application_by_user_and_call(db, current_user.id, call_id)
    if not application:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")
    attachments = get_attachments_by_application(db, application.id)
    if not attachments:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No attachments to confirm")
    if attachments_confirmed(db, application.id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Attachments already confirmed")
    confirm_attachments(db, application.id)
    return {"detail": "Attachments confirmed"}

# Endpoint: Confirm a single attachment
@router.patch("/{call_id}/attachments/{attachment_id}/confirm", status_code=status.HTTP_200_OK)
def confirm_single_attachment(
    call_id: int,
    attachment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    application = get_application_by_user_and_call(db, current_user.id, call_id)
    if not application:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")
    attachment = (
        db.query(Attachment)
        .filter(Attachment.id == attachment_id, Attachment.application_id == application.id)
        .first()
    )
    if not attachment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Attachment not found")
    confirm_attachment(db, attachment.id)
    return {"detail": "Attachment confirmed"}

# Endpoint: Delete a single attachment
@router.delete("/{call_id}/attachments/{attachment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_single_attachment(
    call_id: int,
    attachment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    application = get_application_by_user_and_call(db, current_user.id, call_id)
    if not application:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")
    delete_attachment(db, attachment_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)

# Endpoint: Read current user's application
@router.get("/{call_id}", response_model=ApplicationOut)
def read_application(
    call_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    application = get_application_by_user_and_call(db, current_user.id, call_id)
    if not application:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")
    return application

# Endpoint: List current user's attachments
@router.get("/{call_id}/attachments", response_model=List[AttachmentOut])
def list_application_attachments(
    call_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    application = get_application_by_user_and_call(db, current_user.id, call_id)
    if not application:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")
    return get_attachments_by_application(db, application.id)

# Admin endpoint: List all applications for a call
@router.get("/admin/{call_id}/applications", response_model=List[ApplicationDetail])
async def admin_list_call_applications(
    call_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
):
    applications = get_applications_by_call(db, call_id)
    return applications

# Admin endpoint: Assign a reviewer to an application
@router.post("/admin/applications/{application_id}/assign-reviewer", status_code=status.HTTP_200_OK)
async def assign_reviewer_to_application(
    application_id: int = Path(..., description="ID of the application"),
    reviewer_id: int = Query(..., description="ID of the reviewer to assign"),
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
):
    """(Admin) Assign a reviewer to an application."""
    try:
        assign_reviewer(db, application_id, reviewer_id)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
    return {"detail": f"Reviewer {reviewer_id} assigned to application {application_id}"}
