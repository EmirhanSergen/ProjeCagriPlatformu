from pydantic import BaseModel, ConfigDict
from .attachment import AttachmentOut
from .user import UserOut
from datetime import datetime


# Schema for creating a new application
class ApplicationCreate(BaseModel):
    call_id: int   # ID of the call being applied to
    content: str   # Application content written by the user

# Basic schema for returning application info
class ApplicationOut(BaseModel):
    id: int
    user_id: int
    call_id: int
    content: str
    documents_confirmed: bool
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

 

class ReviewerShort(BaseModel):
    id: int
    name: str  # veya email
    model_config = ConfigDict(from_attributes=True)

# Detailed schema for one application with user and attachment info
class ApplicationDetail(BaseModel):
    id: int
    user_id: int
    call_id: int
    content: str
    status: str
    documents_confirmed: bool   # Whether the user confirmed their documents
    user: UserOut
    created_at: datetime
    attachments: list[AttachmentOut]  # List of uploaded documents
    reviewers: list[ReviewerShort]

    model_config = ConfigDict(from_attributes=True)
