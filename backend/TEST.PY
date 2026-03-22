# Test script for database operations
from app.db.mongo import get_db
from app.services.auth import get_password_hash
import asyncio
from datetime import datetime, timedelta
from typing import Optional

# Test function to create a doctor entry (currently disabled)
# async def create_test_doctor():
#     db = get_db()
#     doctor = {
#         "name": "Dr. Johnny",
#         "email": "johnny@example.com",
#         "password_hash": get_password_hash("password"),
#         "consultation_fee": 500, 
#         "created_at": datetime.utcnow()
#     }
#     await db.doctors.insert_one(doctor)
#     print("Doctor created!")

# Test function to create a consultation slot
async def create_test_slot():
    db = get_db()
    slot = {
        "doctor_id": "696c9e1dfe05973aacabdce8",
        "start_time": datetime.utcnow(),
        "end_time": datetime.utcnow()+timedelta(minutes=30),
        "is_booked": False,
        "created_at": datetime.utcnow()
    }

    await db.slots.insert_one(slot)
    print("slot created!")

# asyncio.run(create_test_doctor())
asyncio.run(create_test_slot())
