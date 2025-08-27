import { Router } from 'express'
import axios from 'axios'
import { logger } from '../utils/logger'
import { subscriptionService } from '../services/subscriptionService'

const router = Router()

/**
 * Viva Wallet webhook validation endpoint (GET)
 * GET /api/webhooks/viva-wallet
 */
router.get('/viva-wallet', (req, res) => {
  logger.info('Received Viva Wallet webhook validation request (GET)')
  
  // Return a simple validation response
  // Viva Wallet just needs to see that the endpoint is reachable
  res.status(200).json({ 
    Key: 'WEBHOOK_VALIDATION_OK',
    message: 'Webhook endpoint is active and ready to receive notifications'
  })
})

/**
 * Viva Wallet webhook endpoint
 * POST /api/webhooks/viva-wallet
 */
router.post('/viva-wallet', async (req, res) => {
  try {
    // Always respond with 200 OK first for Viva Wallet validation
    res.status(200).send('OK')
    
    const { OrderCode, StateId, Amount, TransactionId } = req.body
    
    // If this is just a validation ping (empty body), return early
    if (!OrderCode && !StateId) {
      logger.info('Received Viva Wallet validation ping')
      return
    }
    
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
    
    // Process the webhook asynchronously
    subscriptionService.processPaymentWebhook(OrderCode?.toString() || '', status)
      .then(() => {
        logger.info('Viva Wallet webhook processed successfully', {
          orderCode: OrderCode,
          status: status
        })
      })
      .catch((error) => {
        logger.error('Error processing Viva Wallet webhook:', {
          error: error.message,
          orderCode: OrderCode
        })
      })

  } catch (error: any) {
    logger.error('Error in Viva Wallet webhook handler:', {
      error: error.message,
      body: req.body
    })
    
    // Still respond with 200 OK
    if (!res.headersSent) {
      res.status(200).send('OK')
    }
  }
})

export default router 