import { Router } from 'express'
import { logger } from '../utils/logger'
import { subscriptionService } from '../services/subscriptionService'

const router = Router()

/**
 * Viva Wallet webhook endpoint
 * POST /api/webhooks/viva-wallet
 */
router.post('/viva-wallet', async (req, res) => {
  try {
    const { OrderCode, StateId, Amount, TransactionId } = req.body
    
    logger.info('Received Viva Wallet webhook', { 
      orderCode: OrderCode,
      stateId: StateId,
      amount: Amount,
      transactionId: TransactionId
    })

    // Map Viva Wallet status to our internal status
    let status = 'pending'
    switch (StateId) {
      case 1: // Completed
        status = 'completed'
        break
      case 2: // Cancelled
        status = 'cancelled'
        break
      case 3: // Failed
      case 4: // Declined
        status = 'failed'
        break
      case 5: // Refunded
        status = 'refunded'
        break
      default:
        status = 'pending'
    }
    
    // Process the webhook
    await subscriptionService.processPaymentWebhook(OrderCode?.toString() || '', status)
    
    logger.info('Viva Wallet webhook processed successfully', {
      orderCode: OrderCode,
      status: status
    })

    // Respond to Viva Wallet with 200 OK
    res.status(200).json({ 
      success: true,
      received: true,
      orderCode: OrderCode
    })

  } catch (error: any) {
    logger.error('Error processing Viva Wallet webhook:', {
      error: error.message,
      body: req.body
    })
    
    // Still respond with 200 to prevent Viva Wallet from retrying
    res.status(200).json({
      success: false,
      error: 'Webhook processing failed'
    })
  }
})

export default router 