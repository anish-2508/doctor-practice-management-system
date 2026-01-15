from fastapi import APIRouter, Depends
from app.services.public import get_available_slots
from app.db.mongo import get_db

router = APIRouter(prefix="/public", tags = ["public"])

@router.get("/{doctor_id}")
async def view_available_slots(doctor_id, db = Depends(get_db)): 
    available_slots = await get_available_slots(db, doctor_id)
    return available_slots

