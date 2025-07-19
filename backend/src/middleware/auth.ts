import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { prisma } from '../lib/prisma'

interface AuthRequest extends Request {
  userId?: string
  user?: any
}

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
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
    
    // Get user from database to ensure they still exist
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isEmailVerified: true
      }
    })

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Ogiltigt token'
      })
    }

    req.userId = decoded.userId
    req.user = user
    next()

  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Ogiltigt token'
    })
  }
}

// Optional authentication - don't fail if no token
export const optionalAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.split(' ')[1]

    if (token) {
      const secret = process.env.JWT_SECRET || 'fallback-secret'
      const decoded = jwt.verify(token, secret) as { userId: string }
      
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          isEmailVerified: true
        }
      })

      if (user) {
        req.userId = decoded.userId
        req.user = user
      }
    }

    next()
  } catch (error) {
    // Continue without authentication
    next()
  }
} 