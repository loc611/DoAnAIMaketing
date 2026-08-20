require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const db = require('../config/db');

async function runMigration() {
  console.log('🚀 Đang chạy migration cập nhật Database Neon...');
  try {
    // 1. Cập nhật bảng admin.users
    console.log('--- 1. Cập nhật bảng admin.users ---');
    await db.query(`
      ALTER TABLE admin.users 
        ADD COLUMN IF NOT EXISTS dob DATE,
        ADD COLUMN IF NOT EXISTS address TEXT,
        ADD COLUMN IF NOT EXISTS gender VARCHAR(20),
        ADD COLUMN IF NOT EXISTS notes TEXT,
        ADD COLUMN IF NOT EXISTS lastloginat TIMESTAMP;
    `);
    console.log('✓ Bảng admin.users đã được bổ sung các cột: dob, address, gender, notes, lastloginat.');

    // 2. Cập nhật bảng admin.permission_settings
    console.log('--- 2. Cập nhật bảng admin.permission_settings ---');
    await db.query(`
      CREATE TABLE IF NOT EXISTS admin.permission_settings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        role VARCHAR(50) UNIQUE NOT NULL,
        permissions JSON NOT NULL,
        updatedat TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await db.query(`
      ALTER TABLE admin.permission_settings 
        ADD COLUMN IF NOT EXISTS updatedat TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    `);
    console.log('✓ Bảng admin.permission_settings đã sẵn sàng.');

    // 3. Đảm bảo types và bảng CRM trong sales schema
    console.log('--- 3. Kiểm tra ENUM và bảng sales.leads ---');
    await db.query(`
      DO $$ BEGIN
        CREATE TYPE sales.Temperature AS ENUM ('HOT', 'WARM', 'COLD');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;

      DO $$ BEGIN
        CREATE TYPE sales.LeadStatus AS ENUM ('NEW', 'CONTACTED', 'QUALIFIED', 'WON', 'LOST');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS sales.leads (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(150) NOT NULL,
        email VARCHAR(150) NOT NULL,
        phone VARCHAR(20),
        productInterest VARCHAR(255) NOT NULL,
        budgetRange VARCHAR(50),
        source VARCHAR(50) NOT NULL,
        score INT NOT NULL DEFAULT 0,
        temperature sales.Temperature NOT NULL DEFAULT 'COLD',
        status sales.LeadStatus NOT NULL DEFAULT 'NEW',
        assignedToId UUID REFERENCES admin.users(id) ON DELETE SET NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS sales.lead_activities (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        leadId UUID NOT NULL REFERENCES sales.leads(id) ON DELETE CASCADE,
        activityType VARCHAR(50) NOT NULL,
        scoreDelta INT NOT NULL,
        metadata JSONB,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ Bảng sales.leads và sales.lead_activities đã sẵn sàng.');

    // 4. Khởi tạo quyền mặc định GLOBAL_MATRIX nếu chưa có
    const matrixCheck = await db.query(`SELECT id FROM admin.permission_settings WHERE role = 'GLOBAL_MATRIX'`);
    if (matrixCheck.rows.length === 0) {
      const defaultPermissions = JSON.stringify([
        { id: 'exec_dash', feature: 'Xem Executive Dashboard', superAdmin: true, manager: true, sales: false, other: false },
        { id: 'op_dash', feature: 'Xem Dashboard Vận Hành', superAdmin: true, manager: true, sales: true, other: true },
        { id: 'crud_lead', feature: 'Thêm / Sửa / Xoá Lead', superAdmin: true, manager: true, sales: true, other: false },
        { id: 'view_user', feature: 'Xem Danh Sách User', superAdmin: true, manager: true, sales: true, other: false },
        { id: 'crud_user', feature: 'Thêm / Sửa / Xoá User', superAdmin: true, manager: false, sales: false, other: false },
        { id: 'export_report', feature: 'Xuất Báo Cáo', superAdmin: true, manager: true, sales: true, other: false }
      ]);
      await db.query(
        `INSERT INTO admin.permission_settings (role, permissions, updatedat) VALUES ($1, $2, NOW())`,
        ['GLOBAL_MATRIX', defaultPermissions]
      );
      console.log('✓ Đã khởi tạo cấu hình phân quyền mặc định GLOBAL_MATRIX.');
    }

    console.log('🎉 Migration hoàn tất thành công 100%!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Lỗi khi chạy migration:', err);
    process.exit(1);
  }
}

runMigration();
