from app.models.doctor import DoctorInDB
from app.services.auth import verify_password

async def get_doctor(db, email: str):
    doctors = db.doctors
    doctor = await doctors.find_one({"email": email})

    if doctor: 
        doctor["id"] = str(doctor["_id"])
        del doctor["_id"]
        return DoctorInDB(**doctor)
    
    return None

async def authenticate_doctor(db, email: str, password: str):
    doctors = db.doctors    
    doctor = await doctors.find_one({"email": email})
    if not doctor:
        return False
    if not verify_password(password, doctor["password_hash"]):
        return False
    return doctor





