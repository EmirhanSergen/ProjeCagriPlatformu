from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.dependencies import get_db
from ..dependencies import get_current_user
from ..models.user import User
from ..schemas.application import ApplicationCreate, ApplicationOut
from ..crud.application import create_application

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
