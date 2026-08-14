import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useAuthAction } from '../../hooks/useAuthAction';

export default function ProductModal({ isOpen, onClose, product }) {
  const navigate = useNavigate();
  const requireAuth = useAuthAction();
  const { addToCart, openCart } = useCart();

  const getHexForString = (colorStr) => {
    if (colorStr.includes('Tự Nhiên')) return '#b5b4b1';
    if (colorStr.includes('Xanh')) return '#3b434a';
    if (colorStr.includes('Trắng') || colorStr.includes('Bạc')) return '#f2f1ec';
    if (colorStr.includes('Đen') || colorStr.includes('Không Gian')) return '#454341';
    if (colorStr.includes('Tím')) return '#4c3c53';
    if (colorStr.includes('Vàng') || colorStr.includes('Sa Mạc')) return '#d4c2a5';
    return '#b5b4b1'; 
  };

  const rawColors = product?.colors || ['Titan Tự Nhiên', 'Titan Xanh', 'Titan Trắng', 'Titan Đen'];
  const colorsList = rawColors.map(c => typeof c === 'string' ? { name: c, hex: getHexForString(c) } : c);

  const rawStorages = product?.storages || ['256GB', '512GB', '1TB'];
  const storagesList = rawStorages.map(s => typeof s === 'string' ? { label: s, priceMod: 0 } : s);

  const [selectedColor, setSelectedColor] = useState(colorsList[0]?.name || 'Titan Tự Nhiên');
  const [selectedStorage, setSelectedStorage] = useState(storagesList[0]?.label || '256GB');
  const [quantity, setQuantity] = useState(1);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (isOpen && product) {
      setSelectedColor(colorsList[0]?.name || 'Titan Tự Nhiên');
      setSelectedStorage(storagesList[0]?.label || '256GB');
      setQuantity(1);
    }
  }, [isOpen, product?.id]);

  const currentStorage = storagesList.find(s => s.label === selectedStorage) || storagesList[0];
  const priceMod = currentStorage?.priceMod || 0;
  const currentPrice = (product?.price || 0) + priceMod;

  const currentColorObj = colorsList.find(c => c.name === selectedColor);
  const currentImage = currentColorObj?.image || product?.image || '/images/iphone17.jpg';

  if (!isOpen || !product) return null;

  const productName = product.title || product.name || 'Sản phẩm Pig Store';

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: productName,
      price: currentPrice,
      image: currentImage,
      color: selectedColor,
      storage: selectedStorage,
      quantity
    });
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
      onClose();
    }, 1500);
  };

  const handleBuyNow = () => {
    addToCart({
      id: product.id,
      name: productName,
      price: currentPrice,
      image: currentImage,
      color: selectedColor,
      storage: selectedStorage,
      quantity
    });
    requireAuth(() => {
      onClose();
      openCart();
    });
  };

  const handleLearnMore = () => {
    onClose();
    const route = product.id?.includes('mac') 
      ? '/mac' 
      : product.id?.includes('ipad') 
      ? '/ipad' 
      : '/iphone';
    navigate(route);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl bg-[#12121a]/95 backdrop-blur-2xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row"
          >
            {/* Close Button */}
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-black/50 text-white hover:bg-white/20 transition-colors z-10"
            >
              ✕
            </button>

            {/* Product Image Container */}
            <div className="w-full md:w-1/2 p-8 bg-black/40 flex items-center justify-center relative">
              <motion.img 
                key={currentImage}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
                src={currentImage} 
                alt={`${productName} - ${selectedColor}`} 
                onClick={handleLearnMore}
                className="w-full h-auto object-contain max-h-[300px] drop-shadow-2xl cursor-pointer"
              />
            </div>

            {/* Product Details */}
            <div className="w-full md:w-1/2 p-8 flex flex-col justify-center">
              <h2 className="text-2xl font-extrabold text-white mb-2">{productName}</h2>
              <p className="text-white/60 text-sm mb-4 line-clamp-2">{product.description || 'Sức mạnh Pro. Đột phá mới.'}</p>
              <div className="text-2xl font-extrabold text-[#e87b46] mb-6">
                {formatPrice(currentPrice * quantity)}
              </div>

              {/* Color Selection */}
              <div className="mb-6">
                <p className="text-sm text-white mb-3 font-medium">Màu sắc: <span className="text-white/60 font-normal">{selectedColor}</span></p>
                <div className="flex gap-3">
                  {colorsList.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(color.name)}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        selectedColor === color.name ? 'border-[#d15a20] scale-110' : 'border-transparent hover:border-white/30'
                      }`}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              {/* Storage Selection */}
              <div className="mb-6">
                <p className="text-sm text-white mb-3 font-medium">Dung lượng:</p>
                <div className="flex gap-2 flex-wrap">
                  {storagesList.map((storage) => (
                    <button
                      key={storage.label}
                      onClick={() => setSelectedStorage(storage.label)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${
                        selectedStorage === storage.label 
                          ? 'border-[#d15a20] text-[#e87b46] bg-[#d15a20]/10' 
                          : 'border-white/20 text-white/60 hover:border-white/50 hover:text-white'
                      }`}
                    >
                      {storage.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div className="mb-8 flex items-center gap-4">
                <p className="text-sm text-white font-medium">Số lượng:</p>
                <div className="flex items-center gap-4 bg-white/5 rounded-full px-4 py-2 border border-white/10">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="text-white/60 hover:text-white transition-colors text-lg"
                  >-</button>
                  <span className="text-white w-4 text-center">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="text-white/60 hover:text-white transition-colors text-lg"
                  >+</button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-2.5 mt-auto">

                <button 
                  onClick={handleAddToCart}
                  className="flex-1 py-3 px-3 rounded-full border border-[#d15a20] text-[#e87b46] font-semibold hover:bg-[#d15a20]/10 transition-colors text-center text-xs whitespace-nowrap"
                >
                  Thêm vào giỏ
                </button>
                <button 
                  onClick={handleBuyNow}
                  className="flex-1 py-3 px-3 rounded-full bg-white text-black font-semibold hover:bg-[#f0f0f3] transition-colors text-center text-xs shadow-lg whitespace-nowrap"
                >
                  Mua ngay
                </button>
              </div>
            </div>

            {/* Toast Notification */}
            <AnimatePresence>
              {showToast && (
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 50 }}
                  className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-6 py-3 rounded-full text-sm font-semibold shadow-xl backdrop-blur-md whitespace-nowrap z-20"
                >
                  ✓ Đã thêm vào giỏ hàng
                </motion.div>
              )}
            </AnimatePresence>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
