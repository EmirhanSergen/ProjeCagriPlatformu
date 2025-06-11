from pydantic import BaseModel, ConfigDict


class ApplicationCreate(BaseModel):
    call_id: int
    content: str


class ApplicationOut(BaseModel):
    id: int
    user_id: int
    call_id: int
    content: str

    model_config = ConfigDict(from_attributes=True)
