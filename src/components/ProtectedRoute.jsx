import React from 'react';
import { Link, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ allowedRoles = [] }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const userRoles = Array.isArray(user.role) ? user.role : [user.role];

  if (
    allowedRoles.length > 0 &&
    !userRoles.some((role) => allowedRoles.includes(role))
  ) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
