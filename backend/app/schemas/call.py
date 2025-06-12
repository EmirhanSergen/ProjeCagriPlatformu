from datetime import datetime
from typing import Literal
from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator
from ..models.call import CallStatus


class CallBase(BaseModel):
    title: str = Field(..., min_length=3, max_length=200)
    description: str | None = None
    is_open: bool | None = True
    category: str | None = Field(None, max_length=50)
    max_applications: int | None = Field(None, gt=0)
    start_date: datetime | None = None
    end_date: datetime | None = None

    @model_validator(mode='after')
    def validate_dates(self) -> 'CallBase':
        if self.start_date and self.end_date and self.end_date <= self.start_date:
            raise ValueError('end_date must be after start_date')
        return self


class CallCreate(CallBase):
    status: Literal[CallStatus.DRAFT, CallStatus.PUBLISHED] = CallStatus.DRAFT


class CallUpdate(CallBase):
    title: str | None = Field(None, min_length=3, max_length=200)
    status: CallStatus | None = None


class CallOut(CallBase):
    id: int
    status: CallStatus
    created_at: datetime
    updated_at: datetime
    is_active: bool

    model_config = ConfigDict(from_attributes=True)
