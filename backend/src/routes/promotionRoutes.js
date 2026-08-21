const express = require('express');
const router = express.Router();
const promotionController = require('../controllers/promotionController');
const { authenticateToken, checkRole } = require('../middlewares/authMiddleware');

// --- Public Endpoints (Khách hàng xem mã khả dụng & kiểm tra mã tại Checkout) ---
router.get('/available', promotionController.getAvailablePromotions);
router.post('/validate', promotionController.validatePromotion);

// --- CRM Admin Endpoints (Quản trị viên quản lý mã khuyến mãi) ---
router.get(
  '/crm',
  authenticateToken,
  checkRole(['SUPER_ADMIN', 'admin', 'MANAGER', 'manager']),
  promotionController.getAllPromotions
);

router.post(
  '/crm',
  authenticateToken,
  checkRole(['SUPER_ADMIN', 'admin', 'MANAGER', 'manager']),
  promotionController.createPromotion
);

router.put(
  '/crm/:id',
  authenticateToken,
  checkRole(['SUPER_ADMIN', 'admin', 'MANAGER', 'manager']),
  promotionController.updatePromotion
);

router.delete(
  '/crm/:id',
  authenticateToken,
  checkRole(['SUPER_ADMIN', 'admin', 'MANAGER', 'manager']),
  promotionController.deletePromotion
);

module.exports = router;
