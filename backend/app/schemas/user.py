from enum import Enum
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, ConfigDict

# User roles used for access control
class UserRole(str, Enum):
    applicant = "applicant"
    reviewer = "reviewer"
    admin = "admin"

# Shared fields for all user schemas
class UserBase(BaseModel):
    email: EmailStr
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    organization: Optional[str] = None

# Schema for registering a new user
class UserCreate(UserBase):
    password: str
    role: UserRole = UserRole.applicant

# Schema for login
class UserLogin(BaseModel):
    email: EmailStr
    password: str
    role: UserRole

# Schema for updating a user's profile
class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    organization: Optional[str] = None

# Full user info schema for API responses
class UserOut(UserBase):
    id: int
    role: UserRole
    is_active: bool
    is_verified: bool
    last_login: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

# Schema for initiating password reset
class PasswordReset(BaseModel):
    email: EmailStr

# Schema for confirming password reset
class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str
