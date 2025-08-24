import { Request, Response, NextFunction } from 'express'
import { logApiRequest, logWarning } from '../utils/logger'

// Extend Request interface to include timing
declare global {
  namespace Express {
    interface Request {
      startTime?: number
      requestId?: string
    }
  }
}

// Generate unique request ID
const generateRequestId = (): string => {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Request logging middleware
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  // Skip logging for health checks and static assets
  if (req.url === '/health' || req.url.startsWith('/static') || req.url.includes('favicon')) {
    return next()
  }

  // Add request ID and start time
  req.requestId = generateRequestId()
  req.startTime = Date.now()

  // Add request ID to response headers (useful for debugging)
  res.setHeader('X-Request-ID', req.requestId)

  // Log request start (only in development or for errors)
  if (process.env.NODE_ENV === 'development') {
    console.log(`→ ${req.method} ${req.url} [${req.requestId}]`)
  }

  // Override res.end to capture response
  const originalEnd = res.end.bind(res)
  res.end = function(chunk?: any, encoding?: any, cb?: () => void) {
    const duration = Date.now() - (req.startTime || Date.now())
    const userId = (req as any).user?.id

    // Log API request
    logApiRequest(req.method, req.url, res.statusCode, duration, userId)

    // Log slow requests as warnings
    if (duration > 5000) { // 5 seconds
      logWarning('Slow API request detected', {
        method: req.method,
        url: req.url,
        duration_ms: duration,
        statusCode: res.statusCode,
        userId,
        requestId: req.requestId
      })
    }

    // Log errors (4xx, 5xx) with additional context
    if (res.statusCode >= 400) {
      const logLevel = res.statusCode >= 500 ? 'error' : 'warn'
      const message = `${req.method} ${req.url} - ${res.statusCode}`
      
      if (logLevel === 'error') {
        logWarning(message, {
          method: req.method,
          url: req.url,
          statusCode: res.statusCode,
          duration_ms: duration,
          userId,
          requestId: req.requestId,
          userAgent: req.get('User-Agent'),
          ip: req.ip
        })
      }
    }

    // Development logging
    if (process.env.NODE_ENV === 'development') {
      const statusColor = res.statusCode >= 500 ? '\x1b[31m' : // red
                         res.statusCode >= 400 ? '\x1b[33m' : // yellow
                         res.statusCode >= 300 ? '\x1b[36m' : // cyan
                         '\x1b[32m' // green
      
      console.log(`← ${statusColor}${res.statusCode}\x1b[0m ${req.method} ${req.url} [${req.requestId}] ${duration}ms`)
    }

    return originalEnd(chunk, encoding, cb)
  }

  next()
}

// Rate limiting logging
export const logRateLimitHit = (req: Request, limit: number, windowMs: number) => {
  logWarning('Rate limit exceeded', {
    type: 'rate_limit',
    ip: req.ip,
    url: req.url,
    method: req.method,
    userAgent: req.get('User-Agent'),
    limit,
    windowMs,
    requestId: req.requestId
  })
}

// Database query logging (for development)
export const logDatabaseQuery = (query: string, duration: number, params?: any[]) => {
  if (process.env.NODE_ENV === 'development' && process.env.LOG_LEVEL === 'debug') {
    console.log(`🗄️  DB Query (${duration}ms): ${query}`, params ? { params } : '')
  }
} 