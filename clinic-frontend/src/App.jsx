import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// layouts
import Navbar from './components/Navbar';

// public pages
import Landing from './pages/Landing';

// auth pages
import PatientLogin from './pages/auth/PatientLogin';
import PatientRegister from './pages/auth/PatientRegister';
import DoctorLogin from './pages/auth/DoctorLogin';
import DoctorSignup from './pages/auth/DoctorSignup';

// doctor pages
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import DoctorProfile from './pages/doctor/DoctorProfile';
import DoctorSlots from './pages/doctor/DoctorSlots';
import DoctorBookings from './pages/doctor/DoctorBookings';
import DoctorRecords from './pages/doctor/DoctorRecords';

// patient pages
import PatientDashboard from './pages/patient/PatientDashboard';
import PatientProfile from './pages/patient/PatientProfile';
import PatientBookings from './pages/patient/PatientBookings';
import PatientRecords from './pages/patient/PatientRecords';
import BrowseDoctors from './pages/patient/BrowseDoctors';
import DoctorDetail from './pages/patient/DoctorDetail';

import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  const { token, role } = useAuth();

  return (
    <>
      <Navbar />
      <Routes>

        {/* public routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/doctors/:doctorId" element={<DoctorDetail />} />

        {/* auth routes — redirect to dashboard if already logged in */}
        <Route
          path="/login/patient"
          element={token && role === 'patient' ? <Navigate to="/patient/dashboard" /> : <PatientLogin />}
        />
        <Route
          path="/register/patient"
          element={token && role === 'patient' ? <Navigate to="/patient/dashboard" /> : <PatientRegister />}
        />
        <Route
          path="/login/doctor"
          element={token && role === 'doctor' ? <Navigate to="/doctor/dashboard" /> : <DoctorLogin />}
        />
        <Route
          path="/signup/doctor"
          element={token && role === 'doctor' ? <Navigate to="/doctor/dashboard" /> : <DoctorSignup />}
        />

        {/* patient protected routes */}
        <Route element={<ProtectedRoute allowedRole="patient" />}>
          <Route path="/patient/dashboard" element={<PatientDashboard />} />
          <Route path="/patient/profile" element={<PatientProfile />} />
          <Route path="/patient/bookings" element={<PatientBookings />} />
          <Route path="/patient/records" element={<PatientRecords />} />
          <Route path="/patient/browse" element={<BrowseDoctors />} />
        </Route>

        {/* doctor protected routes */}
        <Route element={<ProtectedRoute allowedRole="doctor" />}>
          <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
          <Route path="/doctor/profile" element={<DoctorProfile />} />
          <Route path="/doctor/slots" element={<DoctorSlots />} />
          <Route path="/doctor/bookings" element={<DoctorBookings />} />
          <Route path="/doctor/records" element={<DoctorRecords />} />
        </Route>

        {/* fallback */}
        <Route path="*" element={<Navigate to="/" />} />

      </Routes>
    </>
  );
}
