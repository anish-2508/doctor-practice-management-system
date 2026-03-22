import api from './axios';

// patient auth
export const registerPatient = (data) => {
  console.log('[Auth] Attempting patient registration with data:', data);
  return api.post('/patient/register', data);
};

export const loginPatient = (data) => {
  console.log('[Auth] Attempting patient login with email:', data.email);
  return api.post('/patient/login', data);
};

// doctor auth
export const signupDoctor = (data) => {
  console.log('[Auth] Attempting doctor signup');
  return api.post('/doctor/signup', data);
};

export const loginDoctor = (data) => {
  console.log('[Auth] Attempting doctor login');
  return api.post('/doctor/login', data);
};