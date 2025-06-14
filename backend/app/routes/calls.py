from fastapi import APIRouter, Depends, HTTPException, Response, status, Query, Path
from fastapi.responses import Response as FastAPIResponse
from fastapi.templating import Jinja2Templates
from sqlalchemy.orm import Session
from typing import List
import pdfkit

from app.dependencies import get_db
from ..dependencies import get_current_admin, get_current_admin_or_reviewer, get_current_user
from ..models.call import Call
from ..schemas.call import CallCreate, CallOut, CallUpdate
from ..schemas.document import DocumentDefinitionOut
from ..schemas.application import ApplicationDetail
from ..crud.call import (
    create_call,
    get_call,
    update_call,
    delete_call,
    list_calls,
    list_open_calls,
)
from ..crud.application import get_applications_by_call
from ..crud.attachment import get_attachments_by_application
from ..crud.document import list_document_definitions

templates = Jinja2Templates(directory="app/templates")
router = APIRouter(prefix="/calls", tags=["calls"])


# Reusable DB fetcher with error handling
def get_call_or_404(call_id: int, db: Session) -> Call:
    call = db.query(Call).filter(Call.id == call_id).first()
    if not call:
        raise HTTPException(status_code=404, detail="Call not found")
    return call


@router.post("/", response_model=CallOut, status_code=status.HTTP_201_CREATED)
def create_new_call(
    call_in: CallCreate,
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin),
):
    call = create_call(db, call_in)
    return call


@router.get("/", response_model=List[CallOut])
def read_calls(
    only_open: bool = Query(False, description="Filter only currently open calls"),
    db: Session = Depends(get_db),
):
    return list_open_calls(db) if only_open else list_calls(db)


@router.get("/{call_id}", response_model=CallOut)
def read_call(call_id: int, db: Session = Depends(get_db)):
    return get_call_or_404(call_id, db)


@router.put("/{call_id}", response_model=CallOut)
def update_existing_call(
    call_id: int,
    call_in: CallUpdate,
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin),
):
    get_call_or_404(call_id, db)
    updated = update_call(db, call_id, call_in)
    return updated


@router.delete("/{call_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_existing_call(
    call_id: int,
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin),
):
    deleted = delete_call(db, call_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Call not found")
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/{call_id}/applications", response_model=List[ApplicationDetail])
def list_call_applications(
    call_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_admin_or_reviewer),
):
    get_call_or_404(call_id, db)
    return get_applications_by_call(db, call_id)


@router.get("/{call_id}/export-applications.pdf")
def export_applications_pdf(
    call_id: int,
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin),
):
    call = get_call_or_404(call_id, db)
    applications = get_applications_by_call(db, call_id)
    attachments_map = {
        app.id: get_attachments_by_application(db, app.id) for app in applications
    }

    try:
        html = templates.get_template("applications_export.html").render(
            {
                "call": call,
                "applications": applications,
                "attachments": attachments_map,
            }
        )
        pdf = pdfkit.from_string(html, False)
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to generate PDF")

    headers = {
        "Content-Disposition": f"attachment; filename=call_{call_id}_applications.pdf"
    }
    return FastAPIResponse(content=pdf, media_type="application/pdf", headers=headers)


@router.get(
    "/{call_id}/documents",
    response_model=List[DocumentDefinitionOut],
    summary="List a call's required documents (applicant view)",
)
def list_call_documents_for_applicant(
    call_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    get_call_or_404(call_id, db)
    return list_document_definitions(db, call_id)
