import express from 'express'
import { requireAdmin, requireSuperAdmin } from '../middleware/adminAuth'
import {
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  processRefund,
  getOrderStatistics
} from '../controllers/adminController'

const router = express.Router()

// Admin authentication required for all routes
router.use(requireAdmin)

// Order management routes
router.get('/orders', getAllOrders)
router.get('/orders/statistics', getOrderStatistics)
router.get('/orders/:orderId', getOrderById)
router.put('/orders/:orderId/status', updateOrderStatus)
router.post('/orders/:orderId/refund', processRefund)

// Super admin only routes (for future expansion)
// router.get('/users', requireSuperAdmin, getAllUsers)
// router.put('/users/:userId/role', requireSuperAdmin, updateUserRole)

export default router 