from sqlalchemy import Column, Integer, Text, ForeignKey, Boolean

from ..database import Base


class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    call_id = Column(Integer, ForeignKey("calls.id"), nullable=False)
    content = Column(Text, nullable=False)
    documents_confirmed = Column(Boolean, default=False)
