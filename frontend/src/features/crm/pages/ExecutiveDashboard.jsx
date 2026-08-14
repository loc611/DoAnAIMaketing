import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  DollarSign, 
  TrendingUp, 
  Flame, 
  Users, 
  Lock, 
  ShieldAlert, 
  Award, 
  PieChart as PieIcon,
  Plus,
  X
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  Cell 
} from 'recharts';

const API_BASE = `\${import.meta.env.VITE_API_URL}/api/v1/crm`;

const ExecutiveDashboard = () => {
  const context = useOutletContext() || {};
  const user = context.user;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);

  const role = (user?.role || 'SUPER_ADMIN').toUpperCase();
  const isAuthorized = role === 'SUPER_ADMIN' || role === 'ADMIN' || role === 'MANAGER';

  // Modal State cho Thêm Sản Phẩm
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: '',
    basePrice: '',
    variants: []
  });
  const [isSubmittingProduct, setIsSubmittingProduct] = useState(false);

  const handleAddVariant = () => {
    setNewProduct(prev => ({
      ...prev,
      variants: [...prev.variants, { color: '', storage: '', price: '', stockQuantity: 0 }]
    }));
  };

  const handleVariantChange = (index, field, value) => {
    const updatedVariants = [...newProduct.variants];
    updatedVariants[index][field] = value;
    setNewProduct(prev => ({ ...prev, variants: updatedVariants }));
  };

  const handleRemoveVariant = (index) => {
    setNewProduct(prev => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index)
    }));
  };

  const handleAddProductSubmit = async (e) => {
    e.preventDefault();
    setIsSubmittingProduct(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/products`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
          'X-CRM-Role': role
        },
        body: JSON.stringify(newProduct)
      });
      if (res.ok) {
        alert('Thêm sản phẩm thành công!');
        setIsProductModalOpen(false);
        setNewProduct({ name: '', category: '', basePrice: '', variants: [] });
      } else {
        const err = await res.json();
        alert('Lỗi: ' + (err.error || 'Không thể thêm sản phẩm'));
      }
    } catch (err) {
      console.error(err);
      alert('Đã xảy ra lỗi khi thêm sản phẩm.');
    } finally {
      setIsSubmittingProduct(false);
    }
  };

  useEffect(() => {
    if (!isAuthorized) {
      setForbidden(true);
      setLoading(false);
      return;
    }
    setForbidden(false);

    const fetchExecutiveData = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE}/executive`, {
          headers: { 
            'Authorization': token ? `Bearer ${token}` : '',
            'X-CRM-Role': role
          }
        });
        if (res.status === 403) {
          setForbidden(true);
        } else if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error('Failed to fetch executive data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchExecutiveData();
  }, [isAuthorized, role]);

  if (forbidden) {
    return (
      <div className="flex flex-col items-center justify-center h-96 bg-[#12141d] rounded-2xl border border-red-500/20 p-8 text-center">
        <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mb-4">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-white mb-1">Truy Cập Bị Từ Chối (403 Forbidden)</h2>
        <p className="text-xs text-[#86868b] max-w-md">
          Màn hình Executive Dashboard chứa thông tin doanh thu chiến lược và chỉ dành riêng cho quyền <span className="text-red-400 font-semibold">SUPER_ADMIN</span>.
        </p>
      </div>
    );
  }

  if (loading && !data) {
    return (
      <div className="flex h-64 w-full items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
          <p className="text-xs text-[#86868b]">Đang tổng hợp báo cáo Executive...</p>
        </div>
      </div>
    );
  }

  const stats = data?.stats || {
    estimatedRevenue: 245000000,
    overallConversionRate: '20.0%',
    hotLeadsCount: 12,
    averageCAC: '450,000 VNĐ'
  };

  const revenueTrend = [
    { period: 'Tuần 1', revenue: 35000000 },
    { period: 'Tuần 2', revenue: 70000000 },
    { period: 'Tuần 3', revenue: 105000000 },
    { period: 'Tuần 4', revenue: 245000000 }
  ];

  const tempDist = data?.temperatureDistribution || [
    { name: 'HOT', count: 12, percentage: '34.3%' },
    { name: 'WARM', count: 15, percentage: '42.8%' },
    { name: 'COLD', count: 8, percentage: '22.9%' }
  ];

  const funnelData = data?.funnelData || [
    { stage: 'Mới (New)', count: 35 },
    { stage: 'Đã liên hệ', count: 22 },
    { stage: 'Tiềm năng', count: 14 },
    { stage: 'Thành công (Won)', count: 7 }
  ];

  const topProducts = data?.topProducts || [
    { name: 'iPhone 17 Pro Max 256GB', count: 14 },
    { name: 'MacBook Pro 14 M3 Max', count: 9 },
    { name: 'iPad Pro 11 M2', count: 6 },
    { name: 'AirPods Max Space Gray', count: 4 },
    { name: 'Apple Watch Ultra 2', count: 2 }
  ];

  const formatVND = (val) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  return (
    <div className="space-y-8 w-full">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-red-500/10 text-red-400 border border-red-500/20 text-[11px] font-semibold mb-2">
            <ShieldAlert className="w-3.5 h-3.5" /> Báo Cáo Chiến Lược Dành Cho Ban Giám Đốc
          </div>
          <h1 className="text-xl font-bold text-white">Executive Dashboard</h1>
          <p className="text-xs text-[#86868b]">Đo lường doanh thu, funnel chuyển đổi và hiệu quả chi phí CAC.</p>
        </div>
        <button 
          onClick={() => setIsProductModalOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" /> Thêm Sản Phẩm
        </button>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-gradient-to-br from-[#12141d] to-[#1a1d2d] border border-white/5 shadow-xl shadow-black/40 hover:shadow-emerald-500/10 hover:border-emerald-500/20 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#86868b] uppercase tracking-wider group-hover:text-emerald-400/70 transition-colors">Doanh Thu Ước Tính</span>
            <div className="p-2 rounded-full bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform"><DollarSign className="w-4 h-4" /></div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">{formatVND(stats.estimatedRevenue)}</div>
            <p className="text-[11px] text-emerald-400/80 mt-1 font-medium flex items-center gap-1"><TrendingUp className="w-3 h-3"/> Dựa trên các đơn hàng WON</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-gradient-to-br from-[#12141d] to-[#1a1d2d] border border-white/5 shadow-xl shadow-black/40 hover:shadow-blue-500/10 hover:border-blue-500/20 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#86868b] uppercase tracking-wider group-hover:text-blue-400/70 transition-colors">Tỷ Lệ Chuyển Đổi</span>
            <div className="p-2 rounded-full bg-blue-500/10 text-blue-400 group-hover:scale-110 transition-transform"><PieIcon className="w-4 h-4" /></div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-extrabold text-white group-hover:text-blue-400 transition-colors">{stats.overallConversionRate}</div>
            <p className="text-[11px] text-blue-400/80 mt-1 font-medium">Từ Lead Mới sang Deal Thắng</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-gradient-to-br from-[#12141d] to-[#1a1d2d] border border-white/5 shadow-xl shadow-black/40 hover:shadow-red-500/10 hover:border-red-500/20 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#86868b] uppercase tracking-wider group-hover:text-red-400/70 transition-colors">Số Lead HOT</span>
            <div className="p-2 rounded-full bg-red-500/10 text-red-400 group-hover:scale-110 transition-transform group-hover:animate-pulse"><Flame className="w-4 h-4" /></div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-extrabold text-red-400 flex items-center gap-1.5 drop-shadow-[0_0_8px_rgba(248,113,113,0.5)]">
               {stats.hotLeadsCount} Leads
            </div>
            <p className="text-[11px] text-red-400/80 mt-1 font-medium">Cần chốt sale ngay</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-gradient-to-br from-[#12141d] to-[#1a1d2d] border border-white/5 shadow-xl shadow-black/40 hover:shadow-amber-500/10 hover:border-amber-500/20 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#86868b] uppercase tracking-wider group-hover:text-amber-400/70 transition-colors">Chi Phí CAC</span>
            <div className="p-2 rounded-full bg-amber-500/10 text-amber-400 group-hover:scale-110 transition-transform"><Users className="w-4 h-4" /></div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-extrabold text-amber-400">{stats.averageCAC}</div>
            <p className="text-[11px] text-amber-400/80 mt-1 font-medium">Chi phí để có 1 khách hàng</p>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trend Area Chart */}
        <div className="lg:col-span-2 p-6 rounded-xl bg-[#12141d] border border-white/10">
          <h3 className="text-sm font-semibold text-white mb-4">Xu Hướng Doanh Thu Theo Tuần</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueTrend}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis dataKey="period" stroke="#86868b" fontSize={11} />
                <YAxis stroke="#86868b" fontSize={11} tickFormatter={(v) => `${v / 1000000}M`} />
                <Tooltip
                  formatter={(val) => formatVND(val)}
                  contentStyle={{ backgroundColor: '#090a0f', borderColor: '#ffffff20', borderRadius: '8px', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Temperature Distribution Bars */}
        <div className="p-6 rounded-xl bg-[#12141d] border border-white/10 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white mb-1">Phân Bổ Nhiệt Độ Leads</h3>
            <p className="text-xs text-[#86868b] mb-4">Tỷ lệ phân loại HOT / WARM / COLD</p>
          </div>

          <div className="space-y-4 my-auto">
            {tempDist.map((item) => {
              const colorClass = item.name === 'HOT' ? 'bg-red-500' : item.name === 'WARM' ? 'bg-amber-400' : 'bg-blue-500';
              const textClass = item.name === 'HOT' ? 'text-red-400' : item.name === 'WARM' ? 'text-amber-400' : 'text-blue-400';

              return (
                <div key={item.name} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className={textClass}>{item.name}</span>
                    <span className="text-white">{item.count} leads ({item.percentage})</span>
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${colorClass} transition-all duration-500`}
                      style={{ width: item.percentage }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Funnel & Top Products Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Conversion Funnel */}
        <div className="p-6 rounded-xl bg-[#12141d] border border-white/10">
          <h3 className="text-sm font-semibold text-white mb-4">Funnel Chuyển Đổi Leads</h3>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={funnelData} margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis type="number" stroke="#86868b" fontSize={11} />
                <YAxis dataKey="stage" type="category" stroke="#86868b" fontSize={11} width={100} />
                <Tooltip contentStyle={{ backgroundColor: '#090a0f', borderColor: '#ffffff20', borderRadius: '8px', fontSize: '12px' }} />
                <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]}>
                  {funnelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 3 ? '#10b981' : index === 2 ? '#3b82f6' : '#6366f1'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Product Interest */}
        <div className="p-6 rounded-xl bg-[#12141d] border border-white/10">
          <h3 className="text-sm font-semibold text-white mb-4">Top Sản Phẩm Quan Tâm Nhất</h3>
          <div className="space-y-3">
            {topProducts.map((prod, index) => (
              <div key={prod.name} className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
                <div className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded bg-white/10 text-white font-bold text-xs flex items-center justify-center">
                    {index + 1}
                  </span>
                  <span className="text-xs font-medium text-white">{prod.name}</span>
                </div>
                <span className="text-xs font-bold text-blue-400">{prod.count} quan tâm</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sales Leaderboard & Pipeline Forecast Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Sales Leaderboard */}
        <div className="lg:col-span-2 p-6 rounded-xl bg-[#12141d] border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded bg-amber-500/20 text-amber-400">
                <Award className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-white">Bảng Xếp Hạng Hiệu Suất Sales (Leaderboard)</h3>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-[#86868b] uppercase tracking-wider font-semibold">
                  <th className="py-2.5 px-3">Nhân Viên</th>
                  <th className="py-2.5 px-3">Được Gán</th>
                  <th className="py-2.5 px-3">Deal Thắng</th>
                  <th className="py-2.5 px-3">Tỷ Lệ Chốt</th>
                  <th className="py-2.5 px-3 text-right">Doanh Thu Mang Về</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {(!data?.salesLeaderboard || data.salesLeaderboard.length === 0) ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-[#86868b]">Chưa có dữ liệu nhân viên Sales.</td>
                  </tr>
                ) : (
                  data.salesLeaderboard.map((s, idx) => (
                    <tr key={s.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-3 font-semibold text-white flex items-center gap-2">
                        <span className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center ${
                          idx === 0 ? 'bg-amber-400 text-black' : idx === 1 ? 'bg-slate-300 text-black' : idx === 2 ? 'bg-amber-700 text-white' : 'bg-white/10 text-white'
                        }`}>
                          {idx + 1}
                        </span>
                        {s.name}
                      </td>
                      <td className="py-3 px-3 text-[#86868b]">{s.totalAssigned} leads</td>
                      <td className="py-3 px-3 font-bold text-emerald-400">{s.wonLeads} deals</td>
                      <td className="py-3 px-3 text-blue-400 font-semibold">{s.conversionRate}%</td>
                      <td className="py-3 px-3 text-right font-extrabold text-white">{formatVND(s.revenue)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pipeline Forecast by Budget */}
        <div className="p-6 rounded-xl bg-[#12141d] border border-white/10 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white mb-1">Dự Báo Giá Trị Pipeline</h3>
            <p className="text-xs text-[#86868b] mb-4">Phân bổ giá trị tiềm năng theo phân khúc ngân sách</p>
            
            <div className="space-y-3">
              {(data?.pipelineForecast || [
                { category: 'Phân khúc cao (>30tr)', count: 18, estimatedValue: 720000000 },
                { category: 'Phân khúc trung (10-30tr)', count: 12, estimatedValue: 240000000 },
                { category: 'Phân khúc tiêu chuẩn (<10tr)', count: 5, estimatedValue: 35000000 }
              ]).map((item) => (
                <div key={item.category} className="p-3 rounded-lg bg-white/[0.02] border border-white/5 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-white">{item.category}</div>
                    <div className="text-[11px] text-[#86868b] mt-0.5">{item.count} leads tiềm năng</div>
                  </div>
                  <div className="text-xs font-bold text-emerald-400 text-right">
                    {formatVND(item.estimatedValue)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/10 text-center">
            <span className="text-[11px] text-[#86868b]">Tổng giá trị pipeline đang theo dõi: </span>
            <span className="text-xs font-extrabold text-emerald-400">
              {formatVND((data?.pipelineForecast || []).reduce((acc, curr) => acc + curr.estimatedValue, 0))}
            </span>
          </div>
        </div>
      </div>

      {/* Product Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsProductModalOpen(false)}></div>
          <div className="relative w-full max-w-2xl bg-[#12141d] border border-white/10 rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
              <h2 className="text-xl font-bold text-white">Thêm Sản Phẩm Mới</h2>
              <button onClick={() => setIsProductModalOpen(false)} className="text-[#86868b] hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddProductSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#86868b] mb-1">Tên sản phẩm *</label>
                  <input 
                    type="text" 
                    required 
                    value={newProduct.name}
                    onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                    placeholder="VD: iPhone 17 Pro Max"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#86868b] mb-1">Danh mục</label>
                  <input 
                    type="text" 
                    value={newProduct.category}
                    onChange={e => setNewProduct({...newProduct, category: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                    placeholder="VD: Điện thoại"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-[#86868b] mb-1">Giá cơ bản (VNĐ) *</label>
                  <input 
                    type="number" 
                    required 
                    value={newProduct.basePrice}
                    onChange={e => setNewProduct({...newProduct, basePrice: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                    placeholder="VD: 30000000"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-sm font-medium text-white">Biến thể (Variants)</label>
                  <button 
                    type="button" 
                    onClick={handleAddVariant}
                    className="text-xs bg-white/10 hover:bg-white/20 text-white px-2.5 py-1.5 rounded flex items-center gap-1 transition-colors"
                  >
                    <Plus className="w-3 h-3" /> Thêm biến thể
                  </button>
                </div>
                
                <div className="space-y-3">
                  {newProduct.variants.length === 0 && (
                    <div className="text-xs text-[#86868b] italic py-2 text-center border border-dashed border-white/10 rounded-lg">
                      Chưa có biến thể nào. (Tuỳ chọn)
                    </div>
                  )}
                  {newProduct.variants.map((v, idx) => (
                    <div key={idx} className="flex flex-wrap gap-2 items-end p-3 bg-white/[0.02] border border-white/5 rounded-lg relative">
                      <button 
                        type="button" 
                        onClick={() => handleRemoveVariant(idx)}
                        className="absolute -top-2 -right-2 bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white rounded-full p-1 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      <div className="flex-1 min-w-[120px]">
                        <label className="block text-[10px] text-[#86868b] mb-1">Màu sắc</label>
                        <input type="text" value={v.color} onChange={e => handleVariantChange(idx, 'color', e.target.value)} placeholder="Màu" className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-xs text-white" />
                      </div>
                      <div className="flex-1 min-w-[100px]">
                        <label className="block text-[10px] text-[#86868b] mb-1">Dung lượng</label>
                        <input type="text" value={v.storage} onChange={e => handleVariantChange(idx, 'storage', e.target.value)} placeholder="256GB" className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-xs text-white" />
                      </div>
                      <div className="flex-1 min-w-[120px]">
                        <label className="block text-[10px] text-[#86868b] mb-1">Giá (VNĐ)</label>
                        <input type="number" value={v.price} onChange={e => handleVariantChange(idx, 'price', e.target.value)} placeholder="Giá bán" className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-xs text-white" />
                      </div>
                      <div className="w-20">
                        <label className="block text-[10px] text-[#86868b] mb-1">Tồn kho</label>
                        <input type="number" value={v.stockQuantity} onChange={e => handleVariantChange(idx, 'stockQuantity', e.target.value)} className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-xs text-white" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex justify-end gap-3">
                <button type="button" onClick={() => setIsProductModalOpen(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-[#86868b] hover:bg-white/5 transition-colors">
                  Huỷ
                </button>
                <button type="submit" disabled={isSubmittingProduct} className="px-5 py-2 rounded-lg text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors disabled:opacity-50">
                  {isSubmittingProduct ? 'Đang lưu...' : 'Lưu Sản Phẩm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExecutiveDashboard;
