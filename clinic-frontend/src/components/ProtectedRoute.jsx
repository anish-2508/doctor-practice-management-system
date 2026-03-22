import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ allowedRole }) {
  const { token, role } = useAuth();

  // not logged in at all
  if (!token) {
    console.warn(`[ProtectedRoute] No token found - redirecting to /login/${allowedRole}`);
    return <Navigate to={`/login/${allowedRole}`} />;
  }

  // logged in but wrong role
  // e.g. doctor trying to access patient routes
  if (role !== allowedRole) {
    console.warn(`[ProtectedRoute] Role mismatch - User role: ${role}, Required: ${allowedRole} - redirecting to /${role}/dashboard`);
    return <Navigate to={`/${role}/dashboard`} />;
  }

  // correct role, render the child route
  console.log(`[ProtectedRoute] Access granted for role: ${role}`);
  return <Outlet />;
}