from enum import Enum

from pydantic import BaseModel, EmailStr

class UserRole(str, Enum):
    applicant = "applicant"
    reviewer = "reviewer"
    admin = "admin"

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    role: UserRole = UserRole.applicant

class UserOut(BaseModel):
    id: int
    email: EmailStr
    role: UserRole

    class Config:
        orm_mode = True
