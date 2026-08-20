const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { authenticateToken, checkRole } = require('../middlewares/authMiddleware');

// Lấy danh sách tất cả người dùng (Chỉ admin, manager)
router.get('/', authenticateToken, checkRole(['admin', 'manager', 'SUPER_ADMIN']), profileController.getAllUsers);

// Cập nhật thông tin profile
router.put('/profile', authenticateToken, profileController.updateProfile);

module.exports = router;
