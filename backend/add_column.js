require('dotenv').config();
const db = require('./src/config/db');

async function addColumn() {
  try {
    console.log('Adding lastloginat column to admin.users table...');
    await db.query(`ALTER TABLE admin.users ADD COLUMN IF NOT EXISTS lastloginat TIMESTAMP`);
    console.log('Column added successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error adding column:', error);
    process.exit(1);
  }
}

addColumn();
