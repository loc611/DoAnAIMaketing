const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const validate = require('../middlewares/validate.middleware');
const { 
  registerSchema, 
  loginSchema, 
  forgotPasswordSchema, 
  verifyOtpSchema, 
  resetPasswordSchema 
} = require('../validations/authValidation');

// Định tuyến API Đăng ký (Đã tích hợp Zod validation)
router.post('/register', validate(registerSchema), authController.register);

// Định tuyến API Đăng nhập (Đã tích hợp Zod validation)
router.post('/login', validate(loginSchema), authController.login);

// Định tuyến API Đăng nhập bằng Google
router.post('/google', authController.googleLogin);

// Định tuyến API Quên & Khôi phục mật khẩu OTP
router.post('/forgot-password', validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/verify-otp', validate(verifyOtpSchema), authController.verifyOtp);
router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword);

module.exports = router;
