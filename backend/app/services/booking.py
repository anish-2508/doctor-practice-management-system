# Booking service - functions for managing patient bookings and doctor approval
from datetime import datetime
from bson import ObjectId
from fastapi import HTTPException
from app.models.booking import BookingCreate

async def get_doctor_bookings(db, doctor_id: str):
    print(f"[BookingService] Fetching bookings for doctor ID: {doctor_id}")
    cursor = db.bookings.find(
        {"doctor_id": doctor_id}
    ).sort("booked_at", -1)

    bookings = []
    async for booking in cursor:
        booking["id"] = str(booking["_id"])
        bookings.append(booking)

    print(f"[BookingService] Retrieved {len(bookings)} bookings for doctor ID: {doctor_id}")
    return bookings

async def create_booking(db, booking_create: BookingCreate, patient: dict):
    print(f"[BookingService] Creating booking for patient ID: {patient['_id']}, slot ID: {booking_create.slot_id}")
    
    now = datetime.utcnow()
    patient_id = str(patient["_id"])

    # 1. Fetch slot
    slot = await db.slots.find_one({"_id": ObjectId(booking_create.slot_id)})

    if not slot:
        raise HTTPException(status_code=404, detail="Slot not found")

    if slot.get("is_booked"):
        raise HTTPException(status_code=400, detail="Slot already booked")

    # 2. Verify lock belongs to this patient and hasn't expired
    is_locked = slot.get("is_locked", False)
    locked_by = slot.get("locked_by")
    locked_until = slot.get("locked_until")

    if is_locked and locked_until and locked_until > now:
        if locked_by != patient_id:
            raise HTTPException(status_code=409, detail="Slot is currently locked by another patient")
    
    # 3. Create booking document
    booking_doc = {
        "slot_id": booking_create.slot_id,
        "doctor_id": slot["doctor_id"],
        "patient_id": patient_id,
        "patient_name": patient["name"],
        "patient_contact": patient["phone"],
        "status": "pending",
        "booked_at": now,
    }

    # 4. Insert booking
    result = await db.bookings.insert_one(booking_doc)

    # 5. Mark slot as booked and clear lock
    await db.slots.update_one(
        {"_id": slot["_id"]},
        {"$set": {
            "is_booked": True,
            "is_locked": False,
            "locked_by": None,
            "locked_until": None,
        }}
    )

    booking_doc["_id"] = str(result.inserted_id)
    print(f"[BookingService] Booking created successfully with ID: {booking_doc['_id']}")
    return booking_doc

# Get the current status of a booking
async def get_status_of_booking(db, booking_id: str, patient_id: str):
    print(f"[BookingService] Fetching booking status - booking ID: {booking_id}, patient ID: {patient_id}")
    booking = await db.bookings.find_one({"_id": ObjectId(booking_id)})

    if not booking:
        print(f"[BookingService] Booking not found: {booking_id}")
        raise HTTPException(status_code=404, detail="Booking not found")

    if booking["patient_id"] != patient_id:
        print(f"[BookingService] Unauthorized access to booking: {booking_id} by patient: {patient_id}")
        raise HTTPException(status_code=403, detail="Not authorized to view this booking")

    print(f"[BookingService] Booking status: {booking['status']} for booking ID: {booking_id}")
    return {"status": booking["status"]}


async def approve_booking(db, booking_id: str, doctor_id: str):
    print(f"[BookingService] Approving booking - booking ID: {booking_id}, doctor ID: {doctor_id}")
    booking = await db.bookings.find_one({"_id": ObjectId(booking_id)})

    if not booking:
        print(f"[BookingService] Booking not found: {booking_id}")
        raise HTTPException(status_code=404, detail="Booking not found")

    if booking["doctor_id"] != doctor_id:
        print(f"[BookingService] Unauthorized approval attempt for booking: {booking_id} by doctor: {doctor_id}")
        raise HTTPException(status_code=403, detail="Not authorized to manage this booking")

    if booking["status"] != "pending":
        print(f"[BookingService] Cannot approve non-pending booking: {booking_id}, status: {booking['status']}")
        raise HTTPException(status_code=400, detail="Only pending bookings can be approved")

    await db.bookings.update_one(
        {"_id": ObjectId(booking_id)},
        {"$set": {"status": "approved"}}
    )

    print(f"[BookingService] Booking approved successfully: {booking_id}")
    return {"message": "Booking approved"}


async def reject_booking(db, booking_id: str, doctor_id: str):
    print(f"[BookingService] Rejecting booking - booking ID: {booking_id}, doctor ID: {doctor_id}")
    booking = await db.bookings.find_one({"_id": ObjectId(booking_id)})

    if not booking:
        print(f"[BookingService] Booking not found: {booking_id}")
        raise HTTPException(status_code=404, detail="Booking not found")

    if booking["doctor_id"] != doctor_id:
        print(f"[BookingService] Unauthorized rejection attempt for booking: {booking_id} by doctor: {doctor_id}")
        raise HTTPException(status_code=403, detail="Not authorized to manage this booking")

    if booking["status"] != "pending":
        print(f"[BookingService] Cannot reject non-pending booking: {booking_id}, status: {booking['status']}")
        raise HTTPException(status_code=400, detail="Only pending bookings can be rejected")

    await db.bookings.update_one(
        {"_id": ObjectId(booking_id)},
        {"$set": {"status": "rejected"}}
    )

    await db.slots.update_one(
        {"_id": ObjectId(booking["slot_id"])},
        {"$set": {"is_booked": False}}
    )

    print(f"[BookingService] Booking rejected successfully: {booking_id}")
    return {"message": "Booking rejected"}

async def cancel_booking(db, booking_id: str, patient_id: str):
    print(f"[BookingService] Cancelling booking - booking ID: {booking_id}, patient ID: {patient_id}")
    booking = await db.bookings.find_one({"_id": ObjectId(booking_id)})

    if not booking:
        print(f"[BookingService] Booking not found: {booking_id}")
        raise HTTPException(status_code=404, detail="Booking not found")

    if booking["patient_id"] != patient_id:
        print(f"[BookingService] Unauthorized cancellation attempt for booking: {booking_id} by patient: {patient_id}")
        raise HTTPException(status_code=403, detail="Not authorized to cancel this booking")

    if booking["status"] != "pending":
        print(f"[BookingService] Cannot cancel non-pending booking: {booking_id}, status: {booking['status']}")
        raise HTTPException(status_code=400, detail="Only pending bookings can be cancelled")

    await db.bookings.update_one(
        {"_id": ObjectId(booking_id)},
        {"$set": {"status": "cancelled"}}
    )

    await db.slots.update_one(
        {"_id": ObjectId(booking["slot_id"])},
        {"$set": {"is_booked": False}}
    )

    print(f"[BookingService] Booking cancelled successfully: {booking_id}")
    return {"message": "Booking cancelled"}