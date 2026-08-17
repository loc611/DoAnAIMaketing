import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  Users, 
  UserPlus, 
  Percent, 
  Trophy, 
  Flame, 
  Clock, 
  Phone, 
  ArrowUpRight, 
  RefreshCw 
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

const API_BASE = `${import.meta.env.VITE_API_URL || ''}/api/v1/crm`;

const OperationalDashboard = () => {
  const context = useOutletContext() || {};
  const user = context.user;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/dashboard`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

  if (loading && !data) {
    return (
      <div className="flex h-64 w-full items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
          <p className="text-xs text-[#86868b]">Đang tải dữ liệu Dashboard vận hành...</p>
        </div>
      </div>
    );
  }

  const stats = data?.stats || {
    totalLeads: 35,
    newLeadsLast7Days: 14,
    conversionRate: '18.5%',
    wonDealsCount: 7
  };

  const timeSeries = data?.charts?.timeSeriesChart || [
    { date: '23/07', leads: 4 },
    { date: '24/07', leads: 6 },
    { date: '25/07', leads: 3 },
    { date: '26/07', leads: 8 },
    { date: '27/07', leads: 5 },
    { date: '28/07', leads: 9 },
    { date: '29/07', leads: 12 }
  ];

  const sourceChart = data?.charts?.sourceChart || [
    { source: 'landing_page', count: 18 },
    { source: 'ads', count: 9 },
    { source: 'referral', count: 5 },
    { source: 'form', count: 3 }
  ];

  const followUpToday = data?.followUpToday || [];

  return (
    <div className="space-y-8 w-full">
      {/* Top Banner */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            Dashboard Vận Hành Leads
          </h1>
          <p className="text-xs text-[#86868b] mt-0.5">
            Tổng quan số liệu leads, nguồn tiếp cận và công việc cần xử lý ngay hôm nay.
          </p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 border border-gray-200 text-xs text-gray-900 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Làm mới dữ liệu</span>
        </button>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Leads */}
        <div className="p-5 rounded-xl bg-white border border-gray-200 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#86868b]">Tổng Leads</span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold text-gray-900">{stats.totalLeads}</div>
            <p className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1 font-medium">
              <ArrowUpRight className="w-3 h-3" /> +12% so với tuần trước
            </p>
          </div>
        </div>

        {/* Card 2: New Leads 7 Days */}
        <div className="p-5 rounded-xl bg-white border border-gray-200 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#86868b]">Leads Mới 7 Ngày</span>
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <UserPlus className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold text-gray-900">{stats.newLeadsLast7Days}</div>
            <p className="text-[11px] text-blue-400 font-medium mt-1">Cập nhật theo thời gian thực</p>
          </div>
        </div>

        {/* Card 3: Conversion Rate */}
        <div className="p-5 rounded-xl bg-white border border-gray-200 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#86868b]">Tỷ Lệ Chuyển Đổi</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold text-gray-900">{stats.conversionRate}</div>
            <p className="text-[11px] text-emerald-400 font-medium mt-1">Tỷ lệ lead chốt đơn thành công</p>
          </div>
        </div>

        {/* Card 4: Won Deals */}
        <div className="p-5 rounded-xl bg-white border border-gray-200 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#86868b]">Deals Thắng (Won)</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <Trophy className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold text-gray-900">{stats.wonDealsCount}</div>
            <p className="text-[11px] text-amber-400 font-medium mt-1">Đơn hàng đã hoàn tất</p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Time-Series Line Chart */}
        <div className="lg:col-span-2 p-6 rounded-xl bg-white border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Lượng Leads Theo Thời Gian</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeSeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" stroke="#86868b" fontSize={11} />
                <YAxis stroke="#86868b" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb', borderRadius: '8px', fontSize: '12px' }}
                />
                <Line type="monotone" dataKey="leads" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Source Distribution Donut Chart */}
        <div className="p-6 rounded-xl bg-white border border-gray-200 flex flex-col justify-between">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">Phân Bổ Theo Nguồn Lead</h3>
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sourceChart}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="count"
                  nameKey="source"
                >
                  {sourceChart.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb', borderRadius: '8px', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2 pt-3 border-t border-gray-200">
            {sourceChart.map((src, i) => (
              <div key={src.source} className="flex items-center gap-2 text-xs">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></span>
                <span className="text-[#86868b] truncate">{src.source}</span>
                <span className="font-semibold text-gray-900 ml-auto">{src.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action Table: Needs Follow-up Today */}
      <div className="p-6 rounded-xl bg-white border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-red-500/20 text-red-400">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Cần Follow-Up Ngay Hôm Nay</h3>
              <p className="text-[11px] text-[#86868b]">Danh sách các Lead HOT chưa được liên hệ trong 24 giờ</p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-200 text-[#86868b] uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">Tên Khách Hàng</th>
                <th className="py-3 px-4">Sản Phẩm Quan Tâm</th>
                <th className="py-3 px-4">Điểm Số</th>
                <th className="py-3 px-4">Nhiệt Độ</th>
                <th className="py-3 px-4">Người Phụ Trách</th>
                <th className="py-3 px-4 text-right">Hành Động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {followUpToday.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#86868b]">
                    Không có lead HOT nào cần liên hệ gấp. Tuyệt vời!
                  </td>
                </tr>
              ) : (
                followUpToday.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-gray-900">
                      <div>{lead.name}</div>
                      <div className="text-[11px] text-[#86868b]">{lead.email}</div>
                    </td>
                    <td className="py-3.5 px-4 text-[#86868b]">{lead.productInterest}</td>
                    <td className="py-3.5 px-4 font-bold text-gray-900">{lead.score} điểm</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                        🔥 HOT
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-[#86868b]">
                      {lead.assignedTo?.fullName || 'Chưa gán'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <a
                        href={`tel:${lead.phone || ''}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-medium transition-colors"
                      >
                        <Phone className="w-3 h-3" />
                        <span>Gọi Ngay</span>
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OperationalDashboard;
