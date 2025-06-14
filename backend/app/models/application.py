from sqlalchemy import Column, Integer, Text, ForeignKey, Boolean, DateTime, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from enum import Enum as PyEnum

from ..database import Base

# Application status enum
class ApplicationStatus(str, PyEnum):
    DRAFT = "draft"
    SUBMITTED = "submitted"
    CANCELLED = "cancelled"

# Represents a project application submitted by a user for a specific call
class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    
    # Foreign keys
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    call_id = Column(Integer, ForeignKey("calls.id"), nullable=False)

    # Application content
    content = Column(Text, nullable=False)
    documents_confirmed = Column(Boolean, default=False)
    status = Column(Enum(ApplicationStatus), nullable=False, default=ApplicationStatus.DRAFT)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    user = relationship("User", backref="applications")
    call = relationship("Call", backref="applications")
    attachments = relationship("Attachment", backref="application", cascade="all, delete-orphan")
    review_assignments = relationship("ApplicationReviewer", back_populates="application", cascade="all, delete-orphan")
