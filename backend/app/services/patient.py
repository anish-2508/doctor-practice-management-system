from datetime import datetime
from bson import ObjectId
from fastapi import HTTPException
from app.models.patient import PatientCreate, PatientInDB, PatientUpdate
from app.services.auth import verify_password, get_password_hash


def _to_patient_in_db(patient: dict) -> PatientInDB:
    return PatientInDB(
        id=str(patient["_id"]),
        **{k: v for k, v in patient.items() if k != "_id"}
    )


async def register_patient(db, patient_data: PatientCreate):
    print(f"[PatientService] Registering patient with email: {patient_data.email}")
    existing = await db.patients.find_one({"email": patient_data.email})
    if existing:
        print(f"[PatientService] Email already registered: {patient_data.email}")
        raise HTTPException(status_code=400, detail="Email already registered")

    patient_doc = {
        "name": patient_data.name,
        "email": patient_data.email,
        "password_hash": get_password_hash(patient_data.password),
        "phone": patient_data.phone,
        "created_at": datetime.utcnow(),
    }

    result = await db.patients.insert_one(patient_doc)
    patient_doc["_id"] = result.inserted_id
    print(f"[PatientService] Patient registered successfully with email: {patient_data.email}")
    return _to_patient_in_db(patient_doc)


async def authenticate_patient(db, email: str, password: str):
    print(f"[PatientService] Authenticating patient with email: {email}")
    patient = await db.patients.find_one({"email": email})
    if not patient:
        print(f"[PatientService] Patient not found with email: {email}")
        return False
    if not verify_password(password, patient["password_hash"]):
        print(f"[PatientService] Invalid password for patient: {email}")
        return False
    print(f"[PatientService] Patient authenticated successfully: {email}")
    return _to_patient_in_db(patient)


async def update_patient(db, patient_id: str, update_data: PatientUpdate):
    print(f"[PatientService] Updating patient with ID: {patient_id}")
    existing = await db.patients.find_one({"_id": ObjectId(patient_id)})
    if not existing:
        print(f"[PatientService] Patient not found with ID: {patient_id}")
        raise HTTPException(status_code=404, detail="Patient not found")

    updates = {}
    if update_data.name is not None:
        updates["name"] = update_data.name
    if update_data.phone is not None:
        updates["phone"] = update_data.phone

    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")

    await db.patients.update_one(
        {"_id": ObjectId(patient_id)},
        {"$set": updates}
    )

    updated = await db.patients.find_one({"_id": ObjectId(patient_id)})
    print(f"[PatientService] Patient updated successfully with ID: {patient_id}")
    return _to_patient_in_db(updated)


async def get_patient_bookings(db, patient_id: str):
    print(f"[PatientService] Fetching all bookings for patient ID: {patient_id}")
    cursor = db.bookings.find(
        {"patient_id": patient_id}
    ).sort("booked_at", -1)

    bookings = []
    async for booking in cursor:
        booking["id"] = str(booking["_id"])
        bookings.append(booking)

    print(f"[PatientService] Retrieved {len(bookings)} bookings for patient ID: {patient_id}")
    return bookings


async def get_upcoming_bookings(db, patient_id: str):
    print(f"[PatientService] Fetching upcoming bookings for patient ID: {patient_id}")
    now = datetime.utcnow()

    # get all non-cancelled bookings for this patient
    cursor = db.bookings.find({
        "patient_id": patient_id,
        "status": {"$in": ["pending", "approved"]}
    })

    upcoming = []
    async for booking in cursor:
        # fetch the slot to check if it's in the future
        from bson import ObjectId as ObjId
        slot = await db.slots.find_one({"_id": ObjId(booking["slot_id"])})
        if slot and slot["start_time"] >= now:
            booking["id"] = str(booking["_id"])
            upcoming.append(booking)

    upcoming.sort(key=lambda x: x["booked_at"])
    print(f"[PatientService] Retrieved {len(upcoming)} upcoming bookings for patient ID: {patient_id}")
    return upcoming