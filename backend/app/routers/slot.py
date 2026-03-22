from fastapi import APIRouter, Depends
from app.models.slot import SlotResponse
from app.services.slot import generate_slots_for_doctor, get_doctor_slots, lock_slot, unlock_slot
from app.services.auth import get_current_active_doctor, get_current_active_patient
from app.db.mongo import get_db
from typing import List

router = APIRouter(tags=["Slots"])

@router.get("/doctor/slots", response_model=List[SlotResponse])
async def list_doctor_slots(
    db=Depends(get_db),
    current_doctor=Depends(get_current_active_doctor),
):
    await generate_slots_for_doctor(db, current_doctor)
    slots = await get_doctor_slots(db, str(current_doctor["_id"]))
    return [
        {
            "id": str(slot["_id"]),
            "start_time": slot["start_time"],
            "end_time": slot["end_time"],
            "is_booked": slot["is_booked"]
        }
        for slot in slots
    ]


@router.post("/slots/{slot_id}/lock")
async def lock_patient_slot(
    slot_id: str,
    db=Depends(get_db),
    current_patient=Depends(get_current_active_patient),
):
    return await lock_slot(db, slot_id, str(current_patient["_id"]))


@router.delete("/slots/{slot_id}/lock")
async def unlock_patient_slot(
    slot_id: str,
    db=Depends(get_db),
    current_patient=Depends(get_current_active_patient),
):
    return await unlock_slot(db, slot_id, str(current_patient["_id"]))