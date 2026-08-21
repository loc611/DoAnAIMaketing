import React, { useEffect, useState } from 'react';
import { useOutletContext, useLocation } from 'react-router-dom';
import { 
  Users, 
  ShieldCheck, 
  UserPlus, 
  Lock, 
  Unlock, 
  Check, 
  X, 
  ShieldAlert, 
  Search, 
  Edit3, 
  Trash2, 
  Save, 
  Sparkles, 
  UserCheck 
} from 'lucide-react';

const API_BASE = `${import.meta.env.VITE_API_URL || ''}/api/v1/crm`;

const UserManagement = () => {
  const context = useOutletContext() || {};
  const user = context.user;
  const location = useLocation();

  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [matrix, setMatrix] = useState([]);
  const [activeTab, setActiveTab] = useState(location.pathname.includes('/crm/roles') ? 'matrix' : 'users'); // 'users' | 'matrix'
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  useEffect(() => {
    if (location.pathname.includes('/crm/roles')) {
      setActiveTab('matrix');
    } else if (location.pathname.includes('/crm/users')) {
      setActiveTab('users');
    }
  }, [location.pathname]);

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);

  // New User Form State
  const [newUserForm, setNewUserForm] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    role: 'SALES',
    status: 'ACTIVE',
    address: '',
    gender: '',
    dob: '',
    notes: ''
  });

  const [savingMatrix, setSavingMatrix] = useState(false);
  const [savingUser, setSavingUser] = useState(false);
  const [actionError, setActionError] = useState(null);

  const role = (user?.role || 'SUPER_ADMIN').toUpperCase();
  const isSuperAdmin = role === 'SUPER_ADMIN' || role === 'ADMIN';
  const isManager = role === 'MANAGER';
  const isAuthorized = isSuperAdmin || isManager;

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/users`, {
        headers: { 
          'Authorization': token ? `Bearer ${token}` : '',
          'X-CRM-Role': role
        }
      });
      if (res.ok) {
        const json = await res.json();
        setUsersList(json.users || []);
        setMatrix(json.permissionMatrix || []);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [role]);

  // Create New User
  const handleCreateUser = async (e) => {
    e.preventDefault();
    setSavingUser(true);
    setActionError(null);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
          'X-CRM-Role': role
        },
        body: JSON.stringify(newUserForm)
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Có lỗi xảy ra khi tạo tài khoản.');
      }

      setIsAddOpen(false);
      setNewUserForm({ fullName: '', email: '', password: '', phone: '', role: 'SALES', status: 'ACTIVE', address: '', gender: '', dob: '', notes: '' });
      fetchUsers();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setSavingUser(false);
    }
  };

  // Update User Details / Role
  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    setSavingUser(true);
    setActionError(null);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/users/${editingUser.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
          'X-CRM-Role': role
        },
        body: JSON.stringify({
          fullName: editingUser.fullName,
          email: editingUser.email,
          phone: editingUser.phone,
          role: editingUser.role,
          status: editingUser.status,
          address: editingUser.address,
          gender: editingUser.gender,
          dob: editingUser.dob,
          notes: editingUser.notes
        })
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Có lỗi xảy ra khi cập nhật.');
      }

      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setSavingUser(false);
    }
  };

  // Toggle Lock/Unlock User Status
  const handleToggleStatus = async (userObj) => {
    const nextStatus = userObj.status === 'ACTIVE' ? 'LOCKED' : 'ACTIVE';
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/users/${userObj.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
          'X-CRM-Role': role
        },
        body: JSON.stringify({ status: nextStatus })
      });
      if (res.ok) fetchUsers();
    } catch (err) {
      console.error('Failed to toggle status:', err);
    }
  };

  // Delete User
  const handleDeleteUser = async () => {
    if (!deletingUser) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/users/${deletingUser.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'X-CRM-Role': role
        }
      });
      if (res.ok) {
        setDeletingUser(null);
        fetchUsers();
      }
    } catch (err) {
      console.error('Failed to delete user:', err);
    }
  };

  // Toggle Checkbox in Permission Matrix
  const handleMatrixCheckboxChange = (featureId, roleKey) => {
    if (!isSuperAdmin) return;
    setMatrix(prev => prev.map(item => {
      if (item.id === featureId) {
        return { ...item, [roleKey]: !item[roleKey] };
      }
      return item;
    }));
  };

  // Save Dynamic Permission Matrix
  const handleSaveMatrix = async () => {
    setSavingMatrix(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/permission-matrix`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
          'X-CRM-Role': role
        },
        body: JSON.stringify({ permissionMatrix: matrix })
      });
      if (res.ok) {
        alert('Đã lưu cấu hình ma trận phân quyền thành công!');
      }
    } catch (err) {
      console.error('Lỗi khi lưu ma trận quyền:', err);
    } finally {
      setSavingMatrix(false);
    }
  };

  if (!isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center h-96 bg-white rounded-2xl border border-red-500/20 p-8 text-center">
        <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mb-4">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-gray-900 mb-1">Quyền Hạn Bị Giới Hạn</h2>
        <p className="text-sm text-[#86868b] max-w-md">
          Chức năng Quản lý Người dùng & Gán Role RBAC chỉ dành cho <span className="text-red-400 font-semibold">SUPER_ADMIN</span> và <span className="text-blue-400 font-semibold">MANAGER</span>.
        </p>
      </div>
    );
  }

  const [schemaFilter, setSchemaFilter] = useState('ALL'); // 'ALL' | 'CUSTOMER' | 'SALES' | 'ADMIN'

  const customerCount = usersList.filter(u => u.schemaGroup === 'customer' || (u.role || '').toUpperCase() === 'OTHER' || (u.role || '').toUpperCase() === 'CUSTOMER').length;
  const salesCount = usersList.filter(u => u.schemaGroup === 'sales' || (u.role || '').toUpperCase() === 'SALES').length;
  const adminCount = usersList.filter(u => u.schemaGroup === 'admin' || (u.role || '').toUpperCase() === 'SUPER_ADMIN' || (u.role || '').toUpperCase() === 'MANAGER').length;

  const filteredUsers = usersList.filter(u => {
    const matchesSearch = (u.fullName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (u.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (u.phone || '').includes(searchQuery);
    const matchesRole = roleFilter ? u.role === roleFilter : true;
    
    let matchesSchema = true;
    if (schemaFilter === 'CUSTOMER') {
      matchesSchema = u.schemaGroup === 'customer' || (u.role || '').toUpperCase() === 'OTHER' || (u.role || '').toUpperCase() === 'CUSTOMER';
    } else if (schemaFilter === 'SALES') {
      matchesSchema = u.schemaGroup === 'sales' || (u.role || '').toUpperCase() === 'SALES';
    } else if (schemaFilter === 'ADMIN') {
      matchesSchema = u.schemaGroup === 'admin' || (u.role || '').toUpperCase() === 'SUPER_ADMIN' || (u.role || '').toUpperCase() === 'MANAGER';
    }

    return matchesSearch && matchesRole && matchesSchema;
  });

  const getRoleBadge = (uRole, schemaGroup) => {
    const r = (uRole || '').toUpperCase();
    if (r === 'SUPER_ADMIN' || r === 'ADMIN') {
      return (
        <div className="flex flex-col gap-0.5">
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-600 border border-red-200 w-fit">👑 SUPER ADMIN</span>
          <span className="text-[9px] text-gray-600 font-mono">admin.users</span>
        </div>
      );
    }
    if (r === 'MANAGER') {
      return (
        <div className="flex flex-col gap-0.5">
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-200 w-fit">👔 MANAGER</span>
          <span className="text-[9px] text-gray-600 font-mono">admin.users</span>
        </div>
      );
    }
    if (r === 'SALES' || schemaGroup === 'sales') {
      return (
        <div className="flex flex-col gap-0.5">
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-200 w-fit">💼 SALES</span>
          <span className="text-[9px] text-gray-600 font-mono">sales.staff</span>
        </div>
      );
    }
    return (
      <div className="flex flex-col gap-0.5">
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200 w-fit">🛍️ KHÁCH HÀNG</span>
        <span className="text-[9px] text-gray-600 font-mono">customer.users</span>
      </div>
    );
  };

  return (
    <div className="space-y-6 w-full">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            Quản Lý Người Dùng & Phân Tách Schema
          </h1>
          <p className="text-sm text-[#86868b] mt-0.5">
            Phân tách theo 3 Schema: <span className="font-semibold text-emerald-600">customer.users</span> (Khách hàng), <span className="font-semibold text-amber-600">sales.staff</span> (Nhân viên), <span className="font-semibold text-red-600">admin.users</span> (Quản trị).
          </p>
        </div>

        {/* Tab Toggle & Add User Action */}
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200 text-sm">
            <button
              onClick={() => setActiveTab('users')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
                activeTab === 'users' ? 'bg-blue-600 text-white' : 'text-[#86868b] hover:text-gray-900'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Danh Sách User ({usersList.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('matrix')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
                activeTab === 'matrix' ? 'bg-blue-600 text-white' : 'text-[#86868b] hover:text-gray-900'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Ma Trận Phân Quyền</span>
            </button>
          </div>

          {isSuperAdmin && activeTab === 'users' && (
            <button
              onClick={() => setIsAddOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold shadow-lg shadow-blue-500/20 transition-all"
            >
              <UserPlus className="w-4 h-4" />
              <span>Tạo User Mới</span>
            </button>
          )}
        </div>
      </div>

      {/* TAB 1: DANH SÁCH USER (USER LIST & CRUD) */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          
          {/* Schema Category Tabs Filter */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button
              onClick={() => setSchemaFilter('ALL')}
              className={`p-3 rounded-xl border text-left transition-all ${
                schemaFilter === 'ALL'
                  ? 'bg-blue-50/50 border-blue-500 ring-2 ring-blue-500/20'
                  : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-xs text-gray-500 font-medium">Toàn bộ tài khoản</div>
              <div className="text-lg font-bold text-gray-900 mt-0.5">{usersList.length}</div>
              <div className="text-[11px] text-blue-600 font-medium mt-1">Tất cả các Schema</div>
            </button>

            <button
              onClick={() => setSchemaFilter('CUSTOMER')}
              className={`p-3 rounded-xl border text-left transition-all ${
                schemaFilter === 'CUSTOMER'
                  ? 'bg-emerald-50/50 border-emerald-500 ring-2 ring-emerald-500/20'
                  : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-xs text-gray-500 font-medium">🛍️ Khách Hàng</div>
              <div className="text-lg font-bold text-emerald-600 mt-0.5">{customerCount}</div>
              <div className="text-[11px] text-gray-500 font-mono mt-1">customer.users</div>
            </button>

            <button
              onClick={() => setSchemaFilter('SALES')}
              className={`p-3 rounded-xl border text-left transition-all ${
                schemaFilter === 'SALES'
                  ? 'bg-amber-50/50 border-amber-500 ring-2 ring-amber-500/20'
                  : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-xs text-gray-500 font-medium">💼 Nhân Viên Sales</div>
              <div className="text-lg font-bold text-amber-600 mt-0.5">{salesCount}</div>
              <div className="text-[11px] text-gray-500 font-mono mt-1">sales.staff</div>
            </button>

            <button
              onClick={() => setSchemaFilter('ADMIN')}
              className={`p-3 rounded-xl border text-left transition-all ${
                schemaFilter === 'ADMIN'
                  ? 'bg-red-50/50 border-red-500 ring-2 ring-red-500/20'
                  : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-xs text-gray-500 font-medium">👑 Ban Quản Trị</div>
              <div className="text-lg font-bold text-red-600 mt-0.5">{adminCount}</div>
              <div className="text-[11px] text-gray-500 font-mono mt-1">admin.users</div>
            </button>
          </div>

          {/* Search & Filter Bar */}
          <div className="p-4 rounded-xl bg-white border border-gray-200 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="relative w-64">
                <Search className="w-3.5 h-3.5 text-[#86868b] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm theo tên, email, sđt..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-100 border border-gray-200 rounded-lg pl-8 pr-3 py-1.5 text-sm text-gray-900 placeholder-[#86868b] focus:outline-none focus:border-blue-500"
                />
              </div>

              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="bg-gray-100 border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-900 focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="" className="bg-white">Tất cả vai trò</option>
                <option value="SUPER_ADMIN" className="bg-white">👑 Super Admin (CEO)</option>
                <option value="MANAGER" className="bg-white">👔 Manager (Quản lý)</option>
                <option value="SALES" className="bg-white">💼 Sales Staff</option>
                <option value="OTHER" className="bg-white">🛍️ Khách Hàng (Customer)</option>
              </select>
            </div>

            <div className="text-sm text-[#86868b]">
              Hiển thị <span className="font-semibold text-gray-900">{filteredUsers.length}</span> / {usersList.length} tài khoản
            </div>
          </div>

          {/* Table of Users */}
          <div className="p-6 rounded-xl bg-white border border-gray-200 overflow-x-auto">
            {loading ? (
              <div className="flex h-40 items-center justify-center text-sm text-[#86868b]">
                Đang tải danh sách người dùng...
              </div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-[#86868b] uppercase tracking-wider font-semibold">
                    <th className="py-3 px-4 whitespace-nowrap">Nhân Sự</th>
                    <th className="py-3 px-4 whitespace-nowrap">Email / SĐT</th>
                    <th className="py-3 px-4 whitespace-nowrap">Vai Trò (Role)</th>
                    <th className="py-3 px-4 whitespace-nowrap">Trạng Thái</th>
                    <th className="py-3 px-4 whitespace-nowrap">Ngày Sinh</th>
                    <th className="py-3 px-4 min-w-[150px]">Địa Chỉ</th>
                    <th className="py-3 px-4 min-w-[150px]">Ghi Chú</th>
                    <th className="py-3 px-4 whitespace-nowrap">Leads Được Gán</th>
                    {isSuperAdmin && <th className="py-3 px-4 text-right whitespace-nowrap">Thao Tác</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-8 text-center text-[#86868b]">
                        Không tìm thấy tài khoản nhân sự phù hợp.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-gray-900 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-200 border border-gray-200 flex items-center justify-center font-bold text-blue-400">
                            {(u.fullName || u.email || 'U')[0].toUpperCase()}
                          </div>
                          <div>
                            <div>{u.fullName || 'Chưa đặt tên'}</div>
                            <div className="text-[10px] text-[#86868b]">ID: {u.id.slice(0, 8)}...</div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-[#86868b]">
                          <div>{u.email}</div>
                          <div className="text-[11px] text-gray-400">{u.phone || 'Chưa có SĐT'}</div>
                        </td>
                        <td className="py-3.5 px-4">{getRoleBadge(u.role, u.schemaGroup)}</td>
                        <td className="py-3.5 px-4">
                          <button
                            disabled={!isSuperAdmin}
                            onClick={() => handleToggleStatus(u)}
                            className={`px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1 transition-colors ${
                              u.status === 'ACTIVE'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-red-500/10 text-red-400 border border-red-500/20'
                            }`}
                          >
                            {u.status === 'ACTIVE' ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                            <span>{u.status === 'ACTIVE' ? 'ĐANG HOẠT ĐỘNG' : 'ĐÃ KHÓA'}</span>
                          </button>
                        </td>
                        <td className="py-3.5 px-4 text-[#86868b] text-[13px] whitespace-nowrap">
                          {u.dob ? new Date(u.dob).toLocaleDateString('vi-VN') : '—'}
                        </td>
                        <td className="py-3.5 px-4 text-[#86868b] text-[13px] max-w-[200px] truncate" title={u.address}>
                          {u.address || '—'}
                        </td>
                        <td className="py-3.5 px-4 text-[#86868b] text-[13px] max-w-[200px] truncate" title={u.notes}>
                          {u.notes || '—'}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-gray-900 whitespace-nowrap">
                          {u._count?.assignedLeads || 0} leads
                        </td>
                        {isSuperAdmin && (
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => setEditingUser(u)}
                                className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-blue-400 transition-colors"
                                title="Sửa thông tin / Role"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setDeletingUser(u)}
                                className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                                title="Xóa tài khoản"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: MA TRẬN PHÂN QUYỀN ĐỘNG (DYNAMIC PERMISSION MATRIX) */}
      {activeTab === 'matrix' && (
        <div className="p-6 rounded-xl bg-white border border-gray-200 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-400" /> Bảng Ma Trận Phân Quyền Chi Tiết (RBAC Settings)
              </h3>
              <p className="text-sm text-[#86868b] mt-0.5">
                {isSuperAdmin
                  ? 'Bật/tắt checkbox để điều chỉnh quyền truy cập từng tính năng cho 4 vai trò.'
                  : 'Chế độ xem ma trận phân quyền (Chỉ Super Admin mới có quyền thay đổi).'}
              </p>
            </div>

            {isSuperAdmin && (
              <button
                onClick={handleSaveMatrix}
                disabled={savingMatrix}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold flex items-center gap-1.5 shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{savingMatrix ? 'Đang lưu...' : 'Lưu Cấu Hình Quyền'}</span>
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-[#86868b] uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">Tính Năng / Quyền Hạn</th>
                  <th className="py-3 px-4 text-center text-red-400">👑 Super Admin (CEO)</th>
                  <th className="py-3 px-4 text-center text-blue-400">👔 Manager (Quản lý)</th>
                  <th className="py-3 px-4 text-center text-amber-400">💼 Sales Staff</th>
                  <th className="py-3 px-4 text-center text-gray-400">👁️ Other (Xem/Khác)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {matrix.map((row) => (
                  <tr key={row.id || row.feature} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-gray-900">{row.feature}</td>
                    
                    {/* Super Admin Checkbox */}
                    <td className="py-3.5 px-4 text-center">
                      <input
                        type="checkbox"
                        checked={!!row.superAdmin}
                        disabled={!isSuperAdmin}
                        onChange={() => handleMatrixCheckboxChange(row.id, 'superAdmin')}
                        className="w-4 h-4 rounded accent-red-500 cursor-pointer"
                      />
                    </td>

                    {/* Manager Checkbox */}
                    <td className="py-3.5 px-4 text-center">
                      <input
                        type="checkbox"
                        checked={!!row.manager}
                        disabled={!isSuperAdmin}
                        onChange={() => handleMatrixCheckboxChange(row.id, 'manager')}
                        className="w-4 h-4 rounded accent-blue-500 cursor-pointer"
                      />
                    </td>

                    {/* Sales Checkbox */}
                    <td className="py-3.5 px-4 text-center">
                      <input
                        type="checkbox"
                        checked={!!row.sales}
                        disabled={!isSuperAdmin}
                        onChange={() => handleMatrixCheckboxChange(row.id, 'sales')}
                        className="w-4 h-4 rounded accent-amber-500 cursor-pointer"
                      />
                    </td>

                    {/* Other Checkbox */}
                    <td className="py-3.5 px-4 text-center">
                      <input
                        type="checkbox"
                        checked={!!row.other}
                        disabled={!isSuperAdmin}
                        onChange={() => handleMatrixCheckboxChange(row.id, 'other')}
                        className="w-4 h-4 rounded accent-gray-500 cursor-pointer"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: TẠO USER MỚI */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl p-6 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-blue-400" /> Tạo Tài Khoản User Mới
              </h3>
              <button onClick={() => setIsAddOpen(false)} className="text-[#86868b] hover:text-gray-900">
                <X className="w-4 h-4" />
              </button>
            </div>

            {actionError && (
              <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-sm text-red-300">
                {actionError}
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-3 text-sm">
              <div>
                <label className="block text-[#86868b] mb-1 font-medium">Họ và Tên</label>
                <input
                  type="text"
                  required
                  value={newUserForm.fullName}
                  onChange={(e) => setNewUserForm({ ...newUserForm, fullName: e.target.value })}
                  placeholder="Ví dụ: Nguyễn Văn A"
                  className="w-full bg-gray-100 border border-gray-200 rounded-lg p-2.5 text-gray-900 placeholder-[#86868b] focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[#86868b] mb-1 font-medium">Email Đăng Nhập</label>
                <input
                  type="email"
                  required
                  value={newUserForm.email}
                  onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                  placeholder="admin@apple.crm"
                  className="w-full bg-gray-100 border border-gray-200 rounded-lg p-2.5 text-gray-900 placeholder-[#86868b] focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[#86868b] mb-1 font-medium">Mật Khẩu</label>
                <input
                  type="password"
                  required
                  value={newUserForm.password}
                  onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full bg-gray-100 border border-gray-200 rounded-lg p-2.5 text-gray-900 placeholder-[#86868b] focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[#86868b] mb-1 font-medium">Số Điện Thoại</label>
                <input
                  type="tel"
                  value={newUserForm.phone}
                  onChange={(e) => setNewUserForm({ ...newUserForm, phone: e.target.value })}
                  placeholder="0901234567"
                  className="w-full bg-gray-100 border border-gray-200 rounded-lg p-2.5 text-gray-900 placeholder-[#86868b] focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#86868b] mb-1 font-medium">Vai Trò (Role)</label>
                  <select
                    value={newUserForm.role}
                    onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value })}
                    className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-gray-900 focus:outline-none focus:border-blue-500"
                  >
                    <option value="SUPER_ADMIN">👑 Super Admin (admin.users)</option>
                    <option value="MANAGER">👔 Manager (admin.users)</option>
                    <option value="SALES">💼 Sales Staff (sales.staff)</option>
                    <option value="OTHER">🛍️ Khách Hàng (customer.users)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#86868b] mb-1 font-medium">Trạng Thái</label>
                  <select
                    value={newUserForm.status}
                    onChange={(e) => setNewUserForm({ ...newUserForm, status: e.target.value })}
                    className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-gray-900 focus:outline-none focus:border-blue-500"
                  >
                    <option value="ACTIVE">Mở hoạt động</option>
                    <option value="LOCKED">Khóa tài khoản</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#86868b] mb-1 font-medium">Địa chỉ</label>
                <input
                  type="text"
                  value={newUserForm.address}
                  onChange={(e) => setNewUserForm({ ...newUserForm, address: e.target.value })}
                  placeholder="Ví dụ: 123 Đường ABC, Quận 1, TP.HCM"
                  className="w-full bg-gray-100 border border-gray-200 rounded-lg p-2.5 text-gray-900 placeholder-[#86868b] focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#86868b] mb-1 font-medium">Giới tính</label>
                  <select
                    value={newUserForm.gender}
                    onChange={(e) => setNewUserForm({ ...newUserForm, gender: e.target.value })}
                    className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-gray-900 focus:outline-none focus:border-blue-500"
                  >
                    <option value="">-- Chọn giới tính --</option>
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#86868b] mb-1 font-medium">Ngày sinh</label>
                  <input
                    type="date"
                    value={newUserForm.dob ? new Date(newUserForm.dob).toISOString().split('T')[0] : ''}
                    onChange={(e) => setNewUserForm({ ...newUserForm, dob: e.target.value })}
                    className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-gray-900 focus:outline-none focus:border-blue-500 [color-scheme:dark]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#86868b] mb-1 font-medium">Ghi chú</label>
                <textarea
                  value={newUserForm.notes}
                  onChange={(e) => setNewUserForm({ ...newUserForm, notes: e.target.value })}
                  placeholder="Nhập ghi chú thêm..."
                  rows={2}
                  className="w-full bg-gray-100 border border-gray-200 rounded-lg p-2.5 text-gray-900 placeholder-[#86868b] focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div className="pt-3 border-t border-gray-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={savingUser}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-lg shadow-blue-500/20 disabled:opacity-50"
                >
                  {savingUser ? 'Đang tạo...' : 'Tạo Tài Khoản'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: SỬA USER */}
      {editingUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl p-6 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-blue-400" /> Sửa Thông Tin User
              </h3>
              <button onClick={() => setEditingUser(null)} className="text-[#86868b] hover:text-gray-900">
                <X className="w-4 h-4" />
              </button>
            </div>

            {actionError && (
              <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-sm text-red-300">
                {actionError}
              </div>
            )}

            <form onSubmit={handleUpdateUser} className="space-y-3 text-sm">
              <div>
                <label className="block text-[#86868b] mb-1 font-medium">Họ và Tên</label>
                <input
                  type="text"
                  required
                  value={editingUser.fullName}
                  onChange={(e) => setEditingUser({ ...editingUser, fullName: e.target.value })}
                  className="w-full bg-gray-100 border border-gray-200 rounded-lg p-2.5 text-gray-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[#86868b] mb-1 font-medium">Email</label>
                <input
                  type="email"
                  required
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  className="w-full bg-gray-100 border border-gray-200 rounded-lg p-2.5 text-gray-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[#86868b] mb-1 font-medium">Số Điện Thoại</label>
                <input
                  type="tel"
                  value={editingUser.phone || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                  className="w-full bg-gray-100 border border-gray-200 rounded-lg p-2.5 text-gray-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#86868b] mb-1 font-medium">Vai Trò (Role)</label>
                  <select
                    value={editingUser.role}
                    onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                    className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-gray-900 focus:outline-none focus:border-blue-500"
                  >
                    <option value="SUPER_ADMIN">👑 Super Admin (admin.users)</option>
                    <option value="MANAGER">👔 Manager (admin.users)</option>
                    <option value="SALES">💼 Sales Staff (sales.staff)</option>
                    <option value="OTHER">🛍️ Khách Hàng (customer.users)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#86868b] mb-1 font-medium">Trạng Thái</label>
                  <select
                    value={editingUser.status}
                    onChange={(e) => setEditingUser({ ...editingUser, status: e.target.value })}
                    className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-gray-900 focus:outline-none focus:border-blue-500"
                  >
                    <option value="ACTIVE">Mở hoạt động</option>
                    <option value="LOCKED">Khóa tài khoản</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#86868b] mb-1 font-medium">Địa chỉ</label>
                <input
                  type="text"
                  value={editingUser.address || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, address: e.target.value })}
                  className="w-full bg-gray-100 border border-gray-200 rounded-lg p-2.5 text-gray-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#86868b] mb-1 font-medium">Giới tính</label>
                  <select
                    value={editingUser.gender || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, gender: e.target.value })}
                    className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-gray-900 focus:outline-none focus:border-blue-500"
                  >
                    <option value="">-- Chọn giới tính --</option>
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#86868b] mb-1 font-medium">Ngày sinh</label>
                  <input
                    type="date"
                    value={editingUser.dob ? new Date(editingUser.dob).toISOString().split('T')[0] : ''}
                    onChange={(e) => setEditingUser({ ...editingUser, dob: e.target.value })}
                    className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-gray-900 focus:outline-none focus:border-blue-500 [color-scheme:dark]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#86868b] mb-1 font-medium">Ghi chú</label>
                <textarea
                  value={editingUser.notes || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, notes: e.target.value })}
                  rows={2}
                  className="w-full bg-gray-100 border border-gray-200 rounded-lg p-2.5 text-gray-900 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div className="pt-3 border-t border-gray-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={savingUser}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-lg shadow-blue-500/20 disabled:opacity-50"
                >
                  {savingUser ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: XÁC NHẬN XÓA USER */}
      {deletingUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white border border-red-500/30 rounded-2xl p-6 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-red-400">
              <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Xóa Tài Khoản?</h3>
                <p className="text-sm text-[#86868b]">Hành động này không thể hoàn tác.</p>
              </div>
            </div>

            <p className="text-sm text-gray-300">
              Bạn có chắc chắn muốn xóa tài khoản <b className="text-gray-900">{deletingUser.fullName || deletingUser.email}</b>? 
              Tất cả các Lead đang được gán cho nhân viên này sẽ chuyển về trạng thái <i>Unassigned (Chưa gán)</i>.
            </p>

            <div className="pt-2 flex justify-end gap-2 text-sm">
              <button
                onClick={() => setDeletingUser(null)}
                className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium"
              >
                Hủy
              </button>
              <button
                onClick={handleDeleteUser}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold shadow-lg shadow-red-500/20"
              >
                Xóa vĩnh viễn
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
