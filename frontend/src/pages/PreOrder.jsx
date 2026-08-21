import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { trackCrmEvent } from '../utils/trackCrmEvent';
import AwwwardsButton from '../components/ui/AwwwardsButton';
import { Sparkle, CheckCircle, WarningCircle, User, Phone, Envelope, NotePencil, DeviceMobile } from '@phosphor-icons/react';

const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwc26qOYaw_IczDuLyA1IvrKXIxlBTZjXSoMOSm2OzXC0m_pNIFZFbZA3NfGdpGe-jZ/exec';

export default function PreOrder() {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    productInterest: 'iPhone 17 Pro Max',
    notes: ''
  });
  
  const [status, setStatus] = useState('idle'); // 'idle' | 'submitting' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate Phone (10 digits Vietnam phone)
    const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
    if (!phoneRegex.test(formData.phone)) {
      setErrorMessage('Số điện thoại không hợp lệ. Vui lòng nhập SĐT Việt Nam (10 số).');
      setStatus('error');
      return;
    }

    // Validate Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailRegex.test(formData.email)) {
      setErrorMessage('Vui lòng nhập địa chỉ Email hợp lệ để nhận thông tin tư vấn.');
      setStatus('error');
      return;
    }

    setStatus('submitting');
    setErrorMessage('');

    // 1. Prepare CRM tracking & lead sync
    const crmPromise = trackCrmEvent({
      email: formData.email,
      name: formData.fullName,
      phone: formData.phone,
      productInterest: formData.productInterest,
      activityType: 'form_submit',
      metadata: { notes: formData.notes, sourcePage: 'PreOrder VIP' }
    });

    // 2. Prepare FormData to bypass CORS on Google Apps Script (Backup)
    const formPayload = new FormData();
    formPayload.append('fullName', formData.fullName);
    formPayload.append('phone', formData.phone);
    formPayload.append('email', formData.email);
    formPayload.append('productInterest', formData.productInterest);
    formPayload.append('notes', formData.notes);

    const sheetPromise = fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      body: formPayload,
    }).catch(err => console.warn('Google Sheets backup error:', err));

    try {
      const [crmResult] = await Promise.allSettled([crmPromise, sheetPromise]);

      // Broadcast event across tabs for instant Lead Management update
      try {
        const channel = new BroadcastChannel('crm_channel');
        channel.postMessage({ type: 'lead_updated', data: formData });
        channel.close();
      } catch (bcErr) {
        // Fallback for browsers without BroadcastChannel
      }
      window.dispatchEvent(new CustomEvent('crm:lead_updated', { detail: formData }));

      setStatus('success');
      setFormData({
        fullName: '',
        phone: '',
        email: '',
        productInterest: 'iPhone 17 Pro Max',
        notes: ''
      });
    } catch (err) {
      console.error('Lỗi khi gửi form:', err);
      setErrorMessage('Đã xảy ra lỗi kết nối hệ thống. Vui lòng thử lại sau.');
      setStatus('error');
    }
  };

  return (
    <div className="bg-[#08080a] text-[#f3f3f6] pt-16 min-h-screen flex items-center justify-center py-20 px-4 sm:px-6">

      {/* Ambient Radial Glow */}
      <div className="pointer-events-none fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-radial from-[#d15a20]/15 via-transparent to-transparent blur-3xl" />

      <div className="w-full max-w-2xl z-10">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[11px] uppercase tracking-[0.25em] font-semibold border border-white/10 bg-white/5 backdrop-blur-md mb-6 text-[#e87b46]">
            <Sparkle size={14} weight="fill" />
            <span>Pig Concierge VIP • Đăng Ký Tư Vấn</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight text-white mb-4">
            Đăng Ký Tư Vấn VIP.{' '}
            <span className="bg-gradient-to-r from-white via-white/70 to-white/20 bg-clip-text text-transparent">
              Trải Nghiệm Riêng Tư.
            </span>
          </h1>

          <p className="text-white/60 text-base max-w-md mx-auto font-medium">
            Chuyên gia Pig Store sẽ liên hệ trực tiếp tư vấn ưu đãi đặc quyền và đặt trước thiết bị trong vòng 15 phút.
          </p>
        </div>

        {/* Doppelrand Form Container */}
        <div className="doppelrand-shell">
          <div className="doppelrand-core p-8 sm:p-12">
            
            <AnimatePresence mode="wait">
              {status === 'success' ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="py-12 text-center flex flex-col items-center"
                >
                  <div className="w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mb-6">
                    <CheckCircle size={48} weight="fill" />
                  </div>
                  <h2 className="text-3xl font-extrabold text-white mb-3">Đăng Ký VIP Thành Công!</h2>
                  <p className="text-white/60 text-sm max-w-md mb-8">
                    Cảm ơn bạn đã tin tưởng Pig Store. Chuyên gia tư vấn VIP của chúng tôi sẽ gọi lại cho bạn qua số điện thoại đã đăng ký.
                  </p>
                  <button
                    onClick={() => setStatus('idle')}
                    className="px-8 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold text-xs uppercase tracking-widest border border-white/15 transition-all"
                  >
                    Gửi Đăng Ký Khác
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                  
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-white/50 mb-2">
                      Họ và Tên <span className="text-[#e87b46]">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/40">
                        <User size={18} />
                      </div>
                      <input
                        type="text"
                        name="fullName"
                        required
                        value={formData.fullName}
                        onChange={handleChange}
                        placeholder="Nguyễn Văn A"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white text-sm placeholder-white/30 focus:outline-none focus:border-[#d15a20] focus:ring-1 focus:ring-[#d15a20] transition-all font-medium"
                      />
                    </div>
                  </div>

                  {/* Phone & Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-white/50 mb-2">
                        Số Điện Thoại <span className="text-[#e87b46]">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/40">
                          <Phone size={18} />
                        </div>
                        <input
                          type="tel"
                          name="phone"
                          required
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="0912345678"
                          className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white text-sm placeholder-white/30 focus:outline-none focus:border-[#d15a20] focus:ring-1 focus:ring-[#d15a20] transition-all font-medium"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-white/50 mb-2">
                        Email <span className="text-[#e87b46]">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/40">
                          <Envelope size={18} />
                        </div>
                        <input
                          type="email"
                          name="email"
                          required
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="name@example.com"
                          className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white text-sm placeholder-white/30 focus:outline-none focus:border-[#d15a20] focus:ring-1 focus:ring-[#d15a20] transition-all font-medium"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Product Selection */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-white/50 mb-2">
                      Sản Phẩm Quan Tâm
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/40">
                        <DeviceMobile size={18} />
                      </div>
                      <select
                        name="productInterest"
                        value={formData.productInterest}
                        onChange={handleChange}
                        className="w-full bg-[#0d0d12] border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white text-sm focus:outline-none focus:border-[#d15a20] focus:ring-1 focus:ring-[#d15a20] transition-all font-medium appearance-none cursor-pointer"
                      >
                        <option value="iPhone 17 Pro Max">iPhone 17 Pro Max</option>
                        <option value="iPhone 17 Pro">iPhone 17 Pro</option>
                        <option value="MacBook Pro M4">MacBook Pro M4 Series</option>
                        <option value="iPad Pro M4">iPad Pro M4</option>
                        <option value="Apple Watch Series 10">Apple Watch Series 10</option>
                      </select>
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-white/50 mb-2">
                      Yêu Cầu Đặc Biệt / Ghi Chú
                    </label>
                    <div className="relative">
                      <div className="absolute top-4 left-0 pl-4 pointer-events-none text-white/40">
                        <NotePencil size={18} />
                      </div>
                      <textarea
                        name="notes"
                        rows="3"
                        value={formData.notes}
                        onChange={handleChange}
                        placeholder="Thời gian thuận tiện gọi lại, tư vấn màu sắc..."
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white text-sm placeholder-white/30 focus:outline-none focus:border-[#d15a20] focus:ring-1 focus:ring-[#d15a20] transition-all font-medium"
                      />
                    </div>
                  </div>

                  {/* Error Alert */}
                  {status === 'error' && (
                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold">
                      <WarningCircle size={20} weight="fill" className="flex-shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="mt-4 flex justify-center">
                    <button
                      type="submit"
                      disabled={status === 'submitting'}
                      className="w-full py-4 rounded-full bg-white text-black font-extrabold text-sm uppercase tracking-wider hover:bg-[#f0f0f3] active:scale-[0.98] transition-all duration-300 shadow-xl disabled:opacity-50 flex items-center justify-center gap-3"
                    >
                      {status === 'submitting' ? (
                        <>
                          <div className="w-4 h-4 rounded-full border-2 border-black/20 border-t-black animate-spin" />
                          <span>Đang Gửi Đăng Ký VIP...</span>
                        </>
                      ) : (
                        <span>Xác Nhận Đăng Ký VIP</span>
                      )}
                    </button>
                  </div>

                </form>
              )}
            </AnimatePresence>

          </div>
        </div>

      </div>

    </div>
  );
}
