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
        return 'Quản Lý Người Dùng & Nhân Sự';
      case '/crm/roles':
        return 'Phân Quyền & Ma Trận Vai Trò (RBAC)';
      case '/crm/products':
        return 'Quản Lý Sản Phẩm & Kho Hàng';
      default:
        return 'Hệ Thống CRM Apple';
    }
  };

  const currentRole = user?.role || 'SUPER_ADMIN';

  return (
    <header className="h-16 bg-white/80 backdrop-blur-md border-b border-gray-200 px-8 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-semibold text-gray-900 tracking-tight">
          {getPageTitle()}
        </h2>
      </div>

      <div className="flex items-center gap-4">
        {/* Role Selector Badge Dropdown */}
        <div className="flex items-center gap-2 bg-white border border-gray-200 px-3 py-1.5 rounded-lg text-xs">
          <ShieldCheck className="w-4 h-4 text-blue-400" />
          <span className="text-[#86868b] font-medium hidden sm:inline">Quyền xem:</span>
          <select
            value={currentRole === 'admin' ? 'SUPER_ADMIN' : currentRole}
            onChange={(e) => onRoleChange && onRoleChange(e.target.value)}
            className="bg-white border border-gray-200 rounded px-2 py-1 text-xs font-bold text-gray-900 focus:outline-none focus:border-blue-500 cursor-pointer"
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
            className="w-full bg-gray-100 border border-gray-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-gray-900 placeholder-[#86868b] focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Back to Apple Store Landing Page */}
        <Link
          to="/"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 border border-gray-200 text-xs font-medium text-gray-900 transition-colors"
        >
          <span>Xem Landing Page</span>
          <ExternalLink className="w-3.5 h-3.5 text-[#86868b]" />
        </Link>
      </div>
    </header>
  );
};

export default CrmHeader;
