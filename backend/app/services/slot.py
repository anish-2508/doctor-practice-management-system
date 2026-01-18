from datetime import datetime
from app.models.slot import SlotCreate

async def create_slot(db, doctor_id: str, slot: SlotCreate):
    slot_doc = {
        "doctor_id": doctor_id,
        "start_time": slot.start_time,
        "end_time": slot.end_time,
        "is_booked": False,
        "booked_by": None,
        "created_at": datetime.utcnow(),
    }
    
    result = await db.slots.insert_one(slot_doc)
    slot_doc["_id"] = result.inserted_id
    return slot_doc

async def get_doctor_slots(db, doctor_id: str):
    cursor = db.slots.find({"doctor_id": doctor_id})
    return [slot async for slot in cursor]


