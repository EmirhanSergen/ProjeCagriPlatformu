from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.dependencies import get_db
from ..dependencies import get_current_user
from ..models.user import UserRole
from ..crud.reviewer_invite import get_invite_by_token, accept_invite

router = APIRouter(prefix="/reviewer/invites", tags=["reviewer_invites"])


@router.post("/accept")
def accept_reviewer_invite(token: str, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    if current_user.role is not UserRole.REVIEWER:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only reviewers can accept invites")

    invite = get_invite_by_token(db, token)
    if not invite:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invalid invite token")

    accept_invite(db, invite, current_user.id)
    return {"detail": "Invite accepted"}
