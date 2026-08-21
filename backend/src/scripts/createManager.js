const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const bcrypt = require('bcryptjs');
const prisma = require('../config/prisma');

async function main() {
  const email = 'tanloc@gmail.com';
  const fullName = 'Cao Tấn Lộc';
  const plainPassword = 'loc123';
  const phone = '0987654321';
  const role = 'manager';
  const status = 'ACTIVE';

  console.log(`Bắt đầu tạo/cập nhật tài khoản ${email}...`);
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(plainPassword, salt);

  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  let user;
  if (existingUser) {
    user = await prisma.user.update({
      where: { email },
      data: {
        fullName,
        passwordHash,
        phone,
        role,
        status
      }
    });
    console.log(` Đã cập nhật thành công tài khoản [${role}]: ${user.email} (ID: ${user.id})`);
  } else {
    user = await prisma.user.create({
      data: {
        fullName,
        email,
        passwordHash,
        phone,
        role,
        status
      }
    });
    console.log(` Đã tạo mới thành công tài khoản [${role}]: ${user.email} (ID: ${user.id})`);
  }

  console.log('--- KẾT QUẢ TẠO TÀI KHOẢN ---');
  console.log(`ID: ${user.id}`);
  console.log(`Họ tên: ${user.fullName}`);
  console.log(`Email: ${user.email}`);
  console.log(`Mật khẩu gốc: ${plainPassword}`);
  console.log(`Mã Hash (Bcrypt): ${passwordHash}`);
  console.log(`Role: ${user.role}`);
  console.log(`Status: ${user.status}`);
}

main()
  .catch((e) => {
    console.error('Lỗi khi thực thi:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
