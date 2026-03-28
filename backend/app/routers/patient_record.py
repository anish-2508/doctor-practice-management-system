from typing import List

from fastapi import APIRouter, Depends, File, Query, UploadFile, status
from fastapi.responses import FileResponse, Response

from app.db.mongo import get_db
from app.models.patient_record import (
    PatientRecordCreate,
    RecordAttachmentResponse,
    RecordAttachmentUploadResponse,
    PatientRecordResponse,
    PatientRecordUpdate,
)
from app.services.auth import get_current_active_doctor, get_current_active_patient
from app.services.patient_record import (
    create_patient_record,
    get_doctor_attachment_download,
    get_doctor_patient_record,
    get_doctor_prescription_download,
    get_patient_attachment_download,
    get_patient_record,
    get_patient_prescription_download,
    list_doctor_records,
    list_doctor_record_attachments,
    list_doctor_patient_records,
    list_patient_record_attachments,
    list_patient_records,
    upload_doctor_record_attachment,
    update_patient_record,
)

router = APIRouter(tags=["Patient Records"])


@router.post("/doctor/records", response_model=PatientRecordResponse, status_code=status.HTTP_201_CREATED)
async def create_doctor_patient_record(
    record_data: PatientRecordCreate,
    db=Depends(get_db),
    current_doctor=Depends(get_current_active_doctor),
):
    return await create_patient_record(db, record_data, current_doctor)


@router.put("/doctor/records/{record_id}", response_model=PatientRecordResponse)
async def update_doctor_patient_record(
    record_id: str,
    update_data: PatientRecordUpdate,
    db=Depends(get_db),
    current_doctor=Depends(get_current_active_doctor),
):
    return await update_patient_record(db, record_id, update_data, current_doctor)


@router.post(
    "/doctor/records/{record_id}/attachments",
    response_model=RecordAttachmentUploadResponse,
    status_code=status.HTTP_201_CREATED,
)
async def upload_doctor_attachment(
    record_id: str,
    file: UploadFile = File(...),
    db=Depends(get_db),
    current_doctor=Depends(get_current_active_doctor),
):
    return await upload_doctor_record_attachment(db, record_id, file, current_doctor)


@router.get("/doctor/records/{record_id}/attachments", response_model=List[RecordAttachmentResponse])
async def get_doctor_record_attachments(
    record_id: str,
    db=Depends(get_db),
    current_doctor=Depends(get_current_active_doctor),
):
    return await list_doctor_record_attachments(db, record_id, current_doctor)


@router.get("/patient/records/{record_id}/attachments", response_model=List[RecordAttachmentResponse])
async def get_patient_record_attachments(
    record_id: str,
    db=Depends(get_db),
    current_patient=Depends(get_current_active_patient),
):
    return await list_patient_record_attachments(db, record_id, current_patient)


@router.get("/doctor/records/{record_id}/attachments/{attachment_id}/download")
async def download_doctor_attachment(
    record_id: str,
    attachment_id: str,
    db=Depends(get_db),
    current_doctor=Depends(get_current_active_doctor),
):
    attachment, file_path = await get_doctor_attachment_download(
        db, record_id, attachment_id, current_doctor
    )
    return FileResponse(
        path=file_path,
        media_type=attachment.get("content_type") or "application/octet-stream",
        filename=attachment["file_name"],
    )


@router.get("/patient/records/{record_id}/attachments/{attachment_id}/download")
async def download_patient_attachment(
    record_id: str,
    attachment_id: str,
    db=Depends(get_db),
    current_patient=Depends(get_current_active_patient),
):
    attachment, file_path = await get_patient_attachment_download(
        db, record_id, attachment_id, current_patient
    )
    return FileResponse(
        path=file_path,
        media_type=attachment.get("content_type") or "application/octet-stream",
        filename=attachment["file_name"],
    )


@router.get("/doctor/records/{record_id}/prescription/download")
async def download_doctor_prescription(
    record_id: str,
    db=Depends(get_db),
    current_doctor=Depends(get_current_active_doctor),
):
    file_name, content = await get_doctor_prescription_download(db, record_id, current_doctor)
    return Response(
        content=content,
        media_type="text/plain; charset=utf-8",
        headers={"Content-Disposition": f'attachment; filename="{file_name}"'},
    )


@router.get("/patient/records/{record_id}/prescription/download")
async def download_patient_prescription(
    record_id: str,
    db=Depends(get_db),
    current_patient=Depends(get_current_active_patient),
):
    file_name, content = await get_patient_prescription_download(db, record_id, current_patient)
    return Response(
        content=content,
        media_type="text/plain; charset=utf-8",
        headers={"Content-Disposition": f'attachment; filename="{file_name}"'},
    )


@router.get("/doctor/records/{record_id}", response_model=PatientRecordResponse)
async def get_doctor_record(
    record_id: str,
    db=Depends(get_db),
    current_doctor=Depends(get_current_active_doctor),
):
    return await get_doctor_patient_record(db, record_id, current_doctor)


@router.get("/doctor/records", response_model=List[PatientRecordResponse])
async def get_all_doctor_records(
    patient_name: str | None = Query(default=None),
    month: str | None = Query(default=None),
    db=Depends(get_db),
    current_doctor=Depends(get_current_active_doctor),
):
    return await list_doctor_records(db, current_doctor, patient_name, month)


@router.get("/doctor/patients/{patient_id}/records", response_model=List[PatientRecordResponse])
async def get_doctor_patient_records(
    patient_id: str,
    db=Depends(get_db),
    current_doctor=Depends(get_current_active_doctor),
):
    return await list_doctor_patient_records(db, patient_id, current_doctor)


@router.get("/patient/records", response_model=List[PatientRecordResponse])
async def get_current_patient_records(
    doctor_name: str | None = Query(default=None),
    month: str | None = Query(default=None),
    db=Depends(get_db),
    current_patient=Depends(get_current_active_patient),
):
    return await list_patient_records(db, current_patient, doctor_name, month)


@router.get("/patient/records/{record_id}", response_model=PatientRecordResponse)
async def get_current_patient_record(
    record_id: str,
    db=Depends(get_db),
    current_patient=Depends(get_current_active_patient),
):
    return await get_patient_record(db, record_id, current_patient)
