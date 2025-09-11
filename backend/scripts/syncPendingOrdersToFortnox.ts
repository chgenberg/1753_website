import { PrismaClient } from '@prisma/client'
import { fortnoxService } from '../src/services/fortnoxService'
import { ongoingService } from '../src/services/ongoingService'
import { logger } from '../src/utils/logger'

const prisma = new PrismaClient()

/**
 * Manually sync all pending orders to Fortnox and Ongoing
 */
async function syncPendingOrdersToFortnox() {
  try {
    logger.info('Starting manual sync of pending orders to Fortnox and Ongoing')

    // Find all orders that should be synced but haven't been
    const pendingOrders = await prisma.order.findMany({
      where: {
        OR: [
          {
            status: { in: ['CONFIRMED', 'PROCESSING'] },
            paymentStatus: 'PAID'
          }
        ]
      },
      include: {
        items: {
          include: {
            product: true
          }
        },
        user: true
      }
    })

    logger.info(`Found ${pendingOrders.length} pending orders to sync`)

    if (pendingOrders.length === 0) {
      logger.info('No pending orders found')
      return
    }

    for (const order of pendingOrders) {
      try {
        logger.info(`Syncing order ${order.orderNumber} (${order.id})`)

        // Extract shipping address from JSON
        const shippingAddr = order.shippingAddress as any

        const orderData = {
          customer: {
            email: order.email,
            firstName: shippingAddr?.firstName || '',
            lastName: shippingAddr?.lastName || '',
            phone: order.phone || shippingAddr?.phone || '',
            address: shippingAddr?.address || '',
            apartment: shippingAddr?.apartment || '',
            city: shippingAddr?.city || '',
            postalCode: shippingAddr?.postalCode || '',
            country: shippingAddr?.country || ''
          },
          items: order.items.map(item => ({
            productId: item.productId,
            name: item.product?.name || item.title,
            price: item.price,
            quantity: item.quantity,
            sku: item.product?.sku || item.sku || ''
          })),
          orderId: order.id,
          total: order.totalAmount,
          shipping: order.shippingAmount,
          orderDate: order.createdAt
        }

        // Process Fortnox and Ongoing in parallel
        const [fortnoxResult, ongoingResult] = await Promise.allSettled([
          (async () => {
            logger.info('Processing Fortnox order', { orderId: order.id, orderNumber: order.orderNumber })
            const result = await fortnoxService.processOrder(orderData)
            logger.info('Fortnox order processed successfully', {
              orderId: order.id,
              customerNumber: result.customerNumber,
              orderNumber: result.orderNumber
            })
            return result
          })(),
          (async () => {
            logger.info('Processing Ongoing order', { orderId: order.id, orderNumber: order.orderNumber })
            const result = await ongoingService.processOrder(orderData)
            logger.info('Ongoing order processed successfully', {
              orderId: order.id,
              customerNumber: result.customerNumber,
              orderNumber: result.orderNumber
            })
            return result
          })()
        ])

        // Update order with integration references
        let internalNotes = order.internalNotes || ''
        
        if (fortnoxResult.status === 'fulfilled') {
          internalNotes += `\nFortnox order: ${fortnoxResult.value.orderNumber}`
          logger.info(`✅ Fortnox sync successful for order ${order.orderNumber}`)
        } else {
          logger.error(`❌ Failed to process Fortnox order ${order.orderNumber}:`, {
            orderId: order.id,
            error: fortnoxResult.reason?.message || 'Unknown error'
          })
        }

        if (ongoingResult.status === 'fulfilled') {
          internalNotes += `\nOngoing order: ${ongoingResult.value.orderNumber}`
          logger.info(`✅ Ongoing sync successful for order ${order.orderNumber}`)
        } else {
          logger.error(`❌ Failed to process Ongoing order ${order.orderNumber}:`, {
            orderId: order.id,
            error: ongoingResult.reason?.message || 'Unknown error'
          })
        }

        // Update order with all references
        if (internalNotes !== (order.internalNotes || '')) {
          await prisma.order.update({
            where: { id: order.id },
            data: { internalNotes: internalNotes.trim() }
          })
        }

      } catch (error) {
        logger.error(`Failed to sync order ${order.orderNumber}:`, error)
      }
    }

    logger.info('Completed manual sync of pending orders')

  } catch (error) {
    logger.error('Failed to sync pending orders:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run if called directly
if (require.main === module) {
  syncPendingOrdersToFortnox()
    .then(() => {
      logger.info('Manual sync completed successfully')
      process.exit(0)
    })
    .catch((error) => {
      logger.error('Manual sync failed:', error)
      process.exit(1)
    })
}

export { syncPendingOrdersToFortnox } 