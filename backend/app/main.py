from fastapi import FastAPI
from app.routers import auth, doctor, slot, booking

app = FastAPI()

app.include_router(auth.router)
app.include_router(doctor.router)
app.include_router(slot.router)
app.include_router(booking.router)

