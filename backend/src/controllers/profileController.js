const db = require('../config/db');

/**
 * Lấy danh sách tất cả người dùng từ các schema (Dành cho Admin CRM)
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
        u.schemagroup,
        COUNT(o.id) as orders_count
      FROM (
        SELECT id, fullname, email, phone, role, createdat, lastloginat, 'customer' AS schemagroup FROM customer.users
        UNION ALL
        SELECT id, fullname, email, phone, role, createdat, lastloginat, 'sales' AS schemagroup FROM sales.staff
        UNION ALL
        SELECT id, fullname, email, phone, role, createdat, lastloginat, 'admin' AS schemagroup FROM admin.users
      ) u
      LEFT JOIN sales.orders o ON u.id = o.userid
      GROUP BY u.id, u.fullname, u.email, u.phone, u.role, u.createdat, u.lastloginat, u.schemagroup
      ORDER BY u.createdat DESC
    `;
    const usersResult = await db.query(queryText);
    
    const users = usersResult.rows.map(row => ({
      id: row.id,
      fullName: row.fullname,
      email: row.email,
      phone: row.phone,
      role: row.role,
      schemaGroup: row.schemagroup,
      createdAt: row.createdat,
      lastLoginAt: row.lastloginat,
      _count: { orders: parseInt(row.orders_count, 10) || 0 }
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
    const userSchema = req.user.schema;
    const { fullName, phone, email, dob } = req.body;

    if (!fullName) {
      return res.status(400).json({ error: 'Vui lòng cung cấp Họ tên.' });
    }
    if (!phone && !email) {
      return res.status(400).json({ error: 'Vui lòng cung cấp ít nhất Số điện thoại hoặc Email.' });
    }

    let formattedDob = null;
    if (dob) {
      const parts = dob.split('/');
      if (parts.length === 3) {
        formattedDob = `${parts[2]}-${parts[1]}-${parts[0]}`;
      } else {
        formattedDob = dob;
      }
    }

    // Danh sách các bảng có thể cần cập nhật
    const schemasToTry = userSchema ? [userSchema] : ['customer', 'sales', 'admin'];
    let updatedUser = null;

    for (const schema of schemasToTry) {
      const tableName = schema === 'sales' ? 'staff' : 'users';
      const queryText = `
        UPDATE ${schema}.${tableName}
        SET fullname = $1, 
            phone = COALESCE($2, phone), 
            email = COALESCE($3, email), 
            dob = $4
        WHERE id = $5
        RETURNING id, fullname, email, phone, role, dob
      `;
      const result = await db.query(queryText, [fullName, phone || null, email || null, formattedDob, userId]);
      if (result.rows.length > 0) {
        updatedUser = result.rows[0];
        break;
      }
    }

    if (!updatedUser) {
      return res.status(404).json({ error: 'Không tìm thấy người dùng.' });
    }

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
