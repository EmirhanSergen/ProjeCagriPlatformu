from pydantic import BaseModel, ConfigDict


class CallCreate(BaseModel):
    title: str
    description: str | None = None
    is_open: bool | None = True


class CallOut(BaseModel):
    id: int
    title: str
    description: str | None = None
    is_open: bool

    model_config = ConfigDict(from_attributes=True)
