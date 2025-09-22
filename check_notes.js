
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkOrderNotes() {
  try {
    const order = await prisma.order.findUnique({
      where: { id: 'cmfh0w7ia0001lm1mynjawp6e' },
      select: {
        orderNumber: true,
        status: true,
        paymentStatus: true,
        internalNotes: true
      }
    });
    
    console.log('Order:', order.orderNumber);
    console.log('Status:', order.status);
    console.log('Payment Status:', order.paymentStatus);
    console.log('Internal Notes:', order.internalNotes);
    
    if (order.internalNotes && order.internalNotes.includes('Fortnox order:')) {
      console.log('✅ SUCCESS: Order was synced to Fortnox!');
    } else {
      console.log('❌ FAILED: Order was not synced to Fortnox');
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkOrderNotes();

