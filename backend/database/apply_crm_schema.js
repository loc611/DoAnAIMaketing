require('dotenv').config();
const { Client } = require('pg');

async function applyCrmSchema() {
  console.log('⚡ Updating PostgreSQL Constraints & CRM Schema...');

  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  await client.connect();

  try {
    // Drop existing users_role_check constraint if exists
    await client.query(`
      ALTER TABLE admin.users DROP CONSTRAINT IF EXISTS users_role_check;
    `);

    // Add updated role constraint supporting SUPER_ADMIN, SALES, VIEWER, etc.
    await client.query(`
      ALTER TABLE admin.users ADD CONSTRAINT users_role_check 
      CHECK (role IN ('SUPER_ADMIN', 'SALES', 'VIEWER', 'admin', 'manager', 'sales_staff', 'warehouse_staff', 'customer'));
    `);

    console.log('✅ Updated admin.users role check constraint!');

    // Create Enums if not exists
    await client.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'Temperature' AND typnamespace = 'sales'::regnamespace) THEN
          CREATE TYPE sales."Temperature" AS ENUM ('HOT', 'WARM', 'COLD');
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'LeadStatus' AND typnamespace = 'sales'::regnamespace) THEN
          CREATE TYPE sales."LeadStatus" AS ENUM ('NEW', 'CONTACTED', 'QUALIFIED', 'WON', 'LOST');
        END IF;
      END $$;
    `);

    // Create sales.leads table
    await client.query(`
      CREATE TABLE IF NOT EXISTS sales.leads (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(150) NOT NULL,
        email VARCHAR(150) NOT NULL,
        phone VARCHAR(20),
        productinterest VARCHAR(255) NOT NULL,
        budgetrange VARCHAR(50),
        source VARCHAR(50) NOT NULL,
        score INT NOT NULL DEFAULT 0,
        temperature sales."Temperature" NOT NULL DEFAULT 'COLD',
        status sales."LeadStatus" NOT NULL DEFAULT 'NEW',
        assignedtoid UUID REFERENCES admin.users(id) ON DELETE SET NULL,
        createdat TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedat TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create sales.lead_activities table
    await client.query(`
      CREATE TABLE IF NOT EXISTS sales.lead_activities (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        leadid UUID NOT NULL REFERENCES sales.leads(id) ON DELETE CASCADE,
        activitytype VARCHAR(50) NOT NULL,
        scoredelta INT NOT NULL,
        metadata JSONB,
        createdat TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('🎉 Database Schema & Constraints updated successfully!');
  } catch (err) {
    console.error('❌ Error applying CRM schema:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

applyCrmSchema();
