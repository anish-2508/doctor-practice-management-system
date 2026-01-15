from fastapi import APIRouter, Depends
from app.models.slot import SlotResponse, SlotCreate
from app.services.slot import create_slot, get_doctor_slots
from app.services.auth import get_current_active_doctor
from app.db.mongo import get_db
from typing import List

router = APIRouter(prefix="/doctor/slots", tags=["Slots"])

@router.post("", response_model= SlotResponse)
async def create_doctor_slot(
    slot: SlotCreate,
    db=Depends(get_db),
    current_doctor=Depends(get_current_active_doctor),
    ):
    slot_doc = await create_slot(db, str(current_doctor["_id"]), slot)
    return {
        "id": str(slot_doc["_id"]),
        "start_time": slot_doc["start_time"],
        "end_time": slot_doc["end_time"],
        "is_booked": slot_doc["is_booked"],
    }
     
@router.get("", response_model=List[SlotResponse])
async def list_doctor_slots(
    db=Depends(get_db),
    current_doctor=Depends(get_current_active_doctor),
    ):
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

