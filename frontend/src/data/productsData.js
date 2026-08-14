/**
 * productsData.js
 * Data-driven product catalog for ProductShowcase component
 */
export const PRODUCTS_DATA = [
  {
    id: 'iphone-16-pro-max',
    name: 'iPhone 16 Pro Max',
    edition: 'TITANIUM BLACK',
    watermarkText: '16 PRO',
    heroImage: '/images/iphone16_pro_max_titanium_black.png',
    price: '29.999.000đ',
    originalPrice: '34.999.000đ',
    description: 'Tuyệt tác khung Titan Đen Vũ Trụ hàng không cấp độ 5. Sức mạnh vi xử lý A19 Pro 3nm mang lại khả năng xử lý đồ họa Ray Tracing phần cứng và trải nghiệm Apple Intelligence vượt trội.',
    highlights: [
      'Chipset A19 Pro (3nm) siêu phân luồng',
      'Cụm Camera 48MP Fusion & Tele 5x Prism',
      'Màn hình Super Retina XDR 6.9" ProMotion 120Hz',
      'Thời lượng pin siêu bền bỉ lên đến 33 giờ'
    ],
    specs: {
      chip: 'Apple A19 Pro (3nm)',
      ram: '8GB LPDDR5X',
      storage: '256GB / 512GB / 1TB',
      display: '6.9" OLED Super Retina XDR (120Hz)',
      camera: '48MP Main | 48MP UltraWide | 12MP Tele 5x',
      battery: '4.685 mAh · Sạc nhanh 45W',
      os: 'iOS 18 (Apple Intelligence)',
      weight: '227 grams'
    }
  },
  {
    id: 'iphone-15-pro-max',
    name: 'iPhone 15 Pro Max',
    edition: 'NATURAL TITANIUM',
    watermarkText: '15 PRO',
    heroImage: '/images/iphone16_pro.png',
    price: '24.999.000đ',
    originalPrice: '28.999.000đ',
    description: 'Thiết kế Titanium Tự Nhiên siêu nhẹ và cực kỳ bền bỉ. Trang bị chip A17 Pro chơi game đỉnh cao level Console, nút Action Button thông minh cùng chuẩn kết nối USB-C siêu tốc.',
    highlights: [
      'Chipset A17 Pro (3nm) đồ họa đẳng cấp Console',
      'Cổng sạc USB-C hỗ trợ truyền dữ liệu 10Gbps',
      'Nút Action Button tùy chỉnh đa năng',
      'Khung viền Titanium chuẩn hàng không vũ trụ'
    ],
    specs: {
      chip: 'Apple A17 Pro (3nm)',
      ram: '8GB LPDDR5',
      storage: '256GB / 512GB / 1TB',
      display: '6.7" OLED Super Retina XDR (120Hz)',
      camera: '48MP Main | 12MP UltraWide | 12MP Tele 5x',
      battery: '4.422 mAh · Sạc nhanh 25W',
      os: 'iOS 17',
      weight: '221 grams'
    }
  },
  {
    id: 'iphone-14-pro-max',
    name: 'iPhone 14 Pro Max',
    edition: 'DEEP PURPLE',
    watermarkText: '14 PRO',
    heroImage: '/images/iphone_hero_light.png',
    price: '21.999.000đ',
    originalPrice: '25.999.000đ',
    description: 'Đột phá với giao diện Dynamic Island tương tác thông minh trực quan. Màn hình Always-On Display sống động kết hợp camera cảm biến 48MP bắt trọn khoảnh khắc độ phân giải cao.',
    highlights: [
      'Giao diện Dynamic Island biến đổi đột phá',
      'Màn hình Always-On Display tần số quét 120Hz',
      'Cảm biến camera chính 48MP Quad-Pixel',
      'Tính năng an toàn phát hiện va chạm tự động'
    ],
    specs: {
      chip: 'Apple A16 Bionic (4nm)',
      ram: '6GB LPDDR5',
      storage: '128GB / 256GB / 512GB / 1TB',
      display: '6.7" OLED Super Retina XDR (120Hz)',
      camera: '48MP Main | 12MP UltraWide | 12MP Tele 3x',
      battery: '4.323 mAh · Sạc nhanh 20W',
      os: 'iOS 16',
      weight: '240 grams'
    }
  }
];
