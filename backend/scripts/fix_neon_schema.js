require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const db = require('../src/config/db');

async function fixDatabase() {
  console.log('🔄 Đang đồng bộ hóa Database Neon và dọn dẹp constraint...');

  try {
    // 1. Xử lý constraint wishlists bị xung đột trên schema customer
    console.log('--- 1. Xử lý customer.wishlists và schema ---');
    await db.query(`
      CREATE SCHEMA IF NOT EXISTS customer;
      CREATE SCHEMA IF NOT EXISTS inventory;
      CREATE SCHEMA IF NOT EXISTS sales;
      CREATE SCHEMA IF NOT EXISTS admin;
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS admin.permission_settings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        role VARCHAR(50) UNIQUE NOT NULL,
        permissions JSON NOT NULL,
        updatedat TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await db.query(`
      DO $$ BEGIN
        ALTER TABLE customer.wishlists DROP CONSTRAINT IF EXISTS wishlists_userid_productid_key CASCADE;
      EXCEPTION WHEN undefined_table THEN null;
      END $$;
    `);

    await db.query(`
      DO $$ BEGIN
        ALTER TABLE customer.wishlists DROP CONSTRAINT IF EXISTS wishlists_userId_productId_key CASCADE;
      EXCEPTION WHEN undefined_table THEN null;
      END $$;
    `);

    await db.query(`
      DROP INDEX IF EXISTS customer.wishlists_userid_productid_key;
      DROP INDEX IF EXISTS customer.wishlists_userId_productId_key;
    `);
    console.log('✓ Đã gỡ bỏ constraint/index cũ gây lỗi trên customer.wishlists');

    // 2. Đồng bộ bảng inventory.products và product_variants
    console.log('--- 2. Kiểm tra bảng inventory.products ---');
    await db.query(`
      CREATE TABLE IF NOT EXISTS inventory.products (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100),
        basePrice DECIMAL(15, 2) NOT NULL DEFAULT 0,
        heroImage TEXT,
        description TEXT,
        highlights JSONB,
        specs JSONB,
        camera JSONB,
        performance JSONB,
        design JSONB,
        edition VARCHAR(100),
        watermarkText VARCHAR(50)
      );

      CREATE TABLE IF NOT EXISTS inventory.product_variants (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        productId UUID NOT NULL REFERENCES inventory.products(id) ON DELETE CASCADE,
        color VARCHAR(50),
        storage VARCHAR(50),
        price DECIMAL(15, 2) NOT NULL DEFAULT 0,
        stockQuantity INT NOT NULL DEFAULT 0,
        image TEXT
      );
    `);

    // Bổ sung các cột nếu bảng đã tồn tại từ trước nhưng thiếu cột
    await db.query(`
      ALTER TABLE inventory.products 
        ADD COLUMN IF NOT EXISTS category VARCHAR(100),
        ADD COLUMN IF NOT EXISTS basePrice DECIMAL(15, 2) DEFAULT 0,
        ADD COLUMN IF NOT EXISTS heroImage TEXT,
        ADD COLUMN IF NOT EXISTS description TEXT,
        ADD COLUMN IF NOT EXISTS highlights JSONB,
        ADD COLUMN IF NOT EXISTS specs JSONB,
        ADD COLUMN IF NOT EXISTS camera JSONB,
        ADD COLUMN IF NOT EXISTS performance JSONB,
        ADD COLUMN IF NOT EXISTS design JSONB,
        ADD COLUMN IF NOT EXISTS edition VARCHAR(100),
        ADD COLUMN IF NOT EXISTS watermarkText VARCHAR(50);
    `);
    console.log('✓ Bảng inventory.products & variants đã được cập nhật đầy đủ cấu trúc.');

    // 3. Đảm bảo bảng sales.leads & sales.lead_activities
    console.log('--- 3. Kiểm tra bảng sales.leads & CRM ---');
    await db.query(`
      DO $$ BEGIN
        CREATE TYPE sales.Temperature AS ENUM ('HOT', 'WARM', 'COLD');
      EXCEPTION WHEN duplicate_object THEN null;
      END $$;

      DO $$ BEGIN
        CREATE TYPE sales.LeadStatus AS ENUM ('NEW', 'CONTACTED', 'QUALIFIED', 'WON', 'LOST');
      EXCEPTION WHEN duplicate_object THEN null;
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
    console.log('✓ Bảng sales.leads và activities đã sẵn sàng.');

    // 4. Kiểm tra wishlist table
    console.log('--- 4. Kiểm tra customer.wishlists & reviews ---');
    await db.query(`
      CREATE TABLE IF NOT EXISTS customer.wishlists (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        userId UUID NOT NULL REFERENCES admin.users(id) ON DELETE CASCADE,
        productId UUID NOT NULL REFERENCES inventory.products(id) ON DELETE CASCADE,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT wishlists_userid_productid_key UNIQUE (userId, productId)
      );

      CREATE TABLE IF NOT EXISTS customer.reviews (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        userId UUID NOT NULL REFERENCES admin.users(id) ON DELETE CASCADE,
        productId UUID NOT NULL REFERENCES inventory.products(id) ON DELETE CASCADE,
        rating INT,
        comment TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ Bảng customer.wishlists và customer.reviews đã hoàn tất.');

    console.log('🎉 Cập nhật database thành công 100%! Bây giờ có thể chạy: npx prisma db push hoặc npx prisma generate');
    process.exit(0);
  } catch (err) {
    console.error('❌ Lỗi xử lý database:', err);
    process.exit(1);
  }
}

fixDatabase();
