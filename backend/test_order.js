const prisma = require('./src/config/prisma');

async function main() {
  try {
    const user = await prisma.user.findFirst();
    if (!user) {
      console.log('No user found to test with.');
      return;
    }
    
    console.log('Testing with user:', user.id);
    
    const newOrder = await prisma.order.create({
      data: {
        userId: user.id,
        totalAmount: 150000,
        orderStatus: 'PENDING',
        paymentStatus: 'UNPAID',
        paymentMethod: 'COD',
        cancelReason: 'test note',
        orderItems: {
          create: [{
            productName: 'Test Product',
            selectedColor: 'Red',
            selectedStorage: '256GB',
            price: 150000,
            quantity: 1
          }]
        }
      },
      include: {
        user: { select: { fullName: true } }
      }
    });
    
    console.log('Order created successfully:', newOrder);
  } catch (error) {
    console.error('Error creating order:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
