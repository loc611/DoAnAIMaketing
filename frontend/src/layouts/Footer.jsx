import React from 'react';
import { Link } from 'react-router-dom';

const productsLinks = [
  { label: 'Cửa hàng', to: '/' },
  { label: 'Mac', to: '/mac' },
  { label: 'iPhone', to: '/iphone' },
  { label: 'iPad', to: '/ipad' },
];

const accountLinks = [
  { label: 'Quản lý Đơn hàng', to: '/orders' },
  { label: 'Đăng ký Tư vấn', to: '/pre-order' },
  { label: 'Tài khoản & Đăng nhập', to: '/auth' },
];

const policyLinks = [
  'Chính sách Quyền riêng tư',
  'Điều khoản Sử dụng',
  'Bán hàng và Hoàn tiền',
  'Pháp lý',
  'Sơ đồ trang web',
];

const Footer = () => {
  return (
    <footer className="border-t border-white/10 bg-black px-6 py-12 text-xs text-[#86868b]">
      <div className="mx-auto flex max-w-[980px] flex-col gap-8">
        
        {/* 4-Column Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 border-b border-white/10 pb-10">
          
          {/* Col 1: Sản phẩm */}
          <div className="flex flex-col gap-3">
            <h4 className="text-white font-semibold text-[13px] tracking-tight">Sản phẩm & Khám phá</h4>
            <ul className="flex flex-col gap-2.5">
              {productsLinks.map((item) => (
                <li key={item.to}>
                  <Link 
                    to={item.to} 
                    className="text-[#86868b] hover:text-white transition-colors duration-200"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 2: Tài khoản & Dịch vụ */}
          <div className="flex flex-col gap-3">
            <h4 className="text-white font-semibold text-[13px] tracking-tight">Tài khoản & Dịch vụ</h4>
            <ul className="flex flex-col gap-2.5">
              {accountLinks.map((item) => (
                <li key={item.to}>
                  <Link 
                    to={item.to} 
                    className="text-[#86868b] hover:text-white transition-colors duration-200"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Chính sách */}
          <div className="flex flex-col gap-3">
            <h4 className="text-white font-semibold text-[13px] tracking-tight">Chính sách & Pháp lý</h4>
            <ul className="flex flex-col gap-2.5">
              {policyLinks.map((link) => (
                <li key={link}>
                  <a 
                    href="#" 
                    className="text-[#86868b] hover:text-white transition-colors duration-200"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Liên hệ */}
          <div className="flex flex-col gap-3">
            <h4 className="text-white font-semibold text-[13px] tracking-tight">Thông tin liên hệ</h4>
            <div className="flex flex-col gap-2 leading-relaxed text-[#86868b]">
              <p>Hotline tổng đài:<br />
                <a href="tel:18001192" className="text-blue-400 font-medium hover:underline">1800 1192</a> (Miễn phí)
              </p>
              <p>Email hỗ trợ:<br />
                <a href="mailto:support@apple.com" className="text-blue-400 font-medium hover:underline">support@apple.com</a>
              </p>
              <p>Giờ phục vụ:<br />
                <span className="text-[#a1a1a6]">8:00 – 22:00 (T2 - CN)</span>
              </p>
            </div>
          </div>

        </div>

        {/* Copyright */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 text-[11px] text-[#6e6e73]">
          <p>Bản quyền © 2026 Apple Inc. Bảo lưu mọi quyền.</p>
          <p>Website được thiết kế demo — Pig Store Project.</p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
