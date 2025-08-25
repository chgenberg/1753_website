import { sybkaService } from '../services/sybkaService'
import { fortnoxService } from '../services/fortnoxService'
import { logger } from '../utils/logger'

/**
 * Sync completed orders from Sybka+ back to Fortnox
 * This should be run as a cron job every 5-10 minutes
 */
async function syncCompletedOrders() {
  try {
    logger.info('Starting sync of completed orders from Sybka+')

    // Get completed orders from Sybka+
    const completedOrders = await sybkaService.getCompletedOrders()
    
    if (completedOrders.length === 0) {
      logger.info('No completed orders to sync')
      return
    }

    logger.info(`Found ${completedOrders.length} completed orders to sync`)

    for (const order of completedOrders) {
      try {
        if (order.tracking_number && order.fortnox_invoice_id) {
          logger.info(`Updating Fortnox invoice ${order.fortnox_invoice_id} with tracking: ${order.tracking_number}`)

          // Update Fortnox with delivery status
          // Note: This would require implementing updateDeliveryStatus in fortnoxService
          // For now, we'll just log the information
          logger.info(`Order ${order.shop_order_id} shipped:`, {
            trackingNumber: order.tracking_number,
            carrier: order.carrier,
            shippedAt: order.shipped_at,
            fortnoxInvoiceId: order.fortnox_invoice_id
          })

          // TODO: Implement actual Fortnox delivery status update
          // await fortnoxService.updateDeliveryStatus(order.fortnox_invoice_id, {
          //   deliveryDate: order.shipped_at,
          //   trackingNumber: order.tracking_number,
          //   carrier: order.carrier
          // })

        } else {
          logger.warn(`Order ${order.shop_order_id} missing tracking or Fortnox invoice ID`)
        }
      } catch (error) {
        logger.error(`Failed to sync order ${order.shop_order_id}:`, error)
      }
    }

    logger.info('Completed sync of orders from Sybka+')

  } catch (error) {
    logger.error('Failed to sync completed orders:', error)
  }
}

// Run if called directly
if (require.main === module) {
  syncCompletedOrders()
    .then(() => {
      logger.info('Sync completed successfully')
      process.exit(0)
    })
    .catch((error) => {
      logger.error('Sync failed:', error)
      process.exit(1)
    })
}

export { syncCompletedOrders } 