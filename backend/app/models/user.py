from enum import Enum as PyEnum

from sqlalchemy import Column, Integer, String, Enum, Boolean, DateTime, func
from datetime import datetime, timedelta

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
    
    # Personal information
    first_name = Column(String(50))
    last_name = Column(String(50))
    organization = Column(String(100))
    
    # Account status
    is_active = Column(Boolean, nullable=False, default=True)
    is_verified = Column(Boolean, nullable=False, default=False)
    verification_token = Column(String)
    password_reset_token = Column(String)
    password_reset_expires = Column(DateTime(timezone=True))
    
    # Security tracking
    last_login = Column(DateTime(timezone=True))
    login_attempts = Column(Integer, nullable=False, default=0)
    locked_until = Column(DateTime(timezone=True))
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())
