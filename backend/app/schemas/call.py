from datetime import datetime
from typing import Literal
from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator
from ..models.call import CallStatus

# Base schema for both create and update operations
class CallBase(BaseModel):
    title: str = Field(..., min_length=3, max_length=200)
    description: str | None = None
    is_open: bool | None = True
    category: str | None = Field(None, max_length=50)
    max_applications: int | None = Field(None, gt=0)
    start_date: datetime | None = None
    end_date: datetime | None = None

    # Ensure that end_date is after start_date
    @model_validator(mode='after')
    def validate_dates(self) -> 'CallBase':
        if self.start_date and self.end_date and self.end_date <= self.start_date:
            raise ValueError('end_date must be after start_date')
        return self

# Schema for creating a call
class CallCreate(CallBase):
    status: Literal[CallStatus.DRAFT, CallStatus.PUBLISHED] = CallStatus.DRAFT

# Schema for updating a call
class CallUpdate(CallBase):
    title: str | None = Field(None, min_length=3, max_length=200)
    status: CallStatus | None = None

# Output schema for returning call details
class CallOut(CallBase):
    id: int
    status: CallStatus
    created_at: datetime
    updated_at: datetime
    is_active: bool

    model_config = ConfigDict(from_attributes=True)
