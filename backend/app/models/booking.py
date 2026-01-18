from pydantic import BaseModel
from datetime import datetime

# Input from public booking form
class BookingCreate(BaseModel):
    slot_id: str
    patient_name: str
    patient_contact: str   # phone or email

# Internal DB representation
class BookingInDB(BaseModel):
    id: str
    slot_id: str
    doctor_id: str
    patient_name: str
    patient_contact: str
    status: str         # "pending", "approved", "rejected"
    booked_at: datetime

# Response sent to client / doctor
class BookingResponse(BaseModel):
    id: str
    slot_id: str
    patient_name: str
    status: str
    booked_at: datetime
    
