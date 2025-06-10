from enum import Enum as PyEnum

from sqlalchemy import Column, Integer, String, Enum

from ..database import Base


class UserRole(PyEnum):
    APPLICANT = "applicant"
    REVIEWER = "reviewer"
    ADMIN = "admin"

class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(
        Enum(UserRole, name="user_role"),
        nullable=False,
        default=UserRole.APPLICANT,
    )
