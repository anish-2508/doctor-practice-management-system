# Public service - functions accessible without authentication
from datetime import datetime

# Get all available (unbooked) future slots for a specific doctor
async def get_available_slots(db, doctor_id: str):
    print(f"[PublicService] Fetching available slots for doctor ID: {doctor_id}")
    slots = db.slots.find({
        "doctor_id":doctor_id,
        "is_booked":False, 
        "start_time": {"$gte": datetime.utcnow()} 
        })
    available_slots = [slot async for slot in slots]
    print(f"[PublicService] Found {len(available_slots)} available slots for doctor ID: {doctor_id}")
    return available_slots


    

