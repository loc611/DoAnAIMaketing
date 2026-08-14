require('dotenv').config();
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

async function resetAdmin() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('123456', salt);
    
    // Update admin@apple.com password
    const result = await pool.query(
      `UPDATE admin.users SET passwordhash = $1 WHERE email = 'admin@apple.com' RETURNING *`,
      [hash]
    );
    
    console.log('Updated rows:', result.rowCount);
    console.log('New hash for 123456:', hash);
    console.log('Admin password successfully reset to 123456');
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

resetAdmin();
