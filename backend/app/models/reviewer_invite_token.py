from sqlalchemy import Column, Integer, String, ForeignKey, Boolean, DateTime
from sqlalchemy.sql import func

from ..database import Base


class ReviewerInviteToken(Base):
    __tablename__ = "reviewer_invite_tokens"

    id = Column(Integer, primary_key=True, index=True)
    token = Column(String(6), unique=True, nullable=False)
    call_id = Column(Integer, ForeignKey("calls.id"), nullable=False)
    is_used = Column(Boolean, nullable=False, default=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
