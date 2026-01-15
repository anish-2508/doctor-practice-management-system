from fastapi import APIRouter, Depends
from typing import Annotated
from app.models.doctor import DoctorResponse
from app.services.auth import get_current_active_doctor

router = APIRouter(prefix="/doctor", tags=["Doctor"])

@router.get("/me", response_model=DoctorResponse)
async def read_doctor_me(
    current_doctor: Annotated[dict, Depends(get_current_active_doctor)],
):
    return DoctorResponse(
        name=current_doctor["name"],
        id=str(current_doctor["_id"]),
        email=current_doctor["email"],
        consultation_fee=current_doctor["consultation_fee"],
        created_at= current_doctor["created_at"]
    )

