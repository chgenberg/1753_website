import express from 'express'
import { body, validationResult } from 'express-validator'
import { dripService } from '../services/dripService'
import { logger } from '../utils/logger'

const router = express.Router()

/**
 * Subscribe to newsletter
 * POST /api/newsletter/subscribe
 */
router.post(
  '/subscribe',
  [
    body('email').isEmail().normalizeEmail(),
    body('firstName').optional().trim().isLength({ min: 1, max: 50 }),
    body('lastName').optional().trim().isLength({ min: 1, max: 50 }),
    body('skinType').optional().isIn(['dry', 'oily', 'combination', 'sensitive', 'normal', 'acne', 'mature']),
    body('skinConcerns').optional().isArray(),
    body('interests').optional().isArray(),
    body('source').optional().isString()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        })
      }

      const { 
        email, 
        firstName, 
        lastName, 
        skinType, 
        skinConcerns = [], 
        interests = [],
        source = 'website'
      } = req.body

      // Subscribe to Drip
      const success = await dripService.subscribeUser({
        email,
        first_name: firstName,
        last_name: lastName,
        custom_fields: {
          skin_type: skinType,
          skin_concerns: skinConcerns,
          source,
          interests: interests.join(', ')
        },
        tags: ['Newsletter Signup', `Source: ${source}`]
      })

      if (success) {
        logger.info(`Newsletter subscription successful for ${email}`)
        res.json({
          success: true,
          message: 'Tack för din prenumeration! Du kommer snart att få vårt välkomstmail.'
        })
      } else {
        res.status(500).json({
          success: false,
          message: 'Något gick fel vid prenumerationen. Försök igen senare.'
        })
      }
    } catch (error: any) {
      logger.error('Newsletter subscription error:', error)
      res.status(500).json({
        success: false,
        message: 'Tekniskt fel. Försök igen senare.'
      })
    }
  }
)

/**
 * Unsubscribe from newsletter
 * POST /api/newsletter/unsubscribe
 */
router.post(
  '/unsubscribe',
  [
    body('email').isEmail().normalizeEmail()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        })
      }

      const { email } = req.body

      const success = await dripService.unsubscribeUser(email)

      if (success) {
        logger.info(`Newsletter unsubscribe successful for ${email}`)
        res.json({
          success: true,
          message: 'Du har avregistrerats från vårt nyhetsbrev.'
        })
      } else {
        res.status(500).json({
          success: false,
          message: 'Något gick fel vid avregistreringen.'
        })
      }
    } catch (error: any) {
      logger.error('Newsletter unsubscribe error:', error)
      res.status(500).json({
        success: false,
        message: 'Tekniskt fel. Försök igen senare.'
      })
    }
  }
)

/**
 * Update subscriber preferences
 * PUT /api/newsletter/preferences
 */
router.put(
  '/preferences',
  [
    body('email').isEmail().normalizeEmail(),
    body('preferences').isObject()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        })
      }

      const { email, preferences } = req.body

      // Update custom fields in Drip
      const success = await dripService.subscribeUser({
        email,
        custom_fields: preferences
      })

      if (success) {
        logger.info(`Newsletter preferences updated for ${email}`)
        res.json({
          success: true,
          message: 'Dina inställningar har uppdaterats.'
        })
      } else {
        res.status(500).json({
          success: false,
          message: 'Något gick fel vid uppdateringen.'
        })
      }
    } catch (error: any) {
      logger.error('Newsletter preferences update error:', error)
      res.status(500).json({
        success: false,
        message: 'Tekniskt fel. Försök igen senare.'
      })
    }
  }
)

/**
 * Track user actions for Drip workflows
 * POST /api/newsletter/track
 */
router.post(
  '/track',
  [
    body('email').isEmail().normalizeEmail(),
    body('action').isString(),
    body('data').optional().isObject()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        })
      }

      const { email, action, data = {} } = req.body

      // Define workflow mappings
      const workflowMap: Record<string, string | undefined> = {
        'quiz_completed': process.env.DRIP_QUIZ_COMPLETED_WORKFLOW_ID,
        'product_viewed': process.env.DRIP_PRODUCT_VIEWED_WORKFLOW_ID,
        'cart_abandoned': process.env.DRIP_CART_ABANDONED_WORKFLOW_ID,
        'blog_engaged': process.env.DRIP_BLOG_ENGAGED_WORKFLOW_ID
      }

      const workflowId = workflowMap[action]
      if (!workflowId) {
        return res.status(400).json({
          success: false,
          message: 'Unknown action type'
        })
      }

      // Trigger workflow
      const success = await dripService.triggerWorkflow(email, workflowId, {
        action_type: action,
        timestamp: new Date().toISOString(),
        ...data
      })

      // Add tracking tags
      await dripService.addTagsToSubscriber(email, [
        `Action: ${action}`,
        `Triggered: ${new Date().toISOString().split('T')[0]}`
      ])

      if (success) {
        logger.info(`Action tracked for ${email}: ${action}`)
        res.json({ success: true })
      } else {
        res.status(500).json({
          success: false,
          message: 'Failed to track action'
        })
      }
    } catch (error: any) {
      logger.error('Action tracking error:', error)
      res.status(500).json({
        success: false,
        message: 'Tekniskt fel vid spårning.'
      })
    }
  }
)

export default router 