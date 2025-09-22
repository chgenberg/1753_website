
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateOrder() {
  try {
    const order = await prisma.order.update({
      where: { id: 'cmfh0w7ia0001lm1mynjawp6e' },
      data: {
        status: 'CONFIRMED',
        paymentStatus: 'PAID',
        updatedAt: new Date()
      }
    });
    
    console.log('Order updated successfully!');
    console.log('New Status:', order.status);
    console.log('New Payment Status:', order.paymentStatus);
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

updateOrder();

