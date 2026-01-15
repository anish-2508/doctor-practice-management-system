from pydantic import BaseModel
from typing import Optional
from datetime import datetime

# Input from client when registering
class DoctorCreate(BaseModel):
    name: str
    email: str
    password: str
    consultation_fee: int

# Internal DB representation
class DoctorInDB(BaseModel):
    id: str
    name: str
    email: str
    password_hash: str
    consultation_fee: int
    created_at: Optional[datetime]

# Output to client
class DoctorResponse(BaseModel):
    id: str
    name: str
    email: str
    consultation_fee: int
    created_at: Optional[datetime]
