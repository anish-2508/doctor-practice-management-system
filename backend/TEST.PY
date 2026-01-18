from app.db.mongo import get_db
from app.services.auth import get_password_hash
import asyncio
from datetime import datetime

async def create_test_doctor():
    db = get_db()
    doctor = {
        "name": "Dr. Johnny",
        "email": "johnny@example.com",
        "password_hash": get_password_hash("password"),
        "consultation_fee": 500, 
        "created_at": datetime.utcnow()
    }
    await db.doctors.insert_one(doctor)
    print("Doctor created!")

asyncio.run(create_test_doctor())
