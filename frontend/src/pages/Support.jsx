import React, { useState } from 'react';
import { motion } from 'framer-motion';
import AwwwardsButton from '../components/ui/AwwwardsButton';
import Accordion from '../components/ui/Accordion';
import { MagnifyingGlass, ShieldCheck, Wrench, ChatCircleDots, Headset, CheckCircle, Sparkle } from '@phosphor-icons/react';

const Support = () => {
  const [serial, setSerial] = useState('');
  const [warrantyStatus, setWarrantyStatus] = useState(null);

  const checkWarranty = (e) => {
    e.preventDefault();
    if (serial.trim().length < 5) return;
    setWarrantyStatus('loading');
    setTimeout(() => {
      setWarrantyStatus('active');
    }, 1200);
  };

  const faqItems = [
    {
      title: 'Chính sách bảo hành 1 đổi 1 của Pig Store như thế nào?',
      content: 'Tất cả các sản phẩm chính hãng mua tại Pig Store đều được hưởng chính sách 1 đổi 1 trong vòng 30 ngày nếu có lỗi từ nhà sản xuất, bảo hành chính hãng 12 tháng tại các trung tâm ủy quyền.'
    },
    {
      title: 'Làm thế nào để tra cứu thời hạn bảo hành của thiết bị?',
      content: 'Bạn chỉ cần nhập số Serial (chèn trong Cài đặt > Mã máy hoặc in ở vỏ hộp) vào thanh tra cứu bảo hành VIP ở trên để xem thời hạn chi tiết.'
    },
    {
      title: 'Pig Store hỗ trợ giao hàng hỏa tốc trong bao lâu?',
      content: 'Đối với khu vực nội thành, dịch vụ Pig Store Express sẽ giao hàng hỏa tốc trong vòng 2 giờ hoàn toàn miễn phí và được niêm phong bảo hiểm 100%.'
    },
    {
      title: 'Quy trình Trả góp 0% qua thẻ tín dụng được thực hiện ra sao?',
      content: 'Bạn có thể chọn phương thức trả góp trực tiếp khi mua hàng online hoặc tại cửa hàng. Hỗ trợ kỳ hạn linh hoạt 3, 6, 9, 12 tháng với tất cả ngân hàng liên kết.'
    }
  ];

  return (
    <div className="bg-[#08080a] text-[#f3f3f6] pt-16 min-h-screen">

      {/* SECTION 1: HERO & WARRANTY CHECKER */}
      <section className="relative py-24 px-6 max-w-[1200px] mx-auto text-center">
        {/* Ambient Glow */}
        <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-radial from-[#d15a20]/15 via-transparent to-transparent blur-3xl" />

        <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[11px] uppercase tracking-[0.25em] font-semibold border border-white/10 bg-white/5 backdrop-blur-md mb-6 text-[#e87b46]">
          <Sparkle size={14} weight="fill" />
          <span>Pig Concierge Support • 24/7 VIP Service</span>
        </div>

        <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight leading-tight text-white mb-6">
          Hỗ Trợ Chuyên Gia.{' '}
          <span className="bg-gradient-to-r from-white via-white/70 to-white/20 bg-clip-text text-transparent">
            Tận Tâm 24/7.
          </span>
        </h1>

        <p className="text-lg text-white/60 max-w-2xl mx-auto font-medium mb-12">
          Giải đáp mọi thắc mắc, tra cứu bảo hành chính hãng và đặt lịch hẹn bảo dưỡng chuyên sâu cho thiết bị Apple của bạn.
        </p>

        {/* WARRANTY SEARCH INPUT IN DOPPELRAND SHELL */}
        <div className="doppelrand-shell max-w-2xl mx-auto text-left">
          <form onSubmit={checkWarranty} className="doppelrand-core flex flex-col sm:flex-row items-center gap-3 p-3">
            <div className="flex items-center gap-3 w-full px-4 py-2">
              <MagnifyingGlass size={22} className="text-white/40" />
              <input
                type="text"
                placeholder="Nhập số Serial hoặc IMEI thiết bị..."
                value={serial}
                onChange={(e) => setSerial(e.target.value)}
                className="w-full bg-transparent text-white placeholder-white/40 focus:outline-none text-sm font-medium"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3 rounded-full bg-white text-black font-semibold text-xs uppercase tracking-wider hover:bg-[#f0f0f3] transition-all flex-shrink-0"
            >
              Tra Cứu
            </button>
          </form>

          {/* Warranty Result Box */}
          {warrantyStatus && (
            <div className="p-6 border-t border-white/10 bg-white/5 rounded-b-[calc(2.25rem-0.5rem)] text-left">
              {warrantyStatus === 'loading' ? (
                <div className="flex items-center gap-3 text-white/60 text-sm">
                  <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                  <span>Đang kết nối cơ sở dữ liệu bảo hành Apple...</span>
                </div>
              ) : (
                <div className="flex items-start gap-4">
                  <CheckCircle size={28} className="text-emerald-400 flex-shrink-0" weight="fill" />
                  <div>
                    <h4 className="text-base font-bold text-white mb-1">Bảo Hành Chính Hãng Còn Hiệu Lực</h4>
                    <p className="text-xs text-white/60">Gói AppleCare+ VIP • Hạn bảo hành đến 30/11/2026. Hỗ trợ 1 đổi 1 tận nơi.</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* SECTION 2: SERVICE CARDS (DOPPELRAND) */}
      <section className="py-20 px-6 max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="doppelrand-shell">
            <div className="doppelrand-core p-8 flex flex-col justify-between min-h-[280px]">
              <div className="text-4xl text-[#e87b46] mb-6">
                <Wrench weight="duotone" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">Đặt Lịch Sửa Chữa</h3>
                <p className="text-white/60 text-sm">Kỹ thuật viên chứng chỉ Apple xử lý trực tiếp trước mặt khách hàng trong 30 phút.</p>
              </div>
            </div>
          </div>

          <div className="doppelrand-shell">
            <div className="doppelrand-core p-8 flex flex-col justify-between min-h-[280px]">
              <div className="text-4xl text-blue-400 mb-6">
                <ShieldCheck weight="duotone" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">AppleCare+ Đặc Quyền</h3>
                <p className="text-white/60 text-sm">Bảo vệ toàn diện trước sự cố rơi vỡ, vào nước và hỗ trợ thay pin miễn phí.</p>
              </div>
            </div>
          </div>

          <div className="doppelrand-shell">
            <div className="doppelrand-core p-8 flex flex-col justify-between min-h-[280px]">
              <div className="text-4xl text-emerald-400 mb-6">
                <Headset weight="duotone" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">Tổng Đài Chuyên Gia</h3>
                <p className="text-white/60 text-sm">Hỗ trợ cài đặt phần mềm và giải đáp thắc mắc kỹ thuật 24/7 qua Hotline 028.3923.4675.</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 3: FREQUENTLY ASKED QUESTIONS (FAQ) */}
      <section className="py-24 px-6 max-w-[1000px] mx-auto border-t border-white/10">
        <div className="text-center mb-16">
          <span className="text-[11px] uppercase font-bold tracking-widest text-[#e87b46] block mb-2">Câu Hỏi Thường Gặp</span>
          <h2 className="text-4xl font-extrabold tracking-tight text-white">Thắc Mắc Phổ Biến.</h2>
        </div>

        <div className="flex flex-col gap-4">
          {faqItems.map((item, index) => (
            <div key={index} className="doppelrand-shell">
              <div className="doppelrand-core p-6">
                <h3 className="text-lg font-bold text-white mb-3">{item.title}</h3>
                <p className="text-white/60 text-sm leading-relaxed">{item.content}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 4: CTA */}
      <section className="py-20 px-6 bg-[#050508] border-t border-white/10 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight text-white mb-6">
            Cần Trợ Giúp Trực Tiếp?
          </h2>
          <AwwwardsButton href="/pre-order" className="bg-white text-black hover:bg-[#f0f0f3]">
            Liên Hệ Tư Vấn Viên VIP
          </AwwwardsButton>
        </div>
      </section>

    </div>
  );
};

export default Support;
