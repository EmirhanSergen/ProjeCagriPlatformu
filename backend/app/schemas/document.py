from enum import Enum

from pydantic import BaseModel, ConfigDict
from enum import Enum as PyEnum

# Allowed document formats
class DocumentFormat(str, Enum):
    pdf = "pdf"
    image = "image"
    text = "text"

class DocumentDefinitionCreate(BaseModel):
    name: str
    description: str | None = None
    allowed_formats: DocumentFormat

# Schema for updating a document definition
class DocumentDefinitionUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    allowed_formats: DocumentFormat | None = None

# Output schema for a document definition
class DocumentDefinitionOut(BaseModel):
    id: int
    call_id: int
    name: str
    description: str | None = None
    allowed_formats: DocumentFormat

    model_config = ConfigDict(from_attributes=True)
