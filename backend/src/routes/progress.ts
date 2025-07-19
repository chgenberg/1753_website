import express from 'express'
import { body, param, query } from 'express-validator'
import {
  getProgressOverview,
  generateProgressReport,
  createSuggestion,
  getSuggestions,
  updateSuggestion
} from '../controllers/progressController'
import { authenticateToken } from '../middleware/auth'

const router = express.Router()

// All routes require authentication
router.use(authenticateToken)

// Progress overview
router.get('/overview', getProgressOverview)

// Monthly progress reports
router.post(
  '/reports/:month',
  [
    param('month').matches(/^\d{4}-\d{2}$/).withMessage('Month must be in YYYY-MM format')
  ],
  generateProgressReport
)

// Suggestions
router.get('/suggestions', getSuggestions)

router.post(
  '/suggestions',
  [
    body('type').isIn(['product', 'routine', 'lifestyle', 'seasonal']).withMessage('Invalid suggestion type'),
    body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Title required (1-200 characters)'),
    body('description').trim().isLength({ min: 1, max: 1000 }).withMessage('Description required (1-1000 characters)'),
    body('reason').trim().isLength({ min: 1, max: 500 }).withMessage('Reason required (1-500 characters)'),
    body('urgency').optional().isIn(['low', 'medium', 'high']),
    body('category').trim().notEmpty().withMessage('Category required'),
    body('triggers').optional().isArray(),
    body('productIds').optional().isArray(),
    body('validUntil').optional().isISO8601()
  ],
  createSuggestion
)

router.put(
  '/suggestions/:suggestionId',
  [
    param('suggestionId').isLength({ min: 1 }).withMessage('Suggestion ID required'),
    body('isRead').optional().isBoolean(),
    body('isAccepted').optional().isBoolean(),
    body('isHidden').optional().isBoolean(),
    body('rating').optional().isInt({ min: 1, max: 5 })
  ],
  updateSuggestion
)

export default router 