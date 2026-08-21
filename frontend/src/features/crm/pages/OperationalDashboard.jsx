import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { 
  Users, 
  UserPlus, 
  Percent, 
  Trophy, 
  Flame, 
  Phone, 
  ArrowUpRight, 
  RefreshCw,
  ShoppingBag,
  TrendingUp,
  AlertTriangle,
  Package,
  Clock,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Layers,
  ArrowRight,
  Boxes
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  ComposedChart,
  Area,
  Bar,
  Line,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import LeadDetailDrawer from '../components/LeadDetailDrawer';

const API_BASE = `${import.meta.env.VITE_API_URL || ''}/api/v1/crm`;

const OperationalDashboard = () => {
  const navigate = useNavigate();
  const context = useOutletContext() || {};
  const user = context.user;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeframe, setTimeframe] = useState('7'); // '7' | '30' | 'all'
  const [rightChartTab, setRightChartTab] = useState('orders'); // 'orders' | 'leads'
  const [selectedLeadId, setSelectedLeadId] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchDashboardData = async (days = timeframe) => {
    setRefreshing(true);
    try {
      const token = localStorage.getItem('token');
      const role = user?.role || 'SUPER_ADMIN';
      const res = await fetch(`${API_BASE}/dashboard?days=${days}`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'X-CRM-Role': role
        }
      });
      if (res.ok) {
        const json = await res.json();
        setData(json);
        setLastUpdated(new Date());
      }
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData(timeframe);
  }, [timeframe]);

  const stats = useMemo(() => data?.stats || {
    totalRevenue: 0,
    averageOrderValue: 0,
    totalOrders: 0,
    pendingOrdersCount: 0,
    completedOrdersCount: 0,
    cancelledOrdersCount: 0,
    totalLeads: 0,
    newLeadsInPeriod: 0,
    wonLeadsCount: 0,
    conversionRate: '0%',
    lowStockCount: 0
  }, [data]);

  const timeSeries = useMemo(() => data?.charts?.timeSeriesChart || [], [data]);
  const sourceChart = useMemo(() => data?.charts?.sourceChart || [], [data]);
  const orderStatusChart = useMemo(() => data?.charts?.orderStatusChart || [], [data]);
  const recentOrders = useMemo(() => data?.recentPendingOrders || [], [data]);
  const followUpToday = useMemo(() => data?.followUpToday || [], [data]);

  const PIE_COLORS = ['#10b981', '#f59e0b', '#3b82f6', '#ef4444', '#8b5cf6', '#ec4899'];

  // Format currency in VNĐ
  const formatVND = (num) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num || 0);
  };

  const formatShortVND = (num) => {
    if (!num || num === 0) return '0 đ';
    if (num >= 1000000000) return `${(num / 1000000000).toFixed(1)} Tỷ`;
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)} Tr`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)} K`;
    return `${num} đ`;
  };

  const getOrderStatusBadge = (status) => {
    switch (status) {
      case 'COMPLETED':
      case 'DELIVERED':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200"><CheckCircle2 className="w-2.5 h-2.5" /> Hoàn tất</span>;
      case 'CONFIRMED':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200"><CheckCircle2 className="w-2.5 h-2.5" /> Đã xác nhận</span>;
      case 'PROCESSING':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200"><Clock className="w-2.5 h-2.5" /> Đang xử lý</span>;
      case 'SHIPPING':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200"><Package className="w-2.5 h-2.5" /> Đang giao</span>;
      case 'CANCELLED':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">Đã hủy</span>;
      case 'PENDING':
      default:
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200"><AlertTriangle className="w-2.5 h-2.5" /> Chờ xử lý</span>;
    }
  };

  if (loading && !data) {
    return (
      <div className="flex h-96 w-full items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-blue-500/20 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-gray-500">Đang đồng bộ dữ liệu Dashboard vận hành...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full pb-10">
      {/* Top Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">
              Dashboard Vận Hành
            </h1>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              <Sparkles className="w-3 h-3 text-blue-600" />
              Live Sync
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Tổng quan thời gian thực về Doanh số thương mại, Đơn hàng, Leads & Cảnh báo tồn kho.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Timeframe Filter Buttons */}
          <div className="flex items-center bg-gray-100/90 p-1 rounded-xl border border-gray-200/60 text-xs font-medium">
            <button
              onClick={() => setTimeframe('7')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                timeframe === '7' 
                  ? 'bg-white text-gray-900 font-semibold shadow-xs' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              7 ngày qua
            </button>
            <button
              onClick={() => setTimeframe('30')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                timeframe === '30' 
                  ? 'bg-white text-gray-900 font-semibold shadow-xs' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              30 ngày
            </button>
            <button
              onClick={() => setTimeframe('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                timeframe === 'all' 
                  ? 'bg-white text-gray-900 font-semibold shadow-xs' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Toàn bộ
            </button>
          </div>

          {/* Refresh Button */}
          <button
            onClick={() => fetchDashboardData(timeframe)}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 text-xs font-medium text-gray-700 transition-colors shadow-2xs disabled:opacity-60"
            title="Làm mới số liệu"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-gray-500 ${refreshing ? 'animate-spin text-blue-600' : ''}`} />
            <span>Làm mới</span>
          </button>
        </div>
      </div>

      {/* 5 KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Revenue */}
        <div className="p-5 rounded-2xl bg-white border border-gray-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Doanh Thu Đã Thu</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-xl font-extrabold text-gray-900 tracking-tight truncate" title={formatVND(stats.totalRevenue)}>
              {formatVND(stats.totalRevenue)}
            </div>
            <div className="flex items-center justify-between text-[11px] mt-1.5 pt-1.5 border-t border-gray-100">
              <span className="text-gray-500">Đơn hoàn tất:</span>
              <span className="font-bold text-emerald-600">{stats.completedOrdersCount} đơn</span>
            </div>
          </div>
        </div>

        {/* Card 2: Pending Orders */}
        <div className="p-5 rounded-2xl bg-white border border-gray-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Đơn Chờ Xử Lý</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-gray-900">{stats.pendingOrdersCount}</span>
              <span className="text-xs text-gray-500">/ {stats.totalOrders} tổng đơn</span>
            </div>
            <div className="flex items-center justify-between text-[11px] mt-1.5 pt-1.5 border-t border-gray-100">
              <span className="text-gray-500">AOV trung bình:</span>
              <span className="font-semibold text-gray-800">{formatShortVND(stats.averageOrderValue)}</span>
            </div>
          </div>
        </div>

        {/* Card 3: Total Leads */}
        <div className="p-5 rounded-2xl bg-white border border-gray-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Tổng Leads</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-extrabold text-gray-900">{stats.totalLeads}</div>
            <div className="flex items-center justify-between text-[11px] mt-1.5 pt-1.5 border-t border-gray-100">
              <span className="text-gray-500">Mới trong kỳ:</span>
              <span className="font-bold text-blue-600">+{stats.newLeadsInPeriod} leads</span>
            </div>
          </div>
        </div>

        {/* Card 4: Conversion Rate */}
        <div className="p-5 rounded-2xl bg-white border border-gray-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Tỷ Lệ Chốt Won</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Trophy className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-extrabold text-gray-900">{stats.conversionRate}</div>
            <div className="flex items-center justify-between text-[11px] mt-1.5 pt-1.5 border-t border-gray-100">
              <span className="text-gray-500">Deals thành công:</span>
              <span className="font-bold text-indigo-600">{stats.wonLeadsCount} won</span>
            </div>
          </div>
        </div>

        {/* Card 5: Inventory Warning */}
        <div className="p-5 rounded-2xl bg-white border border-gray-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Cảnh Báo Tồn Kho</span>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform ${
              stats.lowStockCount > 0 ? 'bg-rose-500/10 text-rose-600' : 'bg-gray-100 text-gray-500'
            }`}>
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className={`text-2xl font-extrabold ${stats.lowStockCount > 0 ? 'text-rose-600' : 'text-gray-900'}`}>
                {stats.lowStockCount}
              </span>
              <span className="text-xs text-gray-500">sản phẩm</span>
            </div>
            <div className="flex items-center justify-between text-[11px] mt-1.5 pt-1.5 border-t border-gray-100">
              <span className="text-gray-500">Tồn kho $\le$ 5 cái:</span>
              <span className={`font-semibold ${stats.lowStockCount > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                {stats.lowStockCount > 0 ? 'Cần nhập thêm' : 'An toàn'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics & Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart: Combo Area/Bar Chart for Revenue & Orders */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white border border-gray-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                Xu Hướng Doanh Thu & Đơn Hàng Theo Thời Gian
              </h3>
              <p className="text-[11px] text-gray-500 mt-0.5">Biểu đồ đối soát doanh thu phát sinh và khối lượng đơn hàng</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-blue-500 inline-block"></span>
                <span className="text-gray-600">Doanh thu (VNĐ)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-emerald-500 inline-block"></span>
                <span className="text-gray-600">Đơn hàng (Số đơn)</span>
              </div>
            </div>
          </div>

          <div className="h-72 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={timeSeries} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis 
                  yAxisId="left" 
                  stroke="#94a3b8" 
                  fontSize={11} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={formatShortVND}
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right" 
                  stroke="#94a3b8" 
                  fontSize={11} 
                  tickLine={false} 
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-lg text-xs space-y-1.5">
                          <p className="font-bold text-gray-900 pb-1 border-b border-gray-100">Ngày {label}</p>
                          <p className="text-blue-600 font-semibold flex items-center justify-between gap-4">
                            <span>Doanh thu:</span>
                            <span>{formatVND(payload[0]?.value || 0)}</span>
                          </p>
                          <p className="text-emerald-600 font-semibold flex items-center justify-between gap-4">
                            <span>Đơn hàng:</span>
                            <span>{payload[1]?.value || 0} đơn</span>
                          </p>
                          <p className="text-purple-600 font-medium flex items-center justify-between gap-4 text-[11px]">
                            <span>Leads mới:</span>
                            <span>{payload[2]?.value || 0} leads</span>
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area 
                  yAxisId="left" 
                  type="monotone" 
                  dataKey="revenue" 
                  name="Doanh thu"
                  stroke="#3b82f6" 
                  strokeWidth={2.5} 
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                />
                <Bar 
                  yAxisId="right" 
                  dataKey="orders" 
                  name="Số đơn"
                  fill="#10b981" 
                  radius={[4, 4, 0, 0]} 
                  maxBarSize={20}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="leads"
                  name="Leads"
                  stroke="#8b5cf6"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  dot={{ r: 2 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Secondary Donut Chart with Tab Switcher */}
        <div className="p-6 rounded-2xl bg-white border border-gray-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <h3 className="text-sm font-bold text-gray-900">Phân Bổ Vận Hành</h3>
            <div className="flex bg-gray-100 p-0.5 rounded-lg text-[11px] font-medium">
              <button
                onClick={() => setRightChartTab('orders')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  rightChartTab === 'orders' ? 'bg-white text-gray-900 shadow-2xs font-semibold' : 'text-gray-500'
                }`}
              >
                Đơn Hàng
              </button>
              <button
                onClick={() => setRightChartTab('leads')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  rightChartTab === 'leads' ? 'bg-white text-gray-900 shadow-2xs font-semibold' : 'text-gray-500'
                }`}
              >
                Nguồn Lead
              </button>
            </div>
          </div>

          <div className="h-48 w-full my-auto flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={rightChartTab === 'orders' ? orderStatusChart : sourceChart}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="count"
                  nameKey={rightChartTab === 'orders' ? 'status' : 'source'}
                >
                  {(rightChartTab === 'orders' ? orderStatusChart : sourceChart).map((entry, index) => (
                    <Cell 
                      key={`pie-cell-${index}`} 
                      fill={entry.color || PIE_COLORS[index % PIE_COLORS.length]} 
                    />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '10px', fontSize: '12px' }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend Items */}
          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-gray-100">
            {(rightChartTab === 'orders' ? orderStatusChart : sourceChart).slice(0, 4).map((item, i) => (
              <div key={item.status || item.source} className="flex items-center gap-2 text-xs">
                <span 
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0" 
                  style={{ backgroundColor: item.color || PIE_COLORS[i % PIE_COLORS.length] }}
                ></span>
                <span className="text-gray-600 truncate">{item.status || item.source}</span>
                <span className="font-bold text-gray-900 ml-auto">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Side-by-Side Actionable Tasks Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Side: Pending Orders Requiring Action */}
        <div className="p-6 rounded-2xl bg-white border border-gray-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">Đơn Hàng Mới Chờ Xử Lý</h3>
                <p className="text-[11px] text-gray-500">Các đơn hàng cần xác nhận hoặc cập nhật giao vận</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/crm/orders')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
            >
              <span>Xem tất cả</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400 uppercase tracking-wider font-semibold">
                  <th className="py-2.5 px-2">Mã & Khách Hàng</th>
                  <th className="py-2.5 px-2">Tổng Tiền</th>
                  <th className="py-2.5 px-2">Trạng Thái</th>
                  <th className="py-2.5 px-2 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-10 text-center text-gray-400">
                      <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-60" />
                      Không có đơn hàng nào tồn đọng. Tuyệt vời!
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-3 px-2">
                        <div className="font-semibold text-gray-900">
                          {order.fullName || order.user?.fullName || 'Khách vãng lai'}
                        </div>
                        <div className="text-[11px] text-gray-400 flex items-center gap-1.5">
                          <span className="font-mono">#{order.id.slice(0, 8)}</span>
                          {order.phone || order.user?.phone ? (
                            <span>• {order.phone || order.user?.phone}</span>
                          ) : null}
                        </div>
                      </td>
                      <td className="py-3 px-2 font-bold text-gray-900 whitespace-nowrap">
                        {formatVND(order.totalAmount)}
                      </td>
                      <td className="py-3 px-2">
                        {getOrderStatusBadge(order.orderStatus)}
                      </td>
                      <td className="py-3 px-2 text-right">
                        <button
                          onClick={() => navigate('/crm/orders')}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-[11px] font-semibold transition-colors"
                        >
                          <span>Xem đơn</span>
                          <ExternalLink className="w-3 h-3 text-gray-500" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Side: HOT Leads Needing Immediate Follow-up */}
        <div className="p-6 rounded-2xl bg-white border border-gray-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-rose-500/10 text-rose-600">
                <Flame className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">Leads HOT Cần Chăm Sóc Ngay</h3>
                <p className="text-[11px] text-gray-500">Khách hàng tiềm năng có điểm quan tâm cao nhất</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/crm/leads')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
            >
              <span>Quản lý Leads</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400 uppercase tracking-wider font-semibold">
                  <th className="py-2.5 px-2">Khách Hàng & Nhu Cầu</th>
                  <th className="py-2.5 px-2">Điểm & Độ Nóng</th>
                  <th className="py-2.5 px-2">Phụ Trách</th>
                  <th className="py-2.5 px-2 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {followUpToday.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-10 text-center text-gray-400">
                      <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-60" />
                      Không có lead HOT cần liên hệ gấp.
                    </td>
                  </tr>
                ) : (
                  followUpToday.map((lead) => (
                    <tr key={lead.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-3 px-2">
                        <div 
                          onClick={() => setSelectedLeadId(lead.id)}
                          className="font-semibold text-gray-900 hover:text-blue-600 cursor-pointer transition-colors"
                        >
                          {lead.name}
                        </div>
                        <div className="text-[11px] text-gray-400 truncate max-w-[150px]">
                          {lead.productInterest || 'Chưa rõ sản phẩm'}
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-1.5">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            lead.temperature === 'HOT' 
                              ? 'bg-rose-50 text-rose-600 border border-rose-200'
                              : 'bg-amber-50 text-amber-600 border border-amber-200'
                          }`}>
                            {lead.temperature === 'HOT' ? '🔥 HOT' : '⚡ WARM'}
                          </span>
                          <span className="font-bold text-gray-700">{lead.score || 0}đ</span>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-gray-500">
                        {lead.assignedTo?.fullName || (
                          <span className="text-gray-400 italic">Chưa gán</span>
                        )}
                      </td>
                      <td className="py-3 px-2 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          {lead.phone && (
                            <a
                              href={`tel:${lead.phone}`}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[11px] font-semibold border border-emerald-200 transition-colors"
                              title="Gọi ngay cho khách"
                            >
                              <Phone className="w-3 h-3" />
                              <span>Gọi</span>
                            </a>
                          )}
                          <button
                            onClick={() => setSelectedLeadId(lead.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-semibold border border-blue-200 transition-colors"
                          >
                            <span>Chi tiết</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Lead Detail Drawer */}
      {selectedLeadId && (
        <LeadDetailDrawer
          leadId={selectedLeadId}
          onClose={() => setSelectedLeadId(null)}
          onLeadUpdated={() => {
            fetchDashboardData(timeframe);
          }}
        />
      )}
    </div>
  );
};

export default OperationalDashboard;
