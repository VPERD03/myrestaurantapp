import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  const location = useLocation();

  const redirectPath = `/login?redirect=${encodeURIComponent(location.pathname + location.search)}`;

  if (!token) {
    return <Navigate to={redirectPath} replace />;
  }

  try {
    const decoded = jwtDecode(token);
    if (decoded.exp * 1000 < Date.now()) {
      localStorage.removeItem('token');
      return <Navigate to={redirectPath} replace />;
    }

    return children;
  } catch (error) {
    localStorage.removeItem('token');
    return <Navigate to={redirectPath} replace />;
  }
}

export default ProtectedRoute;
