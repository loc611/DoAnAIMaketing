require('dotenv').config();
const db = require('../src/config/db');

async function makeAdmin(email) {
  if (!email) {
    console.error('Vui lòng cung cấp email của tài khoản muốn nâng cấp.');
    console.error('Ví dụ: node make_admin.js email@gmail.com');
    process.exit(1);
  }

  try {
    const queryText = `
      UPDATE admin.users
      SET role = 'admin'
      WHERE email = $1
      RETURNING id, fullname, email, role;
    `;
    const result = await db.query(queryText, [email]);

    if (result.rowCount === 0) {
      console.log(`❌ Không tìm thấy tài khoản nào với email: ${email}`);
    } else {
      console.log(`✅ Thành công! Đã cấp quyền ADMIN cho:`);
      console.log(result.rows[0]);
    }
    process.exit(0);
  } catch (err) {
    console.error('❌ Lỗi:', err.message);
    process.exit(1);
  }
}

const emailArg = process.argv[2];
makeAdmin(emailArg);
