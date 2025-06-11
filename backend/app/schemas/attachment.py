from pydantic import BaseModel


class AttachmentOut(BaseModel):
    id: int
    application_id: int
    file_path: str
    is_confirmed: bool

    class Config:
        orm_mode = True
