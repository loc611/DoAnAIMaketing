import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ScrollHint({ sceneIndex }) {
  const hints = [
    'Cuộn để khám phá',
    'Cuộn tiếp để xem thông số',
    'Cuộn để chuyển sản phẩm tiếp theo'
  ];

  return (
    <div className="flex flex-col items-center justify-center gap-2 text-center select-none pointer-events-none">
      <AnimatePresence mode="wait">
        <motion.p
          key={sceneIndex}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="text-xs sm:text-sm font-medium tracking-wide text-white/40"
        >
          {hints[sceneIndex] || hints[0]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
