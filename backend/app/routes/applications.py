from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
from pathlib import Path
import shutil

from app.dependencies import get_db
from ..dependencies import get_current_user
from ..models.user import User
from ..schemas.application import ApplicationCreate, ApplicationOut
from ..schemas.attachment import AttachmentOut
from ..crud.application import create_application, get_application_by_user_and_call
from ..crud.attachment import (
    create_attachment,
    confirm_attachments,
    confirm_attachment,
    attachments_confirmed,
    get_attachments_by_application,
)
from ..models.attachment import Attachment


router = APIRouter(prefix="/applications", tags=["applications"])


@router.post("/", response_model=ApplicationOut)
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
        raise HTTPException(status_code=400, detail=str(exc))
    return application


@router.post("/{call_id}/upload", response_model=list[AttachmentOut])
def upload_application_files(
    call_id: int,
    document_id: int | None = None,
    files: List[UploadFile] = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Upload attachment files for the current user's application."""
    application = get_application_by_user_and_call(db, current_user.id, call_id)
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    if attachments_confirmed(db, application.id):
        raise HTTPException(status_code=400, detail="Attachments already confirmed")

    upload_dir = Path("uploads")
    upload_dir.mkdir(exist_ok=True)

    attachments = []
    for uploaded_file in files:
        file_location = upload_dir / uploaded_file.filename
        with file_location.open("wb") as buffer:
            shutil.copyfileobj(uploaded_file.file, buffer)
        attachment = create_attachment(db, application.id, str(file_location), document_id=document_id)
        attachments.append(attachment)
    return attachments



@router.post("/{call_id}/confirm")
def confirm_application_files(
    call_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Confirm uploaded files for an application."""
    application = get_application_by_user_and_call(db, current_user.id, call_id)
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    if attachments_confirmed(db, application.id):
        raise HTTPException(status_code=400, detail="Attachments already confirmed")

    attachments = get_attachments_by_application(db, application.id)
    if not attachments:
        raise HTTPException(status_code=400, detail="No attachments to confirm")

    confirm_attachments(db, application.id)
    return {"detail": "Attachments confirmed"}


@router.patch("/{call_id}/save")
def save_attachment(
    call_id: int,
    attachment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    application = get_application_by_user_and_call(db, current_user.id, call_id)
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    attachment = (
        db.query(Attachment).filter(Attachment.id == attachment_id, Attachment.application_id == application.id).first()
    )
    if not attachment:
        raise HTTPException(status_code=404, detail="Attachment not found")
    confirm_attachment(db, attachment.id)
    return {"detail": "Attachment saved"}


@router.get("/{call_id}", response_model=ApplicationOut)
def read_application(
    call_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return the current user's application for the given call."""
    application = get_application_by_user_and_call(db, current_user.id, call_id)
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    return application


@router.get("/{call_id}/attachments", response_model=list[AttachmentOut])
def list_application_attachments(
    call_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return attachments for the current user's application to the given call."""
    application = get_application_by_user_and_call(db, current_user.id, call_id)
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    return get_attachments_by_application(db, application.id)

