from pydantic import BaseModel, ConfigDict


class DocumentDefinitionCreate(BaseModel):
    name: str
    allowed_formats: str


class DocumentDefinitionOut(BaseModel):
    id: int
    call_id: int
    name: str
    allowed_formats: str

    model_config = ConfigDict(from_attributes=True)
