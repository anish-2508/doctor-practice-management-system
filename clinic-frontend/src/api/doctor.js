import api from './axios';

// profile
export const getDoctorMe = () => {
  console.log('[Doctor API] Fetching doctor profile');
  return api.get('/doctor/me');
};

export const updateDoctorMe = (data) => {
  console.log('[Doctor API] Updating doctor profile');
  return api.put('/doctor/me', data);
};

// slots
export const getDoctorSlots = () => {
  console.log('[Doctor API] Fetching doctor slots');
  return api.get('/doctor/slots');
};

// bookings
export const getDoctorBookings = () => {
  console.log('[Doctor API] Fetching doctor bookings');
  return api.get('/doctor/bookings');
};

export const approveBooking = (bookingId) => {
  console.log(`[Doctor API] Approving booking ID: ${bookingId}`);
  return api.post(`/doctor/bookings/${bookingId}/approve`);
};

export const rejectBooking = (bookingId) => {
  console.log(`[Doctor API] Rejecting booking ID: ${bookingId}`);
  return api.post(`/doctor/bookings/${bookingId}/reject`);
};