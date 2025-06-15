from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query, Path, status, Response
from sqlalchemy.orm import Session
from typing import List
from pathlib import Path as Pathlib
import os, uuid

from app.dependencies import get_db
from ..dependencies import get_current_user, get_current_admin, get_current_admin_or_reviewer
from ..models.application import Application, ApplicationStatus
from ..models.user import User, UserRole
from ..models.document import DocumentDefinition
from ..models.attachment import Attachment
from ..schemas.application import ApplicationCreate, ApplicationOut, ApplicationDetail
from ..schemas.attachment import AttachmentOut
from app.config import settings
from ..crud.application import (
    create_application,
    get_application_by_user_and_call,
    get_application_for_user,
    get_applications_by_call,
    get_application_detail,
    get_applications_by_user,
    delete_application_by_id,
    assign_reviewer,
    is_reviewer_assigned,
)
from ..crud.attachment import (
    create_attachment,
    get_attachments_by_application,
    confirm_attachments,
    confirm_attachment,
    attachments_confirmed,
    delete_attachment,
)

router = APIRouter(prefix="/applications", tags=["applications"])

# Submit a new application
@router.post("/", response_model=ApplicationOut, status_code=status.HTTP_201_CREATED)
def submit_application(
    app_in: ApplicationCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
):
    if not app_in.content.strip():
        raise HTTPException(status_code=400, detail="Application content is required")
    try:
        return create_application(db, call_id=app_in.call_id, content=app_in.content, user_id=current_user.id)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

# List my applications
@router.get("/me", response_model=List[ApplicationOut], summary="List my applications")
def list_my_applications(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
):
    return get_applications_by_user(db, current_user.id)

# Read current user's application for a call
@router.get("/{application_id}", response_model=ApplicationOut)
def read_application(
    application_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
):
    application = get_application_for_user(db, application_id, current_user.id)
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    return application

# Multi-file upload for an application (legacy)
@router.post("/{call_id}/upload", response_model=List[AttachmentOut])
def upload_application_files(
    call_id: int = Path(..., description="The call ID for the application"),
    document_id: int = Query(..., description="Document definition ID"),
    files: List[UploadFile] = File(..., description="Upload one or more files"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
):
    application = get_application_by_user_and_call(db, current_user.id, call_id)
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    if attachments_confirmed(db, application.id):
        raise HTTPException(status_code=400, detail="Attachments already confirmed")

    attachments: List[Attachment] = []
    for file in files:
        filename = os.path.basename(file.filename)
        if Pathlib(filename).is_absolute() or ".." in filename:
            raise HTTPException(status_code=400, detail="Invalid filename")

        ext = filename.rsplit(".", 1)[-1].lower()
        document = (
            db.query(DocumentDefinition)
              .filter_by(id=document_id, call_id=application.call_id)
              .first()
        )
        if not document:
            raise HTTPException(status_code=400, detail="Invalid document ID for this call")
        if ext not in document.allowed_formats.split(","):
            raise HTTPException(status_code=400, detail=f"Invalid file format: .{ext}")

        unique_name = f"{uuid.uuid4().hex}_{filename}"
        data = file.file.read()

        attachment = Attachment(
            application_id=application.id,
            document_id=document_id,
            file_name=unique_name,
            data=data,
            is_confirmed=False,
        )
        db.add(attachment)
        db.commit()
        db.refresh(attachment)

        attachments.append(attachment)

    return attachments


# Single file upload endpoint
@router.post("/{application_id}/attachments", response_model=AttachmentOut)
def upload_attachment(
    application_id: int = Path(..., description="The application ID"),
    document_id: int = Query(..., description="Document definition ID"),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
):
    application = get_application_for_user(db, application_id, current_user.id)
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    if attachments_confirmed(db, application.id):
        raise HTTPException(status_code=400, detail="Attachments already confirmed")

    document = db.query(DocumentDefinition).filter_by(id=document_id, call_id=application.call_id).first()
    if not document:
        raise HTTPException(status_code=400, detail="Invalid document ID for this call")

    ext = file.filename.rsplit('.', 1)[-1].lower()
    if ext not in document.allowed_formats.split(','):
        raise HTTPException(status_code=400, detail=f"Invalid file format: .{ext}")

    filename = f"{uuid.uuid4().hex}.{ext}"
    data = file.file.read()

    attachment = Attachment(
        application_id=application.id,
        document_id=document.id,
        file_name=filename,
        data=data,
        is_confirmed=False,
    )
    db.add(attachment)
    db.commit()
    db.refresh(attachment)
    return attachment

# List attachments for an application
@router.get("/{application_id}/attachments", response_model=List[AttachmentOut])
def list_attachments(
    application_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
):
    application = get_application_for_user(db, application_id, current_user.id)
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    return get_attachments_by_application(db, application.id)

# Download attachment data
@router.get("/attachments/{attachment_id}/download")
def download_attachment(
    attachment_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
):
    attachment = db.query(Attachment).join(Application).filter(
        Attachment.id == attachment_id,
        Application.user_id == current_user.id,
    ).first()
    if not attachment:
        raise HTTPException(status_code=404, detail="Attachment not found")
    return Response(
        content=attachment.data,
        media_type="application/octet-stream",
        headers={"Content-Disposition": f"attachment; filename={attachment.file_name}"},
    )

# Admin/Reviewer: Download attachment for review
@router.get("/attachments/{attachment_id}/review-download")
def download_attachment_for_review(
    attachment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_or_reviewer),
):
    attachment = (
        db.query(Attachment)
        .join(Application)
        .filter(Attachment.id == attachment_id)
        .first()
    )
    if not attachment:
        raise HTTPException(status_code=404, detail="Attachment not found")
    application = attachment.application
    if current_user.role == UserRole.REVIEWER and not is_reviewer_assigned(
        db, application.id, current_user.id
    ):
        raise HTTPException(status_code=403, detail="Not assigned to this application")
    return Response(
        content=attachment.data,
        media_type="application/octet-stream",
        headers={"Content-Disposition": f"attachment; filename={attachment.file_name}"},
    )

