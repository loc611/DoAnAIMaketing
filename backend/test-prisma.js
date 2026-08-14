const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  try {
    const newOrder = await prisma.order.create({
      data: {
        userId: null,
        totalAmount: 34999000,
        orderStatus: 'PENDING',
        paymentStatus: 'UNPAID',
        paymentMethod: 'COD',
        cancelReason: '',
        fullName: 'Tấn Lộc',
        phone: '0359897209',
        shippingAddress: 'Store 1',
        orderItems: {
          create: [{
            productName: 'iPhone 17 Pro Max',
            selectedColor: 'Trắng',
            selectedStorage: '256GB',
            price: 34999000,
            quantity: 1,
            image: ''
          }]
        }
      },
      include: {
        user: { select: { fullName: true } }
      }
    });
    console.log("Success:", newOrder.id);
  } catch (e) {
    console.error("Prisma Error:", e);
  } finally {
    await prisma.$disconnect();
  }
}
main();
