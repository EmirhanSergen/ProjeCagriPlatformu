from enum import Enum as PyEnum
from sqlalchemy import Column, Integer, String, ForeignKey, Enum
from ..database import Base

class DocumentFormat(str, PyEnum):
    pdf = "pdf"
    image = "image"
    text = "text"

class DocumentDefinition(Base):
    __tablename__ = "document_definitions"

    id = Column(Integer, primary_key=True, index=True)
    call_id = Column(Integer, ForeignKey("calls.id"), nullable=False)
    name = Column(String, nullable=False)
    description = Column(String)
    allowed_formats = Column(Enum(DocumentFormat), nullable=False)
