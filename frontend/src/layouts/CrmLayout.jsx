import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Flame, Bell, X } from 'lucide-react';
import CrmSidebar from '../features/crm/components/CrmSidebar';
import CrmHeader from '../features/crm/components/CrmHeader';

const CrmLayout = () => {
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [toastNotification, setToastNotification] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let activeUser = null;
    try {
      const crmUserRaw = localStorage.getItem('crm_user');
      if (crmUserRaw) {
        activeUser = JSON.parse(crmUserRaw);
      } else {
        const userRaw = localStorage.getItem('user');
        if (userRaw) {
          activeUser = JSON.parse(userRaw);
        }
      }
    } catch (e) {}

    if (!activeUser) {
      navigate('/auth');
      return;
    }

    const rawRole = String(activeUser.role || '').toUpperCase();
    let normRole = rawRole;
    if (['SUPER_ADMIN', 'ADMIN', 'CEO'].includes(rawRole)) normRole = 'SUPER_ADMIN';
    else if (['MANAGER', 'QUAN_LY'].includes(rawRole)) normRole = 'MANAGER';
    else if (['SALES', 'SALES_STAFF', 'STAFF', 'NHAN_VIEN'].includes(rawRole)) normRole = 'SALES';

    if (rawRole === 'OTHER' || rawRole === 'CUSTOMER' || rawRole === 'USER') {
      alert('Tài khoản của bạn chỉ có quyền xem sản phẩm và mua hàng.');
      navigate('/shop');
      return;
    }

    const allowedCrmRoles = ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'SALES'];
    if (!allowedCrmRoles.includes(normRole)) {
      navigate('/auth');
      return;
    }

    setUser({ ...activeUser, role: normRole });
  }, [navigate]);

  const handleRoleChange = (newRole) => {
    if (newRole === 'OTHER') {
      alert('Tài khoản của bạn chỉ có quyền xem sản phẩm và mua hàng.');
      navigate('/shop');
      return;
    }
    const updatedUser = {
      ...(user || {}),
      role: newRole,
      fullName: newRole === 'SUPER_ADMIN' ? 'Super Admin CRM' : newRole === 'MANAGER' ? 'Manager CRM' : 'Sales Staff'
    };
    localStorage.setItem('crm_user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  // Poll for lead updates or socket fallback
  useEffect(() => {
    const handleCustomToast = (event) => {
      if (event.detail) {
        setToastNotification(event.detail);
        setTimeout(() => setToastNotification(null), 5000);
      }
    };
    window.addEventListener('crm:toast', handleCustomToast);
    return () => window.removeEventListener('crm:toast', handleCustomToast);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('crm_user');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('cart');
    localStorage.removeItem('guest_cart');
    window.location.href = '/auth';
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex relative">
      {/* Toast Notification */}
      {toastNotification && (
        <div className="fixed top-5 right-5 z-50 bg-white border border-red-500/30 rounded-xl p-4 shadow-2xl flex items-start gap-3 max-w-sm animate-in slide-in-from-top duration-300">
          <div className="p-2 rounded-lg bg-red-500/20 text-red-400">
            <Flame className="w-5 h-5 fill-red-400" />
          </div>
          <div className="flex-1">
            <h4 className="text-xs font-bold text-gray-900 flex items-center gap-2">
              {toastNotification.title || 'Lead HOT Mới Khởi Tạo'}
            </h4>
            <p className="text-[11px] text-[#86868b] mt-0.5">{toastNotification.message}</p>
          </div>
          <button onClick={() => setToastNotification(null)} className="text-[#86868b] hover:text-gray-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Sidebar */}
      <CrmSidebar user={user} onLogout={handleLogout} />

      {/* Main Content Area */}
      <div className="flex-1 ml-64 flex flex-col min-w-0">
        <CrmHeader user={user} searchQuery={searchQuery} setSearchQuery={setSearchQuery} onRoleChange={handleRoleChange} />
        
        <main className="p-8 flex-1 overflow-y-auto">
          <Outlet context={{ user, searchQuery }} />
        </main>
      </div>
    </div>
  );
};

export default CrmLayout;
