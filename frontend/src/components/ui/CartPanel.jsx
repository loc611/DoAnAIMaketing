import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CartPanel({ isOpen, onClose }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
          />
          
          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 z-[70] w-full max-w-md bg-[#1c1c1e] shadow-2xl flex flex-col border-l border-white/10"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <h2 className="text-2xl font-bold text-white">Giỏ hàng</h2>
              <button 
                onClick={onClose}
                className="text-white/50 hover:text-white transition-colors"
              >
                Đóng ✕
              </button>
            </div>

            {/* Empty State (Since no real cart logic yet) */}
            <div className="flex-1 p-6 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 mb-6 rounded-full bg-white/5 flex items-center justify-center text-4xl">
                🛍️
              </div>
              <h3 className="text-xl font-medium text-white mb-2">Giỏ hàng trống</h3>
              <p className="text-[#86868b]">Bạn chưa có sản phẩm nào trong giỏ hàng. Hãy khám phá thêm các sản phẩm tuyệt vời của Apple.</p>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-white/5 bg-black/20">
              <div className="flex justify-between mb-4">
                <span className="text-white font-medium">Tổng cộng</span>
                <span className="text-white font-bold">0₫</span>
              </div>
              <button 
                disabled
                className="w-full py-4 rounded-full bg-blue-500/50 text-white/50 font-medium cursor-not-allowed"
              >
                Thanh toán
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
