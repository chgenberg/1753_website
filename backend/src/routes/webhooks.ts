import { Router } from 'express'
import axios from 'axios'
import { logger } from '../utils/logger'
import { subscriptionService } from '../services/subscriptionService'

const router = Router()

/**
 * Viva Wallet webhook validation endpoint (GET)
 * GET /api/webhooks/viva-wallet
 */
router.get('/viva-wallet', async (req, res) => {
  try {
    logger.info('Received Viva Wallet webhook validation request (GET)')
    
    // Get Viva Wallet credentials from environment
    const merchantId = process.env.VIVA_MERCHANT_ID
    const apiKey = process.env.VIVA_API_KEY
    const baseUrl = process.env.VIVA_BASE_URL || 'https://demo.vivapayments.com'
    
    if (!merchantId || !apiKey) {
      logger.error('Viva Wallet credentials not configured for webhook validation')
      return res.status(500).json({ error: 'Webhook validation not configured' })
    }
    
    // Create Basic Auth header
    const credentials = Buffer.from(`${merchantId}:${apiKey}`).toString('base64')
    
    // Request verification key from Viva Wallet
    const response = await axios({
      method: 'GET',
      url: `${baseUrl}/api/messages/config/token`,
      headers: {
        'Authorization': `Basic ${credentials}`
      }
    })
    
    logger.info('Successfully retrieved Viva Wallet verification key')
    
    // Return the key in the expected format
    res.status(200).json({ Key: response.data.Key })
    
  } catch (error: any) {
    logger.error('Failed to validate Viva Wallet webhook', { error: error.message })
    res.status(500).json({ error: 'Webhook validation failed' })
  }
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