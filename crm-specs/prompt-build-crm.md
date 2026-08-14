# Prompt build CRM — Antigravity + Gemini Flash 3.6

Copy toàn bộ nội dung dưới đây vào Antigravity để bắt đầu build.

---

## PROMPT

Bạn là một senior full-stack engineer. Hãy giúp tôi build một trang **CRM (Customer Relationship Management)** cho đồ án môn học, kết nối với landing page bán sản phẩm Apple mà tôi đã có sẵn. Đây là dự án cá nhân/học thuật, không phải production thương mại.

### 1. Tech stack bắt buộc
- Frontend: Next.js 14+ (App Router), TypeScript, TailwindCSS
- Backend: Node.js (API routes trong Next.js, không cần server riêng)
- Database: PostgreSQL (dùng Prisma ORM)
- Auth: NextAuth.js (Credentials provider, email + password), session dùng JWT
- UI component: có thể dùng shadcn/ui để tăng tốc độ, giữ style tối giản, hiện đại (không dùng gradient/shadow màu mè)

### 2. Hệ thống Auth & RBAC (3 role)
Tạo bảng `User` với field `role` enum: `SUPER_ADMIN | SALES | VIEWER`

Phân quyền:
| Chức năng | Super Admin | Sales | Viewer |
|---|---|---|---|
| Xem Executive Dashboard | ✓ | ✗ | ✗ |
| Xem Dashboard vận hành (leads, follow-up) | ✓ | ✓ | ✓ (read-only) |
| Thêm/sửa/xoá lead | ✓ | ✓ | ✗ |
| Quản lý user, gán role | ✓ | ✗ | ✗ |
| Xem báo cáo, export | ✓ | ✓ | ✓ |

Yêu cầu bắt buộc: **RBAC phải được enforce ở cả middleware (route-level) VÀ trong từng API handler** (không chỉ ẩn UI bằng CSS/conditional render — đây là lỗi bảo mật phổ biến cần tránh trong đồ án).

### 3. Database schema (Prisma)

```prisma
model User {
  id        String   @id @default(cuid())
  name      String
  email     String   @unique
  password  String
  role      Role     @default(SALES)
  createdAt DateTime @default(now())
  leads     Lead[]   @relation("AssignedLeads")
}

enum Role {
  SUPER_ADMIN
  SALES
  VIEWER
}

model Lead {
  id              String   @id @default(cuid())
  name            String
  email           String
  phone           String?
  productInterest String   // iPhone, MacBook, iPad, AirPods, Accessory
  budgetRange     String?  // "<10tr", "10-30tr", ">30tr"
  source          String   // landing_page, form, ads, referral
  score           Int      @default(0)
  temperature     Temperature @default(COLD)
  status          LeadStatus  @default(NEW)
  assignedToId    String?
  assignedTo      User?    @relation("AssignedLeads", fields: [assignedToId], references: [id])
  activities      LeadActivity[]
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

enum Temperature {
  HOT
  WARM
  COLD
}

enum LeadStatus {
  NEW
  CONTACTED
  QUALIFIED
  WON
  LOST
}

model LeadActivity {
  id          String   @id @default(cuid())
  leadId      String
  lead        Lead     @relation(fields: [leadId], references: [id])
  activityType String  // form_submit, view_product, add_to_cart, click_call, click_chat, inactive_decay
  scoreDelta  Int
  metadata    Json?
  createdAt   DateTime @default(now())
}
```

### 4. Hệ thống chấm điểm lead tự động (Lead Scoring Engine)

Viết một function `calculateLeadScore(leadId: string)` chạy mỗi khi có `LeadActivity` mới được insert (dùng trigger trong code, gọi ngay sau khi ghi activity — không cần cron/queue phức tạp cho đồ án).

**Điểm tĩnh (tính lúc tạo lead, dựa trên field của Lead):**
- `productInterest` = iPhone Pro Max / MacBook Pro → +25
- `productInterest` = iPhone / iPad thường → +15
- `productInterest` = phụ kiện (AirPods, case...) → +5
- `budgetRange` = ">30tr" → +20
- Có `phone` hợp lệ → +10

**Điểm động (cộng dồn từ bảng LeadActivity):**
- `form_submit` → +20
- `view_product` (lặp lại >2 lần) → +10
- `add_to_cart` → +15
- `click_call` hoặc `click_chat` → +25
- Không có activity nào > 7 ngày → -10 (tính bằng cron job đơn giản hoặc tính lazy khi load trang)

**Tổng điểm → phân loại nhiệt độ:**
```
score >= 70        → HOT
40 <= score < 70    → WARM
score < 40          → COLD
```

Sau khi tính, update `Lead.score` và `Lead.temperature` trong cùng transaction.

### 5. Các trang cần build

**a) `/login`** — form đăng nhập, redirect theo role sau khi login thành công.

