import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loader from './Loader';

export const ProtectedRoute = ({ allowedRole }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loader />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && user.role !== allowedRole) {
    // Redirect employee trying to access HR back to employee dashboard
    // and vice versa
    return <Navigate to={user.role === 'employee' ? '/employee' : '/hr'} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
