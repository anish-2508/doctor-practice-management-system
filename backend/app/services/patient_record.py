from datetime import date, datetime, time
from pathlib import Path
import re

from bson import ObjectId
from fastapi import HTTPException, UploadFile

from app.models.patient_record import (
    PatientRecordCreate,
    PRESCRIPTION_TABLE_COLUMNS,
    RecordAttachmentResponse,
    RecordAttachmentUploadResponse,
    PatientRecordResponse,
    PatientRecordUpdate,
)

MAX_ATTACHMENT_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB
RECORD_ATTACHMENTS_ROOT = Path(__file__).resolve().parents[2] / "storage" / "patient_records"


def _parse_object_id(value: str, field_name: str) -> ObjectId:
    if not ObjectId.is_valid(value):
        raise HTTPException(status_code=400, detail=f"Invalid {field_name}")
    return ObjectId(value)


def _to_attachment_response(attachment: dict) -> RecordAttachmentResponse:
    return RecordAttachmentResponse(
        id=attachment["id"],
        kind=attachment["kind"],
        file_name=attachment["file_name"],
        content_type=attachment.get("content_type"),
        file_size=attachment["file_size"],
        uploaded_at=attachment["uploaded_at"],
    )


def _empty_prescription_row() -> dict:
    return {column: "" for column in PRESCRIPTION_TABLE_COLUMNS}


def _normalize_prescription_table(rows) -> list[dict]:
    if not rows:
        return []

    normalized_rows = []
    for row in rows:
        row_dict = row.model_dump() if hasattr(row, "model_dump") else dict(row)
        normalized_row = {}
        for column in PRESCRIPTION_TABLE_COLUMNS:
            value = row_dict.get(column, "")
            normalized_row[column] = str(value).strip() if value is not None else ""
        normalized_rows.append(normalized_row)
    return normalized_rows


def _resolve_prescription_table(record: dict) -> list[dict]:
    if record.get("prescription_table") is not None:
        return _normalize_prescription_table(record.get("prescription_table"))

    # Backward compatibility for old records that only had plain-text prescription.
    legacy_prescription = str(record.get("prescription") or "").strip()
    if not legacy_prescription:
        return []

    row = _empty_prescription_row()
    row["instructions"] = legacy_prescription
    return [row]


def _to_patient_record_response(record: dict) -> PatientRecordResponse:
    attachments = [_to_attachment_response(item) for item in record.get("attachments", [])]
    return PatientRecordResponse(
        id=str(record["_id"]),
        booking_id=record["booking_id"],
        patient_id=record["patient_id"],
        patient_name=record["patient_name"],
        doctor_id=record["doctor_id"],
        doctor_name=record["doctor_name"],
        visit_date=record["visit_date"],
        chief_complaint=record["chief_complaint"],
        symptoms=record.get("symptoms"),
        diagnosis=record["diagnosis"],
        prescription_table=_resolve_prescription_table(record),
        notes=record.get("notes"),
        follow_up_date=record.get("follow_up_date"),
        attachments=attachments,
        prescription_attachment_id=record.get("prescription_attachment_id"),
        created_at=record["created_at"],
        updated_at=record["updated_at"],
    )


def _normalize_follow_up_date(value):
    if isinstance(value, date) and not isinstance(value, datetime):
        return datetime.combine(value, time.min)
    return value


def _build_month_range(month: str):
    match = re.match(r"^(\d{4})-(0[1-9]|1[0-2])$", month or "")
    if not match:
        raise HTTPException(status_code=400, detail="Invalid month format. Use YYYY-MM")

    year = int(match.group(1))
    month_num = int(match.group(2))
    start = datetime(year, month_num, 1)
    if month_num == 12:
        end = datetime(year + 1, 1, 1)
    else:
        end = datetime(year, month_num + 1, 1)
    return start, end


def _sanitize_filename(file_name: str) -> str:
    candidate = Path(file_name).name.strip()
    if not candidate:
        return "file"
    return re.sub(r"[^a-zA-Z0-9._-]", "_", candidate)


