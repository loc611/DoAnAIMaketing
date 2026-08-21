const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticateToken, optionalAuthenticateToken, checkRole } = require('../middlewares/authMiddleware');

// Lấy danh sách đơn hàng (Tất cả vai trò đều vào được, filter logic nằm trong controller)
router.get('/', authenticateToken, orderController.getOrders);

// Tạo phiên thanh toán Stripe
router.post('/create-checkout-session', optionalAuthenticateToken, orderController.createCheckoutSession);

// Tạo đơn hàng (Bất kỳ user nào đã đăng nhập đều có thể mua, Khách vãng lai cũng được)
router.post('/', optionalAuthenticateToken, orderController.createOrder);

// Hủy đơn hàng (Chỉ customer hủy đơn của họ, hoặc sales_staff/admin hủy)
router.post('/:orderId/cancel', authenticateToken, checkRole(['customer', 'sales_staff', 'sales', 'SALES', 'admin', 'SUPER_ADMIN', 'manager', 'MANAGER']), orderController.cancelOrder);

// Cập nhật trạng thái đơn hàng (Admin, Manager, Sales, Warehouse)
router.put('/:orderId/status', authenticateToken, checkRole(['admin', 'SUPER_ADMIN', 'manager', 'MANAGER', 'sales_staff', 'sales', 'SALES', 'warehouse_staff']), orderController.updateOrderStatus);

// Chuyển sang COD (Customer)
router.put('/:orderId/switch-to-cod', authenticateToken, checkRole(['customer', 'sales_staff', 'admin']), orderController.switchToCOD);

// Webhook VNPAY (Không cần authenticateToken vì VNPAY gọi vào)
router.get('/vnpay-ipn', orderController.vnpayWebhook);

module.exports = router;
