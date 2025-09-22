
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getRecentOrders() {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });
    
    console.log('Recent orders:');
    orders.forEach(order => {
      console.log('---');
      console.log('ID:', order.id);
      console.log('Order Number:', order.orderNumber);
      console.log('Status:', order.status);
      console.log('Payment Status:', order.paymentStatus);
      console.log('Payment Order Code:', order.paymentOrderCode);
      console.log('Total:', order.totalAmount);
      console.log('Created:', order.createdAt);
      console.log('Items:', order.items.map(item => ({
        name: item.product?.name || item.title,
        quantity: item.quantity,
        price: item.price
      })));
    });
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

getRecentOrders();

