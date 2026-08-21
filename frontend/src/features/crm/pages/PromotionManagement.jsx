import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  Ticket, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Check, 
  X, 
  Clock, 
  Sparkles, 
  Copy, 
  AlertCircle,
  Percent,
  DollarSign,
  Calendar,
  Layers
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || '';

const PromotionManagement = () => {
  const context = useOutletContext() || {};
  const user = context.user;

  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'ACTIVE' | 'INACTIVE'
  const [copiedCode, setCopiedCode] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState(null);
  const [deletingPromo, setDeletingPromo] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Form State
  const initialForm = {
    code: '',
    title: '',
    description: '',
    discountType: 'FIXED', // 'FIXED' | 'PERCENT'
    discountValue: '',
    maxDiscount: '',
    minOrderValue: '',
    usageLimit: '',
    validFrom: '',
    validUntil: '',
    isActive: true
  };
  const [formData, setFormData] = useState(initialForm);

  const fetchPromotions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/promotions/crm`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'x-crm-role': user?.role || 'SUPER_ADMIN'
        }
      });
      if (res.ok) {
        const data = await res.json();
        setPromotions(data);
      }
    } catch (err) {
      console.error('Lỗi tải danh sách khuyến mãi:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, [user]);

  const handleOpenAdd = () => {
    setEditingPromo(null);
    setFormData(initialForm);
    setErrorMessage('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (promo) => {
    setEditingPromo(promo);
    setFormData({
      code: promo.code,
      title: promo.title || '',
      description: promo.description || '',
      discountType: promo.discountType || 'FIXED',
      discountValue: promo.discountValue,
      maxDiscount: promo.maxDiscount || '',
      minOrderValue: promo.minOrderValue || '',
      usageLimit: promo.usageLimit || '',
      validFrom: promo.validFrom ? new Date(promo.validFrom).toISOString().slice(0, 16) : '',
      validUntil: promo.validUntil ? new Date(promo.validUntil).toISOString().slice(0, 16) : '',
      isActive: promo.isActive
    });
    setErrorMessage('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.code.trim()) {
      setErrorMessage('Vui lòng nhập mã khuyến mãi.');
      return;
    }
    if (!formData.discountValue || Number(formData.discountValue) <= 0) {
      setErrorMessage('Vui lòng nhập giá trị giảm giá hợp lệ.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage('');
      const token = localStorage.getItem('token');
      const url = editingPromo
        ? `${API_BASE}/api/promotions/crm/${editingPromo.id}`
        : `${API_BASE}/api/promotions/crm`;
      const method = editingPromo ? 'PUT' : 'POST';

      const payload = {
        ...formData,
        code: formData.code.trim().toUpperCase(),
        discountValue: Number(formData.discountValue),
        maxDiscount: formData.maxDiscount ? Number(formData.maxDiscount) : null,
        minOrderValue: formData.minOrderValue ? Number(formData.minOrderValue) : 0,
        usageLimit: formData.usageLimit ? parseInt(formData.usageLimit, 10) : null,
        validFrom: formData.validFrom ? new Date(formData.validFrom).toISOString() : null,
        validUntil: formData.validUntil ? new Date(formData.validUntil).toISOString() : null
      };

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
          'x-crm-role': user?.role || 'SUPER_ADMIN'
        },
        body: JSON.stringify(payload)
      });

      const result = await res.json();
      if (!res.ok) {
        setErrorMessage(result.error || 'Có lỗi xảy ra.');
        return;
      }

      setIsModalOpen(false);
      fetchPromotions();
    } catch (err) {
      setErrorMessage(err.message || 'Lỗi kết nối máy chủ.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (promo) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/promotions/crm/${promo.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
          'x-crm-role': user?.role || 'SUPER_ADMIN'
        },
        body: JSON.stringify({ isActive: !promo.isActive })
      });
      if (res.ok) {
        setPromotions(prev => prev.map(p => p.id === promo.id ? { ...p, isActive: !p.isActive } : p));
      }
    } catch (err) {
      console.error('Lỗi khi đổi trạng thái mã:', err);
    }
  };

  const handleDelete = async () => {
    if (!deletingPromo) return;
    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/promotions/crm/${deletingPromo.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'x-crm-role': user?.role || 'SUPER_ADMIN'
        }
      });
      if (res.ok) {
        setPromotions(prev => prev.filter(p => p.id !== deletingPromo.id));
        setDeletingPromo(null);
      }
    } catch (err) {
      console.error('Lỗi xóa khuyến mãi:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Filtered list
  const filteredPromotions = promotions.filter(promo => {
    const matchesSearch = 
      promo.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (promo.title && promo.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (promo.description && promo.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = 
      statusFilter === 'ALL' ? true :
      statusFilter === 'ACTIVE' ? promo.isActive :
      !promo.isActive;

    return matchesSearch && matchesStatus;
  });

  // Metrics
  const totalCodes = promotions.length;
  const activeCodes = promotions.filter(p => p.isActive).length;
  const totalUsed = promotions.reduce((acc, p) => acc + (p.usedCount || 0), 0);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Ticket className="w-7 h-7 text-red-500" /> Quản lý Mã Khuyến Mãi & Voucher
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Thiết lập các chiến dịch voucher, giảm giá trực tiếp theo % hoặc tiền mặt cho khách hàng
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl shadow-sm transition-colors text-sm"
        >
          <Plus className="w-4 h-4" /> Tạo mã khuyến mãi mới
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Tổng số mã</p>
            <h3 className="text-2xl font-bold text-gray-900">{totalCodes}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Đang hoạt động</p>
            <h3 className="text-2xl font-bold text-emerald-600">{activeCodes}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold">
            <Ticket className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Tổng lượt đã dùng</p>
            <h3 className="text-2xl font-bold text-orange-600">{totalUsed}</h3>
          </div>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo mã hoặc tên CTKM..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          {['ALL', 'ACTIVE', 'INACTIVE'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors ${
                statusFilter === st
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {st === 'ALL' ? 'Tất cả' : st === 'ACTIVE' ? 'Đang kích hoạt' : 'Đã khóa'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-700">
            <thead className="bg-gray-50/80 border-b border-gray-200 text-xs font-bold uppercase tracking-wider text-gray-500">
              <tr>
                <th className="py-3.5 px-4">Mã Code</th>
                <th className="py-3.5 px-4">Tên chương trình</th>
                <th className="py-3.5 px-4">Mức giảm</th>
                <th className="py-3.5 px-4">Đơn tối thiểu</th>
                <th className="py-3.5 px-4">Đã dùng / Giới hạn</th>
                <th className="py-3.5 px-4">Thời hạn</th>
                <th className="py-3.5 px-4 text-center">Trạng thái</th>
                <th className="py-3.5 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-normal">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-400">
                    <div className="flex justify-center items-center gap-2">
                      <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                      <span>Đang tải danh sách khuyến mãi...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredPromotions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-400">
                    Không tìm thấy mã khuyến mãi nào.
                  </td>
                </tr>
              ) : (
                filteredPromotions.map((promo) => {
                  const isExpired = promo.validUntil && new Date(promo.validUntil) < new Date();
                  return (
                    <tr key={promo.id} className="hover:bg-gray-50/60 transition-colors">
                      {/* Code */}
                      <td className="py-3.5 px-4 font-mono font-bold">
                        <div className="inline-flex items-center gap-1.5 bg-red-50 text-red-600 px-2.5 py-1 rounded-lg border border-red-200/60">
                          <span>{promo.code}</span>
                          <button
                            onClick={() => handleCopy(promo.code)}
                            title="Sao chép mã"
                            className="text-red-400 hover:text-red-700"
                          >
                            {copiedCode === promo.code ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>

                      {/* Title & Description */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-semibold text-gray-900">{promo.title || promo.code}</div>
                        {promo.description && (
                          <div className="text-xs text-gray-500 truncate mt-0.5">{promo.description}</div>
                        )}
                      </td>

                      {/* Discount Value */}
                      <td className="py-3.5 px-4">
                        {promo.discountType === 'PERCENT' ? (
                          <div>
                            <span className="font-bold text-blue-600">Giảm {promo.discountValue}%</span>
                            {promo.maxDiscount && (
                              <p className="text-xs text-gray-500">Tối đa {Number(promo.maxDiscount).toLocaleString('vi-VN')}đ</p>
                            )}
                          </div>
                        ) : (
                          <span className="font-bold text-red-600">
                            - {Number(promo.discountValue).toLocaleString('vi-VN')}đ
                          </span>
                        )}
                      </td>

                      {/* Min Order Value */}
                      <td className="py-3.5 px-4 font-medium">
                        {Number(promo.minOrderValue) > 0 ? (
                          <span>{Number(promo.minOrderValue).toLocaleString('vi-VN')}đ</span>
                        ) : (
                          <span className="text-gray-400">Không có</span>
                        )}
                      </td>

                      {/* Usage */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-gray-900">
                          {promo.usedCount}{' '}
                          <span className="text-gray-400">
                            / {promo.usageLimit ? promo.usageLimit : '∞'}
                          </span>
                        </div>
                      </td>

                      {/* Valid Until */}
                      <td className="py-3.5 px-4">
                        {promo.validUntil ? (
                          <div className={`text-xs font-medium flex items-center gap-1 ${isExpired ? 'text-red-500 font-semibold' : 'text-gray-600'}`}>
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(promo.validUntil).toLocaleDateString('vi-VN')}
                            {isExpired && <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.2 rounded font-bold">Hết hạn</span>}
                          </div>
                        ) : (
                          <span className="text-xs text-emerald-600 font-medium">Vô thời hạn</span>
                        )}
                      </td>

                      {/* Status Toggle */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => handleToggleActive(promo)}
                          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            promo.isActive ? 'bg-emerald-500' : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              promo.isActive ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right space-x-2">
                        <button
                          onClick={() => handleOpenEdit(promo)}
                          title="Chỉnh sửa"
                          className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingPromo(promo)}
                          title="Xóa"
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-gray-200 p-6 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Ticket className="w-5 h-5 text-red-500" />
                {editingPromo ? 'Chỉnh sửa Mã Khuyến Mãi' : 'Tạo Mã Khuyến Mãi Mới'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Mã Khuyến Mãi (Code) *</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: APPLE2M, SALE10"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 border rounded-xl font-mono uppercase bg-gray-50 focus:bg-white focus:ring-2 focus:ring-red-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Loại Giảm Giá</label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-red-500 focus:outline-none"
                  >
                    <option value="FIXED">Số tiền cố định (VNĐ)</option>
                    <option value="PERCENT">Phần trăm (%)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Tên Chương Trình *</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Giảm 2.000.000đ cho đơn hàng từ 10 triệu"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Mô tả chi tiết</label>
                <textarea
                  rows={2}
                  placeholder="Điều kiện áp dụng hoặc ghi chú..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Giá trị giảm ({formData.discountType === 'PERCENT' ? '%' : 'VNĐ'}) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder={formData.discountType === 'PERCENT' ? '10' : '2000000'}
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-red-500 focus:outline-none"
                  />
                </div>

                {formData.discountType === 'PERCENT' ? (
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Giảm tối đa (VNĐ)</label>
                    <input
                      type="number"
                      placeholder="VD: 1500000 (để trống nếu ko trần)"
                      value={formData.maxDiscount}
                      onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-red-500 focus:outline-none"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Đơn tối thiểu (VNĐ)</label>
                    <input
                      type="number"
                      placeholder="VD: 10000000"
                      value={formData.minOrderValue}
                      onChange={(e) => setFormData({ ...formData, minOrderValue: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-red-500 focus:outline-none"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {formData.discountType === 'PERCENT' && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Đơn tối thiểu (VNĐ)</label>
                    <input
                      type="number"
                      placeholder="VD: 5000000"
                      value={formData.minOrderValue}
                      onChange={(e) => setFormData({ ...formData, minOrderValue: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-red-500 focus:outline-none"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Giới hạn số lượt dùng</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Để trống = Không giới hạn"
                    value={formData.usageLimit}
                    onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-red-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Bắt đầu áp dụng</label>
                  <input
                    type="datetime-local"
                    value={formData.validFrom}
                    onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-red-500 focus:outline-none text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Hạn sử dụng</label>
                  <input
                    type="datetime-local"
                    value={formData.validUntil}
                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-red-500 focus:outline-none text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActiveToggle"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 rounded text-red-600 focus:ring-red-500 border-gray-300"
                />
                <label htmlFor="isActiveToggle" className="text-xs font-semibold text-gray-700">
                  Kích hoạt mã khuyến mãi ngay sau khi lưu
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-sm transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Đang lưu...' : editingPromo ? 'Lưu thay đổi' : 'Tạo mã'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingPromo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-gray-200 p-6 space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-lg font-bold text-gray-900">Xác nhận xóa mã khuyến mãi?</h3>
              <p className="text-sm text-gray-500">
                Bạn có chắc chắn muốn xóa mã <strong className="text-red-600 font-mono">{deletingPromo.code}</strong>? Thao tác này không thể hoàn tác.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingPromo(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
              >
                Không xóa
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleDelete}
                className="px-5 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-sm transition-colors disabled:opacity-50"
              >
                {submitting ? 'Đang xóa...' : 'Đồng ý xóa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromotionManagement;
