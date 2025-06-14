from sqlalchemy import Column, Integer, String, ForeignKey, Boolean, DateTime, LargeBinary
from sqlalchemy.sql import func
from ..database import Base


class Attachment(Base):
    __tablename__ = "attachments"

    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, ForeignKey("applications.id"), nullable=False)
    document_id = Column(Integer, ForeignKey("document_definitions.id"), nullable=True)
    file_name = Column(String, nullable=False)
    data = Column(LargeBinary, nullable=False)
    is_confirmed = Column(Boolean, default=False)

    # Timestamp fields
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
