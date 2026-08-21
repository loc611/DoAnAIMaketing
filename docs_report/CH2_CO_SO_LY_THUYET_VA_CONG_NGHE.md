# CHƯƠNG 2: CƠ SỞ LÝ THUYẾT VÀ CÔNG NGHỆ NỀN TẢNG

---

## 2.1. Cơ sở lý thuyết về AI trong Digital Marketing & Bán hàng

### 2.1.1. Khái niệm và Vai trò của Trí tuệ Nhân tạo Tạo sinh (Generative AI)
Trong bức tranh toàn cảnh của cuộc Cách mạng Công nghiệp 4.0, Trí tuệ Nhân tạo (Artificial Intelligence - AI) đã có bước nhảy vọt lịch sử từ các hệ thống AI Phân tích (Discriminative/Analytical AI) sang Trí tuệ Nhân tạo Tạo sinh (**Generative AI**). 

Nếu như AI phân tích trước đây chỉ tập trung vào việc phân loại dữ liệu có sẵn (ví dụ: phát hiện gian lận, dự đoán tỷ lệ rời bỏ), thì Generative AI — được xây dựng trên nền tảng của các **Mô hình Ngôn ngữ Lớn (Large Language Models - LLMs)** và kiến trúc mạng nơ-ron Transformer (Vaswani et al., 2017) — sở hữu năng lực tự tạo ra nội dung văn bản, mã nguồn, hình ảnh và phân tích ngữ cảnh phức tạp với chất lượng tiệm cận con người.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│             SO SÁNH CÁC THẾ HỆ HỖ TRỢ KHÁCH HÀNG TRONG E-COMMERCE           │
├───────────────────┬──────────────────────────┬──────────────────────────────┤
│ Tiêu chí          │ Chatbot Cổ điển (Rule)   │ Generative AI (Gemini Flash) │
├───────────────────┼──────────────────────────┼──────────────────────────────┤
│ Nguyên lý xử lý   │ Khớp từ khóa (Keywords)  │ Hiểu ngữ nghĩa sâu (Semantics)│
│ Khả năng hội thoại│ Cứng nhắc theo kịch bản  │ Đa lượt, linh hoạt, tự nhiên │
│ Tư vấn kỹ thuật   │ Chỉ đọc câu mẫu có sẵn   │ Phân tích, so sánh cấu hình  │
│ Phạm vi tri thức  │ Giới hạn trong vài câu hỏi│ Vạn năng (Kiến thức mở rộng) │
│ Bán chéo (Upsell) │ Không hoặc rất gượng ép  │ Gợi ý tinh tế theo ngữ cảnh  │
└───────────────────┴──────────────────────────┴──────────────────────────────┘
```

Trong lĩnh vực tiếp thị số (Digital Marketing) và thương mại điện tử, Generative AI tạo ra một bước ngoặt mang tính đột phá:
1. **Siêu cá nhân hóa trải nghiệm khách hàng (Hyper-Personalization):** AI có khả năng phân tích câu hỏi của từng khách hàng cụ thể (ví dụ: *"Tôi là lập trình viên iOS và làm đồ họa 3D, nên chọn MacBook Pro M3 Pro 18GB hay lên bản M3 Max 36GB?"*) để đưa ra lời khuyên kỹ thuật chuyên sâu, chính xác đến từng chi tiết thay vì đưa ra các câu trả lời chung chung.
2. **Kỹ thuật Chỉ thị Hệ thống (System Instruction & Prompt Engineering):** Cho phép lập trình viên định hình trước nhân cách (Persona), tông giọng (Tone of Voice) và các quy tắc ứng xử bắt buộc cho mô hình AI. Trong đề tài này, mô hình được cấu hình nguyên tắc "2-trong-1": vừa là một Chuyên viên Tư vấn Apple chuyên nghiệp, nhiệt tình, am hiểu sâu sắc sản phẩm, vừa đóng vai trò như một Trợ lý Toàn năng sẵn sàng giải đáp mọi thắc mắc đời sống, học tập và công nghệ.

### 2.1.2. Mô hình Xử lý Ngôn ngữ Tự nhiên Đa lượt (Multi-turn Conversational AI)
Giao tiếp giữa người mua hàng và chuyên viên tư vấn là một quá trình liên tục với nhiều lượt hội thoại tương tác qua lại (Multi-turn Conversation). Để AI không bị "mất trí nhớ" sau mỗi câu hỏi, hệ thống phải duy trì cấu trúc dữ liệu lịch sử hội thoại (Conversation History) chuẩn mực.

Mỗi phiên hội thoại được biểu diễn dưới dạng danh sách các cặp thông điệp luân phiên giữa hai vai trò:
- `user`: Thông điệp do người dùng nhập vào.
- `model`: Thông điệp phản hồi do mô hình AI sinh ra.

```
                    ┌────────────────────────────────────────┐
                    │       SYSTEM INSTRUCTION (Định hình)   │
                    └───────────────────┬────────────────────┘
                                        │
                                        ▼
               ┌──────────────────────────────────────────────────┐
               │              CONVERSATION HISTORY BUFFER         │
               ├──────────────────────────────────────────────────┤
               │ [Turn 1] user:  "Tôi có 35 triệu, muốn mua Mac?" │
               │ [Turn 1] model: "Với 35 triệu, MacBook Pro M3..."│
               │ [Turn 2] user:  "Pin của nó dùng được mấy tiếng?"│
               │ [Turn 2] model: "Dòng máy này pin đạt 22 tiếng..."│
               └────────────────────────┬─────────────────────────┘
                                        │
                                        ▼
               ┌──────────────────────────────────────────────────┐
               │        GEMINI 1.5 FLASH STREAMING ENGINE         │
               │        (Tạo từng đoạn Chunk truyền về UI)        │
               └──────────────────────────────────────────────────┘
