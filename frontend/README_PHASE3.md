.# Hướng Dẫn Cài Đặt & Sử Dụng (Phase 3)

Dự án này là hệ thống Frontend cho website bán hàng mô phỏng Apple Store kết hợp CRM Dashboard quản trị.

## 1. Cấu Trúc Thư Mục Mới (Phase 3)

Trong Phase 3 này, các component sau đã được thêm vào:

- `src/components/ui/ProductConfigurator.jsx`: Component cấu hình sản phẩm (Màu sắc, Dung lượng) cho khách hàng (B2C) mua iPhone/MacBook.
- `src/components/ui/ProductConfigurator.module.css`: Styles chuẩn Apple cho Configurator.
- `src/components/ui/CRMDashboard.jsx`: Giao diện Admin/CRM Dashboard với biểu đồ doanh thu và danh sách đơn hàng.
- `src/components/ui/CRMDashboard.module.css`: Styles tĩnh gọn nhẹ và độc lập cho CRM.

## 2. Hướng Dẫn Kiểm Thử (Testing Instructions)

Do đây là React component thuần, bạn có thể dễ dàng test bằng cách import vào `AppRoutes.jsx` hoặc bất kỳ Page nào:

### Test Product Configurator
```jsx
// Import vào trang sản phẩm (Ví dụ: IPhone16ProMaxLanding.jsx)
import ProductConfigurator from '../components/ui/ProductConfigurator';

// Đặt vào render:
<ProductConfigurator />
```
- **Hành vi mong đợi**: Màn hình hiện cấu hình iPhone 16 Pro Max. Khi bạn bấm vào các nút màu (Titan xanh, Titan đen...), hình màu của điện thoại bên trái sẽ thay đổi tương ứng. Khi chọn dung lượng (512GB, 1TB), giá tiền trên cùng bên trái sẽ cộng dồn theo thời gian thực.
- **Test giỏ hàng**: Bấm nút "Thêm vào giỏ hàng", sẽ hiện Alert tóm tắt đúng màu, dung lượng và giá tiền đã chọn.

### Test CRM Dashboard
```jsx
// Import vào route admin (/admin)
import CRMDashboard from '../components/ui/CRMDashboard';

// Đặt vào render:
<CRMDashboard />
```
- **Hành vi mong đợi**: Màn hình toàn trang hiển thị Sidebar (AppleCRM). Hiển thị số liệu doanh thu 750,000,000đ. Biểu đồ cột tự động tính toán chiều cao dựa trên Sales Data lớn nhất. Các thẻ trạng thái đơn hàng có màu khác nhau tùy thuộc (Delivered = Xanh, Processing = Vàng).

## 3. Kiến Trúc Backend Khuyến Nghị (Next Steps)
Nếu bạn quyết định tích hợp Backend, tôi đề xuất:
1. Tạo 1 dự án MedusaJS riêng biệt chạy ở port 9000.
2. Dùng Axios/React Query trong React gọi tới các endpoints của Medusa để nạp data thật (thay cho mock data ở `PRODUCT_DATA` và `SALES_DATA`).

---
*Developed as part of the Apple E-commerce System - Phase 3.*
