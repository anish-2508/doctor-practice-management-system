from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, time

class DoctorLogin(BaseModel):
    email: str
    password: str

class DoctorCreate(BaseModel):
    name: str
    email: str
    password: str
    consultation_fee: int
    work_start_time: time
    work_end_time: time
    slot_duration_mins: int
    working_days: List[int]         # [0,1,2,3,4] Mon-Fri
    years_of_exp: int
    specialization: str             # single value from SPECIALIZATIONS
    qualifications: List[str]       # from QUALIFICATIONS list
    services: List[str]             # from SERVICES list
    bio: str

class DoctorUpdate(BaseModel):
    name: Optional[str] = None
    consultation_fee: Optional[int] = None
    work_start_time: Optional[time] = None
    work_end_time: Optional[time] = None
    slot_duration_mins: Optional[int] = None
    working_days: Optional[List[int]] = None
    years_of_exp: Optional[int] = None
    specialization: Optional[str] = None
    qualifications: Optional[List[str]] = None
    services: Optional[List[str]] = None
    bio: Optional[str] = None

class DoctorInDB(BaseModel):
    id: str
    name: str
    email: str
    password_hash: str
    consultation_fee: int
    work_start_time: time
    work_end_time: time
    slot_duration_mins: int
    working_days: List[int]
    years_of_exp: int
    specialization: str
    qualifications: List[str]
    services: List[str]
    bio: str
    created_at: Optional[datetime]

class DoctorResponse(BaseModel):
    id: str
    name: str
    email: str
    consultation_fee: int
    work_start_time: time
    work_end_time: time
    slot_duration_mins: int
    working_days: List[int]
    years_of_exp: int
    specialization: str
    qualifications: List[str]
    services: List[str]
    bio: str
    created_at: Optional[datetime]