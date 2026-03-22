# Booking router - endpoints for patient and doctor booking operations
# POST /bookings
# GET /doctor/bookings
# POST /doctor/bookings/{id}/approve
# POST /doctor/bookings/{id}/reject

from fastapi import APIRouter, Depends, status, HTTPException
from bson import ObjectId
from typing import List
from app.db.mongo import get_db
from app.models.booking import BookingCreate, BookingResponse
from app.services.booking import create_booking, get_doctor_bookings, approve_booking, reject_booking, get_status_of_booking
from app.services.auth import get_current_active_doctor, get_current_active_patient

router = APIRouter()

# Create a new booking for a slot (patient endpoint)
@router.post("/bookings", response_model=BookingResponse, status_code=status.HTTP_201_CREATED)
async def create_patient_booking(
    booking_create: BookingCreate,
    db=Depends(get_db),
    current_patient=Depends(get_current_active_patient),
):
    print(f"[Booking] Creating booking for patient: {current_patient['email']}, slot_id: {booking_create.slot_id}")
    booking = await create_booking(db, booking_create, current_patient)
    print(f"[Booking] Booking created successfully with ID: {booking['_id']}")
    return {
        "id": booking["_id"],
        "slot_id": booking["slot_id"],
        "patient_id": booking["patient_id"],
        "patient_name": booking["patient_name"],
        "status": booking["status"],
        "booked_at": booking["booked_at"],
    }

# Retrieve all bookings for the authenticated doctor
@router.get("/doctor/bookings", response_model=List[BookingResponse])
async def get_all_bookings(db = Depends(get_db), current_doctor=Depends(get_current_active_doctor)):
    print(f"[Booking] Fetching all bookings for doctor: {current_doctor['email']}")
    bookings = await get_doctor_bookings(db, str(current_doctor["_id"]))
    print(f"[Booking] Fetched {len(bookings)} bookings for doctor: {current_doctor['email']}")
    return bookings

@router.post("/doctor/bookings/{booking_id}/approve")
async def approve_patient_booking(
    booking_id: str,
    db=Depends(get_db),
    current_doctor=Depends(get_current_active_doctor)
):
    print(f"[Booking] Approving booking ID: {booking_id} by doctor: {current_doctor['email']}")
    result = await approve_booking(db, booking_id, str(current_doctor["_id"]))
    print(f"[Booking] Booking {booking_id} approved successfully")
    return result


@router.post("/doctor/bookings/{booking_id}/reject")
async def reject_patient_booking(
    booking_id: str,
    db=Depends(get_db),
    current_doctor=Depends(get_current_active_doctor)
):
    print(f"[Booking] Rejecting booking ID: {booking_id} by doctor: {current_doctor['email']}")
    result = await reject_booking(db, booking_id, str(current_doctor["_id"]))
    print(f"[Booking] Booking {booking_id} rejected successfully")
    return result