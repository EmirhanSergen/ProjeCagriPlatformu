from pydantic import BaseModel, ConfigDict


class DocumentDefinitionCreate(BaseModel):
    name: str
    description: str | None = None
    allowed_formats: str


class DocumentDefinitionUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    allowed_formats: str | None = None


class DocumentDefinitionOut(BaseModel):
    id: int
    call_id: int
    name: str
    description: str | None = None
    allowed_formats: str

    model_config = ConfigDict(from_attributes=True)
