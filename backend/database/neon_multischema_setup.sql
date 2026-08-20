-- ========================================================
-- KIẾN TRÚC MULTI-SCHEMA: HỆ THỐNG BÁN HÀNG APPLE
-- Cảnh báo: Chạy Script này sẽ Drop các Schema hiện tại.
-- ========================================================

-- 0. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. TẠO SCHEMA
DROP SCHEMA IF EXISTS admin CASCADE;
DROP SCHEMA IF EXISTS sales CASCADE;
DROP SCHEMA IF EXISTS inventory CASCADE;
DROP SCHEMA IF EXISTS customer CASCADE;

CREATE SCHEMA admin;
CREATE SCHEMA sales;
CREATE SCHEMA inventory;
CREATE SCHEMA customer;

-- ========================================================
-- 2. SCHEMA: ADMIN (Quản trị viên & Manager)
-- ========================================================

-- Bảng: admin.users
CREATE TABLE admin.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fullName VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    passwordHash VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'manager', 'sales_staff', 'warehouse_staff', 'customer')) DEFAULT 'customer',
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    lastloginat TIMESTAMP
);

-- Trigger Function: Tự động mã hóa mật khẩu bằng pgcrypto bcrypt nếu được truyền text thô
CREATE OR REPLACE FUNCTION admin.trg_auto_hash_password()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.passwordHash IS NOT NULL AND NEW.passwordHash <> '' THEN
        -- Kiểm tra nếu mật khẩu chưa ở dạng bcrypt ($2a$, $2b$, $2y$, $2x$)
        IF NEW.passwordHash NOT SIMILAR TO '[$]2[abxy][$]%' THEN
            NEW.passwordHash := crypt(NEW.passwordHash, gen_salt('bf', 10));
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_hash_password
BEFORE INSERT OR UPDATE OF passwordHash ON admin.users
FOR EACH ROW
EXECUTE FUNCTION admin.trg_auto_hash_password();

-- Bảng: admin.password_resets (Lưu mã OTP khôi phục mật khẩu)
CREATE TABLE admin.password_resets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(150) NOT NULL,
    otp VARCHAR(10) NOT NULL,
    expiresAt TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_password_resets_email_otp ON admin.password_resets(email, otp);

-- Bảng: admin.system_logs
CREATE TABLE admin.system_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staffId UUID REFERENCES admin.users(id) ON DELETE SET NULL,
    action VARCHAR(255) NOT NULL,
    description TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng: admin.promotions
CREATE TABLE admin.promotions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    discountPercent DECIMAL(5,2),
    validFrom TIMESTAMP,
    validUntil TIMESTAMP,
    createdBy UUID REFERENCES admin.users(id) ON DELETE SET NULL
);

-- Bảng: admin.permission_settings
CREATE TABLE admin.permission_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role VARCHAR(50) UNIQUE NOT NULL,
    permissions JSON NOT NULL,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================================================
-- 3. SCHEMA: SALES (Bán hàng & Quản lý Đơn)
-- ========================================================

-- Bảng: sales.orders
CREATE TABLE sales.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    userId UUID REFERENCES admin.users(id) ON DELETE CASCADE,
    totalAmount DECIMAL(15,2) NOT NULL,
    orderstatus VARCHAR(50) NOT NULL CHECK (orderstatus IN ('PENDING', 'PROCESSING', 'SHIPPING', 'COMPLETED', 'CANCELLED')) DEFAULT 'PENDING',
    paymentstatus VARCHAR(50) NOT NULL DEFAULT 'UNPAID',
    paymentMethod VARCHAR(50),
    transactionid VARCHAR(100),
    cancelReason TEXT,
    assignedStaffId UUID REFERENCES admin.users(id) ON DELETE SET NULL,
    fullname VARCHAR(100),
    phone VARCHAR(20),
    shippingaddress TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedat TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng: sales.order_items
CREATE TABLE sales.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    orderId UUID NOT NULL REFERENCES sales.orders(id) ON DELETE CASCADE,
    productName VARCHAR(255) NOT NULL,
    selectedColor VARCHAR(50),
    selectedStorage VARCHAR(50),
    price DECIMAL(15,2) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    image TEXT
);

-- Bảng: sales.customer_contacts (Leads CRM)
CREATE TABLE sales.customer_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fullName VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(150),
    productInterest VARCHAR(255),
    notes TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng: sales.carts
