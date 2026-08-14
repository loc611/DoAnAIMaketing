const db = require('../../config/db');

/**
 * Lấy danh sách tất cả người dùng (Dành cho Admin CRM)
 */
const getAllUsers = async (req, res) => {
  try {
    const queryText = `
      SELECT 
        u.id, 
        u.fullname, 
        u.email, 
        u.phone, 
        u.role, 
        u.createdat, 
        u.lastloginat,
        COUNT(o.id) as orders_count
      FROM admin.users u
      LEFT JOIN sales.orders o ON u.id = o.userid
      GROUP BY u.id
      ORDER BY u.createdat DESC
    `;
    const usersResult = await db.query(queryText);
    
    // Format lại data cho giống API cũ
    const users = usersResult.rows.map(row => ({
      id: row.id,
      fullName: row.fullname,
      email: row.email,
      phone: row.phone,
      role: row.role,
      createdAt: row.createdat,
      lastLoginAt: row.lastloginat,
      _count: { orders: parseInt(row.orders_count, 10) }
    }));

    res.status(200).json(users);
  } catch (error) {
    console.error('Lỗi khi lấy danh sách user:', error);
    res.status(500).json({ error: 'Lỗi server khi lấy danh sách khách hàng.' });
  }
};

/**
 * Cập nhật thông tin cá nhân của người dùng
 */
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { fullName, phone, email, dob } = req.body;

    if (!fullName) {
      return res.status(400).json({ error: 'Vui lòng cung cấp Họ tên.' });
    }
    if (!phone && !email) {
      return res.status(400).json({ error: 'Vui lòng cung cấp ít nhất Số điện thoại hoặc Email.' });
    }

    const queryText = `
      UPDATE admin.users
      SET fullname = $1, 
          phone = COALESCE($2, phone), 
          email = COALESCE($3, email), 
          dob = $4
      WHERE id = $5
      RETURNING id, fullname, email, phone, role, dob
    `;
    // PostgreSQL uses YYYY-MM-DD for DATE. If dob is provided in DD/MM/YYYY, convert it.
    let formattedDob = null;
    if (dob) {
      const parts = dob.split('/');
      if (parts.length === 3) {
        formattedDob = `${parts[2]}-${parts[1]}-${parts[0]}`;
      } else {
        formattedDob = dob; // Fallback in case it's already formatted
      }
    }

    const result = await db.query(queryText, [fullName, phone || null, email || null, formattedDob, userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy người dùng.' });
    }

    const updatedUser = result.rows[0];
    res.status(200).json({
      message: 'Cập nhật thông tin thành công.',
      user: {
        id: updatedUser.id,
        fullName: updatedUser.fullname,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        dob: updatedUser.dob
      }
    });
  } catch (error) {
    console.error('Lỗi khi cập nhật profile:', error);
    res.status(500).json({ error: 'Lỗi server khi cập nhật thông tin.' });
  }
};

module.exports = {
  getAllUsers,
  updateProfile
};
