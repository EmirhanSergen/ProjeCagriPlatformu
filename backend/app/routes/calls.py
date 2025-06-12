from fastapi import APIRouter, Depends, HTTPException, Response, status
from fastapi.responses import Response as FastAPIResponse
from fastapi.templating import Jinja2Templates
import pdfkit
from sqlalchemy.orm import Session

from app.dependencies import get_db
from ..dependencies import get_current_admin, get_current_admin_or_reviewer
from ..models.user import User

from ..models.call import Call
from ..models.user import User as UserModel
from ..schemas.call import CallCreate, CallOut, CallUpdate
from ..schemas.document import DocumentDefinitionCreate
from ..schemas.application import ApplicationDetail
from ..crud.call import create_call, get_call, update_call, delete_call
from ..crud.application import get_applications_by_call
from ..crud.attachment import get_attachments_by_application
from ..models.document import DocumentDefinition


class CallWithDefs(CallCreate):
    """Schema for creating a call with document definitions."""

    documents: list[DocumentDefinitionCreate]


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


@router.post("/with-defs", response_model=CallOut)
def create_call_with_defs(
    call_in: CallWithDefs,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
):
    """Create a call along with its document definitions atomically."""
    with db.begin_nested():
        call = Call(
            title=call_in.title,
            description=call_in.description,
            is_open=True if call_in.is_open is None else call_in.is_open,
        )
        db.add(call)
        db.flush()
        for doc_def in call_in.documents:
            db.add(
                DocumentDefinition(
                    call_id=call.id,
                    name=doc_def.name,
                    description=doc_def.description,
                    allowed_formats=doc_def.allowed_formats,
                )
            )
    db.commit()
    db.refresh(call)
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


@router.get("/{call_id}/applications", response_model=list[ApplicationDetail])
def list_call_applications(
    call_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_or_reviewer),
):
    call = get_call(db, call_id)
    if not call:
        raise HTTPException(status_code=404, detail="Call not found")
    apps = get_applications_by_call(db, call_id)
    result = []
    for app in apps:
        user = db.query(UserModel).filter(UserModel.id == app.user_id).first()
        attachments = get_attachments_by_application(db, app.id)
        result.append(
            {
                "id": app.id,
                "user_id": app.user_id,
                "call_id": app.call_id,
                "content": app.content,
                "documents_confirmed": app.documents_confirmed,
                "user_email": user.email if user else "",
                "attachments": attachments,
            }
        )
    return result


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
