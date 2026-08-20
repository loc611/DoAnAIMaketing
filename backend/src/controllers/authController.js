const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Đăng ký User mới
 */
const register = async (req, res, next) => {
  try {
    const { fullName, identifier, password } = req.body;

    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
    const email = isEmail ? identifier : null;
    const phone = !isEmail ? identifier : null;

    // Kiểm tra đã tồn tại
    const checkQuery = isEmail 
      ? 'SELECT id FROM users WHERE email = $1' 
      : 'SELECT id FROM users WHERE phone = $1';
    
    const checkUser = await db.queryWithSchema('admin', checkQuery, [identifier]);
    if (checkUser.length > 0) {
      const error = new Error(`${isEmail ? 'Email' : 'Số điện thoại'} này đã được sử dụng.`);
      error.statusCode = 400;
      throw error;
    }

    // Hash password (Mã hóa mật khẩu)
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Tạo user mới (mặc định role là customer)
    const insertResult = await db.queryWithSchema(
      'admin',
      `INSERT INTO users (fullname, email, passwordhash, phone, role, lastloginat) 
       VALUES ($1, $2, $3, $4, 'customer', NOW()) RETURNING *`,
      [fullName, email, passwordHash, phone]
    );

    const newUser = insertResult[0];

    // Tạo JWT Token
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, phone: newUser.phone, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Gửi thông báo socket
    if (req.io) {
      req.io.emit('user_activity', {
        type: 'register',
        user: { id: newUser.id, fullName: newUser.fullname, email: newUser.email, phone: newUser.phone }
      });
    }

    res.status(201).json({
      message: 'Đăng ký thành công!',
      token,
      user: {
        id: newUser.id,
        fullName: newUser.fullname,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role
      }
    });
  } catch (error) {
    next(error); // Đẩy lỗi xuống Global Error Handler
  }
};

/**
 * Đăng nhập User
 */
