from datetime import datetime
from sqlalchemy.orm import Session

from ..models.reviewer_invite_token import ReviewerInviteToken


def create_invite(db: Session, call_id: int, token: str, expires_at: datetime) -> ReviewerInviteToken:
    invite = ReviewerInviteToken(call_id=call_id, token=token, expires_at=expires_at)
    db.add(invite)
    db.commit()
    db.refresh(invite)
    return invite
