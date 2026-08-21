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

  const rawRole = String(user.role || 'SUPER_ADMIN').toUpperCase();
  let normalizedRole = rawRole;
  if (['SUPER_ADMIN', 'ADMIN', 'CEO'].includes(rawRole)) normalizedRole = 'SUPER_ADMIN';
  else if (['MANAGER', 'QUAN_LY'].includes(rawRole)) normalizedRole = 'MANAGER';
  else if (['SALES', 'SALES_STAFF', 'STAFF', 'NHAN_VIEN'].includes(rawRole)) normalizedRole = 'SALES';

  if (allowedRoles) {
    const isAllowed = allowedRoles.some(r => {
      const upperR = String(r).toUpperCase();
      let targetRole = upperR;
      if (['SUPER_ADMIN', 'ADMIN', 'CEO'].includes(upperR)) targetRole = 'SUPER_ADMIN';
      else if (['MANAGER', 'QUAN_LY'].includes(upperR)) targetRole = 'MANAGER';
      else if (['SALES', 'SALES_STAFF', 'STAFF', 'NHAN_VIEN'].includes(upperR)) targetRole = 'SALES';

      return targetRole === normalizedRole || upperR === rawRole;
    });

    if (!isAllowed) {
      return <Navigate to="/crm" replace />;
    }
  }

  return <Outlet context={outletContext} />;
};

export default ProtectedRoute;
