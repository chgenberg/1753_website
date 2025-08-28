import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { prisma } from '../lib/prisma'
import { logger } from '../utils/logger'

interface AdminAuthRequest extends Request {
  userId?: string
  user?: any
}

export const requireAdmin = async (req: AdminAuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.split(' ')[1] // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Åtkomsttoken saknas'
      })
    }

    const secret = process.env.JWT_SECRET || 'fallback-secret'
    const decoded = jwt.verify(token, secret) as { userId: string }
    
    // Get user from database and check admin role
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isEmailVerified: true
      }
    })

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Ogiltigt token'
      })
    }

    // Check if user has admin role
    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      logger.warn(`Unauthorized admin access attempt by user: ${user.email}`)
      return res.status(403).json({
        success: false,
        message: 'Otillräckliga behörigheter'
      })
    }

    req.userId = decoded.userId
    req.user = user
    next()

  } catch (error) {
    logger.error('Admin auth error:', error)
    return res.status(401).json({
      success: false,
      message: 'Ogiltigt token'
    })
  }
}

export const requireSuperAdmin = async (req: AdminAuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Åtkomsttoken saknas'
      })
    }

    const secret = process.env.JWT_SECRET || 'fallback-secret'
    const decoded = jwt.verify(token, secret) as { userId: string }
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isEmailVerified: true
      }
    })

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Ogiltigt token'
      })
    }

    if (user.role !== 'SUPER_ADMIN') {
      logger.warn(`Unauthorized super admin access attempt by user: ${user.email}`)
      return res.status(403).json({
        success: false,
        message: 'Otillräckliga behörigheter - endast super admin'
      })
    }

    req.userId = decoded.userId
    req.user = user
    next()

  } catch (error) {
    logger.error('Super admin auth error:', error)
    return res.status(401).json({
      success: false,
      message: 'Ogiltigt token'
    })
  }
} 