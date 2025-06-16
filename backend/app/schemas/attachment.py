from pydantic import BaseModel, ConfigDict


class AttachmentCreate(BaseModel):
    application_id: int
    document_id: int | None = None
    file_name: str
    data: bytes
    is_confirmed: bool = False


# Schema for returning an attachment record
class AttachmentOut(BaseModel):
    id: int
    application_id: int
    document_id: int | None
    file_name: str
    is_confirmed: bool

    model_config = ConfigDict(from_attributes=True)
