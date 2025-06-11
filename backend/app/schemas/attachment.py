from pydantic import BaseModel, ConfigDict


class AttachmentOut(BaseModel):
    id: int
    application_id: int
    file_path: str
    is_confirmed: bool

    model_config = ConfigDict(from_attributes=True)