const login = async (req, res, next) => {
  try {
    const { identifier, password } = req.body;

    // Tìm user theo email hoặc phone
    const userResult = await db.queryWithSchema('admin', 'SELECT * FROM users WHERE email = $1 OR phone = $1', [identifier]);
    const user = userResult[0];

    if (!user) {
      const error = new Error('Tài khoản hoặc mật khẩu không chính xác.');
      error.statusCode = 401;
      throw error;
    }

    // Kiểm tra password
    const isMatch = await bcrypt.compare(password, user.passwordhash);
    if (!isMatch) {
      const error = new Error('Tài khoản hoặc mật khẩu không chính xác.');
      error.statusCode = 401;
      throw error;
    }

    // Cập nhật lastloginat
    await db.queryWithSchema('admin', 'UPDATE users SET lastloginat = NOW() WHERE id = $1', [user.id]);

    // Tạo JWT Token
    const token = jwt.sign(
      { id: user.id, email: user.email, phone: user.phone, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Gửi thông báo socket
    if (req.io) {
      req.io.emit('user_activity', {
        type: 'login',
        user: { id: user.id, fullName: user.fullname, email: user.email, phone: user.phone }
      });
    }

    res.status(200).json({
      message: 'Đăng nhập thành công!',
      token,
      user: {
        id: user.id,
        fullName: user.fullname,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    next(error); // Đẩy lỗi xuống Global Error Handler
  }
};

/**
 * Đăng nhập bằng Google
 */
const googleLogin = async (req, res, next) => {
  try {
    const { token: accessToken } = req.body;

    if (!accessToken) {
      const error = new Error('Không nhận được token từ Google.');
      error.statusCode = 400;
      throw error;
    }

    // Lấy thông tin user từ Google API
    const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const error = new Error('Token Google không hợp lệ hoặc đã hết hạn.');
      error.statusCode = 401;
      throw error;
    }

    const payload = await response.json();
    const { email, name } = payload;

    if (!email) {
      const error = new Error('Không lấy được email từ tài khoản Google.');
      error.statusCode = 400;
      throw error;
    }

    // Tìm user theo email
    let userResult = await db.queryWithSchema('admin', 'SELECT * FROM users WHERE email = $1', [email]);
    let user = userResult[0];

    if (!user) {
      // Đăng ký mới nếu user chưa tồn tại
      const salt = await bcrypt.genSalt(10);
      const randomPassword = Math.random().toString(36).slice(-10); // Dummy password
      const passwordHash = await bcrypt.hash(randomPassword, salt);
      
      const insertResult = await db.queryWithSchema(
        'admin',
        `INSERT INTO users (fullname, email, passwordhash, phone, role, lastloginat) 
         VALUES ($1, $2, $3, $4, 'customer', NOW()) RETURNING *`,
        [name, email, passwordHash, null]
      );
      user = insertResult[0];

      if (req.io) {
        req.io.emit('user_activity', {
          type: 'register',
          user: { id: user.id, fullName: user.fullname, email: user.email }
        });
      }
    } else {
      await db.queryWithSchema('admin', 'UPDATE users SET lastloginat = NOW() WHERE id = $1', [user.id]);

      if (req.io) {
        req.io.emit('user_activity', {
          type: 'login',
          user: { id: user.id, fullName: user.fullname, email: user.email }
        });
      }
    }

    // Tạo JWT Token
    const jwtToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      message: 'Đăng nhập Google thành công!',
      token: jwtToken,
      user: {
        id: user.id,
        fullName: user.fullname,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Yêu cầu gửi mã OTP Quên mật khẩu
 */
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const { sendOtpEmail } = require('../services/email.service');

    // Kiểm tra email có tồn tại trong hệ thống không
    const userResult = await db.queryWithSchema('admin', 'SELECT id, fullname, email FROM users WHERE email = $1', [email]);
    const user = userResult[0];

    if (!user) {
      const error = new Error('Địa chỉ email này chưa được đăng ký trong hệ thống.');
      error.statusCode = 404;
      throw error;
    }

    // Sinh mã OTP 6 số ngẫu nhiên
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Xóa các OTP cũ của email này
    await db.queryWithSchema('admin', 'DELETE FROM password_resets WHERE email = $1', [email]);

    // Lưu OTP mới với hạn 10 phút
    await db.queryWithSchema(
      'admin',
      `INSERT INTO password_resets (email, otp, expiresat, used) 
       VALUES ($1, $2, NOW() + INTERVAL '10 minutes', false)`,
      [email, otp]
    );

    // Gửi email
    const emailResult = await sendOtpEmail(email, otp, user.fullname);

    res.status(200).json({
      message: 'Mã xác thực OTP đã được gửi đến email của bạn (hiệu lực 10 phút).',
      email,
      devOtp: emailResult?.devOtp
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Xác thực mã OTP
 */
const verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    const records = await db.queryWithSchema(
      'admin',
      `SELECT * FROM password_resets 
       WHERE email = $1 AND otp = $2 AND used = false AND expiresat > NOW() 
       ORDER BY createdat DESC LIMIT 1`,
      [email, otp]
    );

    if (records.length === 0) {
      const error = new Error('Mã OTP không chính xác hoặc đã hết hạn.');
      error.statusCode = 400;
      throw error;
    }

    res.status(200).json({
      message: 'Mã OTP chính xác. Vui lòng nhập mật khẩu mới.',
      valid: true
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Đặt lại mật khẩu mới với mã OTP
 */
const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;

    // Kiểm tra OTP hợp lệ
    const records = await db.queryWithSchema(
      'admin',
      `SELECT * FROM password_resets 
       WHERE email = $1 AND otp = $2 AND used = false AND expiresat > NOW() 
       ORDER BY createdat DESC LIMIT 1`,
      [email, otp]
    );

    if (records.length === 0) {
      const error = new Error('Mã OTP không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu lại mã mới.');
      error.statusCode = 400;
      throw error;
    }

    // Mã hóa mật khẩu mới
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    // Cập nhật mật khẩu trong admin.users
    await db.queryWithSchema(
      'admin',
      'UPDATE users SET passwordhash = $1 WHERE email = $2',
      [passwordHash, email]
    );

    // Đánh dấu OTP đã sử dụng
    await db.queryWithSchema(
      'admin',
      'UPDATE password_resets SET used = true WHERE email = $1',
      [email]
    );

    res.status(200).json({
      message: 'Đặt lại mật khẩu thành công! Bạn có thể đăng nhập bằng mật khẩu mới.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  googleLogin,
  forgotPassword,
  verifyOtp,
  resetPassword
};
