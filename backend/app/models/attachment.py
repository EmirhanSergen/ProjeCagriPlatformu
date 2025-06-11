from sqlalchemy import Column, Integer, String, ForeignKey

from ..database import Base


class Attachment(Base):
    __tablename__ = "attachments"

    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, ForeignKey("applications.id"), nullable=False)
    file_path = Column(String, nullable=False)
