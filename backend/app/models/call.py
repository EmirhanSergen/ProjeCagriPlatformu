from sqlalchemy import Column, Integer, String, Text, Boolean

from ..database import Base


class Call(Base):
    __tablename__ = "calls"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text)
    is_open = Column(Boolean, default=True)
