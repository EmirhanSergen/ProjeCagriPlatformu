from fastapi import APIRouter, Depends, HTTPException, Response, status
from fastapi.responses import Response as FastAPIResponse
from fastapi.templating import Jinja2Templates
import pdfkit
from sqlalchemy.orm import Session

from app.dependencies import get_db
from ..dependencies import get_current_admin
from ..models.user import User

from ..models.call import Call
from ..schemas.call import CallCreate, CallOut, CallUpdate
from ..crud.call import create_call, get_call, update_call, delete_call
from ..crud.application import get_applications_by_call
from ..crud.attachment import get_attachments_by_application

router = APIRouter(prefix="/calls", tags=["calls"])

templates = Jinja2Templates(directory="app/templates")


@router.post("/", response_model=CallOut)
def create_new_call(
    call_in: CallCreate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
):
    call = create_call(db, call_in)
    return call


@router.get("/", response_model=list[CallOut])
def list_calls(only_open: bool = False, db: Session = Depends(get_db)):
    """Return all calls. Optionally filter by open status."""
    query = db.query(Call)
    if only_open:
        query = query.filter(Call.is_open == True)  # noqa: E712
    return query.all()


@router.get("/{call_id}", response_model=CallOut)
def read_call(call_id: int, db: Session = Depends(get_db)):
    call = get_call(db, call_id)
    if not call:
        raise HTTPException(status_code=404, detail="Call not found")
    return call


@router.put("/{call_id}", response_model=CallOut)
def update_existing_call(
    call_id: int,
    call_in: CallUpdate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
):
    call = get_call(db, call_id)
    if not call:
        raise HTTPException(status_code=404, detail="Call not found")
    updated = update_call(db, call, call_in)
    return updated


@router.delete("/{call_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_existing_call(
    call_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
):
    call = get_call(db, call_id)
    if not call:
        raise HTTPException(status_code=404, detail="Call not found")
    delete_call(db, call)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/{call_id}/export-applications.pdf")
def export_applications_pdf(
    call_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
):
    """Export all applications for a call as a merged PDF document."""
    call = get_call(db, call_id)
    if not call:
        raise HTTPException(status_code=404, detail="Call not found")

    applications = get_applications_by_call(db, call_id)
    attachments_map = {
        app.id: get_attachments_by_application(db, app.id) for app in applications
    }

    html = templates.get_template("applications_export.html").render(
        {
            "call": call,
            "applications": applications,
            "attachments": attachments_map,
        }
    )

    pdf = pdfkit.from_string(html, False)

    headers = {
        "Content-Disposition": f"attachment; filename=call_{call_id}_applications.pdf"
    }
    return FastAPIResponse(content=pdf, media_type="application/pdf", headers=headers)