**b) `/dashboard`** (Sales + Super Admin + Viewer, nội dung theo quyền)
- 4 stat cards: Tổng leads, Leads mới 7 ngày, Tỷ lệ chuyển đổi, Deals thắng
- Chart leads theo thời gian (line chart, dùng recharts)
- Chart leads theo nguồn (bar/donut)
- Bảng "Cần follow-up hôm nay" (leads HOT chưa contact trong 24h)

**c) `/dashboard/executive`** (chỉ Super Admin — chặn cứng ở middleware, redirect 403 nếu role khác)
- Stat cards: Doanh thu ước tính, Tỷ lệ chuyển đổi tổng, Số lead HOT hiện tại, CAC trung bình
- Chart doanh thu theo tuần/tháng (area chart)
- Phân bổ HOT/WARM/COLD (progress bar hoặc donut, kèm % và số lượng)
- Funnel chuyển đổi: New → Contacted → Qualified → Won (funnel chart hoặc horizontal bar giảm dần)
- Bảng Top sản phẩm được quan tâm nhiều nhất

**d) `/leads`** (Sales, Super Admin: full quyền / Viewer: read-only)
- Bảng danh sách lead: cột Tên, Email, Nguồn, Điểm số, Nhiệt độ (badge màu: HOT=đỏ, WARM=vàng, COLD=xanh dương), Trạng thái, Người phụ trách
- Filter theo: nguồn, trạng thái, nhiệt độ, người phụ trách
- Search theo tên/email
- Toggle 2 view: Table view và Kanban view (kéo-thả theo LeadStatus)
- Nút "Thêm lead" mở slide-over panel (không chuyển trang)
- Bulk action: chọn nhiều lead để gán người phụ trách hàng loạt

**e) `/leads/[id]`** — chi tiết 1 lead
- Thông tin liên hệ, điểm số hiện tại + breakdown điểm (từ đâu ra bao nhiêu điểm)
- Timeline hoạt động (LeadActivity) theo thời gian
- Ghi chú, đổi trạng thái, đổi người phụ trách

**f) `/settings/users`** (chỉ Super Admin)
- Danh sách user, mời user mới (tạo tài khoản + gửi role), sửa role, khoá tài khoản
- Hiển thị bảng ma trận quyền (permission matrix) như mục 2 ở trên

### 6. Kết nối với landing page hiện có
Landing page bán Apple products cần gửi event về CRM khi có tương tác, tạo 1 API endpoint:

```
POST /api/leads/track
Body: {
  email: string,
  name?: string,
  phone?: string,
  productInterest: string,
  activityType: "form_submit" | "view_product" | "add_to_cart" | "click_call" | "click_chat",
  metadata?: object
}
```

Logic: nếu email đã tồn tại → tạo `LeadActivity` mới cho lead đó và gọi lại `calculateLeadScore`. Nếu chưa tồn tại → tạo `Lead` mới với điểm tĩnh ban đầu, rồi tính điểm.

### 7. Yêu cầu về UI/UX
- Thiết kế phẳng (flat), tối giản, không dùng gradient sặc sỡ, không shadow nặng — giống phong cách SaaS hiện đại (Linear, HubSpot)
- Màu badge nhiệt độ lead: HOT = đỏ, WARM = vàng/cam, COLD = xanh dương — dùng nhất quán toàn bộ app
- Responsive tối thiểu ở mức desktop + tablet (không bắt buộc mobile-first vì đây là công cụ nội bộ)
- Sidebar cố định bên trái: Dashboard, Executive Dashboard (chỉ hiện với Super Admin), Leads, Settings (chỉ hiện với Super Admin)

### 8. Thứ tự triển khai (làm theo từng bước, xác nhận từng bước trước khi qua bước tiếp theo)
1. Setup Next.js + Prisma + PostgreSQL, tạo schema, chạy migration
2. Setup NextAuth với Credentials provider, tạo middleware RBAC
3. Seed dữ liệu mẫu: 3 user (1 super_admin, 1 sales, 1 viewer), 30-50 lead mẫu với activity ngẫu nhiên
4. Build Lead Scoring Engine (function tính điểm + phân loại nhiệt độ), viết unit test đơn giản để verify logic đúng
5. Build trang `/leads` (table view trước, kanban view sau)
6. Build trang `/dashboard` (Sales/Viewer)
7. Build trang `/dashboard/executive` (Super Admin)
8. Build `/leads/[id]` chi tiết
9. Build `/settings/users` quản lý user
10. Build API `/api/leads/track` để nối với landing page, viết hướng dẫn cách gọi từ landing page hiện có

Sau mỗi bước, hãy tóm tắt ngắn gọn đã làm gì, và hỏi tôi có muốn điều chỉnh gì trước khi tiếp tục không.
