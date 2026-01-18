# POST /bookings

# GET /doctor/bookings

# POST /doctor/bookings/{id}/approve

# POST /doctor/bookings/{id}/reject

from fastapi import APIRouter, Depends, status
from typing import List
from app.db.mongo import get_db
from app.models.booking import BookingCreate, BookingResponse
from app.services.booking import create_booking, get_doctor_bookings
from app.services.auth import get_current_active_doctor

router = APIRouter()

@router.post("/bookings", response_model = BookingResponse, status_code=status.HTTP_201_CREATED)
async def create_patient_booking(booking_create: BookingCreate, db= Depends(get_db)): 
    booking = await create_booking(db, booking_create)

    return {
        "id": booking["_id"],
        "slot_id": booking["slot_id"],
        "patient_name": booking["patient_name"],
        "status": booking["status"],
        "booked_at": booking["booked_at"],
    }

@router.get("/doctor/bookings", response_model=List[BookingResponse])
async def get_all_bookings(db = Depends(get_db), current_doctor=Depends(get_current_active_doctor)): 
    return await get_doctor_bookings(db, current_doctor["_id"])
    



    
