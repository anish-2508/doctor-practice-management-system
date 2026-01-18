from datetime import datetime
from bson import ObjectId
from fastapi import HTTPException

from app.models.booking import BookingCreate

# -------------------------------
# CREATE BOOKING (PATIENT SIDE)
# -------------------------------
async def create_booking(db, booking_create: BookingCreate):
    # 1. Fetch slot
    slot = await db.slots.find_one(
        {"_id": ObjectId(booking_create.slot_id)}
    )

    if not slot:
        raise HTTPException(status_code=404, detail="Slot not found")

    if slot.get("is_booked"):
        raise HTTPException(status_code=400, detail="Slot already booked")

    # 2. Create booking document
    booking_doc = {
        "slot_id": booking_create.slot_id,
        "doctor_id": slot["doctor_id"],
        "patient_name": booking_create.patient_name,
        "patient_contact": booking_create.patient_contact,
        "status": "pending",  # pending | approved | rejected
        "booked_at": datetime.utcnow(),
    }

    # 3. Insert booking
    result = await db.bookings.insert_one(booking_doc)

    # 4. Lock slot immediately
    await db.slots.update_one(
        {"_id": slot["_id"]},
        {"$set": {"is_booked": True}}
    )

    booking_doc["_id"] = str(result.inserted_id)
    return booking_doc


# -------------------------------
# APPROVE BOOKING (DOCTOR SIDE)
# -------------------------------
async def approve_booking(db, booking_id: str):
    booking = await db.bookings.find_one(
        {"_id": ObjectId(booking_id)}
    )

    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    if booking["status"] != "pending":
        raise HTTPException(
            status_code=400,
            detail="Only pending bookings can be approved"
        )

    await db.bookings.update_one(
        {"_id": ObjectId(booking_id)},
        {"$set": {"status": "approved"}}
    )

    return {"message": "Booking approved"}


# -------------------------------
# REJECT BOOKING (DOCTOR SIDE)
# -------------------------------
async def reject_booking(db, booking_id: str):
    booking = await db.bookings.find_one(
        {"_id": ObjectId(booking_id)}
    )

    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    if booking["status"] != "pending":
        raise HTTPException(
            status_code=400,
            detail="Only pending bookings can be rejected"
        )

    await db.bookings.update_one(
        {"_id": ObjectId(booking_id)},
        {"$set": {"status": "rejected"}}
    )

    return {"message": "Booking rejected"}


# -------------------------------
# GET ALL BOOKINGS FOR A DOCTOR
# -------------------------------
async def get_doctor_bookings(db, doctor_id: str):
    cursor = db.bookings.find(
        {"doctor_id": doctor_id}
    ).sort("booked_at", -1)

    bookings = []
    async for booking in cursor:
        booking["_id"] = str(booking["_id"])
        bookings.append(booking)

    return bookings
