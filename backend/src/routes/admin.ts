import express from 'express'
import { requireAdmin, requireSuperAdmin } from '../middleware/adminAuth'
import {
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  processRefund,
  getOrderStatistics
} from '../controllers/adminController'
import prisma from '../lib/prisma'
import { logger } from '../utils/logger'

const router = express.Router()

// Admin authentication required for all routes
router.use(requireAdmin)

// Order management routes
router.get('/orders', getAllOrders)
router.get('/orders/statistics', getOrderStatistics)
router.get('/orders/:orderId', getOrderById)
router.put('/orders/:orderId/status', updateOrderStatus)
router.post('/orders/:orderId/refund', processRefund)

/**
 * Manually sync all pending orders to Fortnox/Sybka+
 * POST /api/admin/sync-pending-orders
 */
router.post('/sync-pending-orders', requireAdmin, async (req, res) => {
  try {
    // Find all orders that should be synced but haven't been
    const pendingOrders = await prisma.order.findMany({
      where: {
        OR: [
          {
            status: { in: ['CONFIRMED', 'PROCESSING'] },
            paymentStatus: 'PAID'
          }
        ],
        // Add a check to avoid re-syncing already processed orders
        // You might want to add a 'syncedToFortnox' or 'syncedToSybka' field to your Order model
      },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    })

    const results = []
    
    for (const order of pendingOrders) {
      try {
        logger.info('Manually syncing order', { orderId: order.id, orderNumber: order.orderNumber })
        
        // Call the same logic as webhook handler
        const { handleOrderStatusChange } = require('./webhooks')
        await handleOrderStatusChange(order.id)
        
        results.push({
          orderId: order.id,
          orderNumber: order.orderNumber,
          status: 'success'
        })
      } catch (error) {
        logger.error('Failed to sync order', { orderId: order.id, error })
        results.push({
          orderId: order.id,
          orderNumber: order.orderNumber,
          status: 'failed',
          error: error.message
        })
      }
    }

    res.json({
      message: `Processed ${results.length} orders`,
      results
    })
  } catch (error) {
    logger.error('Failed to sync pending orders', error)
    res.status(500).json({ error: 'Failed to sync pending orders' })
  }
})

/**
 * Get sync status for all orders
 * GET /api/admin/orders/sync-status
 */
router.get('/orders/sync-status', async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        paymentStatus: true,
        totalAmount: true,
        createdAt: true,
        customerName: true,
        email: true
      }
    })

    const syncStatus = orders.map(order => ({
      ...order,
      shouldSyncToFortnox: ['CONFIRMED', 'PROCESSING'].includes(order.status),
      shouldSyncToSybka: order.paymentStatus === 'PAID',
      needsSync: (
        (['CONFIRMED', 'PROCESSING'].includes(order.status) || order.paymentStatus === 'PAID') &&
        // You might want to add a field to track if already synced
        true
      )
    }))

    res.json({
      totalOrders: syncStatus.length,
      needsSync: syncStatus.filter(o => o.needsSync).length,
      orders: syncStatus
    })
  } catch (error) {
    logger.error('Failed to get sync status', error)
    res.status(500).json({ error: 'Failed to get sync status' })
  }
})

// Super admin only routes (for future expansion)
// router.get('/users', requireSuperAdmin, getAllUsers)
// router.put('/users/:userId/role', requireSuperAdmin, updateUserRole)

export default router 