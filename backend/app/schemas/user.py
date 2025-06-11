from enum import Enum

from pydantic import BaseModel, EmailStr, ConfigDict

class UserRole(str, Enum):
    applicant = "applicant"
    reviewer = "reviewer"
    admin = "admin"

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    role: UserRole = UserRole.applicant

class UserLogin(BaseModel):
    email: EmailStr
    password: str
    role: UserRole

class UserOut(BaseModel):
    id: int
    email: EmailStr
    role: UserRole

    model_config = ConfigDict(from_attributes=True)
