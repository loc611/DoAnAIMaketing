const { z } = require('zod');

const registerSchema = z.object({
  body: z.object({
    fullName: z.string({
      required_error: 'Họ tên là bắt buộc',
      invalid_type_error: 'Họ tên là bắt buộc',
    }).min(2, 'Họ tên phải có ít nhất 2 ký tự'),
    identifier: z.string({
      required_error: 'Email hoặc Số điện thoại là bắt buộc',
      invalid_type_error: 'Email hoặc Số điện thoại là bắt buộc',
    }).min(1, 'Vui lòng nhập Email hoặc Số điện thoại'),
    password: z.string({
      required_error: 'Mật khẩu là bắt buộc',
      invalid_type_error: 'Mật khẩu là bắt buộc',
    }).min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  }),
});

const loginSchema = z.object({
  body: z.object({
    identifier: z.string({
      required_error: 'Email hoặc Số điện thoại là bắt buộc',
      invalid_type_error: 'Email hoặc Số điện thoại là bắt buộc',
    }).min(1, 'Vui lòng nhập Email hoặc Số điện thoại'),
    password: z.string({
      required_error: 'Mật khẩu là bắt buộc',
      invalid_type_error: 'Mật khẩu là bắt buộc',
    }).min(1, 'Vui lòng nhập mật khẩu'),
  }),
});

const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string({
      required_error: 'Email là bắt buộc',
      invalid_type_error: 'Email không hợp lệ',
    }).email('Địa chỉ email không đúng định dạng'),
  }),
});

const verifyOtpSchema = z.object({
  body: z.object({
    email: z.string({
      required_error: 'Email là bắt buộc',
    }).email('Địa chỉ email không đúng định dạng'),
    otp: z.string({
      required_error: 'Mã OTP là bắt buộc',
    }).length(6, 'Mã OTP phải gồm 6 chữ số'),
  }),
});

const resetPasswordSchema = z.object({
  body: z.object({
    email: z.string({
      required_error: 'Email là bắt buộc',
    }).email('Địa chỉ email không đúng định dạng'),
    otp: z.string({
      required_error: 'Mã OTP là bắt buộc',
    }).length(6, 'Mã OTP phải gồm 6 chữ số'),
    newPassword: z.string({
      required_error: 'Mật khẩu mới là bắt buộc',
    }).min(6, 'Mật khẩu mới phải có ít nhất 6 ký tự'),
  }),
});

module.exports = {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  verifyOtpSchema,
  resetPasswordSchema,
};
