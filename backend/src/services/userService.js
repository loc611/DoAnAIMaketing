const prisma = require('../config/prisma');
const bcrypt = require('bcryptjs');
const { normalizeRole } = require('./dashboardService'); // Reusing helper

async function getUsers() {
  const rawUsers = await prisma.user.findMany({
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
      status: true,
      phone: true,
      address: true,
      gender: true,
      dob: true,
      notes: true,
      createdAt: true,
      _count: { select: { assignedLeads: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  const users = rawUsers.map(u => ({
    ...u,
    role: normalizeRole(u.role)
  }));

  let permissionMatrix = await prisma.permissionSetting.findFirst({
    where: { role: 'GLOBAL_MATRIX' }
  });

  if (!permissionMatrix) {
    // Fallback default
    permissionMatrix = {
      permissions: [
        { id: 'exec_dash', feature: 'Xem Executive Dashboard', superAdmin: true, manager: true, sales: false, other: false },
        { id: 'op_dash', feature: 'Xem Dashboard Vận Hành', superAdmin: true, manager: true, sales: true, other: true },
        { id: 'crud_lead', feature: 'Thêm / Sửa / Xoá Lead', superAdmin: true, manager: true, sales: true, other: false },
        { id: 'view_user', feature: 'Xem Danh Sách User', superAdmin: true, manager: true, sales: false, other: false },
        { id: 'crud_user', feature: 'Thêm / Sửa / Xoá User', superAdmin: true, manager: false, sales: false, other: false },
        { id: 'export_report', feature: 'Xuất Báo Cáo', superAdmin: true, manager: true, sales: true, other: false }
      ]
    };
  }

  return { users, permissionMatrix: permissionMatrix.permissions };
}

async function createUser(data) {
  const { fullName, email, password, phone, role, status, address, gender, dob, notes } = data;
  const existingUser = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
  
  if (existingUser) {
    throw new Error('Email này đã được sử dụng.');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  return prisma.user.create({
    data: {
      fullName,
      email: email.toLowerCase().trim(),
      passwordHash: hashedPassword,
      phone: phone || null,
      address: address || null,
      gender: gender || null,
      dob: dob ? new Date(dob) : null,
      notes: notes || null,
      role: normalizeRole(role || 'SALES'),
      status: status || 'ACTIVE'
    },
    select: { id: true, fullName: true, email: true, role: true, status: true, phone: true, address: true, gender: true, dob: true, notes: true, createdAt: true }
  });
}

async function updateUser(id, updateData) {
  const { fullName, email, phone, role, status, address, gender, dob, notes } = updateData;
  const data = {};
  if (fullName) data.fullName = fullName;
  if (email) data.email = email.toLowerCase().trim();
  if (phone !== undefined) data.phone = phone || null;
  if (address !== undefined) data.address = address || null;
  if (gender !== undefined) data.gender = gender || null;
  if (dob !== undefined) data.dob = dob ? new Date(dob) : null;
  if (notes !== undefined) data.notes = notes || null;
  if (role) data.role = normalizeRole(role);
  if (status) data.status = status;

  return prisma.user.update({
    where: { id },
    data,
    select: { id: true, fullName: true, email: true, role: true, status: true, phone: true, address: true, gender: true, dob: true, notes: true }
  });
}

async function deleteUser(id) {
  await prisma.lead.updateMany({
    where: { assignedToId: id },
    data: { assignedToId: null }
  });
  return prisma.user.delete({ where: { id } });
}

async function updatePermissionMatrix(matrix) {
  return prisma.permissionSetting.upsert({
    where: { role: 'GLOBAL_MATRIX' },
    update: { permissions: matrix },
    create: { role: 'GLOBAL_MATRIX', permissions: matrix }
  });
}

module.exports = {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  updatePermissionMatrix
};
