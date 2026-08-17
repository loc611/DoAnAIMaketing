import React, { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Flame, 
  Award, 
  PlusCircle, 
  MessageSquare, 
  Send, 
  CheckCircle2, 
  Clock, 
  Tag, 
  DollarSign, 
  Briefcase 
} from 'lucide-react';

const API_BASE = `${import.meta.env.VITE_API_URL || ''}/api/v1/crm`;

const LeadDetailDrawer = ({ leadId, onClose, onLeadUpdated, usersList = [] }) => {
  const [leadData, setLeadData] = useState(null);
  const [staticBreakdown, setStaticBreakdown] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('timeline'); // 'timeline' | 'scoring'

  // Form state for adding manual activity
  const [activityType, setActivityType] = useState('phone_call');
  const [noteContent, setNoteContent] = useState('');
  const [submittingActivity, setSubmittingActivity] = useState(false);

  // Status & Assignee editing state
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchLeadDetails = async () => {
    if (!leadId) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/leads/${leadId}`, {
        headers: { 'Authorization': token ? `Bearer ${token}` : '' }
      });
      if (res.ok) {
        const json = await res.json();
        setLeadData(json.lead);
        setStaticBreakdown(json.staticBreakdown || []);
      }
    } catch (err) {
      console.error('Lỗi khi tải thông tin lead:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeadDetails();
  }, [leadId]);

  const handleStatusChange = async (newStatus) => {
    setUpdatingStatus(true);
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
        const json = await res.json();
        setLeadData(json.lead);
        if (onLeadUpdated) onLeadUpdated(json.lead);
      }
    } catch (err) {
      console.error('Lỗi khi cập nhật trạng thái:', err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleAssigneeChange = async (newAssigneeId) => {
    setUpdatingStatus(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/leads/${leadId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({ assignedToId: newAssigneeId || null })
      });
      if (res.ok) {
        const json = await res.json();
        setLeadData(json.lead);
        if (onLeadUpdated) onLeadUpdated(json.lead);
      }
    } catch (err) {
      console.error('Lỗi khi gán người phụ trách:', err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleAddActivity = async (e) => {
    e.preventDefault();
    if (!noteContent.trim() && activityType === 'note') return;

    setSubmittingActivity(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/leads/${leadId}/activities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({
          activityType,
          note: noteContent
        })
      });

      if (res.ok) {
        setNoteContent('');
        await fetchLeadDetails();
        if (onLeadUpdated) onLeadUpdated();
      }
    } catch (err) {
      console.error('Lỗi khi thêm tương tác:', err);
    } finally {
      setSubmittingActivity(false);
    }
  };

  if (!leadId) return null;

  const getTempBadge = (temp) => {
    if (temp === 'HOT') return <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/30">🔥 HOT</span>;
    if (temp === 'WARM') return <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">⚡ WARM</span>;
    return <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">❄️ COLD</span>;
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'phone_call':
      case 'click_call':
        return <Phone className="w-3.5 h-3.5 text-blue-400" />;
      case 'email_sent':
        return <Mail className="w-3.5 h-3.5 text-indigo-400" />;
      case 'meeting':
        return <Calendar className="w-3.5 h-3.5 text-purple-400" />;
      case 'form_submit':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />;
      case 'add_to_cart':
        return <DollarSign className="w-3.5 h-3.5 text-amber-400" />;
      default:
        return <MessageSquare className="w-3.5 h-3.5 text-gray-400" />;
    }
  };

  const getActivityLabel = (type) => {
    switch (type) {
      case 'form_submit': return 'Đã đăng ký Form';
      case 'view_product': return 'Xem thông tin sản phẩm';
      case 'add_to_cart': return 'Thêm sản phẩm vào giỏ';
      case 'click_call': return 'Bấm nút gọi điện hotline';
      case 'click_chat': return 'Bấm trò chuyện tư vấn';
      case 'phone_call': return 'Cuộc gọi Sales tư vấn';
      case 'email_sent': return 'Đã gửi email trao đổi';
      case 'meeting': return 'Lịch hẹn tư vấn trực tiếp';
      case 'note': return 'Ghi chú nội bộ';
      default: return type;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-2xl bg-[#0e1017] border-l border-white/10 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-start justify-between bg-[#12141d]">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-white">{leadData?.name || 'Chi Tiết Lead'}</h2>
              {leadData && getTempBadge(leadData.temperature)}
            </div>
            <p className="text-xs text-[#86868b] mt-1 flex items-center gap-4">
              <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {leadData?.email}</span>
              {leadData?.phone && <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {leadData?.phone}</span>}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#86868b] hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* Quick Status & Assignee Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-[#12141d] border border-white/10 space-y-2">
                <label className="text-[11px] font-semibold text-[#86868b] uppercase tracking-wider">Trạng Thái Lead</label>
                <select
                  value={leadData?.status || 'NEW'}
                  disabled={updatingStatus}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="w-full bg-[#090a0f] border border-white/10 rounded-lg px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="NEW">✨ MỚI (NEW)</option>
                  <option value="CONTACTED">📞 ĐÃ LIÊN HỆ (CONTACTED)</option>
                  <option value="QUALIFIED">🎯 TIỀM NĂNG (QUALIFIED)</option>
                  <option value="WON">🏆 THÀNH CÔNG (WON)</option>
                  <option value="LOST">❌ THẤT BẠI (LOST)</option>
                </select>
              </div>

              <div className="p-4 rounded-xl bg-[#12141d] border border-white/10 space-y-2">
                <label className="text-[11px] font-semibold text-[#86868b] uppercase tracking-wider">Người Phụ Trách</label>
                <select
                  value={leadData?.assignedToId || ''}
                  disabled={updatingStatus}
                  onChange={(e) => handleAssigneeChange(e.target.value)}
                  className="w-full bg-[#090a0f] border border-white/10 rounded-lg px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="">-- Chưa Gán --</option>
                  {usersList.map((u) => (
                    <option key={u.id} value={u.id}>{u.fullName || u.email}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Overview Summary Cards */}
            <div className="p-4 rounded-xl bg-[#12141d] border border-white/10 grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-[11px] text-[#86868b]">Tổng Điểm</div>
                <div className="text-xl font-bold text-blue-400 mt-1">{leadData?.score || 0} điểm</div>
              </div>
              <div className="border-x border-white/10 px-2">
                <div className="text-[11px] text-[#86868b]">Sản Phẩm Quan Tâm</div>
                <div className="text-xs font-semibold text-white mt-1 truncate">{leadData?.productInterest || 'N/A'}</div>
              </div>
              <div>
                <div className="text-[11px] text-[#86868b]">Ngân Sách Dự Kiến</div>
                <div className="text-xs font-semibold text-emerald-400 mt-1">{leadData?.budgetRange || 'Chưa xác định'}</div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-white/10">
              <button
                onClick={() => setActiveTab('timeline')}
                className={`pb-3 px-4 text-xs font-semibold border-b-2 transition-colors ${
                  activeTab === 'timeline'
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-[#86868b] hover:text-white'
                }`}
              >
                Nhật Ký Tương Tác ({leadData?.activities?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('scoring')}
                className={`pb-3 px-4 text-xs font-semibold border-b-2 transition-colors ${
                  activeTab === 'scoring'
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-[#86868b] hover:text-white'
                }`}
              >
                Phân Rã Điểm Số (Score Breakdown)
              </button>
            </div>

            {/* TAB 1: TIMELINE & MANUAL ACTIVITY */}
            {activeTab === 'timeline' && (
              <div className="space-y-6">
                
                {/* Form Add Manual Activity */}
                <form onSubmit={handleAddActivity} className="p-4 rounded-xl bg-[#12141d] border border-white/10 space-y-3">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <PlusCircle className="w-3.5 h-3.5 text-blue-400" />
                    Thêm Nhật Ký / Tương Tác Mới
                  </h4>

                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: 'phone_call', label: '📞 Gọi điện (+15)' },
                      { id: 'email_sent', label: '✉️ Gửi Email (+10)' },
                      { id: 'meeting', label: '🤝 Gặp mặt (+20)' },
                      { id: 'note', label: '📝 Ghi chú (0)' }
                    ].map((t) => (
                      <button
                        type="button"
                        key={t.id}
                        onClick={() => setActivityType(t.id)}
                        className={`px-2 py-1.5 rounded-lg text-[11px] font-medium border transition-colors ${
                          activityType === t.id
                            ? 'bg-blue-600/20 border-blue-500 text-blue-400'
                            : 'bg-[#090a0f] border-white/10 text-[#86868b] hover:text-white'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>

                  <textarea
                    rows={2}
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    placeholder="Nhập nội dung trao đổi hoặc ghi chú nội bộ..."
                    className="w-full bg-[#090a0f] border border-white/10 rounded-lg p-3 text-xs text-white placeholder-[#86868b] focus:outline-none focus:border-blue-500"
                  />

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={submittingActivity}
                      className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{submittingActivity ? 'Đang lưu...' : 'Ghi Tương Tác'}</span>
                    </button>
                  </div>
                </form>

                {/* Timeline List */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-[#86868b] uppercase tracking-wider">Lịch Sử Tương Tác</h4>
                  
                  {(!leadData?.activities || leadData.activities.length === 0) ? (
                    <div className="py-8 text-center text-xs text-[#86868b] bg-[#12141d] rounded-xl border border-white/5">
                      Chưa có tương tác nào được ghi nhận.
                    </div>
                  ) : (
                    <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-white/10">
                      {leadData.activities.map((act) => (
                        <div key={act.id} className="relative bg-[#12141d] border border-white/10 rounded-xl p-4 space-y-1">
                          
                          {/* Dot Icon */}
                          <div className="absolute -left-6 top-4 w-5 h-5 rounded-full bg-[#0e1017] border border-white/20 flex items-center justify-center">
                            {getActivityIcon(act.activityType)}
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-white flex items-center gap-2">
                              {getActivityLabel(act.activityType)}
                              {act.scoreDelta !== 0 && (
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                  act.scoreDelta > 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                                }`}>
                                  {act.scoreDelta > 0 ? `+${act.scoreDelta}` : act.scoreDelta} điểm
                                </span>
                              )}
                            </span>
                            <span className="text-[11px] text-[#86868b] flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {act.createdAt ? new Date(act.createdAt).toLocaleString('vi-VN') : ''}
                            </span>
                          </div>

                          {act.metadata?.note && (
                            <p className="text-xs text-[#86868b] bg-[#090a0f] p-2.5 rounded-lg border border-white/5 mt-2">
                              "{act.metadata.note}"
                              {act.metadata.createdBy && (
                                <span className="block text-[10px] text-blue-400 mt-1">— Ghi bởi {act.metadata.createdBy}</span>
                              )}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: SCORE BREAKDOWN */}
            {activeTab === 'scoring' && (
              <div className="space-y-6">
                
                {/* Static Score Section */}
                <div className="p-4 rounded-xl bg-[#12141d] border border-white/10 space-y-3">
                  <h4 className="text-xs font-bold text-white flex items-center gap-2">
                    <Tag className="w-4 h-4 text-indigo-400" />
                    Điểm Tĩnh (Dựa trên thông tin Lead)
                  </h4>
                  <div className="space-y-2">
                    {staticBreakdown.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs py-1.5 border-b border-white/5 last:border-0">
                        <span className="text-[#86868b]">{item.label}</span>
                        <span className="font-bold text-emerald-400">+{item.points} điểm</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Dynamic Score Section */}
                <div className="p-4 rounded-xl bg-[#12141d] border border-white/10 space-y-3">
                  <h4 className="text-xs font-bold text-white flex items-center gap-2">
                    <Flame className="w-4 h-4 text-amber-400" />
                    Điểm Động (Tương tác tích luỹ)
                  </h4>
                  <div className="space-y-2">
                    {leadData?.activities?.map((act) => (
                      <div key={act.id} className="flex items-center justify-between text-xs py-1.5 border-b border-white/5 last:border-0">
                        <span className="text-[#86868b]">{getActivityLabel(act.activityType)}</span>
                        <span className={`font-bold ${act.scoreDelta >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {act.scoreDelta > 0 ? `+${act.scoreDelta}` : act.scoreDelta} điểm
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total Rule Note */}
                <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300 space-y-1">
                  <div className="font-bold text-white">Quy tắc xếp loại Nhiệt độ Lead:</div>
                  <div>• Tổng điểm ≥ 70 → 🔴 <b>HOT Lead</b> (Cần liên hệ trong 24h)</div>
                  <div>• 40 ≤ Tổng điểm &lt; 70 → 🟡 <b>WARM Lead</b> (Đang tìm hiểu sâu)</div>
                  <div>• Tổng điểm &lt; 40 → 🔵 <b>COLD Lead</b> (Mới tiếp cận)</div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LeadDetailDrawer;
