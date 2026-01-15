from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class SlotCreate(BaseModel):
    start_time: datetime
    end_time: datetime

class SlotInDB(BaseModel):
    id: str
    doctor_id: str
    start_time: datetime
    end_time: datetime
    is_booked: bool
    booked_by: Optional[str]
    created_at: datetime

class SlotResponse(BaseModel):
    id: str
    start_time: datetime
    end_time: datetime
    is_booked: bool
