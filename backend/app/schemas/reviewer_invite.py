from datetime import datetime
from pydantic import BaseModel, ConfigDict

class ReviewerInviteCreate(BaseModel):
    call_id: int
    expiration_hours: int | None = None

class ReviewerInviteTokenOut(BaseModel):
    id: int
    call_id: int
    token: str
    expires_at: datetime
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
