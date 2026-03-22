from app.models.doctor import DoctorInDB, DoctorCreate, DoctorUpdate
from app.services.auth import verify_password, get_password_hash
from app.constants import SPECIALIZATIONS, QUALIFICATIONS, SERVICES
from datetime import datetime
from fastapi import HTTPException
from bson import ObjectId

def validate_profile_fields(specialization, qualifications, services):
    if specialization not in SPECIALIZATIONS:
        raise HTTPException(status_code=400, detail=f"Invalid specialization: {specialization}")
    
    invalid_quals = [q for q in qualifications if q not in QUALIFICATIONS]
    if invalid_quals:
        raise HTTPException(status_code=400, detail=f"Invalid qualifications: {invalid_quals}")
    
    invalid_services = [s for s in services if s not in SERVICES]
    if invalid_services:
        raise HTTPException(status_code=400, detail=f"Invalid services: {invalid_services}")
    
async def get_doctor(db, email: str):
    doctors = db.doctors
    doctor = await doctors.find_one({"email": email})
    if doctor:
        return DoctorInDB(id=str(doctor["_id"]), **{k: v for k, v in doctor.items() if k != "_id"})
    return None

async def authenticate_doctor(db, email: str, password: str):
    print(f"[DoctorService] Authenticating doctor with email: {email}")
    doctors = db.doctors
    doctor = await doctors.find_one({"email": email})
    if not doctor:
        print(f"[DoctorService] Doctor not found for email: {email}")
        return False
    if not verify_password(password, doctor["password_hash"]):
        print(f"[DoctorService] Invalid password for email: {email}")
        return False
    print(f"[DoctorService] Doctor authenticated successfully: {email}")
    return DoctorInDB(id=str(doctor["_id"]), **{k: v for k, v in doctor.items() if k != "_id"})

async def signup_doctor(db, doctor_data: DoctorCreate):
    print(f"[DoctorService] Signup attempt for doctor email: {doctor_data.email}")
    existing = await db.doctors.find_one({"email": doctor_data.email})
    if existing:
        print(f"[DoctorService] Email already registered: {doctor_data.email}")
        raise HTTPException(status_code=400, detail="Email already registered")

    validate_profile_fields(doctor_data.specialization, doctor_data.qualifications, doctor_data.services)

    doctor_doc = {
        "name": doctor_data.name,
        "email": doctor_data.email,
        "password_hash": get_password_hash(doctor_data.password),
        "consultation_fee": doctor_data.consultation_fee,
        "work_start_time": doctor_data.work_start_time.isoformat(),
        "work_end_time": doctor_data.work_end_time.isoformat(),
        "slot_duration_mins": doctor_data.slot_duration_mins,
        "working_days": doctor_data.working_days,
        "created_at": datetime.utcnow(),
        "years_of_exp": doctor_data.years_of_exp,
        "specialization": doctor_data.specialization,
        "qualifications": doctor_data.qualifications,
        "services": doctor_data.services,
        "bio": doctor_data.bio,
    }

    result = await db.doctors.insert_one(doctor_doc)
    doctor_doc["_id"] = result.inserted_id
    print(f"[DoctorService] Doctor signup successful: {doctor_data.email}")
    return DoctorInDB(id=str(result.inserted_id), **{k: v for k, v in doctor_doc.items() if k != "_id"})

async def update_doctor(db, doctor_id: str, update_data: DoctorUpdate):
    print(f"[DoctorService] Updating doctor with ID: {doctor_id}")
    existing = await db.doctors.find_one({"_id": ObjectId(doctor_id)})
    if not existing:
        print(f"[DoctorService] Doctor not found with ID: {doctor_id}")
        raise HTTPException(status_code=404, detail="Doctor not found")

    # validate profile fields if any are being updated
    if any([update_data.specialization, update_data.qualifications, update_data.services]):
        validate_profile_fields(
            update_data.specialization or existing["specialization"],
            update_data.qualifications or existing["qualifications"],
            update_data.services or existing["services"],
        )

    updates = {}
    if update_data.name is not None:
        updates["name"] = update_data.name
    if update_data.consultation_fee is not None:
        updates["consultation_fee"] = update_data.consultation_fee
    if update_data.work_start_time is not None:
        updates["work_start_time"] = update_data.work_start_time.isoformat()
    if update_data.work_end_time is not None:
        updates["work_end_time"] = update_data.work_end_time.isoformat()
    if update_data.slot_duration_mins is not None:
        updates["slot_duration_mins"] = update_data.slot_duration_mins
    if update_data.working_days is not None:
        updates["working_days"] = update_data.working_days
    if update_data.years_of_exp is not None:
        updates["years_of_exp"] = update_data.years_of_exp
    if update_data.specialization is not None:
        updates["specialization"] = update_data.specialization
    if update_data.qualifications is not None:
        updates["qualifications"] = update_data.qualifications
    if update_data.services is not None:
        updates["services"] = update_data.services
    if update_data.bio is not None:
        updates["bio"] = update_data.bio

    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")

    await db.doctors.update_one(
        {"_id": ObjectId(doctor_id)},
        {"$set": updates}
    )

    updated = await db.doctors.find_one({"_id": ObjectId(doctor_id)})
    print(f"[DoctorService] Doctor updated successfully with ID: {doctor_id}")
    return DoctorInDB(id=str(updated["_id"]), **{k: v for k, v in updated.items() if k != "_id"})