```

Đặc biệt, việc áp dụng cơ chế **Truyền phát Dòng chảy (Streaming API)** giúp dữ liệu văn bản được sinh ra đến đâu sẽ lập tức hiển thị trên giao diện người dùng đến đó (Token by Token / Chunk by Chunk). Điều này loại bỏ hoàn toàn cảm giác chờ đợi nặng nề của người dùng, mang lại trải nghiệm tương tác trực quan thời gian thực mượt mà như đang nhắn tin với con người.

### 2.1.3. Phễu chuyển đổi Marketing (AIDA) và Mô hình Chấm điểm Lead (Lead Scoring Engine)

#### 1. Mô hình Phễu Chuyển đổi AIDA
Mô hình AIDA là một trong những nền tảng lý thuyết kinh điển nhất trong Marketing, mô tả 4 giai đoạn tâm lý mà khách hàng trải qua trước khi đưa ra quyết định mua sắm:
- **Attention (Gây chú ý):** Thu hút sự chú ý của khách hàng ngay trong 3 giây đầu tiên khi truy cập trang web bằng không gian đồ họa 3D Hero trực quan, các khối hình học bay lơ lửng (Floating Geometry) và ánh sáng phát quang hiện đại.
- **Interest (Tạo sự thích thú):** Khách hàng chủ động tương tác, xoay lật mô hình 3D của thiết bị 360 độ, khám phá các tính năng và bắt đầu đặt câu hỏi cho Trợ lý ảo AI.
- **Desire (Kích thích khao khát sở hữu):** AI tư vấn sâu về lợi ích, các chương trình ưu đãi, mã giảm giá khuyến mãi (Vouchers), chính sách bảo hành chính hãng và hỗ trợ trả góp.
- **Action (Hành động chuyển đổi):** Khách hàng thêm sản phẩm vào giỏ hàng, nhập thông tin liên hệ và hoàn tất thanh toán trực tuyến qua cổng thanh toán bảo mật.

```
                     ┌───────────────────────────────────────┐
                     │          ATTENTION (Chú ý)            │  ◄── Hero 3D Canvas, Particles
                     ├───────────────────────────────────────┤
                     │          INTEREST (Thích thú)         │  ◄── Xoay mô hình 3D, Chat AI
                     ├───────────────────────────────────────┤
                     │          DESIRE (Khao khát)           │  ◄── Tư vấn sâu, Voucher ưu đãi
                     ├───────────────────────────────────────┤
                     │          ACTION (Hành động)           │  ◄── Thêm giỏ, Thanh toán Stripe
                     └───────────────────────────────────────┘
