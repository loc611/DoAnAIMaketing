# TÀI LIỆU THAM KHẢO VÀ PHỤ LỤC

---

## TÀI LIỆU THAM KHẢO

### Tiếng Việt:
1. **Bộ Thông tin và Truyền thông (2023)**, *Báo cáo Chỉ số Thương mại điện tử Việt Nam (EBI 2023)*, Nhà xuất bản Thông tin và Truyền thông, Hà Nội.
2. **Đặng Văn Đức (2019)**, *Phân tích và Thiết kế Hệ thống Hướng đối tượng với UML*, Nhà xuất bản Khoa học và Kỹ thuật, Hà Nội.
3. **Nguyễn Thanh Thủy (2021)**, *Trí tuệ nhân tạo và Ứng dụng trong Chuyển đổi số Doanh nghiệp*, Nhà xuất bản Bách Khoa Hà Nội.
4. **Hiệp hội Thương mại Điện tử Việt Nam (VECOM) (2024)**, *Báo cáo Toàn cảnh Kinh tế số và Hành vi Người tiêu dùng Thế hệ mới*, VECOM Publications.

### Tiếng Anh:
5. **Vaswani, A., Shazeer, N., Parmar, N., Uszkoreit, J., Jones, L., Gomez, A. N., Kaiser, Ł., & Polosukhin, I. (2017)**, *"Attention Is All You Need"*, Advances in Neural Information Processing Systems (NeurIPS 2017), pp. 5998–6008.
6. **Cabello, R., Dirksen, J. (2023)**, *Learn Three.js: Programming 3D animations and visual effects with JavaScript and WebGL (4th Edition)*, Packt Publishing, Birmingham, UK.
7. **Banks, A., & Porcello, E. (2022)**, *Learning React: Modern Patterns for Developing React Applications (2nd Edition)*, O'Reilly Media, Sebastopol, CA.
8. **Martin, R. C. (2018)**, *Clean Architecture: A Craftsman's Guide to Software Structure and Design*, Prentice Hall, Upper Saddle River, NJ.
9. **Kotler, P., Kartajaya, H., & Setiawan, I. (2021)**, *Marketing 5.0: Technology for Humanity*, John Wiley & Sons, Hoboken, NJ.
10. **Google Cloud AI (2024)**, *Gemini 1.5: Unlocking multimodal understanding across millions of tokens of context*, Google Research Technical Whitepaper.
11. **Prisma Documentation (2024)**, *Prisma ORM Multi-Schema and PostgreSQL Advanced Querying Architecture Guide*, Available at: `https://www.prisma.io/docs`.
12. **Stripe Developer Documentation (2024)**, *Stripe API Reference and Webhook Security Implementation*, Available at: `https://stripe.com/docs/api`.

\pagebreak

---

## PHỤ LỤC A: HƯỚNG DẪN CÀI ĐẶT VÀ TRIỂN KHAI HỆ THỐNG

### A.1. Yêu cầu Tiên quyết
- Đã cài đặt **Node.js** phiên bản v20.x trở lên (khuyến nghị v20.12.0 LTS).
- Trình quản lý gói **npm** (đi kèm Node.js) hoặc **yarn / pnpm**.
- Tài khoản cơ sở dữ liệu **PostgreSQL** trên Neon Cloud (hoặc cài đặt PostgreSQL cục bộ).
- Khóa API **Google Gemini** (lấy từ Google AI Studio: `aistudio.google.com`).
- Khóa API **Stripe** (Publishable Key và Secret Key từ Stripe Dashboard).

### A.2. Cấu hình Biến Môi trường (Environment Variables)

#### 1. Cấu hình Backend (`backend/.env`):
```ini
PORT=5000
DATABASE_URL="postgresql://username:password@ep-sample-neon.region.aws.neon.tech/neondb?sslmode=require"
JWT_SECRET="super_secret_jwt_token_key_2026_apple3d"
STRIPE_SECRET_KEY="sk_test_51Pxxxxxxxxxxxxxxxxxxxxxx"
STRIPE_WEBHOOK_SECRET="whsec_xxxxxxxxxxxxxxxxxxxxxxxxx"
CLIENT_URL="http://localhost:5173"
```

#### 2. Cấu hình Frontend (`frontend/.env`):
```ini
VITE_API_BASE_URL="http://localhost:5000"
VITE_GEMINI_API_KEY="AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
VITE_STRIPE_PUBLISHABLE_KEY="pk_test_51Pxxxxxxxxxxxxxxxxxxxxxx"
```

### A.3. Các Bước Cài đặt và Khởi chạy

```bash
# Bước 1: Di chuyển vào thư mục dự án
cd d:\BaiTapAIMaketing\AI3D

# Bước 2: Cài đặt và khởi chạy Backend
cd backend
npm install
npx prisma generate
npx prisma db push
npm run dev

# Bước 3: Mở một terminal mới, cài đặt và khởi chạy Frontend
cd ../frontend
npm install
npm run dev
```

Sau khi hoàn tất, mở trình duyệt web và truy cập vào địa chỉ: `http://localhost:5173`.

\pagebreak

---

## PHỤ LỤC B: QUY TẮC VÀ THUẬT TOÁN CHẤM ĐIỂM LEAD SCORING

```javascript
// backend/src/config/scoringRules.js
module.exports = {
  // Điểm tĩnh (Dựa trên thông tin đăng ký ban đầu)
  STATIC_POINTS: {
    PRO_MAX: 15,       // Quan tâm iPhone Pro Max hoặc MacBook Pro
    STANDARD: 10,      // Quan tâm iPhone thường, MacBook Air, iPad
    ACCESSORY: 5,      // Phụ kiện, AirPods, Apple Watch
    OTHER: 2,
    BUDGET_HIGH: 15,   // Ngân sách > 30 triệu đồng
    BUDGET_MID: 10,    // Ngân sách 10 - 30 triệu đồng
    VALID_PHONE: 10,   // Cung cấp SĐT hợp lệ >= 9 số
  },

  // Điểm động (Dựa trên hành vi vi mô trên website)
  DYNAMIC_POINTS: {
    FORM_SUBMIT: 10,   // Gửi form nhận tư vấn
    MULTI_VIEW: 10,    // Xem sản phẩm từ 2 lần trở lên
    ADD_TO_CART: 20,   // Bấm nút thêm vào giỏ hàng
    CLICK_CONTACT: 15, // Bấm nút gọi điện hoặc mở khung chat
    INACTIVE_DECAY: -5 // Không hoạt động trong 7 ngày liên tiếp
  },

  // Ngưỡng nhiệt độ Lead
  THRESHOLDS: {
    WARM: 20, // Từ 20 điểm trở lên là WARM (Ấm)
    HOT: 50   // Từ 50 điểm trở lên là HOT (Nóng - Phát tín hiệu khẩn cấp)
  }
};
```
