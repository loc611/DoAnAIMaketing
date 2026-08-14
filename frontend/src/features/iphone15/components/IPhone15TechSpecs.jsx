import React from 'react';
import { motion } from 'framer-motion';

export default function IPhone15TechSpecs() {
  const cards = [
    {
      id: 'battery',
      type: 'battery',
      tag: 'Pin',
      headline: '29 giờ',
      sub: 'xem video. Thời lượng pin đáng kinh ngạc cho cả ngày dài.',
      color: '#C6B9A6', // Natural Titanium color
    },
    {
      id: 'chip',
      type: 'chip',
      tag: 'Chip A17 Pro',
      headline: 'Đột phá',
      sub: 'GPU cấp độ Pro với 6 lõi. Hiệu năng chơi game đỉnh cao chưa từng có.',
      color: '#A09F9C',
    },
    {
      id: 'camera',
      type: 'camera',
      tag: 'Hệ thống Camera Pro',
      headline: 'Tele 5x',
      sub: 'Camera Chính 48MP, Siêu rộng, và ống kính Telephoto 5x độc quyền trên Pro Max.',
      color: '#E3E0D8',
    },
    {
      id: 'action-button',
      type: 'feature',
      tag: 'Nút Tác Vụ',
      headline: 'Nhanh chóng',
      sub: 'Truy cập nhanh tính năng yêu thích của bạn chỉ bằng một cú nhấn giữ.',
      color: '#D1CFC7',
    },
    {
      id: 'connectivity',
      type: 'feature',
      tag: 'Kết nối',
      headline: 'USB-C',
      sub: 'Hỗ trợ USB 3 với tốc độ truyền dữ liệu nhanh hơn tới 20 lần.',
      color: '#B0B0B0',
    },
    {
      id: 'build',
      type: 'build',
      tag: 'Thiết kế',
      headline: 'Titan',
      sub: 'Thiết kế từ Titan chuẩn hàng không vũ trụ. bền bỉ và nhẹ hơn bao giờ hết.',
      color: '#ffffff',
    }
  ];

  return (
    <section className="relative w-full bg-[#0A0A0A] text-[#f4f4f3] overflow-hidden py-24 sm:py-32">
      {/* Background Gradient Effect */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_50%_30%,rgba(10,10,10,0.25),rgba(10,10,10,0.85)_75%),linear-gradient(180deg,rgba(10,10,10,0.55)_0%,rgba(10,10,10,0.35)_22%,rgba(10,10,10,0.75)_100%)]" />
      </div>

      <div className="relative z-10 w-full px-6 sm:px-12 lg:px-24 mx-auto max-w-[1400px]">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="font-mono text-xs tracking-[0.26em] uppercase text-[#f4f4f3]/40 mb-4">
            IPHONE 15 PRO MAX
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-[72px] font-black tracking-tight mb-4 text-[#C6B9A6]">
            Thông Số Kỹ Thuật
          </h2>
          <p className="mt-4 text-[#f4f4f3]/60 text-[15.5px] max-w-[46ch] mx-auto">
            Khung viền Titan. Chip A17 Pro đột phá. Nút Tác vụ hoàn toàn Mới.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[1px] bg-white/10 border border-white/10 rounded-[20px] overflow-hidden backdrop-blur-md">
          {cards.map((card, idx) => (
            <Card key={card.id} card={card} delay={idx * 0.1} />
          ))}
        </div>
      </div>
    </section>
  );
}

function Card({ card, delay }) {
  const isBattery = card.type === 'battery';
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay }}
      className={`bg-[#111111]/70 hover:bg-white/5 transition-colors p-[34px_30px] flex min-h-[230px] ${isBattery ? 'flex-col sm:flex-row items-center gap-6' : 'flex-col gap-4'}`}
    >
      {isBattery && (
        <div className="relative w-[96px] h-[96px] shrink-0">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            <circle cx="50" cy="50" r="40" className="fill-none stroke-white/10 stroke-[6]" />
            <motion.circle 
              cx="50" cy="50" r="40" 
              className="fill-none stroke-[6] stroke-linecap-round"
              style={{ stroke: card.color, filter: `drop-shadow(0 0 6px ${card.color}80)` }}
              initial={{ strokeDasharray: 251.2, strokeDashoffset: 251.2 }}
              whileInView={{ strokeDashoffset: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1.6, ease: [0.16, 0.9, 0.2, 1], delay: delay + 0.2 }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-black font-mono text-[#f4f4f3]" style={{ color: card.color }}>29</span>
          </div>
        </div>
      )}

      <div className={`flex flex-col gap-4 ${isBattery ? 'flex-1' : 'h-full'}`}>
        <div className="flex items-center justify-between">
          <div className="font-mono text-[10.5px] tracking-[0.14em] uppercase text-[#f4f4f3]/40">{card.tag}</div>
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: card.color, boxShadow: `0 0 8px ${card.color}` }} />
        </div>
        
        <div className="mt-auto">
          <h3 className="text-[30px] sm:text-[34px] lg:text-[40px] font-black tracking-[-0.02em] leading-[1.05] mb-2" style={{ color: card.type !== 'build' ? card.color : '#f4f4f3' }}>
            {card.headline}
          </h3>
          <p className="text-[13.5px] text-[#f4f4f3]/60 leading-[1.5] max-w-[30ch]">
            {card.sub}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
