from sqlalchemy import Column, Integer, String, ForeignKey

from ..database import Base


class DocumentDefinition(Base):
    __tablename__ = "document_definitions"

    id = Column(Integer, primary_key=True, index=True)
    call_id = Column(Integer, ForeignKey("calls.id"), nullable=False)
    name = Column(String, nullable=False)
    allowed_formats = Column(String, nullable=False)
