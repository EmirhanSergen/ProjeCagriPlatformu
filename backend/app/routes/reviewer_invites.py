from datetime import datetime, timedelta
import secrets
import string
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.dependencies import get_db
from ..dependencies import get_current_user, get_current_admin
from ..models.user import UserRole
from ..models.call import Call
from ..schemas.reviewer_invite import ReviewerInviteCreate, ReviewerInviteTokenOut
from ..crud.reviewer_invite import (
    get_invite_by_token,
    accept_invite,
    create_invite,
)

router = APIRouter(prefix="/reviewer/invites", tags=["reviewer_invites"])


@router.post("/accept")
def accept_reviewer_invite(
    token: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    if current_user.role is not UserRole.REVIEWER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only reviewers can accept invites",
        )

    invite = get_invite_by_token(db, token)
    if not invite:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invalid invite token",
        )

    accept_invite(db, invite, current_user.id)
    return {"detail": "Invite accepted"}


@router.post(
    "/generate",
    response_model=ReviewerInviteTokenOut,
    status_code=status.HTTP_201_CREATED,
)
def generate_invite(
    data: ReviewerInviteCreate,
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin),
):
    call = db.query(Call).filter(Call.id == data.call_id).first()
    if not call:
        raise HTTPException(status_code=404, detail="Call not found")

    token_chars = string.ascii_uppercase + string.digits
    token = "".join(secrets.choice(token_chars) for _ in range(6))

    hours = data.expiration_hours or 24
    expires_at = datetime.utcnow() + timedelta(hours=hours)

    invite = create_invite(
        db,
        call_id=data.call_id,
        token=token,
        expires_at=expires_at,
    )
    return invite
