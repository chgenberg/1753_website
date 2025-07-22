import express from 'express'
import { orderService } from '../services/orderService'
import { logger } from '../utils/logger'

const router = express.Router()

/**
 * Create payment order
 * POST /api/orders/payment
 */
router.post('/payment', async (req, res) => {
  try {
    const orderData = req.body

    // Validate required fields
    const requiredFields = ['customer', 'items', 'orderId', 'total']
    const missingFields = requiredFields.filter(field => !orderData[field])
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Missing required fields: ${missingFields.join(', ')}`
      })
    }

    // Generate unique order ID if not provided
    if (!orderData.orderId) {
      orderData.orderId = `1753-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }

    // Set order date
    orderData.orderDate = new Date()

    // Create payment in Viva Wallet
    const paymentResult = await orderService.createPayment(orderData)

    if (!paymentResult.success) {
      logger.error('Payment creation failed:', paymentResult.error)
      return res.status(400).json({
        success: false,
        error: paymentResult.error
      })
    }

    // Store order data temporarily (you should implement proper storage)
    // await storeOrderData(orderData)

    logger.info(`Payment created for order: ${orderData.orderId}`, {
      paymentId: paymentResult.paymentId,
      orderCode: paymentResult.orderCode
    })

    res.json({
      success: true,
      orderId: orderData.orderId,
      paymentId: paymentResult.paymentId,
      orderCode: paymentResult.orderCode,
      redirectUrl: paymentResult.redirectUrl
    })

  } catch (error: any) {
    logger.error('Error creating payment order:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
})

/**
 * Viva Wallet webhook endpoint
 * POST /api/orders/webhook/viva-wallet
 */
router.post('/webhook/viva-wallet', async (req, res) => {
  try {
    const signature = req.headers['x-viva-signature'] as string
    const payload = req.body

    logger.info('Received Viva Wallet webhook', { 
      orderCode: payload.OrderCode,
      stateId: payload.StateId 
    })

    // Process the webhook
    const result = await orderService.processPaymentWebhook(payload, signature)

    if (!result.success) {
      logger.error('Webhook processing failed:', result.errors)
      return res.status(400).json({
        success: false,
        errors: result.errors
      })
    }

    logger.info('Webhook processed successfully:', {
      orderId: result.orderId,
      fortnoxOrder: result.fortnoxOrderNumber,
      ongoingOrder: result.ongoingOrderNumber,
      warnings: result.warnings
    })

    // Respond to Viva Wallet
    res.json({
      success: true,
      orderId: result.orderId
    })

  } catch (error: any) {
    logger.error('Error processing Viva Wallet webhook:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
})

/**
 * Get order status
 * GET /api/orders/:orderId/status
 */
router.get('/:orderId/status', async (req, res) => {
  try {
    const { orderId } = req.params

    const status = await orderService.getOrderStatus(orderId)

    res.json({
      success: true,
      ...status
    })

  } catch (error: any) {
    logger.error('Error getting order status:', error)
    
    if (error.message === 'Order not found') {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      })
    }

    res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
})

/**
 * Test integrations
 * GET /api/orders/test/integrations
 */
router.get('/test/integrations', async (req, res) => {
  try {
    const results = await orderService.testIntegrations()

    const allWorking = Object.values(results).every(status => status === true)
    const statusCode = allWorking ? 200 : 206 // 206 = Partial Content

    res.status(statusCode).json({
      success: allWorking,
      integrations: results,
      message: allWorking 
        ? 'All integrations working' 
        : 'Some integrations have issues'
    })

  } catch (error: any) {
    logger.error('Error testing integrations:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
})

/**
 * Test Viva Wallet specifically
 * GET /api/orders/test/viva-wallet
 */
router.get('/test/viva-wallet', async (req, res) => {
  try {
    const { vivaWalletService } = await import('../services/vivaWalletService')
    
    // Test connection
    const connectionTest = await vivaWalletService.testConnection()
    
    let merchantInfo = null
    try {
      merchantInfo = await vivaWalletService.getMerchantInfo()
    } catch (merchantError) {
      // This might fail if endpoint doesn't exist, that's ok
    }

    res.json({
      success: connectionTest,
      connection: connectionTest,
      merchantInfo: merchantInfo,
      credentials: {
        merchantId: process.env.VIVA_MERCHANT_ID ? '✓ Set' : '✗ Missing',
        apiKey: process.env.VIVA_API_KEY ? '✓ Set' : '✗ Missing',
        sourceCode: process.env.VIVA_SOURCE_CODE || '1753_SKINCARE',
        baseUrl: process.env.VIVA_BASE_URL || 'https://api.vivapayments.com'
      }
    })

  } catch (error: any) {
    logger.error('Error testing Viva Wallet:', error)
    res.status(500).json({
      success: false,
      error: error.message,
      credentials: {
        merchantId: process.env.VIVA_MERCHANT_ID ? '✓ Set' : '✗ Missing',
        apiKey: process.env.VIVA_API_KEY ? '✓ Set' : '✗ Missing'
      }
    })
  }
})

/**
 * Create test payment (for testing Viva Wallet)
 * POST /api/orders/test/payment
 */
router.post('/test/payment', async (req, res) => {
  try {
    const testOrderData = {
      orderId: `TEST-${Date.now()}`,
      customer: {
        email: 'test@1753skincare.com',
        firstName: 'Test',
        lastName: 'Customer',
        phone: '+46701234567',
        address: 'Testgatan 1',
        apartment: '',
        city: 'Stockholm', 
        postalCode: '11122',
        country: 'SE'
      },
      items: [{
        productId: 'test-product',
        name: 'Test Product - 1753 Skincare',
        price: 99,
        quantity: 1,
        sku: 'TEST-SKU'
      }],
      subtotal: 99,
      shipping: 0,
      tax: 0,
      total: 99, // 99 SEK for testing
      currency: 'SEK',
      paymentMethod: 'card' as const,
      orderDate: new Date(),
      newsletter: false,
      comments: 'Test order for Viva Wallet integration'
    }

    const paymentResult = await orderService.createPayment(testOrderData)

    if (!paymentResult.success) {
      return res.status(400).json({
        success: false,
        error: paymentResult.error
      })
    }

    res.json({
      success: true,
      message: 'Test payment created successfully',
      orderId: testOrderData.orderId,
      paymentId: paymentResult.paymentId,
      orderCode: paymentResult.orderCode,
      redirectUrl: paymentResult.redirectUrl,
      instructions: 'Use this URL to test the payment flow. Use test card: 4111 1111 1111 1111'
    })

  } catch (error: any) {
    logger.error('Error creating test payment:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
})

/**
 * Manual order processing (for testing/admin)
 * POST /api/orders/:orderId/process
 */
router.post('/:orderId/process', async (req, res) => {
  try {
    const { orderId } = req.params
    const { forceProcess = false } = req.body

    // This would typically check if order is already processed
    // and only allow manual processing in specific cases

    logger.info(`Manual order processing requested: ${orderId}`)

    // You would implement order retrieval and processing here
    // const orderData = await getOrderData(orderId)
    // const result = await orderService.processOrder(orderData)

    res.json({
      success: true,
      message: 'Manual order processing not yet implemented',
      orderId
    })

  } catch (error: any) {
    logger.error('Error processing order manually:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
})

/**
 * Health check for order service
 * GET /api/orders/health
 */
router.get('/health', async (req, res) => {
  try {
    // Basic health check
    const integrations = await orderService.testIntegrations()
    
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        orderService: true,
        ...integrations
      }
    }

    const allHealthy = Object.values(healthStatus.services).every(status => status === true)
    
    if (!allHealthy) {
      healthStatus.status = 'degraded'
    }

    res.status(allHealthy ? 200 : 503).json(healthStatus)

  } catch (error: any) {
    logger.error('Health check failed:', error)
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    })
  }
})

export default router 