// auth/RequireAuth.jsx: route guards. RequireAuth needs a token; GuestOnly is for /login and /signup.
import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from './AuthContext.jsx';

export default function RequireAuth() {
  const { token } = useAuth();
  const location = useLocation();
  if (!token) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <Outlet />;
}

export function GuestOnly() {
  const { token } = useAuth();
  const location = useLocation();
  if (token) return <Navigate to={location.state?.from || '/'} replace />;
  return <Outlet />;
}
