# CHƯƠNG 4: HIỆN THỰC HÓA VÀ THỬ NGHIỆM HỆ THỐNG

---

## 4.1. Môi trường Triển khai và Cấu hình Hệ thống

Hệ thống được phát triển và kiểm thử trên môi trường tiêu chuẩn với cấu hình phần cứng và phần mềm như sau:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    MÔI TRƯỜNG PHÁT TRIỂN VÀ TRIỂN KHAI                      │
├─────────────────┬───────────────────────────────────────────────────────────┤
│ Phần cứng       │ • CPU: Apple M-Series / Intel Core i7 12th Gen            │
│ (Development)   │ • RAM: 16GB - 32GB DDR4/DDR5                              │
│                 │ • GPU: Card đồ họa tích hợp hoặc rời hỗ trợ WebGL 2.0     │
├─────────────────┼───────────────────────────────────────────────────────────┤
│ Nền tảng Máy chủ│ • Node.js Runtime: v20.x LTS / v22.x                      │
│ & Cơ sở dữ liệu │ • PostgreSQL Serverless trên Neon Cloud Platform          │
│                 │ • Prisma ORM v7.9.1 với tính năng `multiSchema`           │
├─────────────────┼───────────────────────────────────────────────────────────┤
│ Frontend Stack  │ • React 18.3, Vite 5.x, Tailwind CSS 3.4                  │
│                 │ • Three.js 0.160+, @react-three/fiber, @react-three/drei  │
│                 │ • Lucide-React, Framer Motion                             │
├─────────────────┼───────────────────────────────────────────────────────────┤
│ API & SDK Bên 3 │ • Google Generative AI SDK (@google/generative-ai 0.24+)  │
│                 │ • Stripe Node.js SDK (v22.x) & Stripe.js                  │
│                 │ • Socket.IO v4.8 (Client & Server)                        │
└─────────────────┴───────────────────────────────────────────────────────────┘
```

---

## 4.2. Hiện thực hóa Phân hệ Giao diện & Đồ họa 3D Tương tác

### 4.2.1. Xây dựng Canvas 3D Hero với Particle Field và Floating Geometry
Để mang lại trải nghiệm thị giác ấn tượng (Visual WOW Effect) ngay khi người dùng truy cập trang chủ, hệ thống xây dựng thành phần `<Hero3DCanvas />` kết hợp hiệu ứng trường hạt không gian `<ParticleField />` và các khối hình học trôi dạt `<FloatingGeometry />`:

```jsx
// frontend/src/components/3d/Hero3DCanvas.jsx
import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Float, OrbitControls } from '@react-three/drei';
import ParticleField from '../three/ParticleField';
import FloatingGeometry from '../three/FloatingGeometry';
import GlowOrbs from '../three/GlowOrbs';

export default function Hero3DCanvas() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={1.2} color="#60a5fa" />
        <pointLight position={[-10, -10, -5]} intensity={0.8} color="#a855f7" />

        <Suspense fallback={null}>
          {/* Trường hạt ngôi sao công nghệ lấp lánh */}
          <ParticleField count={300} />
          
          {/* Quả cầu năng lượng phát sáng */}
          <GlowOrbs />

          {/* Các khối hình học kim loại trôi nổi tương tác */}
          <Float speed={2} rotationIntensity={1.5} floatIntensity={2}>
            <FloatingGeometry position={[-3, 1, 0]} type="octahedron" color="#3b82f6" />
            <FloatingGeometry position={[3.5, -1.2, -1]} type="torus" color="#8b5cf6" />
            <FloatingGeometry position={[0, 2.5, -2]} type="icosahedron" color="#06b6d4" />
          </Float>
        </Suspense>
      </Canvas>
    </div>
  );
}
```

### 4.2.2. Trình diễn Mô hình 3D Thiết bị Tương tác (MacModel & iPhone Viewers)
Tại trang chi tiết sản phẩm và các danh mục Mac / iPhone / iPad, người dùng có thể dùng chuột xoay 360 độ, điều chỉnh góc nhìn để kiểm tra từng chi tiết kim loại, viền màn hình và bàn phím:

```jsx
// frontend/src/components/three/MacModel.jsx
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, Html } from '@react-three/drei';

export default function MacModel({ color = '#7c7e80', openProgress = 1, ...props }) {
  const groupRef = useRef();

  // Hoạt ảnh xoay nhẹ tự nhiên khi ở trạng thái nghỉ
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(t / 4) * 0.15;
    }
  });

  return (
    <group ref={groupRef} {...props} dispose={null}>
      {/* Khung thân dưới (Base Chassis) */}
      <mesh position={[0, -0.05, 0]}>
        <boxGeometry args={[3.2, 0.1, 2.2]} />
        <meshStandardMaterial color={color} metalness={0.85} roughness={0.15} />
      </mesh>

      {/* Bàn phím & Trackpad */}
      <mesh position={[0, 0.01, -0.2]}>
        <boxGeometry args={[2.8, 0.02, 1.2]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.6} />
      </mesh>

      {/* Màn hình hiển thị góc mở */}
      <group position={[0, 0, -1.1]} rotation={[openProgress * 1.8, 0, 0]}>
        <mesh position={[0, 1.1, 0]}>
          <boxGeometry args={[3.2, 2.2, 0.06]} />
          <meshStandardMaterial color={color} metalness={0.85} roughness={0.15} />
        </mesh>
        {/* Mặt gương kính hiển thị */}
        <mesh position={[0, 1.1, 0.035]}>
          <planeGeometry args={[3.0, 2.0]} />
          <meshBasicMaterial color="#000000" />
        </mesh>
      </group>
    </group>
  );
}
```

---

## 4.3. Hiện thực hóa Phân hệ Trợ lý Ảo AI Bán hàng (Google Gemini 1.5 Flash)

### 4.3.1. Thiết kế System Instruction và Quản lý Lịch sử Đa lượt
Để AI có đầy đủ năng lực tư vấn chuyên môn sâu về Apple mà không bị hạn chế tri thức đời sống, hệ thống xây dựng mô hình `gemini-1.5-flash` với cấu hình chỉ thị hệ thống chuyên biệt:

```javascript
// frontend/src/services/geminiService.js
import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY || 'dummy_key');

const systemInstruction = `
Bạn là Trợ lý AI Toàn năng, hoạt động theo 2 nguyên tắc chính:
1. Trợ lý Bán hàng Apple: Nếu người dùng hỏi về các sản phẩm Apple (iPhone, iPad, Mac, AirPods, Apple Watch, phụ kiện), hãy đóng vai chuyên viên tư vấn nhiệt tình. Tư vấn cấu hình, so sánh các dòng máy, gợi ý mua kèm phụ kiện (Cross-selling) và giải đáp chính sách bán hàng.
2. Trợ lý vạn năng (ChatGPT): Nếu người dùng hỏi các kiến thức ngoài lề (lập trình, giải toán, dịch thuật, mẹo đời sống...), HÃY trả lời bình thường, chính xác và linh hoạt như ChatGPT. Không bao giờ từ chối trả lời vì lý do "nằm ngoài phạm vi bán hàng".

Tông giọng: Lịch sự, thông minh, rõ ràng. Trình bày có gạch đầu dòng/bảng biểu khi cần thiết để người dùng dễ đọc.
`;

const model = genAI.getGenerativeModel({
  model: 'gemini-1.5-flash',
  systemInstruction: systemInstruction,
});
```

### 4.3.2. Cơ chế Chuẩn hóa Lịch sử và Truyền phát Dòng chảy (Streaming API)
Gemini yêu cầu lịch sử hội thoại phải bắt đầu bằng vai trò `user` và luân phiên đều đặn. Hàm `initializeChat` thực hiện chuẩn hóa dữ liệu trước khi mở phiên chat, kết hợp hàm `sendMessageStream` để truyền văn bản tức thì về giao diện:

```javascript
export const initializeChat = (history = []) => {
  let formattedHistory = history
    .filter(msg => !msg.isError && msg.text && msg.text.trim().length > 0)
    .map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }],
    }));

  // Đảm bảo tin nhắn mở đầu luôn là của user
  while (formattedHistory.length > 0 && formattedHistory[0].role === 'model') {
    formattedHistory.shift();
  }

  return model.startChat({
    history: formattedHistory,
    generationConfig: {
      maxOutputTokens: 2000,
      temperature: 0.7,
    },
  });
};

export const sendMessageStream = async (chatSession, message, onChunk, onError) => {
  try {
    if (!API_KEY) throw new Error('MISSING_API_KEY');

    const result = await chatSession.sendMessageStream(message);
    let fullText = '';
    
    // Đọc từng mảnh text và gửi về UI tức thời
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      fullText += chunkText;
      onChunk(fullText);
    }
    return fullText;
  } catch (error) {
    console.error('Lỗi Gemini Streaming:', error);
    if (onError) onError('Hệ thống AI đang bận hoặc quá tải. Vui lòng thử lại sau.');
  }
};
```

---

## 4.4. Hiện thực hóa Động cơ Chấm điểm Khách hàng Tiềm năng (CRM Lead Scoring)

### 4.4.1. Thuật toán Tính điểm Tĩnh, Điểm Động và Phân rã theo Thời gian
Động cơ `crmScoring.js` tại máy chủ backend chịu trách nhiệm tính toán tổng hợp và cập nhật trạng thái nhiệt độ của Lead trong một giao dịch cơ sở dữ liệu:

```javascript
// backend/src/services/crmScoring.js
const prisma = require('../config/prisma');
const rules = require('../config/scoringRules');

async function calculateLeadScore(leadId) {
  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
    include: { activities: true }
  });

  if (!lead) return null;

  // 1. TÍNH ĐIỂM TĨNH (Static Points)
  let staticScore = 0;
  const product = (lead.productInterest || '').toLowerCase();
  
  if (product.includes('pro max') || product.includes('macbook pro')) {
    staticScore += rules.STATIC_POINTS.PRO_MAX; // +15 điểm
  } else if (product.includes('iphone') || product.includes('macbook') || product.includes('ipad')) {
    staticScore += rules.STATIC_POINTS.STANDARD; // +10 điểm
  }

  if (lead.budgetRange === '>30tr') {
    staticScore += rules.STATIC_POINTS.BUDGET_HIGH; // +15 điểm
  } else if (lead.budgetRange === '10-30tr') {
    staticScore += rules.STATIC_POINTS.BUDGET_MID; // +10 điểm
  }

  if (lead.phone && lead.phone.trim().length >= 9) {
    staticScore += rules.STATIC_POINTS.VALID_PHONE; // +10 điểm
  }

  // 2. TÍNH ĐIỂM ĐỘNG (Dynamic Points)
  let dynamicScore = 0;
  const activities = lead.activities || [];
  let viewProductCount = 0;

  activities.forEach(act => {
    switch (act.activityType) {
      case 'form_submit':
        dynamicScore += rules.DYNAMIC_POINTS.FORM_SUBMIT; // +10
        break;
      case 'view_product':
        viewProductCount++;
        break;
      case 'add_to_cart':
        dynamicScore += rules.DYNAMIC_POINTS.ADD_TO_CART; // +20
        break;
      case 'click_call':
      case 'click_chat':
        dynamicScore += rules.DYNAMIC_POINTS.CLICK_CONTACT; // +15
        break;
      default:
        dynamicScore += act.scoreDelta || 0;
    }
  });

  if (viewProductCount >= 2) {
    dynamicScore += rules.DYNAMIC_POINTS.MULTI_VIEW; // +10
  }

  // 3. XỬ LÝ PHÂN RÃ KHI KHÔNG HOẠT ĐỘNG (7-Day Inactivity Decay)
  if (activities.length > 0) {
    const lastActivity = activities.reduce((latest, current) => {
      return new Date(current.createdAt) > new Date(latest.createdAt) ? current : latest;
    }, activities[0]);

    const daysInactive = (new Date() - new Date(lastActivity.createdAt)) / (1000 * 60 * 60 * 24);
    if (daysInactive > 7) {
      dynamicScore += rules.DYNAMIC_POINTS.INACTIVE_DECAY; // -5
    }
  }

  const totalScore = Math.max(0, staticScore + dynamicScore);

  // 4. PHÂN LOẠI NHIỆT ĐỘ LEAD (Cold, Warm, Hot)
  let temperature = 'COLD';
  if (totalScore >= rules.THRESHOLDS.HOT) {
    temperature = 'HOT';
  } else if (totalScore >= rules.THRESHOLDS.WARM) {
    temperature = 'WARM';
  }

  // 5. CẬP NHẬT TRẠNG THÁI VÀO POSTGRESQL
  const updatedLead = await prisma.lead.update({
    where: { id: leadId },
    data: {
      score: totalScore,
      temperature: temperature
    }
  });

  return updatedLead;
}

module.exports = { calculateLeadScore };
```

---

## 4.5. Hiện thực hóa Giỏ hàng, Khuyến mãi và Thanh toán Stripe

### 4.5.1. Xác thực Mã Khuyến mãi (Voucher Engine)
Khi khách hàng nhập mã khuyến mãi tại trang thanh toán, backend kiểm tra thời hạn, số lượt sử dụng tối đa và giá trị đơn hàng tối thiểu:

```javascript
// backend/src/controllers/promotionController.js
exports.applyPromotion = async (req, res) => {
  const { code, orderAmount } = req.body;
  const promo = await prisma.promotion.findUnique({ where: { code: code.toUpperCase() } });

  if (!promo || !promo.isActive) {
    return res.status(400).json({ error: 'Mã khuyến mãi không tồn tại hoặc đã bị vô hiệu hóa' });
  }

  const now = new Date();
  if ((promo.validFrom && now < promo.validFrom) || (promo.validUntil && now > promo.validUntil)) {
    return res.status(400).json({ error: 'Mã khuyến mãi đã hết hạn sử dụng' });
  }

  if (promo.usageLimit && promo.usedCount >= promo.usageLimit) {
    return res.status(400).json({ error: 'Mã khuyến mãi đã hết lượt sử dụng' });
  }

  if (orderAmount < promo.minOrderValue) {
    return res.status(400).json({ error: `Đơn hàng tối thiểu phải từ ${promo.minOrderValue.toLocaleString()}đ` });
  }

  let discount = 0;
  if (promo.discountType === 'PERCENTAGE') {
    discount = (orderAmount * promo.discountValue) / 100;
    if (promo.maxDiscount && discount > promo.maxDiscount) {
      discount = promo.maxDiscount;
    }
  } else {
    discount = promo.discountValue;
  }

  return res.json({
    code: promo.code,
    discountAmount: discount,
    finalAmount: Math.max(0, orderAmount - discount)
  });
};
```

### 4.5.2. Đồng bộ Thanh toán Bảo mật qua Stripe Webhooks
Khi người dùng thanh toán qua Stripe, Stripe gửi sự kiện `payment_intent.succeeded` về máy chủ. Backend xác minh chữ ký mã hóa và tự động cập nhật trạng thái đơn hàng:

```javascript
// backend/src/controllers/webhookController.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const prisma = require('../config/prisma');

exports.handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook Signature Verification Failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    const orderId = paymentIntent.metadata.orderId;

    // Cập nhật trạng thái đơn hàng sang PAID và CONFIRMED trong Database
    await prisma.$transaction([
      prisma.order.update({
        where: { id: orderId },
        data: { paymentStatus: 'PAID', status: 'CONFIRMED' }
      }),
      prisma.payment.create({
        data: {
          orderId: orderId,
          paymentMethod: 'STRIPE',
          transactionId: paymentIntent.id,
          amount: paymentIntent.amount,
          status: 'SUCCESS',
          paymentPayload: paymentIntent
        }
      })
    ]);
  }

  res.json({ received: true });
};
```

---

## 4.6. Hiện thực hóa Bảng điều khiển Quản trị CRM (CRM Dashboard)

Trang `CrmDashboard.jsx` cung cấp cái nhìn toàn diện cho đội ngũ lãnh đạo và nhân viên kinh doanh với các chỉ số then chốt:
- **Thống kê Doanh thu và Đơn hàng:** Tổng doanh thu thực tế, số lượng đơn hàng mới, tỷ lệ đơn hàng thanh toán thành công.
- **Phễu Khách hàng Tiềm năng (Lead Funnel):** Biểu đồ cột phân loại số lượng Lead theo 3 mức nhiệt độ Cold - Warm - Hot.
- **Timeline Lịch sử Tương tác:** Cho phép Sales xem chi tiết từng cú click chuột, sản phẩm khách đã xem và lịch sử chat để tư vấn đúng trọng tâm.
- **Cảnh báo Real-time:** Nhận tín hiệu Socket.IO tức thì khi có Lead mới chuyển trạng thái sang HOT để tiếp cận trong vòng 5 phút vàng.

---

## 4.7. Minh họa Kịch bản Kiểm thử Chức năng (Test Cases)

Hệ thống đã trải qua các ca kiểm thử nghiêm ngặt để đảm bảo tính ổn định:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     BẢNG TỔNG HỢP CÁC CA KIỂM THỬ HỆ THỐNG                  │
├─────────┬──────────────────────┬────────────────────────────┬───────────────┤
│ Mã Test │ Tên chức năng        │ Kịch bản thực hiện         │ Kết quả       │
├─────────┼──────────────────────┼────────────────────────────┼───────────────┤
│ TC-01   │ Render Canvas 3D     │ Mở trang chủ & Shop, xoay  │ ĐẠT (58 FPS,  │
│         │                      │ mô hình 360 độ bằng chuột  │ không lag)    │
├─────────┼──────────────────────┼────────────────────────────┼───────────────┤
│ TC-02   │ Chat Gemini Stream   │ Hỏi so sánh Mac M3 vs M2,  │ ĐẠT (Chữ chảy │
│         │                      │ kiểm tra streaming chunk   │ mượt, <1s)    │
├─────────┼──────────────────────┼────────────────────────────┼───────────────┤
│ TC-03   │ Lead Scoring Engine  │ Điền form Mac Pro + Add to │ ĐẠT (Tính đúng│
│         │                      │ cart, kiểm tra điểm & temp │ 55đ -> HOT)   │
├─────────┼──────────────────────┼────────────────────────────┼───────────────┤
│ TC-04   │ Socket.IO Hot Alert  │ Khách đạt HOT, kiểm tra    │ ĐẠT (Phát chuông│
│         │                      │ âm thanh & pop-up tại CRM  │ & popup tức thì)│
├─────────┼──────────────────────┼────────────────────────────┼───────────────┤
│ TC-05   │ Áp dụng Voucher      │ Nhập mã giảm giá và kiểm   │ ĐẠT (Trừ đúng │
│         │                      │ tra chiết khấu tiền hàng   │ số tiền giảm) │
├─────────┼──────────────────────┼────────────────────────────┼───────────────┤
│ TC-06   │ Thanh toán Stripe    │ Nhập thẻ Test Visa 4242... │ ĐẠT (Đơn đổi  │
│         │ và Webhook Sync      │ kiểm tra đổi trạng thái ĐH │ sang PAID)    │
└─────────┴──────────────────────┴────────────────────────────┴───────────────┘
```

---

## 4.8. Kết luận Chương 4
Chương 4 đã minh chứng toàn diện quá trình hiện thực hóa các thành phần cốt lõi của đề tài từ giao diện 3D tương tác, cơ chế trò chuyện AI Streaming thời gian thực, thuật toán tự động chấm điểm khách hàng tiềm năng đến cổng thanh toán bảo mật Stripe và hệ thống quản trị CRM chuyên sâu. Mọi module đều hoạt động đồng bộ và đạt các tiêu chuẩn kiểm thử kỹ thuật đề ra.
