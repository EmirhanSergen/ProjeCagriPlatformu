from pydantic import BaseModel, ConfigDict


class AttachmentCreate(BaseModel):
    application_id: int
    file_path: str
    is_confirmed: bool = False


# Schema for returning an attachment record
class AttachmentOut(BaseModel):
    id: int
    application_id: int
    file_path: str
    is_confirmed: bool

    model_config = ConfigDict(from_attributes=True)