```

#### 2. Nguyên lý Động cơ Chấm điểm Khách hàng Tiềm năng (Lead Scoring)
Trong hoạt động bán hàng B2C và B2B cho các sản phẩm giá trị cao, không phải tất cả khách hàng truy cập website đều có nhu cầu mua sắm thực sự tại cùng một thời điểm. Việc phân bổ nhân viên telesale hoặc tư vấn viên tiếp cận ngẫu nhiên sẽ gây lãng phí nghiêm trọng nguồn lực.

Động cơ Chấm điểm Khách hàng Tiềm năng (CRM Lead Scoring) trong đồ án này được xây dựng trên sự kết hợp giữa **Điểm Tĩnh (Static Score)** và **Điểm Động (Dynamic Score)**:

$$\text{Total Score} = \max\Big(0,\; \text{Static Score} + \sum \text{Dynamic Score} - \text{Decay Penalty}\Big)$$

Trong đó:
- **Điểm Tĩnh (Static Scoring):** Đo lường mức độ phù hợp về mặt nhân khẩu học và phân khúc sản phẩm:
  - Quan tâm dòng máy cao cấp (iPhone Pro Max, MacBook Pro): $+15$ điểm.
  - Quan tâm dòng máy tiêu chuẩn (iPhone thường, MacBook Air, iPad): $+10$ điểm.
  - Phân khúc ngân sách cao ($> 30$ triệu VNĐ): $+15$ điểm; ngân sách trung bình ($10 - 30$ triệu VNĐ): $+10$ điểm.
  - Cung cấp số điện thoại hợp lệ ($\ge 9$ chữ số): $+10$ điểm.
- **Điểm Động (Dynamic Scoring):** Đo lường mức độ tương tác hành vi vi mô trong thời gian thực:
  - Điền biểu mẫu nhận tư vấn (Form submit): $+10$ điểm.
  - Xem chi tiết sản phẩm $\ge 2$ lần (Multi-view): $+10$ điểm.
  - Bấm nút "Thêm vào giỏ hàng" (Add to cart): $+20$ điểm.
  - Bấm nút liên hệ gọi điện / chat trực tiếp: $+15$ điểm.
- **Quy tắc Phân rã theo Thời gian (Time Inactivity Decay):** Nếu khách hàng không có bất kỳ tương tác nào trong vòng 7 ngày liên tiếp, hệ thống tự động trừ $5$ điểm để phản ánh sự suy giảm mức độ quan tâm.

Dựa trên tổng điểm, Lead được phân loại thành 3 ngưỡng nhiệt độ (Lead Temperature):
- **COLD (Lạnh):** Điểm $< 20$ điểm $\rightarrow$ Khách hàng chỉ mới lướt xem, tiếp tục nuôi dưỡng tự động bằng email marketing.
- **WARM (Ấm):** $20 \le \text{Điểm} < 50$ điểm $\rightarrow$ Khách hàng có nhu cầu thực tế, gợi ý khuyến mãi và hỗ trợ AI.
- **HOT (Nóng):** Điểm $\ge 50$ điểm $\rightarrow$ Khách hàng sẵn sàng mua hàng, hệ thống phát tín hiệu qua Socket.IO để Sales can thiệp chốt đơn ngay lập tức.

---

## 2.2. Cơ sở lý thuyết về Đồ họa 3D trên Nền tảng Web

### 2.2.1. Tổng quan về WebGL và Chu trình Đồ họa (Graphics Pipeline)
WebGL (Web Graphics Library) là một chuẩn API JavaScript cấp thấp, cho phép trình duyệt web truy xuất trực tiếp vào bộ xử lý đồ họa phần cứng (**GPU - Graphics Processing Unit**) để render hình ảnh 3D và 2D với hiệu năng cao mà không cần bất kỳ plugin bổ trợ nào.

Chu trình xử lý đồ họa (Graphics Pipeline) của WebGL diễn ra qua các công đoạn tuần tự:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      CHU TRÌNH ĐỒ HỌA WEBGL GRAPHICS PIPELINE               │
├─────────────────┬───────────────────────────────────────────────────────────┤
│ 1. Vertex Data  │ Mảng tọa độ các đỉnh (Vertices), Vector pháp tuyến       │
│                 │ (Normals), Tọa độ UV của chất liệu (Textures)             │
├─────────────────┼───────────────────────────────────────────────────────────┤
│ 2. Vertex Shader│ Chương trình tính toán vị trí đỉnh trong không gian 3D    │
│                 │ (Chuyển đổi từ Local Space sang Clip Space qua Ma trận)  │
├─────────────────┼───────────────────────────────────────────────────────────┤
│ 3. Rasterization│ Chia các tam giác 3D thành các mảnh điểm ảnh (Fragments)  │
├─────────────────┼───────────────────────────────────────────────────────────┤
│ 4. Frag Shader  │ Tính toán màu sắc, ánh sáng, bóng đổ (Shadows) cho từng   │
│                 │ pixel dựa trên nguồn sáng và thuộc tính vật liệu          │
├─────────────────┼───────────────────────────────────────────────────────────┤
│ 5. Framebuffer  │ Ghi kết quả cuối cùng lên Canvas HTML5 trên màn hình      │
└─────────────────┴───────────────────────────────────────────────────────────┘
```

