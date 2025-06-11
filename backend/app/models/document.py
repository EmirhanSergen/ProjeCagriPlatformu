from sqlalchemy import Column, Integer, String, ForeignKey, CheckConstraint

from ..database import Base


class DocumentDefinition(Base):
    __tablename__ = "document_definitions"
    __table_args__ = (
        CheckConstraint(
            "allowed_formats in ('pdf','image','text')",
            name="ck_allowed_formats",
        ),
    )

    id = Column(Integer, primary_key=True, index=True)
    call_id = Column(Integer, ForeignKey("calls.id"), nullable=False)
    name = Column(String, nullable=False)
    description = Column(String)
    allowed_formats = Column(String, nullable=False)
