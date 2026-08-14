import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, ExternalLink, ShieldCheck, User } from 'lucide-react';

const CrmHeader = ({ user, searchQuery, setSearchQuery, onRoleChange }) => {
  const location = useLocation();

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/crm':
        return 'Dashboard Vận Hành';
      case '/crm/executive':
        return 'Executive Dashboard (Super Admin)';
      case '/crm/leads':
        return 'Quản Lý Leads & Cơ Hội Bán Hàng';
      case '/crm/users':
        return 'Quản Lý Người Dùng & Phân Quyền RBAC';
      default:
        return 'Hệ Thống CRM Apple';
    }
  };

  const currentRole = user?.role || 'SUPER_ADMIN';

  return (
    <header className="h-16 bg-[#090a0f]/80 backdrop-blur-md border-b border-white/10 px-8 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-semibold text-white tracking-tight">
          {getPageTitle()}
        </h2>
      </div>

      <div className="flex items-center gap-4">
        {/* Role Selector Badge Dropdown */}
        <div className="flex items-center gap-2 bg-[#12141d] border border-white/10 px-3 py-1.5 rounded-lg text-xs">
          <ShieldCheck className="w-4 h-4 text-blue-400" />
          <span className="text-[#86868b] font-medium hidden sm:inline">Quyền xem:</span>
          <select
            value={currentRole === 'admin' ? 'SUPER_ADMIN' : currentRole}
            onChange={(e) => onRoleChange && onRoleChange(e.target.value)}
            className="bg-[#090a0f] border border-white/10 rounded px-2 py-1 text-xs font-bold text-white focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="SUPER_ADMIN">👑 Super Admin (CEO)</option>
            <option value="MANAGER">👔 Manager (Quản Lý)</option>
          </select>
        </div>

        {/* Quick Search */}
        <div className="relative w-56">
          <Search className="w-4 h-4 text-[#86868b] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm kiếm lead, email..."
            value={searchQuery || ''}
            onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-[#86868b] focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Back to Apple Store Landing Page */}
        <Link
          to="/"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-white transition-colors"
        >
          <span>Xem Landing Page</span>
          <ExternalLink className="w-3.5 h-3.5 text-[#86868b]" />
        </Link>
      </div>
    </header>
  );
};

export default CrmHeader;