Tuy nhiên, việc viết mã trực tiếp bằng WebGL thuần (Raw WebGL) đòi hỏi hàng trăm dòng lệnh toán học ma trận phức tạp và quản lý bộ nhớ thủ công rất nặng nề, không phù hợp cho việc phát triển ứng dụng web quy mô lớn.

### 2.2.2. Thư viện Three.js và Trừu tượng hóa React Three Fiber (R3F)

#### 1. Thư viện Three.js
Three.js là thư viện JavaScript mã nguồn mở phổ biến nhất thế giới để đơn giản hóa WebGL. Three.js đóng gói các thuật toán ma trận và WebGL API thành các đối tượng trừu tượng cấp cao:
- **Scene (Không gian sân khấu):** Nơi chứa toàn bộ các đối tượng 3D, camera và hệ thống đèn chiếu sáng.
- **Camera (Máy quay):** Thiết lập góc nhìn của người dùng (thường sử dụng `PerspectiveCamera` để mô phỏng mắt người với trường nhìn Field of View - FOV).
- **Mesh (Lưới vật thể):** Sự kết hợp giữa Hình học (`Geometry` - hình dáng khối đa diện) và Vật liệu (`Material` - màu sắc, độ phản chiếu kim loại, độ nhám bề mặt).
- **Light (Hệ thống chiếu sáng):** Bao gồm `AmbientLight` (ánh sáng môi trường), `DirectionalLight` (ánh sáng mặt trời định hướng tạo bóng đổ), `PointLight` (ánh sáng điểm tỏa ra xung quanh).
- **Renderer:** Bộ phận thực thi lệnh vẽ toàn bộ Scene qua góc nhìn của Camera lên thẻ `<canvas>`.

#### 2. Trừu tượng hóa React Three Fiber (R3F) & Drei
React Three Fiber (`@react-three/fiber`) là một bộ kết xuất (Renderer) khai báo (Declarative) dành riêng cho React. Thay vì phải khởi tạo và hủy các đối tượng Three.js thủ công trong các hàm vòng đời (Life-cycle methods), R3F cho phép biểu diễn các đối tượng 3D dưới dạng các thành phần React JSX tự nhiên:

```jsx
// Ví dụ cú pháp khai báo trong React Three Fiber
<Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
  <ambientLight intensity={0.8} />
  <directionalLight position={[10, 10, 5]} intensity={1.5} />
  <mesh rotation={[0, Math.PI / 4, 0]}>
    <boxGeometry args={[1, 1, 1]} />
    <meshStandardMaterial color="#0071e3" metalness={0.8} roughness={0.2} />
  </mesh>
  <OrbitControls enableZoom={false} />
</Canvas>
```

