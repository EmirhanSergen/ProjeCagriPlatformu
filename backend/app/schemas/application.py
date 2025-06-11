from pydantic import BaseModel


class ApplicationCreate(BaseModel):
    call_id: int
    content: str


class ApplicationOut(BaseModel):
    id: int
    user_id: int
    call_id: int
    content: str

    class Config:
        orm_mode = True
