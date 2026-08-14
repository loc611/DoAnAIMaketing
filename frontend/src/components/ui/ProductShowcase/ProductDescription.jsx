import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle } from '@phosphor-icons/react';

export default function ProductDescription({ description, highlights }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="w-full max-w-3xl mx-auto px-4 py-4 text-center"
    >
      {/* Đoạn văn mô tả 2-3 câu */}
      <p className="text-base sm:text-lg text-white/80 leading-relaxed max-w-2xl mx-auto font-normal mb-6">
        {description}
      </p>

      {/* 3-4 Highlight bullets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto text-left">
        {highlights?.map((highlight, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, delay: idx * 0.08 }}
            className="flex items-center gap-3 p-3.5 rounded-xl bg-[#141416] border border-[#E87B2C]/25 shadow-md hover:border-[#E87B2C]/50 transition-colors"
          >
            <CheckCircle size={20} weight="fill" className="text-[#E87B2C] shrink-0" />
            <span className="text-xs sm:text-sm font-medium text-white/90">
              {highlight}
            </span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