def _display_text(value) -> str:
    if value is None:
        return "Not provided"
    text = str(value).strip()
    return text if text else "Not provided"


def _format_date(value) -> str:
    if value is None:
        return "Not provided"
    if isinstance(value, datetime):
        return value.strftime("%a, %d %b %Y")
    if isinstance(value, date):
        return value.strftime("%a, %d %b %Y")
    return _display_text(value)


def _display_cell(value) -> str:
    text = str(value).strip() if value is not None else ""
    return text if text else "-"


def _build_prescription_download(record: dict):
    patient_slug = _sanitize_filename(record.get("patient_name", "patient")).replace(".", "_")
    visit_date = record.get("visit_date")
    date_slug = (
        visit_date.strftime("%Y%m%d")
        if isinstance(visit_date, (datetime, date))
        else datetime.utcnow().strftime("%Y%m%d")
    )
    file_name = f"prescription_{patient_slug}_{date_slug}.txt"
    prescription_rows = _resolve_prescription_table(record)
    table_labels = [
        ("medicine", "Medicine"),
        ("type", "Type"),
        ("strength", "Strength"),
        ("dose", "Dose"),
        ("frequency", "Frequency"),
        ("when", "When"),
        ("duration", "Duration"),
        ("instructions", "Instructions"),
    ]
    table_lines = [" | ".join(label for _, label in table_labels)]
    if prescription_rows:
        for row in prescription_rows:
            table_lines.append(
                " | ".join(_display_cell(row.get(column)) for column, _ in table_labels)
            )
    else:
        table_lines.append("-")

    content = "\n".join(
        [
            "WellBook Prescription",
            "",
            f"Doctor: {_display_text(record.get('doctor_name'))}",
            f"Patient: {_display_text(record.get('patient_name'))}",
            f"Visit Date: {_format_date(record.get('visit_date'))}",
            "",
            f"Chief Complaint: {_display_text(record.get('chief_complaint'))}",
            f"Symptoms: {_display_text(record.get('symptoms'))}",
            f"Diagnosis: {_display_text(record.get('diagnosis'))}",
            "",
            "Prescription Table:",
            *table_lines,
            f"Notes: {_display_text(record.get('notes'))}",
            f"Follow-up Date: {_format_date(record.get('follow_up_date'))}",
            "",
            f"Generated At: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')} UTC",
        ]
    )
    return file_name, content.encode("utf-8")


def _record_storage_dir(record_id: str) -> Path:
    return RECORD_ATTACHMENTS_ROOT / record_id


def _resolve_attachment_path(storage_key: str) -> Path:
    abs_root = RECORD_ATTACHMENTS_ROOT.resolve()
    resolved = (RECORD_ATTACHMENTS_ROOT / storage_key).resolve()
    if not resolved.is_relative_to(abs_root):
        raise HTTPException(status_code=500, detail="Invalid attachment path")
    return resolved


def _find_attachment(record: dict, attachment_id: str) -> dict:
    for attachment in record.get("attachments", []):
        if attachment.get("id") == attachment_id:
            return attachment
    raise HTTPException(status_code=404, detail="Attachment not found")


async def _get_doctor_owned_record(db, record_id: str, current_doctor: dict):
    doctor_id = str(current_doctor["_id"])
    record = await db.patient_records.find_one({"_id": _parse_object_id(record_id, "record_id")})

    if not record:
        raise HTTPException(status_code=404, detail="Patient record not found")
    if record["doctor_id"] != doctor_id:
        raise HTTPException(status_code=403, detail="Not authorized to access this patient record")
    return record


async def _get_patient_owned_record(db, record_id: str, current_patient: dict):
    patient_id = str(current_patient["_id"])
    record = await db.patient_records.find_one({"_id": _parse_object_id(record_id, "record_id")})

    if not record:
        raise HTTPException(status_code=404, detail="Patient record not found")
    if record["patient_id"] != patient_id:
        raise HTTPException(status_code=403, detail="Not authorized to access this patient record")
    return record


