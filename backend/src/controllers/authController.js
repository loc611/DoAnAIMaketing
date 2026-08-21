const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_apple_jwt_key_2026';

/**
 * Helper: Tìm kiếm user trên cả 3 schema (customer, sales, admin)
 */
const findUserByIdentifier = async (identifier) => {
  const query = `
    SELECT id, fullname, email, passwordhash, phone, dob, address, gender, notes, role, status, createdat, lastloginat, 'customer' AS "schemaGroup"
    FROM customer.users
    WHERE email = $1 OR phone = $1
    UNION ALL
    SELECT id, fullname, email, passwordhash, phone, dob, address, gender, notes, role, status, createdat, lastloginat, 'sales' AS "schemaGroup"
    FROM sales.staff
    WHERE email = $1 OR phone = $1
    UNION ALL
    SELECT id, fullname, email, passwordhash, phone, dob, address, gender, notes, role, status, createdat, lastloginat, 'admin' AS "schemaGroup"
    FROM admin.users
    WHERE email = $1 OR phone = $1
    LIMIT 1;
  `;
  const result = await db.query(query, [identifier]);
  return result.rows[0] || null;
};

/**
 * Helper: Tìm kiếm user theo Email trên cả 3 schema
 */
const findUserByEmail = async (email) => {
  const query = `
    SELECT id, fullname, email, passwordhash, phone, dob, address, gender, notes, role, status, createdat, lastloginat, 'customer' AS "schemaGroup"
    FROM customer.users
    WHERE LOWER(email) = LOWER($1)
    UNION ALL
    SELECT id, fullname, email, passwordhash, phone, dob, address, gender, notes, role, status, createdat, lastloginat, 'sales' AS "schemaGroup"
    FROM sales.staff
    WHERE LOWER(email) = LOWER($1)
    UNION ALL
    SELECT id, fullname, email, passwordhash, phone, dob, address, gender, notes, role, status, createdat, lastloginat, 'admin' AS "schemaGroup"
    FROM admin.users
    WHERE LOWER(email) = LOWER($1)
    LIMIT 1;
  `;
  const result = await db.query(query, [email]);
  return result.rows[0] || null;
};

/**
 * Đăng ký User mới (Khách hàng vào schema customer)
 */
const register = async (req, res, next) => {
  try {
    const { fullName, identifier, password } = req.body;

    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
    const email = isEmail ? identifier.toLowerCase().trim() : null;
    const phone = !isEmail ? identifier.trim() : null;

    // Kiểm tra đã tồn tại trên bất kỳ schema nào chưa
    const existingUser = await findUserByIdentifier(identifier.trim());
    if (existingUser) {
      const error = new Error(`${isEmail ? 'Email' : 'Số điện thoại'} này đã được sử dụng.`);
      error.statusCode = 400;
      throw error;
    }

    // Hash password (Mã hóa mật khẩu)
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Tạo khách hàng mới vào customer.users
    const insertResult = await db.queryWithSchema(
      'customer',
      `INSERT INTO users (fullname, email, passwordhash, phone, role, lastloginat) 
       VALUES ($1, $2, $3, $4, 'customer', NOW()) RETURNING *`,
      [fullName, email, passwordHash, phone]
    );

    const newUser = insertResult[0];

    // Tạo JWT Token
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, phone: newUser.phone, role: newUser.role, schema: 'customer' },
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
        role: newUser.role,
        schema: 'customer'
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Đăng nhập User (Unified Login - tự động tra cứu trên customer, sales, admin)
 */
const login = async (req, res, next) => {
  try {
    const { identifier, password } = req.body;
    const trimmedIdentifier = (identifier || '').trim();

    // Tìm user trên cả 3 schema
    const user = await findUserByIdentifier(trimmedIdentifier);

    if (!user) {
      const error = new Error('Tài khoản hoặc mật khẩu không chính xác.');
      error.statusCode = 401;
      throw error;
    }

    // Kiểm tra mật khẩu
    const isMatch = await bcrypt.compare(password, user.passwordhash);
    if (!isMatch) {
      const error = new Error('Tài khoản hoặc mật khẩu không chính xác.');
      error.statusCode = 401;
      throw error;
    }

    // Cập nhật lastloginat theo đúng schema của user
    const targetSchema = user.schemaGroup || 'admin';
    const targetTable = targetSchema === 'sales' ? 'staff' : 'users';
    await db.queryWithSchema(targetSchema, `UPDATE ${targetTable} SET lastloginat = NOW() WHERE id = $1`, [user.id]);

    // Tạo JWT Token
    const token = jwt.sign(
      { id: user.id, email: user.email, phone: user.phone, role: user.role, schema: targetSchema },
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
        role: user.role,
        schema: targetSchema
      }
    });
  } catch (error) {
    next(error);
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

    // Tìm user trên cả 3 schema
    let user = await findUserByEmail(email);

    if (!user) {
      // Đăng ký khách hàng mới vào customer.users
      const salt = await bcrypt.genSalt(10);
      const randomPassword = Math.random().toString(36).slice(-10);
      const passwordHash = await bcrypt.hash(randomPassword, salt);
      
      const insertResult = await db.queryWithSchema(
        'customer',
        `INSERT INTO users (fullname, email, passwordhash, phone, role, lastloginat) 
         VALUES ($1, $2, $3, $4, 'customer', NOW()) RETURNING *`,
        [name, email.toLowerCase().trim(), passwordHash, null]
      );
      user = insertResult[0];
      user.schemaGroup = 'customer';

      if (req.io) {
        req.io.emit('user_activity', {
          type: 'register',
          user: { id: user.id, fullName: user.fullname, email: user.email }
        });
      }
    } else {
      const targetSchema = user.schemaGroup || 'customer';
      const targetTable = targetSchema === 'sales' ? 'staff' : 'users';
      await db.queryWithSchema(targetSchema, `UPDATE ${targetTable} SET lastloginat = NOW() WHERE id = $1`, [user.id]);

      if (req.io) {
        req.io.emit('user_activity', {
          type: 'login',
          user: { id: user.id, fullName: user.fullname, email: user.email }
        });
      }
    }

    const targetSchema = user.schemaGroup || 'customer';

    // Tạo JWT Token
    const jwtToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role, schema: targetSchema },
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
        role: user.role,
        schema: targetSchema
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

    // Kiểm tra email trên cả 3 schema
    const user = await findUserByEmail(email);

    if (!user) {
      const error = new Error('Địa chỉ email này chưa được đăng ký trong hệ thống.');
      error.statusCode = 404;
      throw error;
    }

    // Sinh mã OTP 6 số ngẫu nhiên
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Xóa các OTP cũ của email này trong admin.password_resets
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

    // Tìm xem user nằm ở schema nào
    const user = await findUserByEmail(email);
    if (!user) {
      const error = new Error('Không tìm thấy tài khoản để cập nhật mật khẩu.');
      error.statusCode = 404;
      throw error;
    }

    // Mã hóa mật khẩu mới
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    // Cập nhật mật khẩu vào đúng bảng của schema đó
    const targetSchema = user.schemaGroup || 'admin';
    const targetTable = targetSchema === 'sales' ? 'staff' : 'users';
    await db.queryWithSchema(
      targetSchema,
      `UPDATE ${targetTable} SET passwordhash = $1 WHERE LOWER(email) = LOWER($2)`,
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
  resetPassword,
  findUserByIdentifier,
  findUserByEmail
};
