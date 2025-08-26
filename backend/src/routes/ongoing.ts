import { Router } from 'express'
import { ongoingService } from '../services/ongoingService'
import { logger } from '../utils/logger'

const router = Router()

/**
 * Test Ongoing WMS connection
 * GET /api/ongoing/test
 */
router.get('/test', async (req, res) => {
  try {
    logger.info('Testing Ongoing WMS connection via API endpoint')
    
    const isConnected = await ongoingService.testConnection()
    
    if (isConnected) {
      res.json({
        success: true,
        message: 'Ongoing WMS connection successful',
        timestamp: new Date().toISOString(),
        endpoint: 'SOAP API',
        status: 'Connected'
      })
    } else {
      res.status(500).json({
        success: false,
        message: 'Ongoing WMS connection failed',
        timestamp: new Date().toISOString(),
        endpoint: 'SOAP API',
        status: 'Disconnected'
      })
    }
  } catch (error: any) {
    logger.error('Ongoing WMS test endpoint error:', error)
    
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
      timestamp: new Date().toISOString()
    })
  }
})

/**
 * Get Ongoing WMS configuration status
 * GET /api/ongoing/status
 */
router.get('/status', (req, res) => {
  const config = {
    username: process.env.ONGOING_USERNAME ? '✅ Set' : '❌ Not set',
    password: process.env.ONGOING_PASSWORD ? '✅ Set' : '❌ Not set',
    goodsOwnerId: process.env.ONGOING_GOODS_OWNER_ID ? '✅ Set' : '❌ Not set',
    baseUrl: process.env.ONGOING_BASE_URL ? '✅ Set' : '❌ Not set'
  }
  
  const allConfigured = Object.values(config).every(status => status.includes('✅'))
  
  res.json({
    success: true,
    message: 'Ongoing WMS configuration status',
    configured: allConfigured,
    config,
    timestamp: new Date().toISOString()
  })
})

export default router 