async def create_patient_record(db, record_data: PatientRecordCreate, current_doctor: dict):
    doctor_id = str(current_doctor["_id"])
    booking = await db.bookings.find_one({"_id": _parse_object_id(record_data.booking_id, "booking_id")})

    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    if booking["doctor_id"] != doctor_id:
        raise HTTPException(status_code=403, detail="Not authorized to create a record for this booking")
    if booking["status"] != "approved":
        raise HTTPException(status_code=400, detail="Records can only be created for approved bookings")

    existing_record = await db.patient_records.find_one({"booking_id": str(booking["_id"])})
    if existing_record:
        raise HTTPException(status_code=400, detail="A patient record already exists for this booking")

    slot = await db.slots.find_one({"_id": _parse_object_id(booking["slot_id"], "slot_id")})
    if not slot:
        raise HTTPException(status_code=404, detail="Slot not found")

    now = datetime.utcnow()
    prescription_table = _normalize_prescription_table(record_data.prescription_table)
    record_doc = {
        "booking_id": str(booking["_id"]),
        "patient_id": booking["patient_id"],
        "patient_name": booking["patient_name"],
        "doctor_id": doctor_id,
        "doctor_name": current_doctor["name"],
        "visit_date": slot["start_time"],
        "chief_complaint": record_data.chief_complaint,
        "symptoms": record_data.symptoms,
        "diagnosis": record_data.diagnosis,
        "prescription_table": prescription_table,
        "notes": record_data.notes,
        "follow_up_date": _normalize_follow_up_date(record_data.follow_up_date),
        "attachments": [],
        "prescription_attachment_id": None,
        "created_at": now,
        "updated_at": now,
    }

    result = await db.patient_records.insert_one(record_doc)
    record_doc["_id"] = result.inserted_id
    return _to_patient_record_response(record_doc)


async def update_patient_record(db, record_id: str, update_data: PatientRecordUpdate, current_doctor: dict):
    doctor_id = str(current_doctor["_id"])
    record = await db.patient_records.find_one({"_id": _parse_object_id(record_id, "record_id")})

    if not record:
        raise HTTPException(status_code=404, detail="Patient record not found")
    if record["doctor_id"] != doctor_id:
        raise HTTPException(status_code=403, detail="Not authorized to update this patient record")

    updates = {
        "prescription_table": _normalize_prescription_table(update_data.prescription_table),
    }
    for field in ("chief_complaint", "symptoms", "diagnosis", "notes", "follow_up_date"):
        value = getattr(update_data, field)
        if value is not None:
            updates[field] = _normalize_follow_up_date(value) if field == "follow_up_date" else value

    updates["updated_at"] = datetime.utcnow()

    await db.patient_records.update_one(
        {"_id": record["_id"]},
        {"$set": updates},
    )

    updated_record = await db.patient_records.find_one({"_id": record["_id"]})
    return _to_patient_record_response(updated_record)


async def upload_doctor_record_attachment(
    db,
    record_id: str,
    file: UploadFile,
    current_doctor: dict,
):
    record = await _get_doctor_owned_record(db, record_id, current_doctor)

    if not file.filename:
        raise HTTPException(status_code=400, detail="Missing file name")

    file_bytes = await file.read()
    if not file_bytes:
        raise HTTPException(status_code=400, detail="File is empty")
    if len(file_bytes) > MAX_ATTACHMENT_SIZE_BYTES:
        raise HTTPException(status_code=400, detail="File exceeds 10 MB limit")

    attachment_id = str(ObjectId())
    safe_file_name = _sanitize_filename(file.filename)
    stored_file_name = f"{attachment_id}_{safe_file_name}"
    storage_key = f"{record_id}/{stored_file_name}"
    file_dir = _record_storage_dir(record_id)
    file_dir.mkdir(parents=True, exist_ok=True)
    file_path = file_dir / stored_file_name

    with file_path.open("wb") as f:
        f.write(file_bytes)

    uploaded_at = datetime.utcnow()
    attachment_doc = {
        "id": attachment_id,
        "kind": "attachment",
        "file_name": safe_file_name,
        "content_type": file.content_type,
        "file_size": len(file_bytes),
        "uploaded_at": uploaded_at,
        "storage_key": storage_key,
    }

    await db.patient_records.update_one(
        {"_id": record["_id"]},
        {"$push": {"attachments": attachment_doc}, "$set": {"updated_at": datetime.utcnow()}},
    )

    return RecordAttachmentUploadResponse(
        attachment=_to_attachment_response(attachment_doc),
        prescription_attachment_id=record.get("prescription_attachment_id"),
    )


