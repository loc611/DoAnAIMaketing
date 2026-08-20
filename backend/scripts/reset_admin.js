require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('../src/config/db');

async function resetAdmin() {
  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('123456', salt);
    
    // Update all users password to 123456
    const result = await db.query(
      `UPDATE admin.users SET passwordhash = $1 RETURNING email, role`,
      [hash]
    );
    
    console.log('Updated rows:', result.rowCount);
    console.log('Updated users:', result.rows);
    console.log('New hash for 123456:', hash);
    console.log('All passwords successfully reset to 123456');
    process.exit(0);
  } catch (err) {
    console.error('Error resetting password:', err);
    process.exit(1);
  }
}

resetAdmin();
