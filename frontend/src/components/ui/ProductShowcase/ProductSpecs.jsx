import React from 'react';
import { motion } from 'framer-motion';
import { Cpu, HardDrive, DeviceMobile, Camera, BatteryHigh, Sparkle, Scales, Browsers } from '@phosphor-icons/react';

export default function ProductSpecs({ specs }) {
  if (!specs) return null;

  const items = [
    { label: 'Vi Xử Lý (Chip)', value: specs.chip, icon: <Cpu size={20} className="text-[#E87B2C]" /> },
    { label: 'Bộ Nhớ RAM', value: specs.ram, icon: <Sparkle size={20} className="text-[#E87B2C]" /> },
    { label: 'DUNG LƯỢNG Lưu Trữ', value: specs.storage, icon: <HardDrive size={20} className="text-[#E87B2C]" /> },
    { label: 'MÀN HÌNH', value: specs.display, icon: <DeviceMobile size={20} className="text-[#E87B2C]" /> },
    { label: 'Cụm Camera', value: specs.camera, icon: <Camera size={20} className="text-[#E87B2C]" /> },
    { label: 'DUNG LƯỢNG PIN & SẠC', value: specs.battery, icon: <BatteryHigh size={20} className="text-[#E87B2C]" /> },
    { label: 'Hệ Điều Hành', value: specs.os, icon: <Browsers size={20} className="text-[#E87B2C]" /> },
    { label: 'Trọng Lượng', value: specs.weight, icon: <Scales size={20} className="text-[#E87B2C]" /> }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="w-full max-w-4xl mx-auto px-4 py-4"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        {items.map((item, idx) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: idx * 0.05 }}
            className="flex items-center gap-4 p-4 rounded-2xl bg-[#121214] border border-[#E87B2C]/30 shadow-[0_4px_20px_rgba(0,0,0,0.4)] hover:border-[#E87B2C]/60 transition-colors group"
          >
            <div className="p-2.5 rounded-xl bg-[#E87B2C]/10 border border-[#E87B2C]/20 group-hover:scale-105 transition-transform shrink-0">
              {item.icon}
            </div>
            <div className="min-w-0 flex-1">
              <span className="block text-[11px] font-mono uppercase tracking-wider text-white/40">
                {item.label}
              </span>
              <span className="block text-sm font-semibold text-white truncate mt-0.5">
                {item.value}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
