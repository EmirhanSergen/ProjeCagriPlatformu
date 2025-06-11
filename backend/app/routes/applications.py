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
from ..crud.attachment import create_attachment

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
    files: List[UploadFile] = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Upload attachment files for the current user's application."""
    application = get_application_by_user_and_call(db, current_user.id, call_id)
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    upload_dir = Path("uploads")
    upload_dir.mkdir(exist_ok=True)

    attachments = []
    for uploaded_file in files:
        file_location = upload_dir / uploaded_file.filename
        with file_location.open("wb") as buffer:
            shutil.copyfileobj(uploaded_file.file, buffer)
        attachment = create_attachment(db, application.id, str(file_location))
        attachments.append(attachment)
    return attachments
