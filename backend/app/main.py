from fastapi import FastAPI
from app.routers import auth, doctor

app = FastAPI()

app.include_router(auth.router)
app.include_router(doctor.router)
app.include_router(slot.router)


