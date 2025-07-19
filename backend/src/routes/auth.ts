import express from 'express'
import { body, validationResult } from 'express-validator'
import { 
  register, 
  login, 
  getProfile, 
  updateProfile, 
  addSkinJourneyEntry, 
  getSkinJourneyProgress,
  changePassword 
} from '../controllers/authController'
import { authenticateToken } from '../middleware/auth'

const router = express.Router()

// Registration validation
const registerValidation = [
  body('firstName').trim().isLength({ min: 1, max: 50 }).withMessage('Förnamn krävs (1-50 tecken)'),
  body('lastName').trim().isLength({ min: 1, max: 50 }).withMessage('Efternamn krävs (1-50 tecken)'),
  body('email').isEmail().normalizeEmail().withMessage('Giltig e-postadress krävs'),
  body('password').isLength({ min: 8 }).withMessage('Lösenord måste vara minst 8 tecken'),
  body('phone').optional().isMobilePhone('sv-SE').withMessage('Giltigt telefonnummer krävs'),
  body('skinType').optional().isIn(['dry', 'oily', 'combination', 'sensitive', 'normal', 'acne', 'mature']),
  body('skinConcerns').optional().isArray(),
  body('newsletter').optional().isBoolean()
]

// Login validation
const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Giltig e-postadress krävs'),
  body('password').notEmpty().withMessage('Lösenord krävs')
]

// Profile update validation
const profileUpdateValidation = [
  body('firstName').optional().trim().isLength({ min: 1, max: 50 }),
  body('lastName').optional().trim().isLength({ min: 1, max: 50 }),
  body('phone').optional().isMobilePhone('sv-SE'),
  body('skinType').optional().isIn(['dry', 'oily', 'combination', 'sensitive', 'normal', 'acne', 'mature']),
  body('skinConcerns').optional().isArray(),
  body('newsletter').optional().isBoolean(),
  body('emailNotifications').optional().isBoolean(),
  body('smsNotifications').optional().isBoolean(),
  body('orderUpdates').optional().isBoolean(),
  body('skinJourneyReminders').optional().isBoolean()
]

// Skin journey validation
const skinJourneyValidation = [
  body('skinCondition').isInt({ min: 1, max: 10 }).withMessage('Hudtillstånd måste vara mellan 1-10'),
  body('notes').optional().trim().isLength({ max: 1000 }).withMessage('Anteckningar får max vara 1000 tecken'),
  body('photos').optional().isArray(),
  body('photoType').optional().isIn(['before', 'progress', 'after'])
]

// Password change validation
const passwordChangeValidation = [
  body('currentPassword').notEmpty().withMessage('Nuvarande lösenord krävs'),
  body('newPassword').isLength({ min: 8 }).withMessage('Nytt lösenord måste vara minst 8 tecken')
]

// Public routes
router.post('/register', registerValidation, register)
router.post('/login', loginValidation, login)

// Protected routes (require authentication)
router.get('/profile', authenticateToken, getProfile)
router.put('/profile', authenticateToken, profileUpdateValidation, updateProfile)
router.post('/skin-journey', authenticateToken, skinJourneyValidation, addSkinJourneyEntry)
router.get('/skin-journey/progress', authenticateToken, getSkinJourneyProgress)
router.put('/change-password', authenticateToken, passwordChangeValidation, changePassword)

export default router 