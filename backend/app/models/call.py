from datetime import datetime
from enum import Enum as PyEnum
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, Enum, CheckConstraint
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from datetime import datetime, timezone


from ..database import Base


class CallStatus(str, PyEnum):
    DRAFT = 'DRAFT'
    PUBLISHED = 'PUBLISHED'
    CLOSED = 'CLOSED'
    ARCHIVED = 'ARCHIVED'


class Call(Base):
    __tablename__ = "calls"
    __table_args__ = (
        CheckConstraint(
            'end_date IS NULL OR start_date IS NULL OR end_date > start_date',
            name='valid_dates'
        ),
    )

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text)
    is_open = Column(Boolean, default=True)
    status = Column(Enum(CallStatus), nullable=False, default=CallStatus.DRAFT)
    start_date = Column(DateTime(timezone=True), nullable=True)
    end_date = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    category = Column(String(50), nullable=True)
    max_applications = Column(Integer, nullable=True)

    # Relationship to document definitions (one-to-many)
    document_definitions = relationship("DocumentDefinition", backref="call", cascade="all, delete-orphan")

    @property
    def is_active(self) -> bool:
        """Return whether the call is currently active based on dates and status."""
        now = datetime.now(timezone.utc)
        return (
            self.status == CallStatus.PUBLISHED
            and (self.start_date is None or self.start_date <= now)
            and (self.end_date is None or now <= self.end_date)
        )
