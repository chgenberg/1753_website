// TEMPORARILY DISABLED - Auth controller using mongoose User model removed
// TODO: Implement authentication with Prisma User model when needed

/*
import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { User, IUser } from '../models/User'
import { AppError } from '../middleware/errorHandler'
import { logger } from '../utils/logger'
import { sendEmail } from '../services/emailService'

interface AuthRequest extends Request {
  user?: IUser
}

const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, process.env.JWT_SECRET as string, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  } as any)
}

const generateRefreshToken = (userId: string): string => {
  return jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET as string, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d',
  } as any)
}

const sendTokenResponse = (user: IUser, statusCode: number, res: Response) => {
  const token = generateToken(user.id)
  const refreshToken = generateRefreshToken(user.id)

  const options = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
  }

  res
    .status(statusCode)
    .cookie('token', token, options)
    .cookie('refreshToken', refreshToken, options)
    .json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          avatar: user.avatar,
          preferences: user.preferences,
          skinJourney: user.skinJourney,
        },
        token,
        refreshToken,
      },
    })
}

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { firstName, lastName, email, password, skinType, newsletter } = req.body

    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      throw new AppError('User already exists with this email', 400)
    }

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email: email.toLowerCase(),
      password,
      preferences: {
        language: 'sv',
        newsletter: newsletter || false,
        skinType: skinType || 'normal',
        skinConcerns: [],
        notifications: {
          email: true,
          sms: false,
          orderUpdates: true,
          skinJourneyReminders: true,
        },
      },
    })

    // Generate email verification token
    const verificationToken = crypto.randomBytes(32).toString('hex')
    user.emailVerificationToken = verificationToken
    await user.save()

    // Send verification email
    if (process.env.SMTP_HOST) {
      try {
        await sendEmail({
          to: user.email,
          subject: 'Verifiera din e-postadress - 1753 Skincare',
          template: 'emailVerification',
          data: {
            firstName: user.firstName,
            verificationUrl: `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`,
          },
        })
      } catch (error) {
        logger.error('Failed to send verification email:', error)
      }
    }

    logger.info(`New user registered: ${user.email}`)
    sendTokenResponse(user, 201, res)
  } catch (error) {
    next(error)
  }
}

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password, rememberMe: _rememberMe } = req.body

    // Validate email & password
    if (!email || !password) {
      throw new AppError('Please provide email and password', 400)
    }

    // Check for user
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password')
    if (!user || !(await user.comparePassword(password))) {
      throw new AppError('Invalid credentials', 401)
    }

    // Update last login
    user.lastLogin = new Date()
    await user.save()

    logger.info(`User logged in: ${user.email}`)
    sendTokenResponse(user, 200, res)
  } catch (error) {
    next(error)
  }
}

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (
  _req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    res
      .cookie('token', 'none', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true,
      })
      .cookie('refreshToken', 'none', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true,
      })
      .status(200)
      .json({
        success: true,
        message: 'Logged out successfully',
      })
  } catch (error) {
    next(error)
  }
}

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await User.findById(req.user!.id)
    
    res.status(200).json({
      success: true,
      data: user,
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Verify email
// @route   POST /api/auth/verify-email
// @access  Public
export const verifyEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { token } = req.body

    const user = await User.findOne({
      emailVerificationToken: token,
    })

    if (!user) {
      throw new AppError('Invalid verification token', 400)
    }

    user.isEmailVerified = true
    user.emailVerificationToken = undefined
    await user.save()

    logger.info(`Email verified for user: ${user.email}`)

    res.status(200).json({
      success: true,
      message: 'Email verified successfully',
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email } = req.body

    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) {
      throw new AppError('No user found with that email', 404)
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    user.passwordResetToken = resetToken
    user.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
    await user.save()

    // Send reset email
    if (process.env.SMTP_HOST) {
      try {
        await sendEmail({
          to: user.email,
          subject: 'Återställ ditt lösenord - 1753 Skincare',
          template: 'passwordReset',
          data: {
            firstName: user.firstName,
            resetUrl: `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`,
          },
        })
      } catch (error) {
        user.passwordResetToken = undefined
        user.passwordResetExpires = undefined
        await user.save()
        
        logger.error('Failed to send password reset email:', error)
        throw new AppError('Email could not be sent', 500)
      }
    }

    res.status(200).json({
      success: true,
      message: 'Password reset email sent',
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { token, password } = req.body

    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() },
    })

    if (!user) {
      throw new AppError('Invalid or expired reset token', 400)
    }

    // Set new password
    user.password = password
    user.passwordResetToken = undefined
    user.passwordResetExpires = undefined
    await user.save()

    logger.info(`Password reset for user: ${user.email}`)
    sendTokenResponse(user, 200, res)
  } catch (error) {
    next(error)
  }
}

// @desc    Refresh token
// @route   POST /api/auth/refresh
// @access  Public
export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { refreshToken } = req.cookies

    if (!refreshToken) {
      throw new AppError('No refresh token provided', 401)
    }

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET!) as { userId: string }
    const user = await User.findById(decoded.userId)

    if (!user) {
      throw new AppError('Invalid refresh token', 401)
    }

    sendTokenResponse(user, 200, res)
  } catch (error) {
    next(error)
  }
} 
*/

// Export empty functions to prevent import errors
export const register = (req: any, res: any) => {
  res.status(501).json({ message: 'Authentication not implemented yet' })
}

export const login = (req: any, res: any) => {
  res.status(501).json({ message: 'Authentication not implemented yet' })
}

export const logout = (req: any, res: any) => {
  res.status(501).json({ message: 'Authentication not implemented yet' })
}

export const getMe = (req: any, res: any) => {
  res.status(501).json({ message: 'Authentication not implemented yet' })
} 