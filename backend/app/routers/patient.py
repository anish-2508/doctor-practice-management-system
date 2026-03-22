from fastapi import APIRouter, Depends, HTTPException, status
from typing import Annotated, List
from datetime import timedelta
from app.models.patient import PatientCreate, PatientUpdate, PatientResponse, PatientLogin
from app.models.auth import Token
from app.models.booking import BookingResponse
from app.services.patient import (
    register_patient,
    authenticate_patient,
    update_patient,
    get_patient_bookings,
    get_upcoming_bookings,
)
from app.services.booking import cancel_booking, get_status_of_booking
from app.services.auth import (
    get_current_active_patient,
    create_access_token,
    ACCESS_TOKEN_EXPIRE_MINUTES,
)
from app.db.mongo import get_db

router = APIRouter(prefix="/patient", tags=["Patient"])


@router.post("/register", response_model=PatientResponse, status_code=201)
async def register(patient_data: PatientCreate, db=Depends(get_db)):
    print(f"[Patient] Registration attempt for email: {patient_data.email}")
    patient = await register_patient(db, patient_data)
    print(f"[Patient] Registration successful for email: {patient_data.email}")
    return PatientResponse(
        id=patient.id,
        name=patient.name,
        email=patient.email,
        phone=patient.phone,
        created_at=patient.created_at,
    )


@router.post("/login", response_model=Token)
async def login(patient_data: PatientLogin, db=Depends(get_db)):
    print(f"[Patient] Login attempt for email: {patient_data.email}")
    patient = await authenticate_patient(db, patient_data.email, patient_data.password)
    if not patient:
        print(f"[Patient] Login failed - invalid credentials for email: {patient_data.email}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    access_token = create_access_token(
        data={"sub": patient.email, "role": "patient"},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    print(f"[Patient] Login successful for email: {patient_data.email}")
    return Token(access_token=access_token, token_type="bearer")


@router.get("/me", response_model=PatientResponse)
async def read_patient_me(
    current_patient: Annotated[dict, Depends(get_current_active_patient)],
):
    print(f"[Patient] Fetching profile for patient email: {current_patient['email']}")
    return PatientResponse(
        id=str(current_patient["_id"]),
        name=current_patient["name"],
        email=current_patient["email"],
        phone=current_patient["phone"],
        created_at=current_patient["created_at"],
    )


@router.put("/me", response_model=PatientResponse)
async def update_patient_me(
    update_data: PatientUpdate,
    db=Depends(get_db),
    current_patient=Depends(get_current_active_patient),
):
    print(f"[Patient] Updating profile for patient email: {current_patient['email']}")
    patient = await update_patient(db, str(current_patient["_id"]), update_data)
    print(f"[Patient] Profile updated successfully for email: {current_patient['email']}")
    return PatientResponse(
        id=patient.id,
        name=patient.name,
        email=patient.email,
        phone=patient.phone,
        created_at=patient.created_at,
    )


@router.get("/bookings", response_model=List[BookingResponse])
async def all_bookings(
    db=Depends(get_db),
    current_patient=Depends(get_current_active_patient),
):
    print(f"[Patient] Fetching all bookings for patient email: {current_patient['email']}")
    bookings = await get_patient_bookings(db, str(current_patient["_id"]))
    print(f"[Patient] Fetched {len(bookings)} bookings for patient email: {current_patient['email']}")
    return bookings


@router.get("/bookings/upcoming", response_model=List[BookingResponse])
async def upcoming_bookings(
    db=Depends(get_db),
    current_patient=Depends(get_current_active_patient),
):
    print(f"[Patient] Fetching upcoming bookings for patient email: {current_patient['email']}")
    bookings = await get_upcoming_bookings(db, str(current_patient["_id"]))
    print(f"[Patient] Fetched {len(bookings)} upcoming bookings for patient email: {current_patient['email']}")
    return bookings


@router.get("/bookings/{booking_id}/status")
async def booking_status(
    booking_id: str,
    db=Depends(get_db),
    current_patient=Depends(get_current_active_patient),
):
    print(f"[Patient] Fetching status for booking {booking_id}")
    return await get_status_of_booking(db, booking_id, str(current_patient["_id"]))


@router.delete("/bookings/{booking_id}", status_code=200)
async def cancel_patient_booking(
    booking_id: str,
    db=Depends(get_db),
    current_patient=Depends(get_current_active_patient),
):
    print(f"[Patient] Cancelling booking {booking_id} for patient: {current_patient['email']}")
    result = await cancel_booking(db, booking_id, str(current_patient["_id"]))
    print(f"[Patient] Booking {booking_id} cancelled successfully")
    return result