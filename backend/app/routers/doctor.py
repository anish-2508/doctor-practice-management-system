# Doctor router - endpoints for doctor profile and authentication
from fastapi import APIRouter, Depends, HTTPException, status
from typing import Annotated
from datetime import timedelta
from app.models.doctor import DoctorResponse, DoctorLogin, DoctorCreate, DoctorUpdate
from app.models.auth import Token
from app.services.auth import get_current_active_doctor
from app.services.auth import create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES
from app.services.doctor import authenticate_doctor, signup_doctor, update_doctor
from app.db.mongo import get_db
from app.services.auth import oauth2_scheme

router = APIRouter(prefix="/doctor", tags=["Doctor"])

# Get current authenticated doctor profile
@router.get("/me", response_model=DoctorResponse)
async def read_doctor_me(
    current_doctor: Annotated[dict, Depends(get_current_active_doctor)],
):
    print(f"[Doctor] Fetching profile for doctor email: {current_doctor['email']}")
    return DoctorResponse(
        id=str(current_doctor["_id"]),
        name=current_doctor["name"],
        email=current_doctor["email"],
        consultation_fee=current_doctor["consultation_fee"],
        work_start_time=current_doctor["work_start_time"],
        work_end_time=current_doctor["work_end_time"],
        slot_duration_mins=current_doctor["slot_duration_mins"],
        working_days=current_doctor["working_days"],
        years_of_exp=current_doctor["years_of_exp"],
        specialization=current_doctor["specialization"],
        qualifications=current_doctor["qualifications"],
        services=current_doctor["services"],
        bio=current_doctor["bio"],
        created_at=current_doctor["created_at"],
    )


@router.post("/signup", response_model=DoctorResponse, status_code=201)
async def signup(doctor_data: DoctorCreate, db=Depends(get_db)):
    print(f"[Doctor] Signup attempt for email: {doctor_data.email}")
    doctor = await signup_doctor(db, doctor_data)
    print(f"[Doctor] Signup successful for email: {doctor_data.email}")
    return DoctorResponse(
        id=doctor.id,
        name=doctor.name,
        email=doctor.email,
        consultation_fee=doctor.consultation_fee,
        work_start_time=doctor.work_start_time,
        work_end_time=doctor.work_end_time,
        slot_duration_mins=doctor.slot_duration_mins,
        working_days=doctor.working_days,
        years_of_exp=doctor.years_of_exp,
        specialization=doctor.specialization,
        qualifications=doctor.qualifications,
        services=doctor.services,
        bio=doctor.bio,
        created_at=doctor.created_at,
    )

@router.put("/me", response_model=DoctorResponse)
async def update_doctor_me(
    update_data: DoctorUpdate,
    db=Depends(get_db),
    current_doctor=Depends(get_current_active_doctor),
):
    print(f"[Doctor] Updating profile for doctor email: {current_doctor['email']}")
    doctor = await update_doctor(db, str(current_doctor["_id"]), update_data)
    print(f"[Doctor] Profile updated successfully for email: {current_doctor['email']}")
    return DoctorResponse(
        id=doctor.id,
        name=doctor.name,
        email=doctor.email,
        consultation_fee=doctor.consultation_fee,
        work_start_time=doctor.work_start_time,
        work_end_time=doctor.work_end_time,
        slot_duration_mins=doctor.slot_duration_mins,
        working_days=doctor.working_days,
        years_of_exp=doctor.years_of_exp,
        specialization=doctor.specialization,
        qualifications=doctor.qualifications,
        services=doctor.services,
        bio=doctor.bio,
        created_at=doctor.created_at,
    )

# Doctor login endpoint - authenticate doctor and return JWT token
@router.post("/login", response_model=Token)
async def login(doctor: DoctorLogin, db=Depends(get_db)):
    print(f"[Doctor] Login attempt for email: {doctor.email}")
    doctor =  await authenticate_doctor(db, doctor.email, doctor.password)
    if not doctor: 
        print(f"[Doctor] Login failed - invalid credentials for email: {doctor.email}")
        raise HTTPException(status_code = status.HTTP_401_UNAUTHORIZED
                            , detail="invalid email or password")
    
    access_token = create_access_token(
        data={"sub": doctor.email},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
    )

    print(f"[Doctor] Login successful for email: {doctor.email}")
    return Token(access_token=access_token, token_type="bearer") 


# @router.post("/logout", status_code=204)
# async def logout(
#     token: Annotated[str, Depends(oauth2_scheme)],
#     db=Depends(get_db)
# ):
#     await logout_doctor(db, token)



