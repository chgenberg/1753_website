import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { User, IUser } from '../models/User'
import { AppError } from './errorHandler'

interface AuthRequest extends Request {
  user?: IUser
}

interface JwtPayload {
  userId: string
}

export const protect = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined

    // Get token from header
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1]
    }
    // Get token from cookie
    else if (req.cookies.token) {
      token = req.cookies.token
    }

    if (!token) {
      throw new AppError('Not authorized, no token', 401)
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload

    // Get user from token
    const user = await User.findById(decoded.userId).select('-password')
    if (!user) {
      throw new AppError('Not authorized, user not found', 401)
    }

    req.user = user
    next()
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AppError('Not authorized, invalid token', 401))
    } else {
      next(error)
    }
  }
}

export const authorize = (..._roles: string[]) => {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new AppError('Not authorized', 401)
    }

    // For now, we don't have roles in the user model
    // This can be extended later when we add admin functionality
    next()
  }
}

export const optionalAuth = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined

    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1]
    } else if (req.cookies.token) {
      token = req.cookies.token
    }

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload
      const user = await User.findById(decoded.userId).select('-password')
      if (user) {
        req.user = user
      }
    }

    next()
  } catch (error) {
    // Ignore errors in optional auth
    next()
  }
} 