from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class PatientLogin(BaseModel):
    email: EmailStr
    password: str
    
class PatientCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    phone: str

class PatientUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None

class PatientInDB(BaseModel):
    id: str
    name: str
    email: str
    password_hash: str
    phone: str
    created_at: datetime

class PatientResponse(BaseModel):
    id: str
    name: str
    email: str
    phone: str
    created_at: datetime