const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
require('dotenv').config();
const { Pool } = require('pg');

// Khởi tạo Pool kết nối tới Neon PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Hàm tiện ích để thực thi query với search_path cụ thể
// Ví dụ: queryWithSchema('admin', 'SELECT * FROM users');
const queryWithSchema = async (schemaName, text, params) => {
  const client = await pool.connect();
  try {
    // Set schema tạm thời cho session (client) hiện tại
    await client.query(`SET search_path TO ${schemaName}`);
    const res = await client.query(text, params);
    return res.rows;
  } finally {
    // Trả client về pool
    client.release();
  }
};

// Hàm query thô (Bạn phải viết rõ tên schema trong SQL, ví dụ: SELECT * FROM admin.users)
const query = async (text, params) => {
  const res = await pool.query(text, params);
  return res;
};

module.exports = {
  pool,
  query,
  queryWithSchema
};
