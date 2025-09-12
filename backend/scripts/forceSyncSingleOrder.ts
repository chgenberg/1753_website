import { PrismaClient } from '@prisma/client'
import { fortnoxService } from '../src/services/fortnoxService'
import { logger } from '../src/utils/logger'

const prisma = new PrismaClient()

// Det specifika ordernumret vi vill synka
const TARGET_ORDER_NUMBER = '1753-1757689009888-ZM0T966V9';

async function forceSyncSingleOrder() {
  logger.info(`--- Starting Force Sync for order: ${TARGET_ORDER_NUMBER} ---`);

  try {
    // 1. Hämta den specifika ordern från databasen
    const order = await prisma.order.findUnique({
      where: { orderNumber: TARGET_ORDER_NUMBER },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        user: true,
      },
    });

    if (!order) {
      logger.error(`Could not find order with order number: ${TARGET_ORDER_NUMBER}`);
      return;
    }

    logger.info('Order found in database. Current status:', { 
      status: order.status, 
      paymentStatus: order.paymentStatus 
    });

    // 2. Konstruera Fortnox-payloaden
    const orderData = {
      customer: {
        email: order.email,
        firstName: (order.shippingAddress as any)?.firstName || 'N/A',
        lastName: (order.shippingAddress as any)?.lastName || 'N/A',
        phone: (order.shippingAddress as any)?.phone || order.phone || '',
        address: (order.shippingAddress as any)?.address || '',
        apartment: (order.shippingAddress as any)?.apartment || '',
        city: (order.shippingAddress as any)?.city || '',
        postalCode: (order.shippingAddress as any)?.postalCode || '',
        country: (order.shippingAddress as any)?.country || 'SE',
      },
      items: order.items.map(item => ({
        productId: item.productId,
        name: item.product?.name || 'Okänd produkt',
        price: item.price,
        quantity: item.quantity,
        sku: item.product?.sku || undefined, // Konvertera null till undefined
        weight: item.product?.weight
      })),
      orderId: order.orderNumber,
      total: order.totalAmount,
      shipping: order.shippingAmount,
      orderDate: order.createdAt,
      deliveryInstruction: order.customerNotes
    };

    // 3. Logga den kompletta payloaden för felsökning
    logger.info('Constructed Fortnox payload:', { payload: orderData });

    // 4. Gör det faktiska API-anropet med detaljerad felhantering
    logger.info('Attempting to send order to Fortnox...');
    const result = await fortnoxService.processOrder(orderData);
    
    logger.info('✅ Fortnox sync successful!', { result });

    // 5. Uppdatera orderstatus och interna anteckningar i databasen
    await prisma.order.update({
        where: { id: order.id },
        data: {
            status: 'CONFIRMED',
            paymentStatus: 'PAID',
            internalNotes: (order.internalNotes || '') + `\nMANUAL SYNC: Fortnox order: ${result.orderNumber}`
        }
    });
    logger.info('Database status updated for order.', { orderId: order.id });


  } catch (error: any) {
    logger.error('💥 An error occurred during the force sync process.', {
      errorMessage: error.message,
      errorStack: error.stack,
      // Om det är ett Axios-fel, logga den detaljerade responsen
      axiosErrorResponse: error.response?.data
    });
  } finally {
    await prisma.$disconnect();
    logger.info(`--- Force Sync Finished for order: ${TARGET_ORDER_NUMBER} ---`);
  }
}

if (require.main === module) {
  forceSyncSingleOrder();
} 