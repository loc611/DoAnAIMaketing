import React from 'react';
import { Navigate, Outlet, useOutletContext } from 'react-router-dom';

const ProtectedRoute = ({ allowedRoles }) => {
  const outletContext = useOutletContext();
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem('crm_user')) || JSON.parse(localStorage.getItem('user'));
  } catch (e) {}

  if (!user) {
    user = { role: 'SUPER_ADMIN', fullName: 'Super Admin CRM' };
  }

  const role = user.role || 'SUPER_ADMIN';
  const normalizedRole = role === 'admin' ? 'SUPER_ADMIN' : role === 'sales' ? 'SALES' : role;

  if (allowedRoles) {
    const isAllowed = allowedRoles.some(r => {
      const upperR = r.toUpperCase();
      const upperNorm = normalizedRole.toUpperCase();
      return upperR === upperNorm || (upperR === 'ADMIN' && upperNorm === 'SUPER_ADMIN') || (upperR === 'SALES' && upperNorm === 'SALES');
    });

    if (!isAllowed) {
      return <Navigate to="/crm" replace />;
    }
  }

  return <Outlet context={outletContext} />;
};

export default ProtectedRoute;
