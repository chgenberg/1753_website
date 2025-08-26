import express from 'express'
import { subscriptionService } from '../services/subscriptionService'
import { authenticateToken as auth } from '../middleware/auth'
import { logger } from '../utils/logger'

const router = express.Router()

/**
 * Get all subscription plans
 */
router.get('/plans', async (req, res) => {
  try {
    const plans = await subscriptionService.getSubscriptionPlans()
    res.json(plans)
  } catch (error: any) {
    logger.error('Failed to get subscription plans', { error: error.message })
    res.status(500).json({ error: 'Failed to get subscription plans' })
  }
})

/**
 * Create a new subscription plan (admin only)
 */
router.post('/plans', auth, async (req, res) => {
  try {
    // TODO: Add admin role check
    const planData = req.body
    const plan = await subscriptionService.createSubscriptionPlan(planData)
    res.status(201).json(plan)
  } catch (error: any) {
    logger.error('Failed to create subscription plan', { error: error.message })
    res.status(500).json({ error: 'Failed to create subscription plan' })
  }
})

/**
 * Get user's subscriptions
 */
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params
    
    // TODO: Check if user can access this data (own data or admin)
    const subscriptions = await subscriptionService.getUserSubscriptions(userId)
    res.json(subscriptions)
  } catch (error: any) {
    logger.error('Failed to get user subscriptions', { 
      userId: req.params.userId,
      error: error.message 
    })
    res.status(500).json({ error: 'Failed to get subscriptions' })
  }
})

/**
 * Create a new subscription
 */
router.post('/', auth, async (req, res) => {
  try {
    const { userId, planId, paymentMethodId } = req.body
    
    // TODO: Validate that user can create subscription for this userId
    const subscription = await subscriptionService.createSubscription({
      userId,
      planId,
      paymentMethodId
    })
    
    res.status(201).json(subscription)
  } catch (error: any) {
    logger.error('Failed to create subscription', { 
      body: req.body,
      error: error.message 
    })
    res.status(500).json({ error: 'Failed to create subscription' })
  }
})

/**
 * Cancel a subscription
 */
router.post('/:subscriptionId/cancel', auth, async (req, res) => {
  try {
    const { subscriptionId } = req.params
    const { cancelAtPeriodEnd = true } = req.body
    
    // TODO: Check if user owns this subscription
    const subscription = await subscriptionService.cancelSubscription(
      subscriptionId,
      cancelAtPeriodEnd
    )
    
    res.json(subscription)
  } catch (error: any) {
    logger.error('Failed to cancel subscription', { 
      subscriptionId: req.params.subscriptionId,
      error: error.message 
    })
    res.status(500).json({ error: 'Failed to cancel subscription' })
  }
})

/**
 * Process subscription renewal (internal/cron job)
 */
router.post('/:subscriptionId/renew', async (req, res) => {
  try {
    const { subscriptionId } = req.params
    
    // TODO: Add API key authentication for cron jobs
    const invoice = await subscriptionService.processSubscriptionRenewal(subscriptionId)
    res.json(invoice)
  } catch (error: any) {
    logger.error('Failed to process subscription renewal', { 
      subscriptionId: req.params.subscriptionId,
      error: error.message 
    })
    res.status(500).json({ error: 'Failed to process renewal' })
  }
})

/**
 * Viva Wallet webhook for payment notifications
 */
router.post('/webhook/viva', async (req, res) => {
  try {
    const { OrderCode, StateId } = req.body
    
    // Map Viva Wallet status to our internal status
    let status = 'pending'
    switch (StateId) {
      case 1:
        status = 'completed'
        break
      case 2:
        status = 'cancelled'
        break
      case 3:
      case 4:
        status = 'failed'
        break
      case 5:
        status = 'refunded'
        break
    }
    
    await subscriptionService.processPaymentWebhook(OrderCode.toString(), status)
    
    res.status(200).json({ received: true })
  } catch (error: any) {
    logger.error('Failed to process Viva Wallet webhook', { 
      body: req.body,
      error: error.message 
    })
    res.status(500).json({ error: 'Webhook processing failed' })
  }
})

export default router 