# Delete an attachment by its ID
@router.delete("/attachments/{attachment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_attachment_route(
    attachment_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
):
    attachment = db.query(Attachment).join(Application).filter(
        Attachment.id == attachment_id,
        Application.user_id == current_user.id
    ).first()
    if not attachment:
        raise HTTPException(status_code=404, detail="Attachment not found")
    delete_attachment(db, attachment_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)

# Confirm all uploaded files
@router.post("/{application_id}/confirm", status_code=status.HTTP_200_OK)
def confirm_application_files(
    application_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
):
    application = get_application_for_user(db, application_id, current_user.id)
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    if not get_attachments_by_application(db, application.id):
        raise HTTPException(status_code=400, detail="No attachments to confirm")
    if attachments_confirmed(db, application.id):
        raise HTTPException(status_code=400, detail="Attachments already confirmed")
    confirm_attachments(db, application.id)
    return {"detail": "Attachments confirmed"}

# Confirm a single attachment
@router.patch("/{application_id}/attachments/{attachment_id}/confirm", status_code=status.HTTP_200_OK)
def confirm_single_attachment(
    application_id: int,
    attachment_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
):
    application = get_application_for_user(db, application_id, current_user.id)
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    attachment = db.query(Attachment).filter(
        Attachment.id == attachment_id,
        Attachment.application_id == application.id
    ).first()
    if not attachment:
        raise HTTPException(status_code=404, detail="Attachment not found")
    confirm_attachment(db, attachment.id)
    return {"detail": "Attachment confirmed"}

# Submit application status
@router.patch("/{application_id}/submit", response_model=ApplicationOut)
def submit_application_status(
    application_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
):
    app_obj = db.query(Application).filter(
        Application.id == application_id,
        Application.user_id == current_user.id
    ).first()
    if not app_obj:
        raise HTTPException(status_code=404, detail="Application not found")
    app_obj.status = ApplicationStatus.SUBMITTED
    db.commit()
    db.refresh(app_obj)
    return app_obj

# Delete draft application
@router.delete("/{application_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_draft_application(
    application_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
):
    application = db.query(Application).filter(
        Application.id == application_id,
        Application.user_id == current_user.id
    ).first()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    if application.status != ApplicationStatus.DRAFT:
        raise HTTPException(status_code=400, detail="Only DRAFT applications can be deleted")
    delete_application_by_id(db, application.id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


# Get or create application by call
@router.get("/by_call/{call_id}", response_model=ApplicationOut)
def get_or_create_application_by_call(
    call_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
):
    existing = get_application_by_user_and_call(db, current_user.id, call_id)
    if existing:
        return existing
    try:
        return create_application(db, call_id=call_id, content="", user_id=current_user.id)
    except ValueError:
        existing = get_application_by_user_and_call(db, current_user.id, call_id)
        if existing:
            return existing
        raise HTTPException(status_code=400, detail="Could not create or fetch application")

# Admin: List all applications for a call
@router.get("/admin/{call_id}/applications", response_model=List[ApplicationDetail])
async def admin_list_call_applications(
    call_id: int,
    db: Session = Depends(get_db),
    current_admin = Depends(get_current_admin),
):
    return get_applications_by_call(db, call_id)

# Admin: Assign reviewer to an application
@router.post("/admin/applications/{application_id}/assign-reviewer", status_code=status.HTTP_200_OK)
async def assign_reviewer_route(
    application_id: int = Path(...),
    reviewer_id: int = Query(...),
    db: Session = Depends(get_db),
    current_admin = Depends(get_current_admin),
):
    try:
        assign_reviewer(db, application_id, reviewer_id)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    return {"detail": f"Reviewer {reviewer_id} assigned", "application_id": application_id}


# Admin/Reviewer: Get application details
@router.get("/{application_id}/details", response_model=ApplicationDetail)
def get_application_details(
    application_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_or_reviewer),
):
    application = get_application_detail(db, application_id)
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    return application
