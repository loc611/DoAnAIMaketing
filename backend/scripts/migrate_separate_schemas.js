const { pool } = require('../src/config/db');

async function migrateSeparateSchemas() {
  const client = await pool.connect();
  try {
    console.log('🚀 Starting Schema Separation & Data Migration...');

    await client.query('BEGIN');

    // 1. Ensure schemas exist
    await client.query(`
      CREATE SCHEMA IF NOT EXISTS admin;
      CREATE SCHEMA IF NOT EXISTS sales;
      CREATE SCHEMA IF NOT EXISTS customer;
      CREATE SCHEMA IF NOT EXISTS inventory;
    `);
    console.log('✅ 1. Schemas verified (admin, sales, customer, inventory).');

    // 2. Create customer.users table
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
        role VARCHAR(20) NOT NULL DEFAULT 'customer',
        status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        lastloginat TIMESTAMP
      );
    `);
    console.log('✅ 2. Table customer.users created / verified.');

    // 3. Create sales.staff table
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
        role VARCHAR(20) NOT NULL DEFAULT 'sales',
        status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        lastloginat TIMESTAMP
      );
    `);
    console.log('✅ 3. Table sales.staff created / verified.');

    // 4. Create trigger functions for password hashing
    await client.query(`
      CREATE OR REPLACE FUNCTION customer.trg_auto_hash_password()
      RETURNS TRIGGER AS $$
      BEGIN
        IF NEW.passwordHash IS NOT NULL AND NEW.passwordHash <> '' THEN
          IF NEW.passwordHash NOT SIMILAR TO '[$]2[abxy][$]%' THEN
            NEW.passwordHash := crypt(NEW.passwordHash, gen_salt('bf', 10));
          END IF;
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      DROP TRIGGER IF EXISTS trg_customer_users_hash_password ON customer.users;
      CREATE TRIGGER trg_customer_users_hash_password
      BEFORE INSERT OR UPDATE OF passwordHash ON customer.users
      FOR EACH ROW EXECUTE FUNCTION customer.trg_auto_hash_password();

      CREATE OR REPLACE FUNCTION sales.trg_auto_hash_password()
      RETURNS TRIGGER AS $$
      BEGIN
        IF NEW.passwordHash IS NOT NULL AND NEW.passwordHash <> '' THEN
          IF NEW.passwordHash NOT SIMILAR TO '[$]2[abxy][$]%' THEN
            NEW.passwordHash := crypt(NEW.passwordHash, gen_salt('bf', 10));
          END IF;
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      DROP TRIGGER IF EXISTS trg_sales_staff_hash_password ON sales.staff;
      CREATE TRIGGER trg_sales_staff_hash_password
      BEFORE INSERT OR UPDATE OF passwordHash ON sales.staff
      FOR EACH ROW EXECUTE FUNCTION sales.trg_auto_hash_password();
    `);
    console.log('✅ 4. Auto-hash password triggers created for customer.users & sales.staff.');

    // 5. Copy customers from admin.users -> customer.users
    const customerMigrateRes = await client.query(`
      INSERT INTO customer.users (id, fullName, email, passwordHash, phone, dob, address, gender, notes, role, status, createdAt, lastloginat)
      SELECT id, fullName, email, passwordHash, phone, dob, address, gender, notes, 'customer', status, createdAt, lastloginat
      FROM admin.users
      WHERE LOWER(role) = 'customer'
      ON CONFLICT (id) DO UPDATE SET
        fullName = EXCLUDED.fullName,
        email = EXCLUDED.email,
        passwordHash = EXCLUDED.passwordHash,
        phone = EXCLUDED.phone,
        dob = EXCLUDED.dob,
        address = EXCLUDED.address,
        gender = EXCLUDED.gender,
        notes = EXCLUDED.notes,
        status = EXCLUDED.status,
        lastloginat = EXCLUDED.lastloginat;
    `);
    console.log(`✅ 5. Migrated customers to customer.users (Count: ${customerMigrateRes.rowCount}).`);

    // 6. Copy sales staff from admin.users -> sales.staff
    const staffMigrateRes = await client.query(`
      INSERT INTO sales.staff (id, fullName, email, passwordHash, phone, dob, address, gender, notes, role, status, createdAt, lastloginat)
      SELECT id, fullName, email, passwordHash, phone, dob, address, gender, notes, role, status, createdAt, lastloginat
      FROM admin.users
      WHERE LOWER(role) IN ('sales', 'sales_staff', 'warehouse_staff', 'staff')
      ON CONFLICT (id) DO UPDATE SET
        fullName = EXCLUDED.fullName,
        email = EXCLUDED.email,
        passwordHash = EXCLUDED.passwordHash,
        phone = EXCLUDED.phone,
        dob = EXCLUDED.dob,
        address = EXCLUDED.address,
        gender = EXCLUDED.gender,
        notes = EXCLUDED.notes,
        status = EXCLUDED.status,
        lastloginat = EXCLUDED.lastloginat;
    `);
    console.log(`✅ 6. Migrated staff to sales.staff (Count: ${staffMigrateRes.rowCount}).`);

    // 7. Update Foreign Keys on dependent tables
    console.log('🔄 7. Cleaning orphan references and updating Foreign Key constraints...');

    // Dọn dẹp các bản ghi cart/review/wishlist của tài khoản admin/test không thuộc customer.users
    await client.query(`
      DELETE FROM sales.cart_items WHERE cartId IN (
        SELECT id FROM sales.carts WHERE userId NOT IN (SELECT id FROM customer.users)
      );
      DELETE FROM sales.carts WHERE userId NOT IN (SELECT id FROM customer.users);
      DELETE FROM customer.reviews WHERE userId NOT IN (SELECT id FROM customer.users);
      DELETE FROM customer.wishlists WHERE userId NOT IN (SELECT id FROM customer.users);
      UPDATE sales.orders SET userId = NULL WHERE userId NOT IN (SELECT id FROM customer.users);
    `);

    // Helper to drop constraint safely if exists
    const dropConstraint = async (table, constraint) => {
      await client.query(`ALTER TABLE ${table} DROP CONSTRAINT IF EXISTS ${constraint};`);
    };

    // sales.carts -> customer.users
    await dropConstraint('sales.carts', 'carts_userid_fkey');
    await dropConstraint('sales.carts', 'carts_userId_fkey');
    await client.query(`
      ALTER TABLE sales.carts
      ADD CONSTRAINT carts_userId_customer_fkey
      FOREIGN KEY (userId) REFERENCES customer.users(id) ON DELETE CASCADE;
    `);

    // customer.reviews -> customer.users
    await dropConstraint('customer.reviews', 'reviews_userid_fkey');
    await dropConstraint('customer.reviews', 'reviews_userId_fkey');
    await client.query(`
      ALTER TABLE customer.reviews
      ADD CONSTRAINT reviews_userId_customer_fkey
      FOREIGN KEY (userId) REFERENCES customer.users(id) ON DELETE CASCADE;
    `);

    // customer.wishlists -> customer.users
    await dropConstraint('customer.wishlists', 'wishlists_userid_fkey');
    await dropConstraint('customer.wishlists', 'wishlists_userId_fkey');
    await client.query(`
      ALTER TABLE customer.wishlists
      ADD CONSTRAINT wishlists_userId_customer_fkey
      FOREIGN KEY (userId) REFERENCES customer.users(id) ON DELETE CASCADE;
    `);

    // sales.orders -> customer.users (for userId)
    await dropConstraint('sales.orders', 'orders_userid_fkey');
    await dropConstraint('sales.orders', 'orders_userId_fkey');
    await client.query(`
      ALTER TABLE sales.orders
      ADD CONSTRAINT orders_userId_customer_fkey
      FOREIGN KEY (userId) REFERENCES customer.users(id) ON DELETE SET NULL;
    `);

    // sales.leads -> assignedToId (can be in sales.staff or null)
    await dropConstraint('sales.leads', 'leads_assignedtoid_fkey');
    await dropConstraint('sales.leads', 'leads_assignedToId_fkey');

    // 8. Delete migrated customers and sales staff from admin.users so admin.users strictly contains admin/manager
    const deleteFromAdminRes = await client.query(`
      DELETE FROM admin.users
      WHERE LOWER(role) IN ('customer', 'sales', 'sales_staff', 'warehouse_staff', 'staff');
    `);
    console.log(`✅ 8. Cleaned up non-admin rows from admin.users (Removed: ${deleteFromAdminRes.rowCount}).`);

    await client.query('COMMIT');
    console.log('🎉 Schema Separation & Data Migration completed successfully!');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed, rolled back:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

migrateSeparateSchemas().then(() => {
  console.log('Done.');
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
