import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { logger } from '../utils/logger'

const router = Router()
const prisma = new PrismaClient()

// Save quiz submission
router.post('/save', async (req, res) => {
  try {
    const { 
      email, 
      phone, 
      name, 
      skinType, 
      skinConcerns, 
      ageBracket, 
      allergens, 
      fragrancePreference, 
      currentRoutine, 
      additionalInfo,
      recommendedProducts 
    } = req.body

    // Save to database
    const quizSubmission = await prisma.quizSubmission.create({
      data: {
        email,
        phone,
        name,
        skinType,
        skinConcerns,
        ageBracket,
        allergens,
        fragrancePreference,
        currentRoutine,
        additionalInfo,
        recommendedProducts
      }
    })

    logger.info(`Quiz submission saved for ${email || phone || 'anonymous'}`)

    res.json({
      success: true,
      id: quizSubmission.id
    })
  } catch (error) {
    logger.error('Error saving quiz submission:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to save quiz submission'
    })
  }
})

// Get quiz statistics
router.get('/stats', async (req, res) => {
  try {
    const totalSubmissions = await prisma.quizSubmission.count()
    const last30Days = await prisma.quizSubmission.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      }
    })

    res.json({
      success: true,
      stats: {
        totalSubmissions,
        last30Days
      }
    })
  } catch (error) {
    logger.error('Error getting quiz stats:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to get quiz statistics'
    })
  }
})

export default router 