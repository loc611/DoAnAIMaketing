const { pool } = require('../src/config/db');

async function migrate() {
  const client = await pool.connect();
  try {
    console.log('--- Starting Promotion & Order Schema Sync ---');

    // 1. Check / Create / Alter admin.promotions
    await client.query(`
      CREATE TABLE IF NOT EXISTS admin.promotions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        code VARCHAR(50) UNIQUE NOT NULL,
        title VARCHAR(255) NOT NULL DEFAULT '',
        description TEXT,
        discountType VARCHAR(20) NOT NULL DEFAULT 'FIXED',
        discountValue NUMERIC(15, 2) NOT NULL DEFAULT 0,
        maxDiscount NUMERIC(15, 2),
        minOrderValue NUMERIC(15, 2) NOT NULL DEFAULT 0,
        usageLimit INTEGER,
        usedCount INTEGER NOT NULL DEFAULT 0,
        validFrom TIMESTAMP,
        validUntil TIMESTAMP,
        isActive BOOLEAN NOT NULL DEFAULT true,
        createdBy UUID REFERENCES admin.users(id) ON DELETE SET NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Ensure columns exist if table already existed with older columns
    await client.query(`
      ALTER TABLE admin.promotions ADD COLUMN IF NOT EXISTS title VARCHAR(255) DEFAULT '';
      ALTER TABLE admin.promotions ADD COLUMN IF NOT EXISTS description TEXT;
      ALTER TABLE admin.promotions ADD COLUMN IF NOT EXISTS discountType VARCHAR(20) DEFAULT 'FIXED';
      ALTER TABLE admin.promotions ADD COLUMN IF NOT EXISTS discountValue NUMERIC(15, 2) DEFAULT 0;
      ALTER TABLE admin.promotions ADD COLUMN IF NOT EXISTS maxDiscount NUMERIC(15, 2);
      ALTER TABLE admin.promotions ADD COLUMN IF NOT EXISTS minOrderValue NUMERIC(15, 2) DEFAULT 0;
      ALTER TABLE admin.promotions ADD COLUMN IF NOT EXISTS usageLimit INTEGER;
      ALTER TABLE admin.promotions ADD COLUMN IF NOT EXISTS usedCount INTEGER DEFAULT 0;
      ALTER TABLE admin.promotions ADD COLUMN IF NOT EXISTS validFrom TIMESTAMP;
      ALTER TABLE admin.promotions ADD COLUMN IF NOT EXISTS validUntil TIMESTAMP;
      ALTER TABLE admin.promotions ADD COLUMN IF NOT EXISTS isActive BOOLEAN DEFAULT true;
      ALTER TABLE admin.promotions ADD COLUMN IF NOT EXISTS createdBy UUID;
      ALTER TABLE admin.promotions ADD COLUMN IF NOT EXISTS createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    `);

    // 2. Check / Alter sales.orders
    await client.query(`
      ALTER TABLE sales.orders ADD COLUMN IF NOT EXISTS discountAmount NUMERIC(15, 2) DEFAULT 0;
      ALTER TABLE sales.orders ADD COLUMN IF NOT EXISTS promotionCode VARCHAR(50);
    `);

    console.log('✓ Tables synced successfully.');

    // 3. Seed initial promo codes if empty
    const checkRes = await client.query(`SELECT COUNT(*) FROM admin.promotions`);
    if (parseInt(checkRes.rows[0].count, 10) === 0) {
      console.log('Seeding initial promotional vouchers...');
      await client.query(`
        INSERT INTO admin.promotions (code, title, description, discountType, discountValue, maxDiscount, minOrderValue, usageLimit, usedCount, validUntil, isActive)
        VALUES 
        ('APPLE2M', 'Giảm trực tiếp 2.000.000đ', 'Áp dụng cho mọi đơn hàng từ 10.000.000đ khi thanh toán', 'FIXED', 2000000, NULL, 10000000, 100, 0, NOW() + INTERVAL '30 days', true),
        ('PIGVIP10', 'Giảm 10% tối đa 1.500.000đ', 'Dành riêng cho khách hàng thân thiết của Pig Store', 'PERCENT', 10, 1500000, 5000000, 50, 0, NOW() + INTERVAL '60 days', true),
        ('CHAOBANMOI', 'Giảm 500.000đ cho đơn đầu tiên', 'Chào mừng thành viên mới mua sắm thiết bị Apple', 'FIXED', 500000, NULL, 3000000, 200, 0, NOW() + INTERVAL '90 days', true),
        ('IPHONE17VIP', 'Ưu đãi siêu phẩm 3.000.000đ', 'Giảm trực tiếp cho đơn hàng từ 25.000.000đ', 'FIXED', 3000000, NULL, 25000000, 30, 0, NOW() + INTERVAL '15 days', true);
      `);
      console.log('✓ Seeded 4 initial promotion vouchers.');
    } else {
      console.log(`✓ Existing promotions found: ${checkRes.rows[0].count}`);
    }

    console.log('--- Migration completed successfully ---');
  } catch (error) {
    console.error('Migration error:', error);
  } finally {
    client.release();
    pool.end();
  }
}

migrate();
