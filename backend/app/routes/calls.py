from fastapi import APIRouter, Depends, HTTPException, Response, status, Query
from fastapi.responses import Response as FastAPIResponse
from fastapi.templating import Jinja2Templates
import pdfkit
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError

from app.dependencies import get_db
from ..dependencies import get_current_admin, get_current_admin_or_reviewer
from ..models.call import Call
from ..models.document import DocumentDefinition
from ..schemas.call import CallCreate, CallOut, CallUpdate
from ..schemas.application import ApplicationDetail
from ..crud.call import create_call, get_call, update_call, delete_call, list_calls, list_open_calls
from ..crud.application import get_applications_by_call
from ..crud.attachment import get_attachments_by_application

templates = Jinja2Templates(directory="app/templates")
router = APIRouter(prefix="/calls", tags=["calls"])

@router.post("/", response_model=CallOut, status_code=status.HTTP_201_CREATED)
def create_new_call(
    call_in: CallCreate,
    db: Session = Depends(get_db),
    current_admin = Depends(get_current_admin),
):
    # Create a new call with full payload
    call = create_call(db, call_in)
    return call

@router.get("/", response_model=list[CallOut])
def read_calls(
    only_open: bool = Query(False, description="Filter only currently open calls"),
    db: Session = Depends(get_db),
):
    # Conditionally list open calls or all calls
    if only_open:
        return list_open_calls(db)
    return list_calls(db)

@router.get("/{call_id}", response_model=CallOut)
def read_call(call_id: int, db: Session = Depends(get_db)):
    # Fetch a single call by ID
    call = get_call(db, call_id)
    if not call:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Call not found")
    return call

@router.put("/{call_id}", response_model=CallOut)
def update_existing_call(
    call_id: int,
    call_in: CallUpdate,
    db: Session = Depends(get_db),
    current_admin = Depends(get_current_admin),
):    # Update only provided fields on an existing call
    call = get_call(db, call_id)
    if not call:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Call not found")
    updated = update_call(db, call_id, call_in)
    return updated

@router.delete("/{call_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_existing_call(
    call_id: int,
    db: Session = Depends(get_db),
    current_admin = Depends(get_current_admin),
):
    # Delete a call, after verifying it exists
    call = get_call(db, call_id)
    if not call:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Call not found")
    delete_call(db, call)
    return Response(status_code=status.HTTP_204_NO_CONTENT)

@router.get("/{call_id}/applications", response_model=list[ApplicationDetail])
def list_call_applications(
    call_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin_or_reviewer),
):
    # Admin or reviewer can list all applications for a call
    call = get_call(db, call_id)
    if not call:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Call not found")
    apps = get_applications_by_call(db, call_id)
    return apps

@router.get("/{call_id}/export-applications.pdf")
def export_applications_pdf(
    call_id: int,
    db: Session = Depends(get_db),
    current_admin = Depends(get_current_admin),
):
    # Export all applications under a call as a merged PDF
    call = get_call(db, call_id)
    if not call:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Call not found")
    applications = get_applications_by_call(db, call_id)
    attachments_map = {app.id: get_attachments_by_application(db, app.id) for app in applications}
    html = templates.get_template("applications_export.html").render({
        "call": call,
        "applications": applications,
        "attachments": attachments_map,
    })
    pdf = pdfkit.from_string(html, False)
    headers = {"Content-Disposition": f"attachment; filename=call_{call_id}_applications.pdf"}
    return FastAPIResponse(content=pdf, media_type="application/pdf", headers=headers)
