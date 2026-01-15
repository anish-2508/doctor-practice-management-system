from datetime import datetime

async def get_available_slots(db, doctor_id: str):
    slots = db.slots.find({
        "doctor_id":doctor_id,
        "is_booked":False, 
        "start_time": {"$gte": datetime.utcnow()} 
        })
    return [slot async for slot in slots]


    

