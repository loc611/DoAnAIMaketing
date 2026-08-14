const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');
const validate = require('../../middlewares/validate.middleware');
const { registerSchema, loginSchema } = require('./auth.validation');

// Định tuyến API Đăng ký (Đã tích hợp Zod validation)
router.post('/register', validate(registerSchema), authController.register);

// Định tuyến API Đăng nhập (Đã tích hợp Zod validation)
router.post('/login', validate(loginSchema), authController.login);

// Định tuyến API Đăng nhập bằng Google
router.post('/google', authController.googleLogin);

module.exports = router;
