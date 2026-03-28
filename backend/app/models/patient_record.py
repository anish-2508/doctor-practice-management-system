from datetime import date, datetime
from typing import Optional, List

from pydantic import BaseModel, Field

PRESCRIPTION_TABLE_COLUMNS = [
    "medicine",
    "type",
    "strength",
    "dose",
    "frequency",
    "when",
    "duration",
    "instructions",
]


class RecordAttachmentResponse(BaseModel):
    id: str
    kind: str
    file_name: str
    content_type: Optional[str] = None
    file_size: int
    uploaded_at: datetime


class RecordAttachmentUploadResponse(BaseModel):
    attachment: RecordAttachmentResponse
    prescription_attachment_id: Optional[str] = None


class PrescriptionTableRow(BaseModel):
    medicine: str = ""
    type: str = ""
    strength: str = ""
    dose: str = ""
    frequency: str = ""
    when: str = ""
    duration: str = ""
    instructions: str = ""


class PatientRecordCreate(BaseModel):
    booking_id: str
    chief_complaint: str
    symptoms: Optional[str] = None
    diagnosis: str
    prescription_table: List[PrescriptionTableRow]
    notes: Optional[str] = None
    follow_up_date: Optional[date] = None


class PatientRecordUpdate(BaseModel):
    chief_complaint: Optional[str] = None
    symptoms: Optional[str] = None
    diagnosis: Optional[str] = None
    prescription_table: List[PrescriptionTableRow]
    notes: Optional[str] = None
    follow_up_date: Optional[date] = None


class PatientRecordResponse(BaseModel):
    id: str
    booking_id: str
    patient_id: str
    patient_name: str
    doctor_id: str
    doctor_name: str
    visit_date: datetime
    chief_complaint: str
    symptoms: Optional[str] = None
    diagnosis: str
    prescription_table: List[PrescriptionTableRow]
    notes: Optional[str] = None
    follow_up_date: Optional[date] = None
    attachments: List[RecordAttachmentResponse] = Field(default_factory=list)
    prescription_attachment_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime
