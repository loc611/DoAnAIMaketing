require('dotenv').config();
const express = require('express');
const path = require('path');

const cors = require('cors');
const errorHandler = require('./middlewares/errorHandler');

// Kiểm tra biến môi trường JWT_SECRET
if (!process.env.JWT_SECRET) {
  console.warn('WARNING: JWT_SECRET is not defined in environment variables. Using default development secret.');
  process.env.JWT_SECRET = 'temporary_jwt_secret_dev_fallback_key';
}

const app = express();
// Socket.io has been removed for Vercel Serverless compatibility.
// req.io is no longer injected.

const PORT = process.env.PORT || 5000;

const authRoutes = require('./routes/authRoutes');
const orderRoutes = require('./routes/orderRoutes');
const userRoutes = require('./routes/userRoutes');
const chatRoutes = require('./routes/chatRoutes');
const cartRoutes = require('./routes/cartRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const crmRoutes = require('./routes/crmRoutes');
const webhookRoutes = require('./routes/webhookRoutes');

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Phục vụ các file tĩnh trong thư mục uploads
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/v1/crm', crmRoutes);
app.use('/api/leads', crmRoutes); // Alias for prompt-build-crm specification compatibility
app.use('/api/webhook', webhookRoutes);

app.get('/', (req, res) => {
  res.send('Apple Store & CRM API đang hoạt động!');
});

// Basic API route
app.get('/api/specs', (req, res) => {
  res.json({
    name: 'iPhone 17 PRO',
    color: 'Copper/Orange',
    chip: 'A19 Pro',
    cameras: ['48MP Main', '48MP Ultrawide', '48MP Telephoto']
  });
});

// Global Error Handler Middleware (Phải đặt ở CUỐI CÙNG sau tất cả routes)
app.use(errorHandler);

// Khởi động server nếu chạy trực tiếp (ví dụ: trên Render)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server đang chạy trên port ${PORT}`);
  });
}

// Export app cho Vercel Serverless Functions
module.exports = app;