Thư viện bổ trợ `@react-three/drei` cung cấp sẵn các thành phần tiện ích cao cấp như `OrbitControls` (điều khiển xoay lật tự do bằng chuột), `Float` (tạo hiệu ứng lơ lửng nhịp nhàng), `MeshDistortMaterial` (vật liệu biến dạng gợn sóng) và các công cụ tối ưu tải trước tài nguyên 3D.

### 2.2.3. Tối ưu hóa hiệu năng render 3D (FPS & Memory Management)
Để duy trì tốc độ khung hình lý tưởng ở mức **60 FPS** và tránh hiện tượng giật lag (frame drop) trên các thiết bị cấu hình tầm trung, hệ thống áp dụng các kỹ thuật tối ưu hóa chuyên sâu:
1. **Giảm số lượng lệnh vẽ (Draw Calls Reduction):** Sử dụng các hình học cơ bản tối ưu số lượng đa giác (Poly-count), tái sử dụng chung vật liệu (Shared Materials) giữa các đối tượng.
2. **Quản lý Vòng lặp Render (Render Loop Throttling):** Tắt tính năng tự động vẽ liên tục khi người dùng không tương tác hoặc khi tab trình duyệt chuyển sang trạng thái ẩn (Inactive Tab).
3. **Giải phóng Bộ nhớ GPU (Resource Disposal):** Khi component React bị unmount, toàn bộ Geometry, Material và Texture đều được gọi hàm `.dispose()` để ngăn chặn rò rỉ bộ nhớ đồ họa (Memory Leak).

---

## 2.3. Tổng quan Hệ sinh thái Công nghệ Xây dựng Dự án

