import { Request, Response } from 'express'
import { validationResult } from 'express-validator'
import bcrypt from 'bcrypt'
import * as jwt from 'jsonwebtoken'
import { prisma } from '../lib/prisma'
import { logger } from '../utils/logger'
import { dripService } from '../services/dripService'

// Generate JWT token
const generateToken = (userId: string): string => {
  const secret = process.env.JWT_SECRET || 'fallback-secret'
  return jwt.sign({ userId }, secret, { expiresIn: '7d' })
}

// Register new user
export const register = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      })
    }

    const { 
      firstName, 
      lastName, 
      email, 
      password, 
      phone,
      skinType,
      skinConcerns = [],
      newsletter = false,
      quizAnswers
    } = req.body

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'En användare med denna e-post finns redan'
      })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email: email.toLowerCase(),
        password: hashedPassword,
        phone,
        skinType,
        skinConcerns,
        newsletter,
        isEmailVerified: false
      }
    })

    // Create initial skin journey entry if quiz answers provided
    if (quizAnswers) {
      await prisma.skinJourneyEntry.create({
        data: {
          userId: user.id,
          skinCondition: 5, // Default starting rating
          notes: `Startpunkt för hudresan. Quiz genomförd: ${JSON.stringify(quizAnswers)}`,
          photoType: 'before'
        }
      })
    }

    // Subscribe to Drip if newsletter is selected
    if (newsletter) {
      try {
        await dripService.subscribeUser({
          email: email.toLowerCase(),
          first_name: firstName,
          last_name: lastName,
          custom_fields: {
            skin_type: skinType,
            skin_concerns: skinConcerns,
            source: 'user_registration'
          },
          tags: ['New User', 'Newsletter Signup', 'User Registration']
        })
        logger.info(`User subscribed to Drip newsletter: ${email}`)
      } catch (error) {
        logger.error(`Failed to subscribe user to Drip: ${email}`, error)
        // Don't fail registration if Drip subscription fails
      }
    }

    // Generate token
    const token = generateToken(user.id)

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user

    logger.info(`User registered: ${email}`)

    res.status(201).json({
      success: true,
      message: 'Konto skapat framgångsrikt!',
      data: {
        user: userWithoutPassword,
        token
      }
    })

  } catch (error) {
    logger.error('Registration error:', error)
    res.status(500).json({
      success: false,
      message: 'Ett fel uppstod vid registrering'
    })
  }
}

// Login user
export const login = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      })
    }

    const { email, password } = req.body

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        skinJourneyEntries: {
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        addresses: true
      }
    })

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Ogiltiga inloggningsuppgifter'
      })
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Ogiltiga inloggningsuppgifter'
      })
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    })

    // Generate token
    const token = generateToken(user.id)

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user

    logger.info(`User logged in: ${email}`)

    res.json({
      success: true,
      message: 'Inloggning lyckades!',
      data: {
        user: userWithoutPassword,
        token
      }
    })

  } catch (error) {
    logger.error('Login error:', error)
    res.status(500).json({
      success: false,
      message: 'Ett fel uppstod vid inloggning'
    })
  }
}

// Get user profile
export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        skinJourneyEntries: {
          orderBy: { createdAt: 'desc' },
          take: 50
        },
        addresses: true,
        orders: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: { items: true }
        }
      }
    })

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Användare hittades inte'
      })
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user

    res.json({
      success: true,
      data: userWithoutPassword
    })

  } catch (error) {
    logger.error('Get profile error:', error)
    res.status(500).json({
      success: false,
      message: 'Ett fel uppstod'
    })
  }
}

// Update user profile
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      })
    }

    const userId = (req as any).userId
    const updateData = req.body

    // Remove sensitive fields that shouldn't be updated directly
    delete updateData.id
    delete updateData.password
    delete updateData.email // Email changes should require verification

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData
    })

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user

    res.json({
      success: true,
      message: 'Profil uppdaterad!',
      data: userWithoutPassword
    })

  } catch (error) {
    logger.error('Update profile error:', error)
    res.status(500).json({
      success: false,
      message: 'Ett fel uppstod vid uppdatering'
    })
  }
}

// Add skin journey entry
export const addSkinJourneyEntry = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      })
    }

    const userId = (req as any).userId
    const { skinCondition, notes, photos = [], photoType = 'progress' } = req.body

    const entry = await prisma.skinJourneyEntry.create({
      data: {
        userId,
        skinCondition,
        notes,
        photos,
        photoType
      }
    })

    logger.info(`Skin journey entry added for user: ${userId}`)

    res.status(201).json({
      success: true,
      message: 'Hudreseinlägg tillagt!',
      data: entry
    })

  } catch (error) {
    logger.error('Add skin journey entry error:', error)
    res.status(500).json({
      success: false,
      message: 'Ett fel uppstod vid sparning'
    })
  }
}

// Get skin journey progress
export const getSkinJourneyProgress = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId

    const entries = await prisma.skinJourneyEntry.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' }
    })

    // Calculate progress statistics
    const totalEntries = entries.length
    const latestEntry = entries[entries.length - 1]
    const firstEntry = entries[0]
    
    const averageCondition = totalEntries > 0 
      ? entries.reduce((sum, entry) => sum + entry.skinCondition, 0) / totalEntries
      : 0

    const improvement = firstEntry && latestEntry 
      ? latestEntry.skinCondition - firstEntry.skinCondition
      : 0

    // Group entries by month for charts
    const monthlyData = entries.reduce((acc, entry) => {
      const month = entry.createdAt.toISOString().substring(0, 7) // YYYY-MM
      if (!acc[month]) {
        acc[month] = []
      }
      acc[month].push(entry)
      return acc
    }, {} as Record<string, any[]>)

    const progressData = Object.entries(monthlyData).map(([month, monthEntries]) => ({
      month,
      averageCondition: monthEntries.reduce((sum, entry) => sum + entry.skinCondition, 0) / monthEntries.length,
      entryCount: monthEntries.length
    }))

    res.json({
      success: true,
      data: {
        entries,
        stats: {
          totalEntries,
          averageCondition: Math.round(averageCondition * 10) / 10,
          improvement: Math.round(improvement * 10) / 10,
          currentCondition: latestEntry?.skinCondition || 0,
          daysTracking: totalEntries > 0 
            ? Math.ceil((new Date().getTime() - firstEntry.createdAt.getTime()) / (1000 * 60 * 60 * 24))
            : 0
        },
        progressData
      }
    })

  } catch (error) {
    logger.error('Get skin journey progress error:', error)
    res.status(500).json({
      success: false,
      message: 'Ett fel uppstod'
    })
  }
}

// Change password
export const changePassword = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      })
    }

    const userId = (req as any).userId
    const { currentPassword, newPassword } = req.body

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Användare hittades inte'
      })
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password)
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Nuvarande lösenord är felaktigt'
      })
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12)

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword }
    })

    logger.info(`Password changed for user: ${userId}`)

    res.json({
      success: true,
      message: 'Lösenord ändrat framgångsrikt!'
    })

  } catch (error) {
    logger.error('Change password error:', error)
    res.status(500).json({
      success: false,
      message: 'Ett fel uppstod'
    })
  }
} 