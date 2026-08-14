import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  Flame, 
  LayoutList, 
  Kanban as KanbanIcon, 
  UserCheck, 
  Phone, 
  Mail, 
  Clock, 
  X, 
  CheckSquare, 
  Square, 
  ChevronRight, 
  Sparkles,
  RefreshCcw,
  Download
} from 'lucide-react';

import LeadDetailDrawer from '../components/LeadDetailDrawer';

const API_BASE = `\${import.meta.env.VITE_API_URL}/api/v1/crm`;

const LeadManagement = () => {
  const context = useOutletContext() || {};
  const user = context.user;
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'kanban'

  // Filters
  const [sourceFilter, setSourceFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [tempFilter, setTempFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Slide-Over Add Lead Modal State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newLeadForm, setNewLeadForm] = useState({
    name: '',
    email: '',
    phone: '',
    productInterest: 'iPhone 17 Pro Max 256GB',
    budgetRange: '>30tr',
    source: 'landing_page'
  });

  // Selected Lead Details Modal
  const [selectedLead, setSelectedLead] = useState(null);
  const [leadDetail, setLeadDetail] = useState(null);

  // Bulk Selection
  const [selectedLeadIds, setSelectedLeadIds] = useState([]);
  const [bulkSalesId, setBulkSalesId] = useState('');
  const [usersList, setUsersList] = useState([]);

  const role = user?.role || 'VIEWER';
  const isReadOnly = role === 'VIEWER';

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      let url = `${API_BASE}/leads?search=${encodeURIComponent(searchQuery)}`;
      if (sourceFilter) url += `&source=${sourceFilter}`;
      if (statusFilter) url += `&status=${statusFilter}`;
      if (tempFilter) url += `&temperature=${tempFilter}`;

      const res = await fetch(url, {
        headers: { 'Authorization': token ? `Bearer ${token}` : '' }
      });

      if (res.ok) {
        const json = await res.json();
        setLeads(json.leads || []);
      }
    } catch (err) {
      console.error('Failed to fetch leads:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/users`, {
        headers: { 'Authorization': token ? `Bearer ${token}` : '' }
      });
      if (res.ok) {
        const json = await res.json();
        setUsersList(json.users || []);
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchLeads();
  }, [sourceFilter, statusFilter, tempFilter, searchQuery]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateLead = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/leads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify(newLeadForm)
      });

      if (res.ok) {
        setIsAddOpen(false);
        setNewLeadForm({
          name: '',
          email: '',
          phone: '',
          productInterest: 'iPhone 17 Pro Max 256GB',
          budgetRange: '>30tr',
          source: 'landing_page'
        });
        fetchLeads();
      }
    } catch (err) {
      console.error('Failed to create lead:', err);
    }
  };

  const handleStatusChange = async (leadId, newStatus) => {
    if (isReadOnly) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/leads/${leadId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        fetchLeads();
        if (selectedLead?.id === leadId) {
          openLeadDetail(leadId);
        }
      }
    } catch (err) {
      console.error('Failed to update lead status:', err);
    }
  };

  const handleBulkAssign = async () => {
    if (selectedLeadIds.length === 0 || !bulkSalesId) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/leads/bulk-assign`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({ leadIds: selectedLeadIds, assignedToId: bulkSalesId })
      });

      if (res.ok) {
        setSelectedLeadIds([]);
        fetchLeads();
      }
    } catch (err) {
      console.error('Failed to bulk assign:', err);
    }
  };

  const openLeadDetail = async (leadId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/leads/${leadId}`, {
        headers: { 'Authorization': token ? `Bearer ${token}` : '' }
      });
      if (res.ok) {
        const json = await res.json();
        setSelectedLead(json.lead);
        setLeadDetail(json);
      }
    } catch (e) {}
  };

  const toggleSelectLead = (id) => {
    setSelectedLeadIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedLeadIds.length === leads.length) {
      setSelectedLeadIds([]);
    } else {
      setSelectedLeadIds(leads.map(l => l.id));
    }
  };

  const handleExportCSV = () => {
    if (!leads || leads.length === 0) return;
    const headers = ['ID', 'Tên Lead', 'Email', 'SĐT', 'Sản Phẩm Quan Tâm', 'Ngân Sách', 'Nguồn', 'Điểm Số', 'Nhiệt Độ', 'Trạng Thái', 'Người Phụ Trách', 'Ngày Tạo'];
    const rows = leads.map(l => [
      l.id,
      `"${l.name || ''}"`,
      `"${l.email || ''}"`,
      `"${l.phone || ''}"`,
      `"${l.productInterest || ''}"`,
      `"${l.budgetRange || ''}"`,
      `"${l.source || ''}"`,
      l.score || 0,
      l.temperature || 'COLD',
      l.status || 'NEW',
      `"${l.assignedTo?.fullName || l.assignedTo?.email || 'Chưa gán'}"`,
      `"${l.createdAt ? new Date(l.createdAt).toLocaleDateString('vi-VN') : ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `danh_sach_leads_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const statuses = ['NEW', 'CONTACTED', 'QUALIFIED', 'WON', 'LOST'];
  const statusLabels = {
    NEW: 'Mới (New)',
    CONTACTED: 'Đã Liên Hệ',
    QUALIFIED: 'Tiềm Năng',
    WON: 'Thành Công (Won)',
    LOST: 'Thất Bại (Lost)'
  };

  return (
    <div className="space-y-6 w-full">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            Quản Lý Leads & Cơ Hội
          </h1>
          <p className="text-xs text-[#86868b] mt-0.5">
            Quản lý, phân loại nhiệt độ (HOT / WARM / COLD) và chuyển đổi Leads theo tiến trình Kanban.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 text-xs">
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
                viewMode === 'table' ? 'bg-blue-600 text-white' : 'text-[#86868b] hover:text-white'
              }`}
            >
              <LayoutList className="w-3.5 h-3.5" />
              <span>Dạng Bảng</span>
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
                viewMode === 'kanban' ? 'bg-blue-600 text-white' : 'text-[#86868b] hover:text-white'
              }`}
            >
              <KanbanIcon className="w-3.5 h-3.5" />
              <span>Dạng Kanban</span>
            </button>
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold transition-colors"
            title="Xuất dữ liệu danh sách lead hiện tại ra file CSV"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Xuất CSV</span>
          </button>

          {!isReadOnly && (
            <button
              onClick={() => setIsAddOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-500/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm Lead Mới</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-xl bg-[#12141d] border border-white/10 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-56">
            <Search className="w-3.5 h-3.5 text-[#86868b] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo tên, email, sđt..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-[#86868b] focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Temperature Filter */}
          <select
            value={tempFilter}
            onChange={(e) => setTempFilter(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="" className="bg-[#090a0f]">Tất cả nhiệt độ</option>
            <option value="HOT" className="bg-[#090a0f] text-red-400">🔥 HOT (&gt;=70đ)</option>
            <option value="WARM" className="bg-[#090a0f] text-amber-400">⚡ WARM (40-69đ)</option>
            <option value="COLD" className="bg-[#090a0f] text-blue-400">❄️ COLD (&lt;40đ)</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="" className="bg-[#090a0f]">Tất cả trạng thái</option>
            <option value="NEW" className="bg-[#090a0f]">Mới (New)</option>
            <option value="CONTACTED" className="bg-[#090a0f]">Đã Liên Hệ</option>
            <option value="QUALIFIED" className="bg-[#090a0f]">Tiềm Năng</option>
            <option value="WON" className="bg-[#090a0f]">Thành Công (Won)</option>
            <option value="LOST" className="bg-[#090a0f]">Thất Bại (Lost)</option>
          </select>

          {/* Source Filter */}
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="" className="bg-[#090a0f]">Tất cả nguồn</option>
            <option value="landing_page" className="bg-[#090a0f]">Landing Page</option>
            <option value="ads" className="bg-[#090a0f]">Quảng Cáo Ads</option>
            <option value="referral" className="bg-[#090a0f]">Giới Thiệu (Referral)</option>
            <option value="form" className="bg-[#090a0f]">Form Đăng Ký</option>
          </select>
        </div>

        {/* Bulk Action Bar */}
        {selectedLeadIds.length > 0 && !isReadOnly && (
          <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 px-3 py-1.5 rounded-lg text-xs">
            <span className="text-blue-400 font-semibold">{selectedLeadIds.length} đã chọn</span>
            <select
              value={bulkSalesId}
              onChange={(e) => setBulkSalesId(e.target.value)}
              className="bg-[#090a0f] border border-white/20 rounded px-2 py-1 text-xs text-white"
            >
              <option value="">-- Chọn Sales --</option>
              {usersList.map(u => (
                <option key={u.id} value={u.id}>{u.fullName}</option>
              ))}
            </select>
            <button
              onClick={handleBulkAssign}
              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded font-medium transition-colors"
            >
              Gán Sales
            </button>
          </div>
        )}
      </div>

      {/* Main Content: Table View vs Kanban View */}
      {viewMode === 'table' ? (
        /* TABLE VIEW */
        <div className="p-6 rounded-xl bg-[#12141d] border border-white/10 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-[#86868b] uppercase tracking-wider font-semibold">
                <th className="py-3 px-3 w-8">
                  <button onClick={toggleSelectAll}>
                    {selectedLeadIds.length === leads.length && leads.length > 0 ? (
                      <CheckSquare className="w-4 h-4 text-blue-400" />
                    ) : (
                      <Square className="w-4 h-4 text-[#86868b]" />
                    )}
                  </button>
                </th>
                <th className="py-3 px-4">Tên Lead</th>
                <th className="py-3 px-4">Sản Phẩm Quan Tâm</th>
                <th className="py-3 px-4">Nguồn</th>
                <th className="py-3 px-4">Điểm Số</th>
                <th className="py-3 px-4">Nhiệt Độ</th>
                <th className="py-3 px-4">Trạng Thái</th>
                <th className="py-3 px-4">Người Phụ Trách</th>
                <th className="py-3 px-4 text-right">Chi Tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {leads.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-[#86868b]">
                    Không tìm thấy Lead phù hợp với bộ lọc.
                  </td>
                </tr>
              ) : (
                leads.map((l) => {
                  const isSelected = selectedLeadIds.includes(l.id);

                  return (
                    <tr key={l.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 px-3">
                        <button onClick={() => toggleSelectLead(l.id)}>
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-blue-400" />
                          ) : (
                            <Square className="w-4 h-4 text-[#86868b]" />
                          )}
                        </button>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-white">
                        <div>{l.name}</div>
                        <div className="text-[11px] text-[#86868b] font-normal">{l.email}</div>
                      </td>
                      <td className="py-3.5 px-4 text-[#86868b] font-medium">{l.productInterest}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded bg-white/5 text-[#86868b] border border-white/10 text-[10px]">
                          {l.source}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-white">{l.score} đ</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          l.temperature === 'HOT' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                          l.temperature === 'WARM' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                          'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        }`}>
                          {l.temperature === 'HOT' ? '🔥 HOT' : l.temperature === 'WARM' ? '⚡ WARM' : '❄️ COLD'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <select
                          value={l.status}
                          disabled={isReadOnly}
                          onChange={(e) => handleStatusChange(l.id, e.target.value)}
                          className="bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-blue-500 cursor-pointer font-medium"
                        >
                          {statuses.map(st => (
                            <option key={st} value={st} className="bg-[#090a0f]">{statusLabels[st]}</option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3.5 px-4 text-[#86868b]">
                        {l.assignedTo?.fullName || 'Chưa gán'}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => openLeadDetail(l.id)}
                          className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-white transition-colors"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      ) : (
        /* KANBAN VIEW */
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 overflow-x-auto pb-4">
          {statuses.map((st) => {
            const columnLeads = leads.filter(l => l.status === st);

            return (
              <div key={st} className="p-4 rounded-xl bg-[#12141d] border border-white/10 flex flex-col min-h-[500px]">
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    {statusLabels[st]}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-white/10 text-white text-[10px] font-bold">
                    {columnLeads.length}
                  </span>
                </div>

                {/* Cards Container */}
                <div className="space-y-3 flex-1 overflow-y-auto">
                  {columnLeads.map((l) => (
                    <div
                      key={l.id}
                      onClick={() => openLeadDetail(l.id)}
                      className="p-3.5 rounded-lg bg-[#090a0f] border border-white/10 hover:border-blue-500/40 transition-all cursor-pointer space-y-2 group shadow-md"
                    >
                      <div className="flex items-center justify-between">
                        <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                          l.temperature === 'HOT' ? 'bg-red-500/20 text-red-400' :
                          l.temperature === 'WARM' ? 'bg-amber-500/20 text-amber-400' :
                          'bg-blue-500/20 text-blue-400'
                        }`}>
                          {l.temperature === 'HOT' ? '🔥 HOT' : l.temperature === 'WARM' ? '⚡ WARM' : '❄️ COLD'}
                        </span>
                        <span className="text-[10px] font-bold text-white">{l.score} điểm</span>
                      </div>

                      <div>
                        <h4 className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors">{l.name}</h4>
                        <p className="text-[10px] text-[#86868b] truncate">{l.productInterest}</p>
                      </div>

                      <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-[#86868b]">
                        <span>{l.assignedTo?.fullName || 'Chưa gán'}</span>
                        <span className="capitalize">{l.source}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* SLIDE-OVER MODAL: ADD NEW LEAD */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-[#090a0f] border-l border-white/10 p-6 h-full flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Plus className="w-4 h-4 text-blue-400" /> Thêm Lead Mới
                </h3>
                <button
                  onClick={() => setIsAddOpen(false)}
                  className="p-1 rounded bg-white/5 text-[#86868b] hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateLead} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[#86868b] mb-1 font-medium">Họ Và Tên *</label>
                  <input
                    type="text"
                    required
                    placeholder="Nguyễn Văn A"
                    value={newLeadForm.name}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, name: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[#86868b] mb-1 font-medium">Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="khachhang@gmail.com"
                    value={newLeadForm.email}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, email: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[#86868b] mb-1 font-medium">Số Điện Thoại</label>
                  <input
                    type="tel"
                    placeholder="0901234567"
                    value={newLeadForm.phone}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, phone: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[#86868b] mb-1 font-medium">Sản Phẩm Quan Tâm</label>
                  <select
                    value={newLeadForm.productInterest}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, productInterest: e.target.value })}
                    className="w-full bg-[#12141d] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="iPhone 17 Pro Max 256GB">iPhone 17 Pro Max 256GB (+25đ)</option>
                    <option value="MacBook Pro 14 M3 Max">MacBook Pro 14 M3 Max (+25đ)</option>
                    <option value="iPad Pro 11 M2">iPad Pro 11 M2 (+15đ)</option>
                    <option value="AirPods Max Space Gray">AirPods Max (+5đ)</option>
                    <option value="Phụ kiện Apple">Phụ kiện Apple (+5đ)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#86868b] mb-1 font-medium">Khoảng Ngân Sách</label>
                  <select
                    value={newLeadForm.budgetRange}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, budgetRange: e.target.value })}
                    className="w-full bg-[#12141d] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value=">30tr">&gt; 30 Triệu (+20đ)</option>
                    <option value="10-30tr">10 - 30 Triệu (+10đ)</option>
                    <option value="<10tr">&lt; 10 Triệu (+0đ)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#86868b] mb-1 font-medium">Nguồn Tiếp Cận</label>
                  <select
                    value={newLeadForm.source}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, source: e.target.value })}
                    className="w-full bg-[#12141d] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="landing_page">Landing Page Store</option>
                    <option value="ads">Quảng Cáo Google/Facebook</option>
                    <option value="referral">Người Thân Giới Thiệu</option>
                    <option value="form">Form Đăng Ký Tư Vấn</option>
                  </select>
                </div>

                <div className="pt-4 border-t border-white/10 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAddOpen(false)}
                    className="flex-1 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white font-medium"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-lg shadow-blue-500/20"
                  >
                    Lưu Lead Mới
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* LEAD DETAIL & ACTIVITY TIMELINE DRAWER */}
      {selectedLead && (
        <LeadDetailDrawer
          leadId={selectedLead.id}
          onClose={() => setSelectedLead(null)}
          onLeadUpdated={() => {
            fetchLeads();
          }}
          usersList={usersList}
        />
      )}
    </div>
  );
};

export default LeadManagement;
