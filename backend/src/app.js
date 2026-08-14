require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const errorHandler = require('./middlewares/errorHandler');

// Fail-fast: Kiểm tra các biến môi trường thiết yếu trước khi chạy server
if (!process.env.JWT_SECRET) {
  console.error('FATAL ERROR: JWT_SECRET is not defined in .env');
  process.exit(1); // Dừng ứng dụng ngay lập tức
}

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // Trong môi trường production, hãy thay bằng URL của frontend
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

// Gắn io vào req để các controller có thể sử dụng
app.use((req, res, next) => {
  req.io = io;
  next();
});

const PORT = process.env.PORT || 5000;

const authRoutes = require('./modules/auth/auth.routes');
const orderRoutes = require('./modules/order/order.routes');
const userRoutes = require('./modules/user/user.routes');
const chatRoutes = require('./modules/chat/chat.routes');
const cartRoutes = require('./modules/cart/cart.routes');
const crmRoutes = require('./routes/crmRoutes');
const webhookRoutes = require('./routes/webhookRoutes');

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/cart', cartRoutes);
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

// Socket.io connection logic
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
