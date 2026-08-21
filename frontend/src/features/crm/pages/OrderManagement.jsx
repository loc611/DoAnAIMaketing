import React, { useState, useEffect, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  ShoppingBag,
  Search,
  Filter,
  RefreshCw,
  Eye,
  CheckCircle2,
  Clock,
  Truck,
  CheckCheck,
  XCircle,
  CreditCard,
  Banknote,
  QrCode,
  Printer,
  ChevronRight,
  User,
  Phone,
  MapPin,
  Calendar,
  AlertCircle,
  Package,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  X,
  ExternalLink
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || '';

const STATUS_TABS = [
  { id: 'ALL', label: 'Tất cả', countKey: 'all' },
  { id: 'PENDING', label: 'Chờ xác nhận', color: 'amber', icon: Clock, countKey: 'pending' },
  { id: 'CONFIRMED', label: 'Đã xác nhận', color: 'blue', icon: CheckCircle2, countKey: 'confirmed' },
  { id: 'SHIPPING', label: 'Đang giao hàng', color: 'indigo', icon: Truck, countKey: 'shipping' },
  { id: 'DELIVERED', label: 'Hoàn thành', color: 'emerald', icon: CheckCheck, countKey: 'delivered' },
  { id: 'CANCELLED', label: 'Đã hủy', color: 'rose', icon: XCircle, countKey: 'cancelled' }
];

export default function OrderManagement() {
  const context = useOutletContext() || {};
  const user = context.user;

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Filters
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('');

  // Selected Order & Modal State
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [cancelModalOrder, setCancelModalOrder] = useState(null);
  const [cancelReasonInput, setCancelReasonInput] = useState('');

  // Toast / Alert Notification
  const [actionMessage, setActionMessage] = useState(null);

  const showNotification = (msg, type = 'success') => {
    setActionMessage({ msg, type });
    setTimeout(() => setActionMessage(null), 4000);
  };

  const getHeaders = () => {
    const token = localStorage.getItem('token');
    const role = user?.role || 'SUPER_ADMIN';
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
      'x-crm-role': role
    };
  };

  const fetchOrders = async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/orders`, {
        headers: getHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Lỗi tải danh sách đơn hàng:', err);
    } finally {
      if (!isBackground) setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // Polling tự động 10 giây/lần để cập nhật đơn hàng mới
    const interval = setInterval(() => {
      fetchOrders(true);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // Đóng modal khi nhấn ESC và quản lý cuộn trang nền
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (cancelModalOrder) {
          setCancelModalOrder(null);
          setCancelReasonInput('');
        } else if (selectedOrder) {
          setSelectedOrder(null);
        }
      }
    };

    if (selectedOrder || cancelModalOrder) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedOrder, cancelModalOrder]);

  const STATUS_LABELS = {
    PENDING: 'Chờ xác nhận',
    CONFIRMED: 'Đã xác nhận',
    PROCESSING: 'Đang xử lý',
    SHIPPING: 'Đang giao hàng',
    DELIVERED: 'Hoàn thành',
    COMPLETED: 'Hoàn thành',
    CANCELLED: 'Đã hủy'
  };

  // Update order status
  const handleUpdateStatus = async (orderId, newStatus, newPaymentStatus = null) => {
    setIsUpdatingStatus(true);
    try {
      const payload = { status: newStatus };
      if (newPaymentStatus) {
        payload.paymentStatus = newPaymentStatus;
      }
      const res = await fetch(`${API_BASE}/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        showNotification(`Đã chuyển trạng thái đơn hàng sang: ${STATUS_LABELS[newStatus] || newStatus}`);
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, orderStatus: newStatus, ...(newPaymentStatus ? { paymentStatus: newPaymentStatus } : {}) } : o));
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder(prev => ({ ...prev, orderStatus: newStatus, ...(newPaymentStatus ? { paymentStatus: newPaymentStatus } : {}) }));
        }
        window.dispatchEvent(new CustomEvent('crm:order_updated'));
      } else {
        alert(data.error || 'Có lỗi xảy ra khi cập nhật đơn hàng.');
      }
    } catch (err) {
      console.error(err);
      alert('Không thể kết nối máy chủ.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Quick Confirm Order (PENDING -> CONFIRMED)
  const handleQuickConfirm = async (e, orderId) => {
    e.stopPropagation();
    await handleUpdateStatus(orderId, 'CONFIRMED');
  };

  // Quick Shipping Order (CONFIRMED -> SHIPPING)
  const handleQuickShipping = async (e, orderId) => {
    e.stopPropagation();
    await handleUpdateStatus(orderId, 'SHIPPING');
  };

  // Quick Deliver Order (SHIPPING -> DELIVERED & PAID)
  const handleQuickDeliver = async (e, orderId) => {
    e.stopPropagation();
    await handleUpdateStatus(orderId, 'DELIVERED', 'PAID');
  };

  // Cancel Order
  const handleConfirmCancel = async () => {
    if (!cancelModalOrder) return;
    if (!cancelReasonInput.trim()) {
      alert('Vui lòng nhập lý do hủy đơn.');
      return;
    }
    setIsUpdatingStatus(true);
    try {
      const res = await fetch(`${API_BASE}/api/orders/${cancelModalOrder.id}/cancel`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ cancelReason: cancelReasonInput })
      });
      const data = await res.json();
      if (res.ok) {
        showNotification('Đã hủy đơn hàng thành công', 'info');
        setOrders(prev => prev.map(o => o.id === cancelModalOrder.id ? { ...o, orderStatus: 'CANCELLED', cancelReason: cancelReasonInput } : o));
        if (selectedOrder && selectedOrder.id === cancelModalOrder.id) {
          setSelectedOrder(prev => ({ ...prev, orderStatus: 'CANCELLED', cancelReason: cancelReasonInput }));
        }
        setCancelModalOrder(null);
        setCancelReasonInput('');
        window.dispatchEvent(new CustomEvent('crm:order_updated'));
      } else {
        alert(data.error || 'Lỗi khi hủy đơn hàng.');
      }
    } catch (err) {
      console.error(err);
      alert('Không thể kết nối máy chủ.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Counts for tabs and stats
  const stats = useMemo(() => {
    const counts = {
      all: orders.length,
      pending: 0,
      confirmed: 0,
      shipping: 0,
      delivered: 0,
      cancelled: 0,
      totalDeliveredRevenue: 0
    };
    orders.forEach(o => {
      const st = (o.orderStatus || 'PENDING').toUpperCase();
      if (st === 'PENDING') counts.pending++;
      else if (st === 'CONFIRMED' || st === 'PROCESSING') counts.confirmed++;
      else if (st === 'SHIPPING') counts.shipping++;
      else if (st === 'DELIVERED' || st === 'COMPLETED') {
        counts.delivered++;
        counts.totalDeliveredRevenue += Number(o.totalAmount || 0);
      }
      else if (st === 'CANCELLED') counts.cancelled++;
    });
    return counts;
  }, [orders]);

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      // Tab filter
      const st = (o.orderStatus || 'PENDING').toUpperCase();
      if (activeTab === 'PENDING' && st !== 'PENDING') return false;
      if (activeTab === 'CONFIRMED' && st !== 'CONFIRMED' && st !== 'PROCESSING') return false;
      if (activeTab === 'SHIPPING' && st !== 'SHIPPING') return false;
      if (activeTab === 'DELIVERED' && st !== 'DELIVERED' && st !== 'COMPLETED') return false;
      if (activeTab === 'CANCELLED' && st !== 'CANCELLED') return false;

      // Payment method filter
      if (paymentMethodFilter && (o.paymentMethod || '').toLowerCase() !== paymentMethodFilter.toLowerCase()) {
        return false;
      }

      // Payment status filter
      if (paymentStatusFilter && (o.paymentStatus || '').toUpperCase() !== paymentStatusFilter.toUpperCase()) {
        return false;
      }

      // Search query (Mã đơn, Tên khách, SĐT, Email)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const shortId = (o.id || '').substring(0, 8).toLowerCase();
        const fullName = (o.fullName || o.user?.fullName || '').toLowerCase();
        const phone = (o.phone || o.user?.phone || '').toLowerCase();
        const email = (o.user?.email || '').toLowerCase();
        const itemsStr = (o.items || []).map(i => i.productName).join(' ').toLowerCase();

        return shortId.includes(q) || fullName.includes(q) || phone.includes(q) || email.includes(q) || itemsStr.includes(q);
      }

      return true;
    });
  }, [orders, activeTab, searchQuery, paymentMethodFilter, paymentStatusFilter]);

  const formatVND = (num) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(num) || 0);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '---';
    const d = new Date(dateStr);
    return d.toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    const st = (status || 'PENDING').toUpperCase();
    switch (st) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">
            <Clock className="w-3.5 h-3.5" /> Chờ xác nhận
          </span>
        );
      case 'CONFIRMED':
      case 'PROCESSING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <CheckCircle2 className="w-3.5 h-3.5" /> Đã xác nhận
          </span>
        );
      case 'SHIPPING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <Truck className="w-3.5 h-3.5" /> Đang giao hàng
          </span>
        );
      case 'DELIVERED':
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCheck className="w-3.5 h-3.5" /> Hoàn thành
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5" /> Đã hủy
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
            {st}
          </span>
        );
    }
  };

  const getPaymentBadge = (method, status) => {
    const isPaid = (status || '').toUpperCase() === 'PAID';
    const isCod = (method || '').toLowerCase() === 'cod';

    return (
      <div className="flex flex-col gap-1 items-start">
        <div className="flex items-center gap-1.5 text-xs text-gray-700 font-medium">
          {isCod ? (
            <Banknote className="w-3.5 h-3.5 text-emerald-600" />
          ) : (
            <QrCode className="w-3.5 h-3.5 text-blue-600" />
          )}
          <span>{isCod ? 'Thu hộ (COD)' : method?.toUpperCase() || 'Chuyển khoản / Online'}</span>
        </div>
        <span className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded ${
          isPaid ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-gray-100 text-gray-600 border border-gray-200'
        }`}>
          {isPaid ? '✓ Đã thanh toán' : 'Chưa thanh toán'}
        </span>
      </div>
    );
  };

  const handlePrintOrder = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {actionMessage && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-sm font-medium animate-in fade-in slide-in-from-bottom duration-200 ${
          actionMessage.type === 'info' ? 'bg-gray-900 text-white' : 'bg-emerald-600 text-white'
        }`}>
          <CheckCircle2 className="w-4 h-4" />
          <span>{actionMessage.msg}</span>
        </div>
      )}

      {/* Header & Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2.5">
            <ShoppingBag className="w-6 h-6 text-orange-500" /> Quản Lý Đơn Hàng
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Theo dõi, xử lý và phê duyệt đơn hàng từ website Apple Store trực tuyến.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setRefreshing(true);
              fetchOrders();
            }}
            disabled={refreshing}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 shadow-sm transition-all active:scale-95"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-orange-500' : 'text-gray-500'}`} />
            <span>Làm mới</span>
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Tổng đơn hàng</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.all}</h3>
            <p className="text-xs text-gray-500 mt-1">Toàn bộ đơn phát sinh</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-500">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-sm flex items-center justify-between relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-700">Chờ xác nhận</p>
            <h3 className="text-2xl font-bold text-amber-600 mt-1">{stats.pending}</h3>
            <p className="text-xs text-amber-700 mt-1">Cần xử lý ngay</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
            <Clock className="w-6 h-6 animate-pulse" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Đang vận chuyển</p>
            <h3 className="text-2xl font-bold text-indigo-600 mt-1">{stats.shipping}</h3>
            <p className="text-xs text-gray-500 mt-1">Đang trên đường giao</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <Truck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Doanh thu hoàn thành</p>
            <h3 className="text-xl font-bold text-emerald-600 mt-1 truncate max-w-[160px]" title={formatVND(stats.totalDeliveredRevenue)}>
              {formatVND(stats.totalDeliveredRevenue)}
            </h3>
            <p className="text-xs text-emerald-600 mt-1 font-medium">{stats.delivered} đơn giao thành công</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Order Card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Status Navigation Tabs */}
        <div className="border-b border-gray-200 px-6 pt-4 flex flex-wrap gap-2 overflow-x-auto bg-gray-50/50">
          {STATUS_TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            const count = stats[tab.countKey] || 0;
            const Icon = tab.icon;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-3.5 px-3 flex items-center gap-2 text-sm font-semibold border-b-2 transition-all duration-150 whitespace-nowrap ${
                  isActive
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                {Icon && <Icon className="w-4 h-4" />}
                <span>{tab.label}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  isActive
                    ? 'bg-orange-100 text-orange-700'
                    : tab.id === 'PENDING' && count > 0
                    ? 'bg-amber-100 text-amber-800 border border-amber-300 animate-bounce'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Filter & Search Bar */}
        <div className="p-5 border-b border-gray-200 flex flex-col md:flex-row items-center justify-between gap-4 bg-white">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm mã đơn, tên khách, SĐT, sản phẩm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
            <select
              value={paymentMethodFilter}
              onChange={(e) => setPaymentMethodFilter(e.target.value)}
              className="px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 text-gray-700"
            >
              <option value="">Tất cả phương thức thanh toán</option>
              <option value="cod">COD (Thanh toán khi nhận hàng)</option>
              <option value="banking">Chuyển khoản QR Ngân hàng</option>
              <option value="stripe">Thẻ Quốc tế / Stripe</option>
            </select>

            <select
              value={paymentStatusFilter}
              onChange={(e) => setPaymentStatusFilter(e.target.value)}
              className="px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 text-gray-700"
            >
              <option value="">Tất cả trạng thái thanh toán</option>
              <option value="PAID">Đã thanh toán (PAID)</option>
              <option value="UNPAID">Chưa thanh toán (UNPAID)</option>
            </select>
          </div>
        </div>

        {/* Orders Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-gray-400 gap-3">
              <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm">Đang tải danh sách đơn hàng...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="py-20 text-center text-gray-400">
              <ShoppingBag className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <h3 className="text-base font-semibold text-gray-700">Không tìm thấy đơn hàng nào</h3>
              <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                Thử thay đổi bộ lọc tìm kiếm hoặc kiểm tra lại tab trạng thái khác.
              </p>
            </div>
          ) : (
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-[11px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-200">
                <tr>
                  <th className="py-3.5 px-6">Mã & Thời Gian</th>
                  <th className="py-3.5 px-4">Khách Hàng</th>
                  <th className="py-3.5 px-4">Sản Phẩm Đặt</th>
                  <th className="py-3.5 px-4">Tổng Tiền</th>
                  <th className="py-3.5 px-4">Thanh Toán</th>
                  <th className="py-3.5 px-4">Trạng Thái Đơn</th>
                  <th className="py-3.5 px-6 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.map((order) => {
                  const status = (order.orderStatus || 'PENDING').toUpperCase();
                  const isPending = status === 'PENDING';
                  const isConfirmed = status === 'CONFIRMED' || status === 'PROCESSING';
                  const isShipping = status === 'SHIPPING';
                  const shortId = (order.id || '').substring(0, 8).toUpperCase();
                  const customerName = order.fullName || order.user?.fullName || 'Khách vãng lai';
                  const customerPhone = order.phone || order.user?.phone || '---';
                  const itemsCount = (order.items || []).reduce((sum, item) => sum + (item.quantity || 1), 0);

                  return (
                    <tr
                      key={order.id}
                      onClick={() => setSelectedOrder(order)}
                      className={`hover:bg-orange-50/30 transition-colors cursor-pointer ${
                        isPending ? 'bg-amber-50/20 font-medium' : ''
                      }`}
                    >
                      {/* Mã đơn & Thời gian */}
                      <td className="py-4 px-6">
                        <div className="flex flex-col">
                          <span className="font-mono font-bold text-gray-900 text-xs flex items-center gap-1.5">
                            #{shortId}
                          </span>
                          <span className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> {formatDate(order.createdAt)}
                          </span>
                        </div>
                      </td>

                      {/* Khách hàng */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-orange-100 border border-orange-200 flex items-center justify-center text-orange-600 font-bold text-xs shrink-0">
                            {customerName.charAt(0).toUpperCase()}
                          </div>
                          <div className="truncate max-w-[170px]">
                            <p className="font-semibold text-gray-900 text-xs truncate">{customerName}</p>
                            <p className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                              <Phone className="w-3 h-3 text-gray-400" /> {customerPhone}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Sản phẩm tóm tắt */}
                      <td className="py-4 px-4">
                        <div className="flex flex-col max-w-[200px]">
                          {order.items && order.items.length > 0 ? (
                            <div>
                              <p className="text-xs text-gray-900 font-medium truncate">
                                {order.items[0].productName}
                              </p>
                              <p className="text-[11px] text-gray-400 truncate">
                                {order.items[0].selectedColor || ''} {order.items[0].selectedStorage ? `• ${order.items[0].selectedStorage}` : ''} x{order.items[0].quantity || 1}
                              </p>
                              {order.items.length > 1 && (
                                <span className="text-[10px] text-orange-600 font-semibold mt-0.5 inline-block">
                                  + {order.items.length - 1} sản phẩm khác ({itemsCount} món)
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400 italic">Không có chi tiết</span>
                          )}
                        </div>
                      </td>

                      {/* Tổng tiền */}
                      <td className="py-4 px-4">
                        <span className="font-bold text-gray-900 text-sm">
                          {formatVND(order.totalAmount)}
                        </span>
                      </td>

                      {/* Thanh toán */}
                      <td className="py-4 px-4">
                        {getPaymentBadge(order.paymentMethod, order.paymentStatus)}
                      </td>

                      {/* Trạng thái đơn */}
                      <td className="py-4 px-4">
                        {getStatusBadge(order.orderStatus)}
                      </td>

                      {/* Thao tác */}
                      <td className="py-4 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          {isPending && (
                            <button
                              onClick={(e) => handleQuickConfirm(e, order.id)}
                              disabled={isUpdatingStatus}
                              title="Duyệt đơn ngay"
                              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm flex items-center gap-1 transition-all active:scale-95 disabled:opacity-50"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" /> Duyệt
                            </button>
                          )}
                          {isConfirmed && (
                            <button
                              onClick={(e) => handleQuickShipping(e, order.id)}
                              disabled={isUpdatingStatus}
                              title="Bàn giao vận chuyển (Giao hàng)"
                              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm flex items-center gap-1 transition-all active:scale-95 disabled:opacity-50"
                            >
                              <Truck className="w-3.5 h-3.5" /> Giao hàng
                            </button>
                          )}
                          {isShipping && (
                            <button
                              onClick={(e) => handleQuickDeliver(e, order.id)}
                              disabled={isUpdatingStatus}
                              title="Hoàn tất giao hàng & Thu tiền"
                              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center gap-1 transition-all active:scale-95 disabled:opacity-50"
                            >
                              <CheckCheck className="w-3.5 h-3.5" /> Hoàn thành
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedOrder(order)}
                            title="Xem chi tiết đơn hàng"
                            className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div 
          onClick={() => setSelectedOrder(null)}
          className="fixed inset-0 z-[999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] shadow-2xl flex flex-col overflow-hidden border border-gray-100 relative"
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-gray-50/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-600 font-bold">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    Chi Tiết Đơn Hàng #{selectedOrder.id?.substring(0, 8).toUpperCase()}
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-2">
                    <span>Đặt lúc: {formatDate(selectedOrder.createdAt)}</span>
                    <span>•</span>
                    <span>{getStatusBadge(selectedOrder.orderStatus)}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrintOrder}
                  className="p-2 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-200/60 transition-colors"
                  title="In phiếu đơn hàng"
                >
                  <Printer className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-200/60 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-gray-800 text-sm">
              {/* Status Action Banner */}
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500 block">
                    Quy trình xử lý đơn hàng:
                  </span>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className="font-semibold text-gray-900">
                      {selectedOrder.orderStatus === 'PENDING' ? 'Đang chờ duyệt' :
                       selectedOrder.orderStatus === 'CONFIRMED' ? 'Đã duyệt / Chuẩn bị đóng gói' :
                       selectedOrder.orderStatus === 'SHIPPING' ? 'Đang vận chuyển' :
                       selectedOrder.orderStatus === 'DELIVERED' ? 'Đã hoàn thành' : 'Đã hủy đơn'}
                    </span>
                  </div>
                </div>

                {/* State Changing Buttons */}
                <div className="flex items-center gap-2 flex-wrap">
                  {selectedOrder.orderStatus === 'PENDING' && (
                    <button
                      onClick={() => handleUpdateStatus(selectedOrder.id, 'CONFIRMED')}
                      disabled={isUpdatingStatus}
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm flex items-center gap-1.5 transition-all"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Duyệt đơn hàng
                    </button>
                  )}

                  {selectedOrder.orderStatus === 'CONFIRMED' && (
                    <button
                      onClick={() => handleUpdateStatus(selectedOrder.id, 'SHIPPING')}
                      disabled={isUpdatingStatus}
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm flex items-center gap-1.5 transition-all"
                    >
                      <Truck className="w-4 h-4" /> Bàn giao vận chuyển
                    </button>
                  )}

                  {selectedOrder.orderStatus === 'SHIPPING' && (
                    <button
                      onClick={() => handleUpdateStatus(selectedOrder.id, 'DELIVERED', 'PAID')}
                      disabled={isUpdatingStatus}
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center gap-1.5 transition-all"
                    >
                      <CheckCheck className="w-4 h-4" /> Hoàn tất giao hàng
                    </button>
                  )}

                  {selectedOrder.orderStatus !== 'CANCELLED' && selectedOrder.orderStatus !== 'DELIVERED' && (
                    <button
                      onClick={() => setCancelModalOrder(selectedOrder)}
                      disabled={isUpdatingStatus}
                      className="px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-all"
                    >
                      Hủy đơn
                    </button>
                  )}
                </div>
              </div>

              {/* Two Column Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Khách hàng & Giao hàng */}
                <div className="p-4 rounded-2xl bg-white border border-gray-200 space-y-2.5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-orange-500" /> Thông tin nhận hàng
                  </h3>
                  <div className="pt-1">
                    <p className="font-bold text-gray-900 text-base">
                      {selectedOrder.fullName || selectedOrder.user?.fullName || 'Khách vãng lai'}
                    </p>
                    <p className="text-xs text-gray-600 flex items-center gap-2 mt-1">
                      <Phone className="w-3.5 h-3.5 text-gray-400" /> {selectedOrder.phone || selectedOrder.user?.phone || 'Chưa cập nhật SĐT'}
                    </p>
                    <p className="text-xs text-gray-600 flex items-start gap-2 mt-1.5">
                      <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                      <span>{selectedOrder.shippingAddress || 'Địa chỉ nhận hàng tại quầy / Chưa cung cấp'}</span>
                    </p>
                    {selectedOrder.user?.email && (
                      <p className="text-[11px] text-gray-500 mt-1">
                        Email: {selectedOrder.user.email}
                      </p>
                    )}
                  </div>
                </div>

                {/* Phương thức thanh toán */}
                <div className="p-4 rounded-2xl bg-white border border-gray-200 space-y-2.5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-blue-500" /> Thanh toán & Giao dịch
                  </h3>
                  <div className="pt-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Hình thức:</span>
                      <span className="font-semibold text-gray-900 text-xs">
                        {selectedOrder.paymentMethod === 'cod' ? 'Thanh toán tiền mặt khi nhận hàng (COD)' :
                         selectedOrder.paymentMethod === 'banking' ? 'Chuyển khoản VietQR Ngân hàng' :
                         'Thanh toán qua cổng Stripe'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Trạng thái thanh toán:</span>
                      <div>
                        {selectedOrder.paymentStatus === 'PAID' ? (
                          <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-100 text-emerald-800">
                            Đã thanh toán
                          </span>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-xs font-bold bg-gray-100 text-gray-600">
                              Chưa thanh toán
                            </span>
                            <button
                              onClick={() => handleUpdateStatus(selectedOrder.id, selectedOrder.orderStatus, 'PAID')}
                              className="text-[11px] text-blue-600 font-semibold hover:underline"
                            >
                              Đánh dấu Đã trả
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {selectedOrder.cancelReason && (
                      <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 mt-2">
                        <strong>Lý do hủy:</strong> {selectedOrder.cancelReason}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-orange-500" /> Danh sách sản phẩm ({selectedOrder.items?.length || 0})
                </h3>

                <div className="border border-gray-200 rounded-2xl overflow-hidden divide-y divide-gray-100">
                  {selectedOrder.items && selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="p-4 flex items-center justify-between gap-4 bg-white hover:bg-gray-50/50">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center p-1 shrink-0 overflow-hidden">
                          {item.image ? (
                            <img src={item.image} alt={item.productName} className="w-full h-full object-contain" />
                          ) : (
                            <Package className="w-6 h-6 text-gray-300" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-sm">{item.productName}</p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {item.selectedColor ? `Màu: ${item.selectedColor}` : ''} 
                            {item.selectedStorage ? ` • Dung lượng: ${item.selectedStorage}` : ''}
                          </p>
                          <p className="text-xs text-gray-400">Đơn giá: {formatVND(item.price)}</p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs text-gray-500">x{item.quantity || 1}</span>
                        <p className="font-bold text-gray-900 text-sm mt-0.5">
                          {formatVND((Number(item.price) || 0) * (item.quantity || 1))}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Calculation */}
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-2">
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span>Tạm tính ({selectedOrder.items?.reduce((s, i) => s + (i.quantity || 1), 0) || 0} món):</span>
                  <span className="font-medium text-gray-900">{formatVND(selectedOrder.totalAmount)}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span>Phí vận chuyển:</span>
                  <span className="text-emerald-600 font-semibold">Miễn phí giao hàng</span>
                </div>
                <div className="border-t border-gray-200 pt-2 flex items-center justify-between text-base font-bold text-gray-900">
                  <span>Tổng tiền thanh toán:</span>
                  <span className="text-orange-600 text-lg">{formatVND(selectedOrder.totalAmount)}</span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-200 bg-gray-50 flex items-center justify-end gap-3">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-gray-200 hover:bg-gray-300 text-gray-700 transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Reason Modal */}
      {cancelModalOrder && (
        <div 
          onClick={() => {
            setCancelModalOrder(null);
            setCancelReasonInput('');
          }}
          className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4 relative"
          >
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <XCircle className="w-5 h-5 text-rose-500" /> Xác nhận hủy đơn hàng
            </h3>
            <p className="text-xs text-gray-500">
              Đơn hàng <strong>#{cancelModalOrder.id?.substring(0, 8).toUpperCase()}</strong> sẽ được chuyển sang trạng thái <strong>Đã hủy (CANCELLED)</strong>.
            </p>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Lý do hủy đơn <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                placeholder="Nhập lý do (Khách đổi ý, hết hàng, không liên lạc được...)"
                value={cancelReasonInput}
                onChange={(e) => setCancelReasonInput(e.target.value)}
                className="w-full p-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => {
                  setCancelModalOrder(null);
                  setCancelReasonInput('');
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleConfirmCancel}
                disabled={isUpdatingStatus}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-sm disabled:opacity-50"
              >
                Xác nhận hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
