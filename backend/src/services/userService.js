const db = require('../config/db');
const bcrypt = require('bcryptjs');
const { normalizeRole } = require('./dashboardService');

/**
 * Lấy danh sách toàn bộ User từ cả 3 schema (admin, sales, customer)
 */
async function getUsers() {
  const queryText = `
    SELECT 
      u.id, 
      u.fullname AS "fullName", 
      u.email, 
      u.role, 
      u.status, 
      u.phone, 
      u.address, 
      u.gender, 
      u.dob, 
      u.notes, 
      u.createdat AS "createdAt",
      u.lastloginat AS "lastLoginAt",
      u.schemagroup AS "schemaGroup",
      COALESCE(l.lead_count, 0)::int AS "assignedLeadsCount"
    FROM (
      SELECT id, fullname, email, role, status, phone, address, gender, dob, notes, createdat, lastloginat, 'admin' AS schemagroup FROM admin.users
      UNION ALL
      SELECT id, fullname, email, role, status, phone, address, gender, dob, notes, createdat, lastloginat, 'sales' AS schemagroup FROM sales.staff
      UNION ALL
      SELECT id, fullname, email, role, status, phone, address, gender, dob, notes, createdat, lastloginat, 'customer' AS schemagroup FROM customer.users
    ) u
    LEFT JOIN (
      SELECT assignedtoid, COUNT(id) AS lead_count 
      FROM sales.leads 
      WHERE assignedtoid IS NOT NULL 
      GROUP BY assignedtoid
    ) l ON u.id = l.assignedtoid
    ORDER BY u.createdat DESC
  `;

  const usersRes = await db.query(queryText);
  const users = usersRes.rows.map(u => ({
    ...u,
    role: normalizeRole(u.role),
    _count: { assignedLeads: u.assignedLeadsCount }
  }));

  // Lấy Permission Matrix từ admin.permission_settings
  let permissionsData = null;
  try {
    const permRes = await db.queryWithSchema('admin', "SELECT permissions FROM permission_settings WHERE role = 'GLOBAL_MATRIX' LIMIT 1");
    if (permRes.length > 0) {
      permissionsData = permRes[0].permissions;
      if (typeof permissionsData === 'string') {
        permissionsData = JSON.parse(permissionsData);
      }
    }
  } catch (e) {
    console.error('Error fetching permission matrix:', e);
  }

  const defaultMatrix = [
    { id: 'exec_dash', feature: 'Xem Executive Dashboard', superAdmin: true, manager: true, sales: false, other: false },
    { id: 'op_dash', feature: 'Xem Dashboard Vận Hành', superAdmin: true, manager: true, sales: true, other: false },
    { id: 'crud_lead', feature: 'Thêm / Sửa / Xoá Lead', superAdmin: true, manager: true, sales: true, other: false },
    { id: 'view_products', feature: 'Xem Danh Mục Sản Phẩm', superAdmin: true, manager: true, sales: true, other: true },
    { id: 'buy_products', feature: 'Đặt Hàng & Mua Sắm', superAdmin: true, manager: true, sales: true, other: true },
    { id: 'manage_products', feature: 'Quản Lý Sản Phẩm & Tồn Kho (CRM)', superAdmin: true, manager: true, sales: false, other: false },
    { id: 'view_user', feature: 'Xem Danh Sách User', superAdmin: true, manager: true, sales: true, other: false },
    { id: 'crud_user', feature: 'Thêm / Sửa / Xoá User', superAdmin: true, manager: false, sales: false, other: false },
    { id: 'export_report', feature: 'Xuất Báo Cáo', superAdmin: true, manager: true, sales: true, other: false }
  ];

  if (!permissionsData || !Array.isArray(permissionsData)) {
    permissionsData = defaultMatrix;
  } else {
    const existingIds = new Set(permissionsData.map(p => p.id));
    defaultMatrix.forEach(def => {
      if (!existingIds.has(def.id)) {
        permissionsData.push(def);
      }
    });
  }

  return { users, permissionMatrix: permissionsData };
}

/**
 * Tạo User mới vào đúng schema theo Role
 */
