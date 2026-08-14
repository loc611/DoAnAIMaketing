import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from './Button';

export default function WishlistPanel({ isOpen, onClose }) {
  // Temporary mock data for wishlist
  const wishlistItems = [
    { id: 1, name: 'iPhone 17 Pro Max', price: '34.999.000₫', color: 'Titan Tự Nhiên', img: '/images/iphone17.jpg' },
    { id: 2, name: 'MacBook Pro 14"', price: '39.999.000₫', color: 'Đen không gian', img: '/images/macbook_hero.jpg' }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90]"
          />
          
          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
            className="fixed top-0 right-0 h-full w-full sm:w-[400px] bg-[#1c1c1e] z-[100] border-l border-white/10 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="text-2xl font-bold text-white">Yêu thích</h2>
              <button 
                onClick={onClose}
                className="text-[#86868b] hover:text-white transition-colors"
              >
                Đóng ✕
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
              {wishlistItems.length === 0 ? (
                <div className="text-center text-[#86868b] mt-10">
                  <span className="text-4xl mb-4 block">❤️</span>
                  <p>Danh sách yêu thích của bạn đang trống.</p>
                </div>
              ) : (
                wishlistItems.map(item => (
                  <div key={item.id} className="flex gap-4 items-center bg-[#2c2c2e] p-4 rounded-2xl border border-white/5 relative">
                    <button className="absolute top-3 right-3 text-[#86868b] hover:text-red-500 transition-colors">
                      ✕
                    </button>
                    <img src={item.img} alt={item.name} className="w-20 h-20 object-contain" />
                    <div>
                      <h3 className="text-white font-semibold">{item.name}</h3>
                      <p className="text-sm text-[#86868b] mb-1">{item.color}</p>
                      <p className="text-sm font-medium text-white">{item.price}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {wishlistItems.length > 0 && (
              <div className="p-6 border-t border-white/10 bg-[#1c1c1e]">
                <Button variant="primary" className="w-full py-4 text-base">Thêm tất cả vào giờ hàng</Button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
