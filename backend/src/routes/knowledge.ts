import express from 'express'
import { body, param, query } from 'express-validator'
import {
  getPersonalizedContent,
  getEducationalContent,
  getContentById,
  updateLearningProgress,
  getVideoGuides,
  updateVideoProgress,
  getIngredients,
  getIngredientById,
  getIngredientBySlug,
  checkIngredientCompatibility
} from '../controllers/knowledgeController'
import { authenticateToken, optionalAuth } from '../middleware/auth'

const router = express.Router()

// Educational content routes
router.get('/content/personalized', authenticateToken, getPersonalizedContent)
router.get('/content', optionalAuth, getEducationalContent)
router.get('/content/:contentId', authenticateToken, getContentById)

router.put(
  '/content/:contentId/progress',
  authenticateToken,
  [
    param('contentId').isLength({ min: 1 }).withMessage('Content ID required'),
    body('status').optional().isIn(['not_started', 'in_progress', 'completed']),
    body('progressPercent').optional().isInt({ min: 0, max: 100 }),
    body('timeSpent').optional().isInt({ min: 0 }),
    body('rating').optional().isInt({ min: 1, max: 5 }),
    body('feedback').optional().trim().isLength({ max: 1000 }),
    body('bookmarked').optional().isBoolean()
  ],
  updateLearningProgress
)

// Video guides routes
router.get('/videos', authenticateToken, getVideoGuides)

router.put(
  '/videos/:videoId/progress',
  authenticateToken,
  [
    param('videoId').isLength({ min: 1 }).withMessage('Video ID required'),
    body('watchedDuration').optional().isInt({ min: 0 }),
    body('completed').optional().isBoolean(),
    body('rating').optional().isInt({ min: 1, max: 5 }),
    body('feedback').optional().trim().isLength({ max: 1000 }),
    body('bookmarked').optional().isBoolean()
  ],
  updateVideoProgress
)

// Ingredient encyclopedia routes
router.get('/ingredients', getIngredients)
router.get('/ingredients/id/:ingredientId', getIngredientById)
router.get('/ingredients/:slug', getIngredientBySlug)

router.post(
  '/ingredients/compatibility',
  [
    body('ingredientIds').isArray({ min: 2 }).withMessage('At least 2 ingredient IDs required'),
    body('ingredientIds.*').isLength({ min: 1 }).withMessage('Valid ingredient IDs required')
  ],
  checkIngredientCompatibility
)

export default router 