async function createUser(data) {
  const { fullName, email, password, phone, role, status, address, gender, dob, notes } = data;
  const cleanEmail = email.toLowerCase().trim();

  // Kiểm tra trùng email trên cả 3 schema
  const checkEmailQuery = `
    SELECT id FROM admin.users WHERE LOWER(email) = $1
    UNION ALL
    SELECT id FROM sales.staff WHERE LOWER(email) = $1
    UNION ALL
    SELECT id FROM customer.users WHERE LOWER(email) = $1
  `;
  const existing = await db.query(checkEmailQuery, [cleanEmail]);
  if (existing.rows.length > 0) {
    throw new Error('Email này đã được sử dụng.');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const normalizedRole = normalizeRole(role || 'SALES');

  // Xác định schema mục tiêu
  let targetSchema = 'admin';
  let targetTable = 'users';
  let schemaGroup = 'admin';

  if (normalizedRole === 'SALES') {
    targetSchema = 'sales';
    targetTable = 'staff';
    schemaGroup = 'sales';
  } else if (normalizedRole === 'OTHER' && (role || '').toLowerCase() === 'customer') {
    targetSchema = 'customer';
    targetTable = 'users';
    schemaGroup = 'customer';
  }

  const insertQuery = `
    INSERT INTO ${targetSchema}.${targetTable} (
      fullname, email, passwordhash, phone, address, gender, dob, notes, role, status, createdat
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW()
    ) RETURNING id, fullname AS "fullName", email, role, status, phone, address, gender, dob, notes, createdat AS "createdAt";
  `;

  const res = await db.query(insertQuery, [
    fullName,
    cleanEmail,
    hashedPassword,
    phone || null,
    address || null,
    gender || null,
    dob ? new Date(dob) : null,
    notes || null,
    normalizedRole,
    status || 'ACTIVE'
  ]);

  return { ...res.rows[0], schemaGroup };
}

/**
 * Cập nhật User
 */
async function updateUser(id, updateData) {
  const { fullName, email, phone, role, status, address, gender, dob, notes } = updateData;

  // Tìm user xem đang ở schema nào
  const findQuery = `
    SELECT id, 'admin' AS schemagroup, 'users' AS tablename FROM admin.users WHERE id = $1
    UNION ALL
    SELECT id, 'sales' AS schemagroup, 'staff' AS tablename FROM sales.staff WHERE id = $1
    UNION ALL
    SELECT id, 'customer' AS schemagroup, 'users' AS tablename FROM customer.users WHERE id = $1
  `;
  const userLoc = await db.query(findQuery, [id]);
  if (userLoc.rows.length === 0) {
    throw new Error('Không tìm thấy người dùng.');
  }

  const currentSchema = userLoc.rows[0].schemagroup;
  const currentTable = userLoc.rows[0].tablename;

  const targetRole = role ? normalizeRole(role) : undefined;
  
  // Xác định schema đích nếu có thay đổi role
  let targetSchema = currentSchema;
  let targetTable = currentTable;
  if (targetRole) {
    if (targetRole === 'SUPER_ADMIN' || targetRole === 'MANAGER') {
      targetSchema = 'admin';
      targetTable = 'users';
    } else if (targetRole === 'SALES') {
      targetSchema = 'sales';
      targetTable = 'staff';
    } else if (targetRole === 'OTHER' && (role || '').toLowerCase() === 'customer') {
      targetSchema = 'customer';
      targetTable = 'users';
    }
  }

  // Nếu chuyển schema (ví dụ từ sales sang admin hoặc ngược lại)
  if (targetSchema !== currentSchema) {
    // Lấy đầy đủ thông tin cũ
    const fullOldRes = await db.query(`SELECT * FROM ${currentSchema}.${currentTable} WHERE id = $1`, [id]);
    const old = fullOldRes.rows[0];

    // Chèn vào schema mới
    await db.query(`
      INSERT INTO ${targetSchema}.${targetTable} (
        id, fullname, email, passwordhash, phone, address, gender, dob, notes, role, status, createdat, lastloginat
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13
      )
    `, [
      old.id,
      fullName || old.fullname,
      email ? email.toLowerCase().trim() : old.email,
      old.passwordhash,
      phone !== undefined ? phone : old.phone,
      address !== undefined ? address : old.address,
      gender !== undefined ? gender : old.gender,
      dob !== undefined ? (dob ? new Date(dob) : null) : old.dob,
      notes !== undefined ? notes : old.notes,
      targetRole || old.role,
      status || old.status,
      old.createdat,
      old.lastloginat
    ]);

    // Xoá ở schema cũ
    await db.query(`DELETE FROM ${currentSchema}.${currentTable} WHERE id = $1`, [id]);

    return {
      id: old.id,
      fullName: fullName || old.fullname,
      email: email ? email.toLowerCase().trim() : old.email,
      role: targetRole || old.role,
      status: status || old.status,
      phone: phone !== undefined ? phone : old.phone,
      schemaGroup: targetSchema
    };
  }

  // Cập nhật tại chỗ
  const fields = [];
  const values = [];
  let idx = 1;

  if (fullName) { fields.push(`fullname = $${idx++}`); values.push(fullName); }
  if (email) { fields.push(`email = $${idx++}`); values.push(email.toLowerCase().trim()); }
  if (phone !== undefined) { fields.push(`phone = $${idx++}`); values.push(phone || null); }
  if (address !== undefined) { fields.push(`address = $${idx++}`); values.push(address || null); }
  if (gender !== undefined) { fields.push(`gender = $${idx++}`); values.push(gender || null); }
  if (dob !== undefined) { fields.push(`dob = $${idx++}`); values.push(dob ? new Date(dob) : null); }
  if (notes !== undefined) { fields.push(`notes = $${idx++}`); values.push(notes || null); }
  if (role) { fields.push(`role = $${idx++}`); values.push(normalizeRole(role)); }
  if (status) { fields.push(`status = $${idx++}`); values.push(status); }

  if (fields.length === 0) return { id };

  values.push(id);
  const updateQuery = `
    UPDATE ${currentSchema}.${currentTable}
    SET ${fields.join(', ')}
    WHERE id = $${idx}
    RETURNING id, fullname AS "fullName", email, role, status, phone, address, gender, dob, notes;
  `;

  const res = await db.query(updateQuery, values);
  return { ...res.rows[0], schemaGroup: currentSchema };
}

/**
 * Xoá User
 */
async function deleteUser(id) {
  // Huỷ gán Leads
  await db.query('UPDATE sales.leads SET assignedtoid = NULL WHERE assignedtoid = $1', [id]);

  // Xoá trên cả 3 bảng
  await db.query('DELETE FROM admin.users WHERE id = $1', [id]);
  await db.query('DELETE FROM sales.staff WHERE id = $1', [id]);
  await db.query('DELETE FROM customer.users WHERE id = $1', [id]);

  return { success: true };
}

/**
 * Cập nhật Permission Matrix
 */
async function updatePermissionMatrix(matrix) {
  const query = `
    INSERT INTO admin.permission_settings (role, permissions, updatedat)
    VALUES ('GLOBAL_MATRIX', $1::jsonb, NOW())
    ON CONFLICT (role) DO UPDATE SET
      permissions = EXCLUDED.permissions,
      updatedat = NOW();
  `;
  await db.query(query, [JSON.stringify(matrix)]);
  return { success: true };
}

module.exports = {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  updatePermissionMatrix
};
