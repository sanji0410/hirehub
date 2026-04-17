// components/ProtectedRoute.jsx
// Redirects unauthenticated users and enforces role-based access

import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner spinner-lg" />
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Role check: if a specific role is required, enforce it
  if (role && user.role !== role) {
    const redirect = user.role === 'employer' ? '/employer/dashboard' : '/seeker/jobs';
    return <Navigate to={redirect} replace />;
  }

  return children;
}
