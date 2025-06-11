from sqlalchemy import Column, Integer, String, ForeignKey, Boolean

from ..database import Base


class Attachment(Base):
    __tablename__ = "attachments"

    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, ForeignKey("applications.id"), nullable=False)
    document_id = Column(Integer, ForeignKey("document_definitions.id"), nullable=True)
    file_path = Column(String, nullable=False)
    is_confirmed = Column(Boolean, default=False)
