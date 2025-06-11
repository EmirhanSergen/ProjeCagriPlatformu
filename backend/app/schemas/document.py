from enum import Enum

from pydantic import BaseModel, ConfigDict


class DocumentFormat(str, Enum):
    pdf = "pdf"
    image = "image"
    text = "text"


class DocumentDefinitionCreate(BaseModel):
    name: str
    description: str | None = None
    allowed_formats: DocumentFormat


class DocumentDefinitionUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    allowed_formats: DocumentFormat | None = None


class DocumentDefinitionOut(BaseModel):
    id: int
    call_id: int
    name: str
    description: str | None = None
    allowed_formats: DocumentFormat

    model_config = ConfigDict(from_attributes=True)
