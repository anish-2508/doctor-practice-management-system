# Slot models
from pydantic import BaseModel
from datetime import datetime
from typing import Optional

# Input model for creating a new slot
class SlotCreate(BaseModel):
    start_time: datetime
    end_time: datetime

# Internal database representation of a slot
class SlotInDB(BaseModel):
    id: str
    doctor_id: str
    start_time: datetime
    end_time: datetime
    is_booked: bool
    booked_by: Optional[str]
    created_at: datetime

# Response model sent to client
class SlotResponse(BaseModel):
    id: str
    start_time: datetime
    end_time: datetime
    is_booked: bool
