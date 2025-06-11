from pydantic import BaseModel


class AttachmentOut(BaseModel):
    id: int
    application_id: int
    file_path: str

    class Config:
        orm_mode = True