CREATE TABLE sales.carts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    userId UUID UNIQUE NOT NULL REFERENCES admin.users(id) ON DELETE CASCADE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng: sales.cart_items
CREATE TABLE sales.cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cartId UUID NOT NULL REFERENCES sales.carts(id) ON DELETE CASCADE,
    productId VARCHAR(255),
    productName VARCHAR(255) NOT NULL,
    selectedColor VARCHAR(50),
    selectedStorage VARCHAR(50),
    price DECIMAL(15,2) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    image TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TYPE sales.Temperature AS ENUM ('HOT', 'WARM', 'COLD');
CREATE TYPE sales.LeadStatus AS ENUM ('NEW', 'CONTACTED', 'QUALIFIED', 'WON', 'LOST');

-- Bảng: sales.leads
CREATE TABLE sales.leads (
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

-- Bảng: sales.lead_activities
CREATE TABLE sales.lead_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    leadId UUID NOT NULL REFERENCES sales.leads(id) ON DELETE CASCADE,
    activityType VARCHAR(50) NOT NULL,
    scoreDelta INT NOT NULL,
    metadata JSON,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================================================
-- 4. SCHEMA: INVENTORY (Kho hàng)
-- ========================================================

-- Bảng: inventory.products
CREATE TABLE inventory.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    basePrice DECIMAL(15,2) NOT NULL
);

-- Bảng: inventory.product_variants
CREATE TABLE inventory.product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    productId UUID NOT NULL REFERENCES inventory.products(id) ON DELETE CASCADE,
    color VARCHAR(50),
    storage VARCHAR(50),
    price DECIMAL(15,2) NOT NULL,
    stockQuantity INT NOT NULL DEFAULT 0
);

-- Bảng: inventory.stock_movements
CREATE TABLE inventory.stock_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    variantId UUID NOT NULL REFERENCES inventory.product_variants(id) ON DELETE CASCADE,
    changeType VARCHAR(20) NOT NULL CHECK (changeType IN ('IMPORT', 'EXPORT', 'ADJUST')),
    quantity INT NOT NULL,
    notes TEXT,
    createdByStaffId UUID REFERENCES admin.users(id) ON DELETE SET NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================================================
-- 5. SCHEMA: CUSTOMER (Khách hàng)
-- ========================================================

-- Bảng: customer.reviews
CREATE TABLE customer.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    userId UUID NOT NULL REFERENCES admin.users(id) ON DELETE CASCADE,
    productId UUID NOT NULL REFERENCES inventory.products(id) ON DELETE CASCADE,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng: customer.wishlists
CREATE TABLE customer.wishlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    userId UUID NOT NULL REFERENCES admin.users(id) ON DELETE CASCADE,
    productId UUID NOT NULL REFERENCES inventory.products(id) ON DELETE CASCADE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(userId, productId)
);

-- ========================================================
-- 6. SEED DATA (Dữ liệu mẫu)
-- LƯU Ý: Mật khẩu dưới đây là đã được mã hóa Hash bcrypt (Mật khẩu gốc: 123456)
-- ========================================================

INSERT INTO admin.users (fullName, email, passwordHash, role) VALUES 
('CEO Tim Cook', 'admin@apple.com', '$2b$10$NhyNiB3xgzqMtc2noj18p.6uiFBuWr.koxDYh0OD4/Ld6rkAhXNH.', 'admin'),
('Store Manager', 'manager@apple.com', '$2b$10$NhyNiB3xgzqMtc2noj18p.6uiFBuWr.koxDYh0OD4/Ld6rkAhXNH.', 'manager'),
('Nhân viên Sale 1', 'sale1@apple.com', '$2b$10$NhyNiB3xgzqMtc2noj18p.6uiFBuWr.koxDYh0OD4/Ld6rkAhXNH.', 'sales_staff'),
('Nhân viên Kho 1', 'kho1@apple.com', '$2b$10$NhyNiB3xgzqMtc2noj18p.6uiFBuWr.koxDYh0OD4/Ld6rkAhXNH.', 'warehouse_staff'),
('Khách hàng VIP', 'vip@gmail.com', '$2b$10$NhyNiB3xgzqMtc2noj18p.6uiFBuWr.koxDYh0OD4/Ld6rkAhXNH.', 'customer');
