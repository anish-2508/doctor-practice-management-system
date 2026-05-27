# WellBook - Doctor Practice Management System

WellBook is a role-based clinic platform that helps patients book consultations and helps doctors manage appointments and consultation records in one place.

## Demo
- Live App: https://doctor-practice-management-system-ad30.onrender.com

## Problem It Solves
- Patients need faster doctor discovery and clearer slot visibility.
- Doctors need a simple workflow to handle booking requests and document visits.
- Clinics need better continuity with booking-linked patient records.

## User Roles

### Patient
- Browse doctors by specialization and services.
- View available slots grouped by day.
- Book appointments with lock protection.
- Track booking status (`pending`, `approved`, `rejected`, `cancelled`).
- View own consultation history records.

### Doctor
- Manage profile and practice details.
- Review incoming bookings and approve/reject them.
- Create and update patient records for approved bookings.
- Use dashboard insights for bookings and slots.

## Core Workflows
- Appointment Lifecycle: `Available -> Locked -> Pending -> Approved/Rejected/Cancelled`
- Record Lifecycle: `Approved Booking -> Record Created -> Record Updated -> Patient View`
- Access Rules:
  - Assigned doctor: create/update/view record
  - Patient: view-only own record
  - Other doctors: no access

## Product Highlights
- Role-based authentication and protected routes.
- Slot-locking mechanism to reduce double booking.
- Structured patient records tied to booking context.
- Clean dashboard UX for both patient and doctor journeys.


## Tech Stack
- Frontend: React, Vite, Joy UI, Axios, Recharts
- Backend: FastAPI, JWT auth, Pydantic
- Database: MongoDB




