from datetime import datetime, date, timedelta
from fastapi import HTTPException
from bson import ObjectId
from datetime import time

async def generate_slots_for_doctor(db, doctor: dict, days_ahead: int = 7):
    print(f"[SlotService] Generating slots for doctor ID: {doctor['_id']} for {days_ahead} days")
    # parse doctor availability
    work_start = time.fromisoformat(doctor["work_start_time"])
    work_end = time.fromisoformat(doctor["work_end_time"])
    slot_duration = doctor["slot_duration_mins"]
    working_days = doctor["working_days"]  # list of ints, 0=Mon

    today = datetime.utcnow().date()
    new_slots = []

    for i in range(days_ahead):
        current_date = today + timedelta(days=i)

        # skip non-working days
        if current_date.weekday() not in working_days:
            continue

        # generate all slot times for this day
        slot_start = datetime.combine(current_date, work_start)
        slot_end_of_day = datetime.combine(current_date, work_end)

        while slot_start + timedelta(minutes=slot_duration) <= slot_end_of_day:
            slot_end = slot_start + timedelta(minutes=slot_duration)

            # check if slot already exists in DB to avoid duplicates
            existing = await db.slots.find_one({
                "doctor_id": str(doctor["_id"]),
                "start_time": slot_start,
            })

            if not existing:
                slot_doc = {
                    "doctor_id": str(doctor["_id"]),
                    "start_time": slot_start,
                    "end_time": slot_end,
                    "is_booked": False,
                    "is_locked": False,
                    "locked_by": None,
                    "locked_until": None,
                    "created_at": datetime.utcnow(),
                }
                result = await db.slots.insert_one(slot_doc)
                slot_doc["_id"] = result.inserted_id
                new_slots.append(slot_doc)

            slot_start = slot_end

    print(f"[SlotService] Generated {len(new_slots)} new slots for doctor ID: {doctor['_id']}")
    return new_slots


async def get_doctor_slots(db, doctor_id: str):
    print(f"[SlotService] Fetching slots for doctor ID: {doctor_id}")
    cursor = db.slots.find({"doctor_id": doctor_id})
    slots = [slot async for slot in cursor]
    print(f"[SlotService] Retrieved {len(slots)} slots for doctor ID: {doctor_id}")
    return slots

async def lock_slot(db, slot_id: str, patient_id: str):
    now = datetime.utcnow()
    locked_until = now + timedelta(minutes=5)

    # atomic find and update — only locks if slot is available
    result = await db.slots.find_one_and_update(
        {
            "_id": ObjectId(slot_id),
            "is_booked": False,
            "$or": [
                {"is_locked": False},
                {"locked_until": {"$lt": now}}  # expired lock
            ]
        },
        {
            "$set": {
                "is_locked": True,
                "locked_by": patient_id,
                "locked_until": locked_until,
            }
        },
        return_document=True,
    )

    if not result:
        raise HTTPException(status_code=409, detail="Slot is no longer available")

    return {"locked_until": locked_until}


async def unlock_slot(db, slot_id: str, patient_id: str):
    # only unlock if this patient owns the lock
    result = await db.slots.find_one_and_update(
        {
            "_id": ObjectId(slot_id),
            "locked_by": patient_id,
            "is_booked": False,  # don't unlock already booked slots
        },
        {
            "$set": {
                "is_locked": False,
                "locked_by": None,
                "locked_until": None,
            }
        },
        return_document=True,
    )

    if not result:
        raise HTTPException(status_code=400, detail="No active lock found for this slot")

    return {"message": "Slot unlocked"}