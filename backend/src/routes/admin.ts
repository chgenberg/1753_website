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
import { fortnoxService } from '../services/fortnoxService'
import { ongoingService } from '../services/ongoingService'

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
        
        // Process order directly with Fortnox
        const shippingAddr = order.shippingAddress as any
        const billingAddr = order.billingAddress as any
        
        const fortnoxResult = await fortnoxService.processOrder({
          customer: {
            email: order.email,
            firstName: shippingAddr?.firstName || billingAddr?.firstName || '',
            lastName: shippingAddr?.lastName || billingAddr?.lastName || '',
            phone: shippingAddr?.phone || billingAddr?.phone || order.phone || '',
            address: shippingAddr?.address || billingAddr?.address || '',
            apartment: shippingAddr?.apartment || billingAddr?.apartment,
            city: shippingAddr?.city || billingAddr?.city || '',
            postalCode: shippingAddr?.postalCode || billingAddr?.postalCode || '',
            country: shippingAddr?.country || billingAddr?.country || 'SE'
          },
          items: order.items.map(item => ({
            productId: item.productId,
            name: item.product?.name || 'Okänd produkt',
            price: item.price,
            quantity: item.quantity,
            sku: item.product?.sku || item.productId
          })),
          orderId: order.orderNumber,
          total: order.totalAmount,
          shipping: order.shippingAmount,
          orderDate: order.createdAt
        })

        // Update order with Fortnox reference
        await prisma.order.update({
          where: { id: order.id },
          data: { 
            internalNotes: `Fortnox order: ${fortnoxResult.orderNumber}${order.internalNotes ? '\n' + order.internalNotes : ''}` 
          }
        })
        
        results.push({
          orderId: order.id,
          orderNumber: order.orderNumber,
          status: 'success',
          fortnoxOrderNumber: fortnoxResult.orderNumber
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

/**
 * Sync all products from database to Ongoing WMS
 * POST /api/admin/sync-products-to-ongoing
 */
router.post('/sync-products-to-ongoing', requireAdmin, async (req, res) => {
  try {
    logger.info('Starting product sync to Ongoing WMS')

    const products = await prisma.product.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        sku: true,
        price: true,
        weight: true,
        dimensions: true
      }
    })

    const results = []
    let successCount = 0
    let errorCount = 0

    for (const product of products) {
      try {
        const dimensions = product.dimensions as any || {}
        
        const ongoingArticle = {
          ArticleNumber: product.sku || product.id,
          ArticleName: product.name,
          ProductCode: product.sku || product.id,
          BarCode: product.sku || product.id,
          Weight: product.weight || 0,
          Length: dimensions.length || 0,
          Width: dimensions.width || 0,
          Height: dimensions.height || 0,
          Price: product.price,
          PurchasePrice: product.price * 0.6,
          ArticleGroupCode: 'SKINCARE',
          ArticleUnitCode: 'ST'
        }

        await ongoingService.createArticle(ongoingArticle)
        successCount++
        
        results.push({
          sku: product.sku,
          name: product.name,
          status: 'success'
        })

        await new Promise(resolve => setTimeout(resolve, 500))

      } catch (error: any) {
        errorCount++
        results.push({
          sku: product.sku,
          name: product.name,
          status: 'failed',
          error: error.message
        })
      }
    }

    res.json({
      message: `Product sync completed: ${successCount} success, ${errorCount} errors`,
      results
    })

  } catch (error: any) {
    logger.error('Product sync to Ongoing failed:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Product sync failed'
    })
  }
})

// Super admin only routes (for future expansion)
// router.get('/users', requireSuperAdmin, getAllUsers)
// router.put('/users/:userId/role', requireSuperAdmin, updateUserRole)

export default router 