async def list_doctor_record_attachments(db, record_id: str, current_doctor: dict):
    record = await _get_doctor_owned_record(db, record_id, current_doctor)
    return [_to_attachment_response(item) for item in record.get("attachments", [])]


async def list_patient_record_attachments(db, record_id: str, current_patient: dict):
    record = await _get_patient_owned_record(db, record_id, current_patient)
    return [_to_attachment_response(item) for item in record.get("attachments", [])]


async def get_doctor_attachment_download(db, record_id: str, attachment_id: str, current_doctor: dict):
    record = await _get_doctor_owned_record(db, record_id, current_doctor)
    attachment = _find_attachment(record, attachment_id)
    file_path = _resolve_attachment_path(attachment["storage_key"])
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Attachment file not found")
    return attachment, file_path


async def get_patient_attachment_download(db, record_id: str, attachment_id: str, current_patient: dict):
    record = await _get_patient_owned_record(db, record_id, current_patient)
    attachment = _find_attachment(record, attachment_id)
    file_path = _resolve_attachment_path(attachment["storage_key"])
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Attachment file not found")
    return attachment, file_path


async def get_doctor_prescription_download(db, record_id: str, current_doctor: dict):
    record = await _get_doctor_owned_record(db, record_id, current_doctor)
    return _build_prescription_download(record)


async def get_patient_prescription_download(db, record_id: str, current_patient: dict):
    record = await _get_patient_owned_record(db, record_id, current_patient)
    return _build_prescription_download(record)


async def get_doctor_patient_record(db, record_id: str, current_doctor: dict):
    record = await _get_doctor_owned_record(db, record_id, current_doctor)
    return _to_patient_record_response(record)


async def list_doctor_patient_records(db, patient_id: str, current_doctor: dict):
    doctor_id = str(current_doctor["_id"])
    cursor = db.patient_records.find(
        {
            "doctor_id": doctor_id,
            "patient_id": patient_id,
        }
    ).sort("visit_date", -1)

    records = []
    async for record in cursor:
        records.append(_to_patient_record_response(record))
    return records


async def list_doctor_records(
    db,
    current_doctor: dict,
    patient_name: str | None = None,
    month: str | None = None,
):
    doctor_id = str(current_doctor["_id"])
    query = {"doctor_id": doctor_id}

    if patient_name and patient_name.strip():
        query["patient_name"] = {"$regex": re.escape(patient_name.strip()), "$options": "i"}

    if month:
        start, end = _build_month_range(month)
        query["visit_date"] = {"$gte": start, "$lt": end}

    cursor = db.patient_records.find(query).sort("visit_date", -1)
    records = []
    async for record in cursor:
        records.append(_to_patient_record_response(record))
    return records


async def get_patient_record(db, record_id: str, current_patient: dict):
    record = await _get_patient_owned_record(db, record_id, current_patient)
    return _to_patient_record_response(record)


async def list_patient_records(
    db,
    current_patient: dict,
    doctor_name: str | None = None,
    month: str | None = None,
):
    patient_id = str(current_patient["_id"])
    query = {"patient_id": patient_id}

    if doctor_name and doctor_name.strip():
        query["doctor_name"] = {"$regex": re.escape(doctor_name.strip()), "$options": "i"}

    if month:
        start, end = _build_month_range(month)
        query["visit_date"] = {"$gte": start, "$lt": end}

    cursor = db.patient_records.find(query).sort("visit_date", -1)

    records = []
    async for record in cursor:
        records.append(_to_patient_record_response(record))
    return records
