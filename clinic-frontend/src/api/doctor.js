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

// patient records
export const getDoctorPatientRecords = (patientId) => {
  console.log(`[Doctor API] Fetching records for patient ID: ${patientId}`);
  return api.get(`/doctor/patients/${patientId}/records`);
};

export const getDoctorRecords = (params = {}) => {
  console.log('[Doctor API] Fetching doctor records');
  return api.get('/doctor/records', { params });
};

export const createPatientRecord = (data) => {
  console.log(`[Doctor API] Creating patient record for booking ID: ${data.booking_id}`);
  return api.post('/doctor/records', data);
};

export const updatePatientRecord = (recordId, data) => {
  console.log(`[Doctor API] Updating patient record ID: ${recordId}`);
  return api.put(`/doctor/records/${recordId}`, data);
};

export const uploadDoctorRecordAttachment = (recordId, file) => {
  console.log(`[Doctor API] Uploading attachment for record ID: ${recordId}`);
  const formData = new FormData();
  formData.append('file', file);
  return api.post(`/doctor/records/${recordId}/attachments`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const downloadDoctorRecordAttachment = (recordId, attachmentId) => {
  console.log(`[Doctor API] Downloading attachment ${attachmentId} for record ID: ${recordId}`);
  return api.get(`/doctor/records/${recordId}/attachments/${attachmentId}/download`, {
    responseType: 'blob',
  });
};
