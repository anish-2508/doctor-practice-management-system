import api from './axios';

// profile
export const getPatientMe = () => {
  console.log('[Patient API] Fetching patient profile');
  return api.get('/patient/me');
};

export const updatePatientMe = (data) => {
  console.log('[Patient API] Updating patient profile');
  return api.put('/patient/me', data);
};

// bookings
export const createBooking = (data) => {
  console.log('[Patient API] Creating booking for slot:', data.slot_id);
  return api.post('/bookings', data);
};

export const getPatientBookings = () => {
  console.log('[Patient API] Fetching patient bookings');
  return api.get('/patient/bookings');
};

export const getUpcomingBookings = () => {
  console.log('[Patient API] Fetching upcoming bookings');
  return api.get('/patient/bookings/upcoming');
};

export const getBookingStatus = (bookingId) => {
  console.log(`[Patient API] Fetching booking status for ID: ${bookingId}`);
  return api.get(`/patient/bookings/${bookingId}/status`);
};

export const cancelBooking = (bookingId) => {
  console.log(`[Patient API] Cancelling booking ID: ${bookingId}`);
  return api.delete(`/patient/bookings/${bookingId}`);
};

export const lockSlot = (slotId) => api.post(`/slots/${slotId}/lock`);
export const unlockSlot = (slotId) => api.delete(`/slots/${slotId}/lock`);