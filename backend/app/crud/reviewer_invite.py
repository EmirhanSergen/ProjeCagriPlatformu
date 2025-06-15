from datetime import datetime
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from ..models.reviewer_invite import ReviewerInvite
from ..models.call_reviewer import CallReviewer


def create_invite(
    db: Session,
    *,
    call_id: int,
    email: str,
    token: str,
    expires_at: datetime,
) -> ReviewerInvite:
    """Create and persist a new reviewer invite."""
    invite = ReviewerInvite(
        call_id=call_id,
        email=email,
        token=token,
        expires_at=expires_at,
    )
    db.add(invite)
    db.commit()
    db.refresh(invite)
    return invite


def get_invite_by_token(db: Session, token: str) -> ReviewerInvite | None:
    return db.query(ReviewerInvite).filter(ReviewerInvite.token == token).first()


def accept_invite(db: Session, invite: ReviewerInvite, reviewer_id: int) -> None:
    if invite.used:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invite already used")
    if invite.expires_at < datetime.utcnow():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invite token expired")

    link = CallReviewer(call_id=invite.call_id, reviewer_id=reviewer_id)
    invite.used = True
    db.add(link)
    db.add(invite)
    db.commit()

