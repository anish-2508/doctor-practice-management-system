import api from './axios';

// get all doctors with optional filters
export const getDoctors = (params) => {
  console.log('[Public] Fetching doctors with params:', params);
  return api.get('/doctors', { params });
};

// get a single doctor's public profile
export const getDoctorProfile = (doctorId) => {
  console.log(`[Public] Fetching doctor profile for ID: ${doctorId}`);
  return api.get(`/doctors/${doctorId}`);
};

// get a doctor's available slots (also triggers slot generation)
export const getDoctorSlots = (doctorId) => {
  console.log(`[Public] Fetching available slots for doctor ID: ${doctorId}`);
  return api.get(`/doctors/${doctorId}/slots`);
};