Hệ thống được thiết kế và xây dựng theo mô hình Full-stack hiện đại với sự phối hợp chặt chẽ giữa các công nghệ tiên tiến nhất:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    HỆ SINH THÁI CÔNG NGHỆ TOÀN DIỆN (FULL-STACK)            │
├─────────────────┬───────────────────────────────────────────────────────────┤
│ Tầng Giao diện  │ • React 18, Vite Bundler, Tailwind CSS, Lucide React      │
│ (Frontend)      │ • Three.js, React Three Fiber, React Three Drei           │
│                 │ • Context API (AuthContext, CartContext, SocketContext)   │
├─────────────────┼───────────────────────────────────────────────────────────┤
│ Tầng Máy chủ    │ • Node.js (v20+), Express Framework (v5)                  │
│ (Backend API)   │ • Socket.IO (Real-time Full Duplex Events)                │
│                 │ • Middleware: JWT Verify, RBAC Authorize, CORS, Multer    │
├─────────────────┼───────────────────────────────────────────────────────────┤
│ Tầng Cơ sở      │ • PostgreSQL Serverless trên nền tảng Neon Cloud          │
│ Dữ liệu         │ • Prisma ORM (v7) hỗ trợ Kiến trúc Multi-Schema           │
│                 │   (Schemas: admin, sales, inventory, customer)            │
├─────────────────┼───────────────────────────────────────────────────────────┤
│ Trí tuệ Nhân tạo│ • Google Generative AI SDK (@google/generative-ai)        │
│ & Dịch vụ Ngoài │ • Model: gemini-1.5-flash (Streaming Chat Engine)         │
│                 │ • Stripe Payment Gateway (Checkout & Webhooks)            │
│                 │ • Nodemailer (Dịch vụ gửi thông báo qua Email SMTP)       │
└─────────────────┴───────────────────────────────────────────────────────────┘
```

### 2.3.1. Phía Frontend
- **React 18:** Thư viện xây dựng giao diện người dùng dựa trên thành phần (Component-based), hỗ trợ cơ chế Concurrent Rendering giúp tối ưu hóa việc cập nhật cây DOM.
- **Vite:** Công cụ đóng gói (Bundler) thế hệ mới sử dụng Native ES Modules, mang lại tốc độ khởi động máy chủ phát triển (Dev Server) tức thì và cơ chế Hot Module Replacement (HMR) tính bằng mili-giây.
- **Tailwind CSS:** Framework CSS tiện ích (Utility-first CSS) cho phép xây dựng giao diện cao cấp, áp dụng hiệu ứng kính mờ (Glassmorphism), bảng màu HSL hài hòa và hệ thống lưới đáp ứng (Responsive Grid) linh hoạt.
- **Lucide Icons:** Bộ biểu tượng vector hiện đại, tối giản và đồng bộ chuẩn thiết kế của Apple.

### 2.3.2. Phía Backend
- **Node.js & Express 5:** Môi trường thực thi JavaScript phi đồng bộ (Non-blocking I/O Event Loop) kết hợp framework web Express 5 mang lại khả năng xử lý hàng ngàn yêu cầu đồng thời với mức tiêu thụ tài nguyên tối thiểu.
- **Socket.IO:** Thiết lập kênh liên lạc hai chiều thời gian thực (Full-duplex WebSockets) giữa máy chủ và các client, phục vụ việc truyền tín hiệu Lead nóng tức thì và cập nhật trạng thái đơn hàng.
- **Bảo mật & Xác thực:** Sử dụng JSON Web Token (JWT) có mã hóa thuật toán HS256 để xác thực phiên làm việc, kết hợp băm mật khẩu bằng thuật toán Bcrypt với hệ số muối (Salt Rounds = 10).

### 2.3.3. Tầng Dữ liệu: PostgreSQL Neon Cloud & Prisma Multi-Schema
- **PostgreSQL Neon Serverless:** Hệ quản trị CSDL quan hệ chuẩn SQL hàng đầu thế giới với kiến trúc Serverless, hỗ trợ khả năng mở rộng lưu trữ tự động và độ tin cậy giao dịch ACID tuyệt đối.
- **Kiến trúc Multi-Schema trong Prisma:** Điểm đặc sắc trong thiết kế của đồ án là việc phân tách cơ sở dữ liệu vật lý thành 4 Không gian Lược đồ (Schemas) chuyên biệt:
  - `admin`: Lưu trữ thông tin người dùng, vai trò, nhật ký hệ thống và mã giảm giá.
  - `sales`: Quản lý giỏ hàng, đơn hàng chi tiết và lịch sử giao dịch thanh toán.
  - `inventory`: Quản lý danh mục, sản phẩm, các biến thể dung lượng/màu sắc và biến động tồn kho.
  - `customer`: Quản lý khách hàng tiềm năng (Leads), lịch sử hành vi (Lead Activities), đánh giá và danh sách yêu thích.
- **Prisma ORM (Object-Relational Mapping):** Cung cấp Type-Safety hoàn hảo, tự động sinh mã truy vấn SQL tối ưu và quản lý di chuyển lược đồ (Migrations) an toàn.

### 2.3.4. Dịch vụ AI và Cổng Thanh toán Ngoài
- **Google Gemini 1.5 Flash SDK:** Mô hình ngôn ngữ lớn tốc độ cao của Google, có độ trễ cực thấp (Sub-second Latency), hỗ trợ cửa sổ ngữ cảnh lớn (Context Window lên tới 1 triệu tokens) và chi phí vận hành tối ưu, rất phù hợp cho ứng dụng trợ lý bán hàng thời gian thực.
- **Stripe API:** Nền tảng xử lý thanh toán trực tuyến tiêu chuẩn quốc tế, hỗ trợ thẻ Visa/MasterCard, mã hóa thông tin thẻ chuẩn PCI-DSS Level 1, tự động đồng bộ kết quả thanh toán về máy chủ backend thông qua chữ ký bảo mật Stripe Webhooks.

---

## 2.4. Kết luận Chương 2
Chương 2 đã cung cấp bức tranh toàn diện và sâu sắc về mặt cơ sở lý thuyết, từ các nguyên lý tiếp thị số hiện đại (Mô hình AIDA, Generative AI đa lượt, Động cơ chấm điểm Lead) cho đến nền tảng toán học đồ họa không gian ba chiều (WebGL, Three.js, React Three Fiber) cùng hệ sinh thái công nghệ Fullstack đồng bộ. Đây chính là nền tảng vững chắc để nhóm tiến hành phân tích chi tiết và thiết kế kiến trúc hệ thống trong Chương 3.
