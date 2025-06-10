from pydantic import BaseModel


class CallCreate(BaseModel):
    title: str
    description: str | None = None
    is_open: bool | None = True


class CallOut(BaseModel):
    id: int
    title: str
    description: str | None = None
    is_open: bool

    class Config:
        orm_mode = True
