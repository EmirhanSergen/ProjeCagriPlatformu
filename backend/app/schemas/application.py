from pydantic import BaseModel, ConfigDict
from .attachment import AttachmentOut


class ApplicationCreate(BaseModel):
    call_id: int
    content: str


class ApplicationOut(BaseModel):
    id: int
    user_id: int
    call_id: int
    content: str

    model_config = ConfigDict(from_attributes=True)


class ApplicationDetail(BaseModel):
    id: int
    user_id: int
    call_id: int
    content: str
    documents_confirmed: bool
    user_email: str
    attachments: list[AttachmentOut]

    model_config = ConfigDict(from_attributes=True)
