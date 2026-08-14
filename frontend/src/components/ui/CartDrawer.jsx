import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../../contexts/CartContext';
import { useNavigate } from 'react-router-dom';

export default function CartDrawer() {
  const { cart, isCartOpen, closeCart, removeFromCart, updateQuantity, totalPrice } = useCart();
  const navigate = useNavigate();

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const handleCheckout = () => {
    closeCart();
    navigate('/checkout');
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-[#1c1c1e] border-l border-white/10 z-[100] flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="text-xl font-semibold text-white">Giỏ hàng của bạn</h2>
              <button 
                onClick={closeCart}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-[#86868b]">
                  <div className="text-4xl mb-4">🛒</div>
                  <p>Giỏ hàng đang trống.</p>
                </div>
              ) : (
                cart.map((item, index) => (
                  <div key={`${item.id}-${index}`} className="flex gap-4">
                    <div className="w-24 h-24 bg-white/5 rounded-xl p-2 flex items-center justify-center">
                      <img src={item.image || 'https://store.storeimages.cdn-apple.com/8756/as-images.apple.com/is/iphone-15-pro-finish-select-202309-6-1inch-bluetitanium?wid=5120&hei=2880&fmt=p-jpg&qlt=80&.v=1692846360609'} alt={item.name} className="object-contain w-full h-full" />
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-white font-medium">{item.name}</h3>
                        <p className="text-sm text-[#86868b]">
                          {[item.color, item.storage].filter(Boolean).join(' | ')}
                        </p>
                        <p className="text-white font-semibold mt-1">{formatPrice(item.price)}</p>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-3 bg-white/10 rounded-full px-3 py-1">
                          <button onClick={() => updateQuantity(index, -1)} className="text-white hover:text-orange-500 transition-colors">-</button>
                          <span className="text-sm w-4 text-center text-white">{item.quantity}</span>
                          <button onClick={() => updateQuantity(index, 1)} className="text-white hover:text-orange-500 transition-colors">+</button>
                        </div>
                        <button 
                          onClick={() => removeFromCart(index)}
                          className="text-xs text-red-400 hover:text-red-300 underline"
                        >
                          Xóa
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {cart.length > 0 && (
              <div className="p-6 border-t border-white/10 bg-black/20">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[#86868b]">Tổng cộng:</span>
                  <span className="text-2xl font-bold text-white">{formatPrice(totalPrice)}</span>
                </div>
                <button 
                  onClick={handleCheckout}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-full font-semibold transition-colors"
                >
                  Mua ngay
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
