const express = require('express');
const router = express.Router();
const userController = require('./user.controller');

const { authenticateToken, checkRole } = require('../../middlewares/authMiddleware');

// Lấy danh sách tất cả người dùng (Chỉ admin, manager)
router.get('/', authenticateToken, checkRole(['admin', 'manager']), userController.getAllUsers);

// Cập nhật thông tin profile
router.put('/profile', authenticateToken, userController.updateProfile);

module.exports = router;
