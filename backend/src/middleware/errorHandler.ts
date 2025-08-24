import { Request, Response, NextFunction } from 'express'
import { logError, logSecurityEvent, logger } from '../utils/logger'

export interface ApiError extends Error {
  statusCode: number
  isOperational: boolean
}

export class AppError extends Error implements ApiError {
  statusCode: number
  isOperational: boolean

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = isOperational

    Error.captureStackTrace(this, this.constructor)
  }
}

// Specific error classes for better categorization
export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400, true)
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed') {
    super(message, 401, true)
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Access denied') {
    super(message, 403, true)
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404, true)
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests') {
    super(message, 429, true)
  }
}

export const errorHandler = (
  err: ApiError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let { statusCode = 500, message } = err
  let errorType = 'unknown'

  // Enhanced error context
  const errorContext = {
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: (req as any).user?.id,
    timestamp: new Date().toISOString(),
    requestId: req.headers['x-request-id'] || 'unknown'
  }

  // Categorize and handle different error types
  if (err.name === 'PrismaClientValidationError') {
    statusCode = 400
    message = 'Invalid data provided'
    errorType = 'validation'
  } else if ((err as any).code === 'P2002') {
    statusCode = 400
    message = 'Duplicate entry - resource already exists'
    errorType = 'database_constraint'
  } else if ((err as any).code === 'P2025') {
    statusCode = 404
    message = 'Resource not found'
    errorType = 'not_found'
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401
    message = 'Invalid token'
    errorType = 'authentication'
    logSecurityEvent('Invalid JWT token attempt', errorContext)
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401
    message = 'Token expired'
    errorType = 'authentication'
  } else if (err.name === 'ValidationError') {
    statusCode = 400
    errorType = 'validation'
  } else if (err.name === 'CastError') {
    statusCode = 400
    message = 'Invalid ID format'
    errorType = 'validation'
  } else if (err.name === 'MongoError' && (err as any).code === 11000) {
    statusCode = 400
    message = 'Duplicate field value'
    errorType = 'database_constraint'
  }

  // Security event logging for suspicious activities
  if (statusCode === 401 || statusCode === 403) {
    logSecurityEvent(`${statusCode} error: ${message}`, {
      ...errorContext,
      errorType
    })
  }

  // Log error with appropriate level
  if (statusCode >= 500) {
    // Server errors - always log with full details
    logError(`Server Error: ${message}`, err, {
      ...errorContext,
      errorType,
      statusCode
    })
  } else if (statusCode >= 400) {
    // Client errors - log as warning with limited details
    logger.warn(`Client Error: ${message}`, {
      ...errorContext,
      errorType,
      statusCode,
      // Don't log stack trace for client errors
      error: {
        name: err.name,
        message: err.message
      }
    })
  }

  // Don't expose internal errors in production
  if (process.env.NODE_ENV === 'production' && !err.isOperational) {
    message = 'Internal server error'
  }

  // Structured error response
  const errorResponse = {
    success: false,
    error: {
      message,
      type: errorType,
      statusCode,
      ...(process.env.NODE_ENV === 'development' && {
        stack: err.stack,
        details: err
      })
    },
    requestId: errorContext.requestId,
    timestamp: errorContext.timestamp
  }

  res.status(statusCode).json(errorResponse)
}

// Async error wrapper
export const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next)
}

// 404 handler
export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  const error = new NotFoundError(`Route ${req.originalUrl} not found`)
  next(error)
} 