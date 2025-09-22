
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkOrder() {
  try {
    const order = await prisma.order.findUnique({
      where: { id: 'cmfh0w7ia0001lm1mynjawp6e' },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });
    
    if (order) {
      console.log('Order Status:', order.status);
      console.log('Payment Status:', order.paymentStatus);
      console.log('Order Number:', order.orderNumber);
      console.log('Total:', order.totalAmount);
      console.log('Product:', order.items[0]?.product?.name);
    } else {
      console.log('Order not found');
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkOrder();

