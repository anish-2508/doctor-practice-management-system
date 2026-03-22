# Booking models
from pydantic import BaseModel
from datetime import datetime

# Input model from patient booking form
class BookingCreate(BaseModel):
    slot_id: str

# Internal database representation of a booking
class BookingInDB(BaseModel):
    id: str
    slot_id: str
    doctor_id: str
    patient_name: str
    patient_contact: str
    status: str         # "pending", "approved", "rejected"
    booked_at: datetime
    patient_id: str

# Response model sent to client or doctor
class BookingResponse(BaseModel):
    id: str
    slot_id: str
    patient_name: str
    status: str
    booked_at: datetime
    patient_id: str
    
