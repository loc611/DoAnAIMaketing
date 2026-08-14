const db = require('../../config/db');
const bcrypt = require('bcryptjs');

/**
 * 1. Hàm Đăng nhập (Query tới admin.users)
 * 
 * LƯU Ý: Đây là code mẫu minh họa cách dùng `pg` module thay thế cho Prisma.
 */
const loginExample = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Vui lòng nhập email và mật khẩu.' });
    }

    // CÁCH 1: Viết tường minh tên schema trong câu query SQL
    const userResult = await db.query('SELECT * FROM admin.users WHERE email = $1', [email]);
    const user = userResult.rows[0];

    if (!user) {
      return res.status(400).json({ error: 'Email hoặc mật khẩu không chính xác.' });
    }

    // Kiểm tra password (Giả sử thư viện bcrypt đã được import)
    const isMatch = await bcrypt.compare(password, user.passwordhash); // LƯU Ý: pg trả về tên cột viết thường
    if (!isMatch) {
      return res.status(400).json({ error: 'Email hoặc mật khẩu không chính xác.' });
    }

    res.status(200).json({ message: 'Đăng nhập thành công với PG Module', role: user.role });
  } catch (error) {
    console.error('Lỗi login:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
};

/**
 * 2. Hàm Nhân viên Sale cập nhật trạng thái đơn hàng (Query tới sales.orders)
 */
const updateOrderStatusExample = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    // CÁCH 2: Dùng hàm tiện ích thiết lập search_path tự động
    // Câu query sẽ tự động chọc vào schema 'sales' mà không cần viết 'sales.orders'
    const updatedOrder = await db.queryWithSchema(
      'sales',
      'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *',
      [status, orderId]
    );

    if (updatedOrder.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy đơn hàng' });
    }

    res.status(200).json({ message: 'Cập nhật thành công', order: updatedOrder[0] });
  } catch (error) {
    console.error('Lỗi update order:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
};

module.exports = {
  loginExample,
  updateOrderStatusExample
};
