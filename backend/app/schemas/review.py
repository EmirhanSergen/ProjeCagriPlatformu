from datetime import datetime
from pydantic import BaseModel, ConfigDict

class ReviewCreate(BaseModel):
    application_id: int
    score: int
    comment: str | None = None

class ReviewOut(BaseModel):
    id: int
    application_id: int
    reviewer_id: int
    score: int
    comment: str | None
    submitted_at: datetime

    model_config = ConfigDict(from_attributes=True)
