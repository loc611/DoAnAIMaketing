import React, { useState } from 'react';
import styles from './ProductConfigurator.module.css';

const PRODUCT_DATA = {
  id: 'iphone-16-pro',
  name: 'iPhone 16 Pro Max',
  basePrice: 29999000,
  colors: [
    { id: 'titanium-natural', name: 'Titan Tự Nhiên', hex: '#BFBDB2' },
    { id: 'titanium-blue', name: 'Titan xanh', hex: '#2F3C4D' },
    { id: 'titanium-white', name: 'Titan Trắng', hex: '#F2F1ED' },
    { id: 'titanium-black', name: 'Titan đen', hex: '#444341' }
  ],
  storages: [
    { id: '256gb', size: '256GB', extraPrice: 0 },
    { id: '512gb', size: '512GB', extraPrice: 5000000 },
    { id: '1tb', size: '1TB', extraPrice: 10000000 }
  ]
};

export default function ProductConfigurator() {
  const [selectedColor, setSelectedColor] = useState(PRODUCT_DATA.colors[0]);
  const [selectedStorage, setSelectedStorage] = useState(PRODUCT_DATA.storages[0]);

  const totalPrice = PRODUCT_DATA.basePrice + selectedStorage.extraPrice;

  // Format currency
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const handleAddToCart = () => {
    alert(`Đã thêm ${PRODUCT_DATA.name} (${selectedColor.name}, ${selectedStorage.size}) vào giờ hàng. Tổng: ${formatPrice(totalPrice)}`);
  };

  return (
    <div className={styles.configuratorContainer}>
      <div className={styles.previewSection}>
        <div className={styles.mockupContainer}>
           <div className={styles.mockupPhone} style={{ backgroundColor: selectedColor.hex }}>
              <div className={styles.cameraModule}>
                 <div className={styles.lens}></div>
                 <div className={styles.lens}></div>
                 <div className={styles.lens}></div>
              </div>
              <div className={styles.appleLogo}></div>
           </div>
        </div>
      </div>
      
      <div className={styles.optionsSection}>
        <h1 className={styles.productTitle}>Mua {PRODUCT_DATA.name}</h1>
        <p className={styles.priceTag}>{formatPrice(totalPrice)}</p>

        {/* Color Selection */}
        <div className={styles.optionGroup}>
          <h3 className={styles.groupTitle}>Màu sắc. <span>Chọn màu yêu thích của bạn.</span></h3>
          <p className={styles.selectedLabel}>Màu {selectedColor.name}</p>
          <div className={styles.colorOptions}>
            {PRODUCT_DATA.colors.map(color => (
              <button 
                key={color.id}
                className={`${styles.colorBtn} ${selectedColor.id === color.id ? styles.active : ''}`}
                style={{ backgroundColor: color.hex }}
                onClick={() => setSelectedColor(color)}
                aria-label={`Chọn màu ${color.name}`}
              />
            ))}
          </div>
        </div>

        {/* Storage Selection */}
        <div className={styles.optionGroup}>
          <h3 className={styles.groupTitle}>DUNG LƯỢNG. <span>Bạn cần bao nhiêu DUNG LƯỢNG?</span></h3>
          <div className={styles.storageOptions}>
            {PRODUCT_DATA.storages.map(storage => (
              <button 
                key={storage.id}
                className={`${styles.storageBtn} ${selectedStorage.id === storage.id ? styles.active : ''}`}
                onClick={() => setSelectedStorage(storage)}
              >
                <span className={styles.storageSize}>{storage.size}</span>
                <span className={styles.storageExtra}>
                  {storage.extraPrice > 0 ? `+ ${formatPrice(storage.extraPrice)}` : 'Cơ bản'}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className={styles.actionSection}>
          <button className={styles.buyBtn} onClick={handleAddToCart}>
            Thêm vào giờ hàng
          </button>
        </div>
      </div>
    </div>
  );
}
