from fastapi import APIRouter, Depends, HTTPException
from app.db.mongo import get_db
from app.services.slot import generate_slots_for_doctor, get_doctor_slots
from bson import ObjectId
from datetime import datetime, timezone

router = APIRouter(prefix="/doctors", tags=["Public"])

@router.get("")
async def list_doctors(
    specialization: str = None,
    service: str = None,
    db=Depends(get_db)
):
    query = {}
    if specialization:
        query["specialization"] = specialization
    if service:
        query["services"] = {"$in": [service]}

    cursor = db.doctors.find(query)
    doctors = []
    async for doctor in cursor:
        doctors.append({
            "id": str(doctor["_id"]),
            "name": doctor["name"],
            "specialization": doctor["specialization"],
            "services": doctor["services"],
            "years_of_exp": doctor["years_of_exp"],
            "consultation_fee": doctor["consultation_fee"],
        })

    return doctors

@router.get("/{doctor_id}")
async def get_doctor_profile(doctor_id: str, db=Depends(get_db)):
    doctor = await db.doctors.find_one({"_id": ObjectId(doctor_id)})
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")

    return {
        "id": str(doctor["_id"]),
        "name": doctor["name"],
        "specialization": doctor["specialization"],
        "qualifications": doctor["qualifications"],
        "services": doctor["services"],
        "years_of_exp": doctor["years_of_exp"],
        "bio": doctor["bio"],
        "consultation_fee": doctor["consultation_fee"],
    }

@router.get("/{doctor_id}/slots")
async def view_available_slots(doctor_id: str, db=Depends(get_db)):
    doctor = await db.doctors.find_one({"_id": ObjectId(doctor_id)})
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")

    await generate_slots_for_doctor(db, doctor)

    now = datetime.utcnow()
    cursor = db.slots.find({
        "doctor_id": str(doctor["_id"]),
        "is_booked": False,
        "start_time": {"$gte": now},
        "$or": [
            {"is_locked": False},
            {"is_locked": None},
            {"locked_until": {"$lt": now}}  # expired lock treated as unlocked
        ]
    }).sort("start_time", 1)

    slots = []
    async for slot in cursor:
        slots.append({
            "id": str(slot["_id"]),
            "start_time": slot["start_time"],
            "end_time": slot["end_time"],
        })

    return slots