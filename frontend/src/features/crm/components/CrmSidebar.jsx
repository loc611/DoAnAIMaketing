import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  TrendingUp, 
  Users, 
  ShieldCheck, 
  LogOut, 
  Apple, 
  Flame, 
  Sparkles 
} from 'lucide-react';

const CrmSidebar = ({ user, onLogout }) => {
  const role = user?.role || 'VIEWER';
  const isSuperAdmin = role === 'SUPER_ADMIN' || role === 'admin';

  const navItems = [
    {
      name: 'Dashboard Vận hành',
      path: '/crm',
      icon: LayoutDashboard,
      roles: ['SUPER_ADMIN', 'MANAGER', 'SALES', 'OTHER', 'admin', 'sales_staff', 'viewer']
    },
    {
      name: 'Executive Dashboard',
      path: '/crm/executive',
      icon: TrendingUp,
      badge: 'Executive',
      roles: ['SUPER_ADMIN', 'MANAGER', 'admin']
    },
    {
      name: 'Quản lý Leads',
      path: '/crm/leads',
      icon: Flame,
      roles: ['SUPER_ADMIN', 'MANAGER', 'SALES', 'OTHER', 'admin', 'sales_staff', 'viewer']
    },
    {
      name: 'Quản lý User & RBAC',
      path: '/crm/users',
      icon: ShieldCheck,
      badge: 'Admin',
      roles: ['SUPER_ADMIN', 'MANAGER', 'admin']
    }
  ];

  return (
    <aside className="w-64 h-screen bg-white border-r border-gray-200 text-gray-900 flex flex-col justify-between fixed top-0 left-0 z-40 select-none">
      <div>
        {/* Brand Header */}
        <div className="h-16 flex items-center gap-3 px-6 border-b border-gray-200">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-gray-900 shadow-lg shadow-blue-500/20">
            <Apple className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-semibold text-sm tracking-wide text-gray-900 flex items-center gap-1.5">
              Apple CRM <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            </h1>
            <p className="text-[11px] text-[#86868b]">Hệ thống Quản lý Khách hàng</p>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="p-4 space-y-1.5">
          <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-[#86868b]">
            Menu CRM
          </div>
          {navItems.map((item) => {
            const hasPermission = item.roles.some(r => 
              r.toUpperCase() === role.toUpperCase() || 
              (r === 'admin' && (role === 'SUPER_ADMIN' || role === 'admin')) ||
              (role === 'SUPER_ADMIN')
            );
            if (!hasPermission) return null;

            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/crm'}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30'
                      : 'text-[#86868b] hover:text-gray-900 hover:bg-gray-100'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-400/20">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* User Profile & Logout */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-400 font-bold text-xs">
              {(user?.fullName || user?.email || 'U')[0].toUpperCase()}
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-gray-900 truncate">{user?.fullName || 'Tài khoản CRM'}</p>
              <span className={`inline-block text-[10px] font-bold uppercase px-1.5 py-0.2 rounded ${
                isSuperAdmin ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                role === 'SALES' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                'bg-blue-500/20 text-blue-400 border border-blue-500/30'
              }`}>
                {role}
              </span>
            </div>
          </div>

          <button
            onClick={onLogout}
            title="Đăng xuất"
            className="p-1.5 rounded-lg text-[#86868b] hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default CrmSidebar;
