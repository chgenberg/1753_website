
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function findOrder() {
  try {
    const order = await prisma.order.findFirst({
      where: {
        orderNumber: '1753-1757694135283'
      },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });
    
    if (order) {
      console.log('Order found:');
      console.log('ID:', order.id);
      console.log('Order Number:', order.orderNumber);
      console.log('Status:', order.status);
      console.log('Payment Status:', order.paymentStatus);
      console.log('Payment Order Code:', order.paymentOrderCode);
      console.log('Total:', order.totalAmount);
      console.log('Items:', order.items.map(item => ({
        name: item.product?.name || item.title,
        quantity: item.quantity,
        price: item.price
      })));
    } else {
      console.log('Order not found');
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

findOrder();

