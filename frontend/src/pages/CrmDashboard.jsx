import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { io } from 'socket.io-client';

const socket = io(`\${import.meta.env.VITE_API_URL}`);

export default function CrmDashboard() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [toastMessage, setToastMessage] = useState(null);

  const currentUser = JSON.parse(localStorage.getItem('user')) || {};
  const isStaff = ['admin', 'manager', 'sales_staff', 'warehouse_staff'].includes(currentUser.role);
  const isAdminOrManager = ['admin', 'manager'].includes(currentUser.role);
  const isSales = currentUser.role === 'sales_staff';
  const isWarehouse = currentUser.role === 'warehouse_staff';

  useEffect(() => {
    // Chuyển hướng nếu không phải là nhân viên/quản trị viên
    if (!isStaff) {
      navigate('/');
      return;
    }
    socket.on('new_order', (data) => {
      console.log('Có đơn mới:', data);
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    });

    socket.on('order_status_update', (data) => {
      console.log('Cập nhật trạng thái đơn:', data);
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    });

    socket.on('user_activity', (data) => {
      console.log('User activity:', data);
      const action = data.type === 'register' ? 'vừa đăng ký tài khoản mới' : 'vừa đăng nhập';
      setToastMessage(`Người dùng ${data.user.fullName} ${action}.`);
      queryClient.invalidateQueries({ queryKey: ['users'] });
      
      // Tự động ẩn toast sau 5s
      setTimeout(() => setToastMessage(null), 5000);
    });

    return () => {
      socket.off('new_order');
      socket.off('order_status_update');
      socket.off('user_activity');
    };
  }, [queryClient, isStaff, navigate]);



  const { data: users = [], isLoading: loadingUsers, error: usersError } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await fetch(`\${import.meta.env.VITE_API_URL}/api/users`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (!res.ok) throw new Error('Lỗi tải người dùng');
      return res.json();
    },
    enabled: !!currentUser.role
  });

  const { data: orders = [], isLoading: loadingOrders, error: ordersError } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const res = await fetch(`\${import.meta.env.VITE_API_URL}/api/orders`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (!res.ok) throw new Error('Lỗi tải đơn hàng');
      return res.json();
    },
    enabled: !!currentUser.role
  });

  const { data: leadsData, isLoading: loadingLeads, error: leadsError } = useQuery({
    queryKey: ['leads'],
    queryFn: async () => {
      const res = await fetch(`\${import.meta.env.VITE_API_URL}/api/v1/crm/leads`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (!res.ok) throw new Error('Lỗi tải danh sách khách hàng quan tâm');
      return res.json();
    },
    enabled: !!currentUser.role
  });

  const leads = leadsData?.leads || [];

  const loading = loadingUsers || loadingOrders || loadingLeads;
  const error = usersError?.message || ordersError?.message || leadsError?.message;

  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, newStatus }) => {
      const response = await fetch(`\${import.meta.env.VITE_API_URL}/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (!response.ok) throw new Error('Lỗi khi cập nhật trạng thái');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: (err) => {
      alert(err.message);
    }
  });

  const handleStatusChange = (orderId, newStatus) => {
    updateStatusMutation.mutate({ orderId, newStatus });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  // Tính toán thống kê
  const totalRevenue = orders
    .filter(o => o.status === 'COMPLETED')
    .reduce((sum, o) => sum + o.totalAmount, 0);
  
  const totalOrders = orders.length;
  const totalCustomers = users.length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 text-black pt-24 flex justify-center">
        <p className="text-[#86868b]">Đang tải dữ liệu CRM...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 text-black pt-24 flex justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-black pt-20 px-4 pb-20">
      <div className="w-full">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold">Dashboard Quản Trị</h1>
            <p className="text-[#86868b] mt-1">Xin chào, {currentUser?.fullName}</p>
          </div>
          <button 
            onClick={() => queryClient.invalidateQueries()}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-sm font-medium transition-colors"
          >
            Làm mới
          </button>
        </div>

        {/* Thống kê Tổng quan (Overview Cards) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {isAdminOrManager && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-3xl border border-white/5"
            >
              <div className="text-4xl mb-2">👥</div>
              <p className="text-[#86868b] text-sm">Tổng Khách Hàng</p>
              <p className="text-3xl font-bold mt-1">{totalCustomers}</p>
            </motion.div>
          )}

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-6 rounded-3xl border border-white/5"
          >
            <div className="text-4xl mb-2">📦</div>
            <p className="text-[#86868b] text-sm">Tổng Đơn Hàng</p>
            <p className="text-3xl font-bold mt-1">{totalOrders}</p>
          </motion.div>

          {isAdminOrManager && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white p-6 rounded-3xl border border-white/5 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/20 rounded-full blur-3xl" />
              <div className="text-4xl mb-2 relative z-10">💰</div>
              <p className="text-[#86868b] text-sm relative z-10">Tổng Doanh Thu</p>
              <p className="text-3xl font-bold mt-1 text-orange-400 relative z-10">{formatPrice(totalRevenue)}</p>
            </motion.div>
          )}
        </div>

        {/* Bảng Quản lý Đơn hàng */}
        <div className="mb-12">
          <h2 className="text-xl font-bold mb-6">Đơn hàng mới nhất</h2>
          <div className="bg-white rounded-3xl border border-white/5 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-black/10 text-sm text-[#86868b]">
                    <th className="p-4 font-medium">Mã Đơn</th>
                    <th className="p-4 font-medium">Khách hàng</th>
                    <th className="p-4 font-medium">Ngày đặt</th>
                    <th className="p-4 font-medium">Tổng tiền</th>
                    <th className="p-4 font-medium">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-4 text-center text-[#86868b]">Chưa có đơn hàng nào</td>
                    </tr>
                  ) : (
                    orders.slice(0, 10).map(order => (
                      <tr key={order.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="p-4 font-mono text-xs uppercase">{order.id.slice(0, 8)}</td>
                        <td className="p-4">{order.user?.fullName || 'Khách Vô Danh'}</td>
                        <td className="p-4">{formatDate(order.createdAt)}</td>
                        <td className="p-4 font-medium">{formatPrice(order.totalAmount)}</td>
                        <td className="p-4 flex gap-2 items-center">
                          {order.status === 'PENDING' ? (
                            <button
                              onClick={() => handleStatusChange(order.id, 'PROCESSING')}
                              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-full transition-colors shadow-lg shadow-blue-500/30"
                            >
                              Xác nhận đơn
                            </button>
                          ) : (
                            <select 
                              value={order.status}
                              onChange={(e) => handleStatusChange(order.id, e.target.value)}
                              className={`px-3 py-1.5 rounded-full text-xs font-bold appearance-none cursor-pointer outline-none ${
                                order.status === 'PROCESSING' ? 'bg-blue-500/20 text-blue-500 border border-blue-500/50' :
                                order.status === 'SHIPPING' ? 'bg-indigo-500/20 text-indigo-500 border border-indigo-500/50' :
                                order.status === 'CANCELLED' ? 'bg-red-500/20 text-red-500 border border-red-500/50' :
                                'bg-green-500/20 text-green-500 border border-green-500/50'
                              }`}
                            >
                              <option value="PROCESSING" className="bg-white text-blue-500">Đang xử lý</option>
                              <option value="SHIPPING" className="bg-white text-indigo-500">Đang giao</option>
                              <option value="COMPLETED" className="bg-white text-green-500">Hoàn thành</option>
                              <option value="CANCELLED" className="bg-white text-red-500">Hủy đơn</option>
                            </select>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Bảng Quản lý Khách Hàng (Chỉ Admin/Manager) */}
        {isAdminOrManager && (
          <div className="mb-12">
            <h2 className="text-xl font-bold mb-6">Danh sách Khách hàng</h2>
            <div className="bg-white rounded-3xl border border-white/5 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-black/10 text-sm text-[#86868b]">
                      <th className="p-4 font-medium">Khách hàng</th>
                      <th className="p-4 font-medium">Số điện thoại</th>
                      <th className="p-4 font-medium">Email</th>
                      <th className="p-4 font-medium">Ngày đăng ký</th>
                      <th className="p-4 font-medium">Đăng nhập lần cuối</th>
                      <th className="p-4 font-medium">Tổng số đơn</th>
                      <th className="p-4 font-medium">Vai trò</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="p-4 text-center text-[#86868b]">Chưa có khách hàng nào</td>
                      </tr>
                    ) : (
                      users.map(user => (
                        <tr key={user.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="p-4 font-medium">{user.fullName}</td>
                          <td className="p-4 text-[#86868b]">{user.phone || 'Chưa cập nhật'}</td>
                          <td className="p-4 text-[#86868b]">{user.email || 'Chưa cập nhật'}</td>
                          <td className="p-4">{formatDate(user.createdAt)}</td>
                          <td className="p-4">{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString('vi-VN') : 'N/A'}</td>
                          <td className="p-4">{user._count?.orders || 0}</td>
                          <td className="p-4">
                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                              user.role === 'admin' ? 'bg-purple-500/20 text-purple-400' : 'bg-white/10 text-[#86868b]'
                            }`}>
                              {user.role.toUpperCase()}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Bảng Khách Hàng Quan Tâm (Leads từ Đăng ký VIP) */}
        <div className="mb-12">
          <h2 className="text-xl font-bold mb-6">Khách hàng Đăng ký VIP (Leads)</h2>
          <div className="bg-white rounded-3xl border border-white/5 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-black/10 text-sm text-[#86868b]">
                    <th className="p-4 font-medium">Khách hàng</th>
                    <th className="p-4 font-medium">SĐT</th>
                    <th className="p-4 font-medium">Sản phẩm quan tâm</th>
                    <th className="p-4 font-medium">Ngày đăng ký</th>
                    <th className="p-4 font-medium">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {leads.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-4 text-center text-[#86868b]">Chưa có dữ liệu</td>
                    </tr>
                  ) : (
                    leads.map(lead => (
                      <tr key={lead.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="p-4">
                          <div className="font-medium">{lead.name}</div>
                          <div className="text-xs text-[#86868b]">{lead.email}</div>
                        </td>
                        <td className="p-4">{lead.phone || 'N/A'}</td>
                        <td className="p-4 font-medium">{lead.productInterest}</td>
                        <td className="p-4">{formatDate(lead.createdAt)}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                            lead.status === 'NEW' ? 'bg-blue-500/20 text-blue-500' :
                            lead.status === 'CONTACTED' ? 'bg-yellow-500/20 text-yellow-600' :
                            lead.status === 'WON' ? 'bg-green-500/20 text-green-500' :
                            'bg-gray-500/20 text-gray-500'
                          }`}>
                            {lead.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <motion.div
          initial={{ opacity: 0, y: 50, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          className="fixed bottom-10 left-1/2 z-50 bg-gray-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 border border-white/10"
        >
          <span className="text-green-400 text-lg">●</span>
          <span className="text-sm font-medium">{toastMessage}</span>
        </motion.div>
      )}
    </div>
  );
}
