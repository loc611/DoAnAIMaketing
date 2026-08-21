require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { pool } = require('../src/config/db');
const bcrypt = require('bcryptjs');

async function fixAllAuthSchemas() {
  const client = await pool.connect();
  try {
    console.log('🚀 Bắt đầu sửa triệt để các bảng Auth & Multi-schema...');

    await client.query('BEGIN');

    // 0. Bật extension pgcrypto
    await client.query('CREATE EXTENSION IF NOT EXISTS pgcrypto;');

    // 1. Tạo tất cả các schemas
    await client.query(`
      CREATE SCHEMA IF NOT EXISTS admin;
      CREATE SCHEMA IF NOT EXISTS sales;
      CREATE SCHEMA IF NOT EXISTS customer;
      CREATE SCHEMA IF NOT EXISTS inventory;
    `);
    console.log('✅ 1. Các schemas (admin, sales, customer, inventory) đã sẵn sàng.');

    // 2. Tạo bảng admin.users
    await client.query(`
      CREATE TABLE IF NOT EXISTS admin.users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        fullName VARCHAR(100) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        passwordHash VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        dob DATE,
        address TEXT,
        gender VARCHAR(20),
        notes TEXT,
        role VARCHAR(50) NOT NULL DEFAULT 'admin',
        status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        lastloginat TIMESTAMP
      );
      ALTER TABLE admin.users DROP CONSTRAINT IF EXISTS users_role_check;
      ALTER TABLE admin.users ADD CONSTRAINT users_role_check 
        CHECK (role IN ('SUPER_ADMIN', 'MANAGER', 'SALES', 'VIEWER', 'admin', 'manager', 'sales_staff', 'warehouse_staff', 'customer'));
    `);
    console.log('✅ 2. Bảng admin.users đã sẵn sàng.');

    // 3. Tạo bảng customer.users
    await client.query(`
      CREATE TABLE IF NOT EXISTS customer.users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        fullName VARCHAR(100) NOT NULL,
        email VARCHAR(150) UNIQUE,
        passwordHash VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        dob DATE,
        address TEXT,
        gender VARCHAR(20),
        notes TEXT,
        role VARCHAR(50) NOT NULL DEFAULT 'customer',
        status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        lastloginat TIMESTAMP
      );
    `);
    console.log('✅ 3. Bảng customer.users đã sẵn sàng.');

    // 4. Tạo bảng sales.staff
    await client.query(`
      CREATE TABLE IF NOT EXISTS sales.staff (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        fullName VARCHAR(100) NOT NULL,
        email VARCHAR(150) UNIQUE,
        passwordHash VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        dob DATE,
        address TEXT,
        gender VARCHAR(20),
        notes TEXT,
        role VARCHAR(50) NOT NULL DEFAULT 'sales',
        status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        lastloginat TIMESTAMP
      );
    `);
    console.log('✅ 4. Bảng sales.staff đã sẵn sàng.');

    // 5. Tạo bảng admin.password_resets
    await client.query(`
      CREATE TABLE IF NOT EXISTS admin.password_resets (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(150) NOT NULL,
        otp VARCHAR(10) NOT NULL,
        expiresAt TIMESTAMP NOT NULL,
        used BOOLEAN DEFAULT FALSE,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_password_resets_email_otp ON admin.password_resets(email, otp);
    `);
    console.log('✅ 5. Bảng admin.password_resets đã sẵn sàng.');

    // 6. Tạo tài khoản mẫu / kiểm tra tài khoản admin@apple.com
    const defaultPasswordHash = await bcrypt.hash('123456', 10);

    // Upsert admin account: admin@apple.com
    await client.query(`
      INSERT INTO admin.users (fullName, email, passwordHash, role, status)
      VALUES ('CEO Tim Cook', 'admin@apple.com', $1, 'SUPER_ADMIN', 'ACTIVE')
      ON CONFLICT (email) DO UPDATE SET 
        role = 'SUPER_ADMIN',
        passwordHash = EXCLUDED.passwordHash;
    `, [defaultPasswordHash]);

    // Upsert manager account: manager@apple.com
    await client.query(`
      INSERT INTO admin.users (fullName, email, passwordHash, role, status)
      VALUES ('Store Manager', 'manager@apple.com', $1, 'MANAGER', 'ACTIVE')
      ON CONFLICT (email) DO UPDATE SET 
        role = 'MANAGER',
        passwordHash = EXCLUDED.passwordHash;
    `, [defaultPasswordHash]);

    // Upsert sales staff: sales@apple.com
    await client.query(`
      INSERT INTO sales.staff (fullName, email, passwordHash, role, status)
      VALUES ('Chuyên Viên Sales', 'sales@apple.com', $1, 'SALES', 'ACTIVE')
      ON CONFLICT (email) DO UPDATE SET 
        role = 'SALES',
        passwordHash = EXCLUDED.passwordHash;
    `, [defaultPasswordHash]);

    // Upsert customer VIP: vip@gmail.com
    await client.query(`
      INSERT INTO customer.users (fullName, email, passwordHash, role, status)
      VALUES ('Khách hàng VIP', 'vip@gmail.com', $1, 'customer', 'ACTIVE')
      ON CONFLICT (email) DO UPDATE SET 
        role = 'customer',
        passwordHash = EXCLUDED.passwordHash;
    `, [defaultPasswordHash]);

    console.log('✅ 6. Đã khởi tạo / đồng bộ các tài khoản mặc định (Mật khẩu: 123456):');
    console.log('   - Admin: admin@apple.com');
    console.log('   - Manager: manager@apple.com');
    console.log('   - Sales: sales@apple.com');
    console.log('   - Customer: vip@gmail.com');

    await client.query('COMMIT');
    console.log('\n🎉 SỬA LỖI HOÀN TẤT THÀNH CÔNG 100%!');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Lỗi khi thực hiện migration:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

fixAllAuthSchemas();
