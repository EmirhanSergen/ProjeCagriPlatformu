from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import relationship

from ..database import Base

class CallReviewer(Base):
    __tablename__ = "call_reviewers"

    id = Column(Integer, primary_key=True)
    call_id = Column(Integer, ForeignKey("calls.id"), nullable=False)
    reviewer_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    call = relationship("Call", backref="reviewers")
    reviewer = relationship("User", backref="review_calls")
