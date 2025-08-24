import winston from 'winston'
import path from 'path'

// Create logs directory if it doesn't exist (only in development)
const logsDir = path.join(process.cwd(), 'logs')

// Custom format for production
const productionFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, service, ...meta }) => {
    return JSON.stringify({
      timestamp,
      level,
      message,
      service,
      ...meta
    })
  })
)

// Custom format for development
const developmentFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.colorize(),
  winston.format.printf(({ timestamp, level, message, service, ...meta }) => {
    const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''
    return `${timestamp} [${service}] ${level}: ${message} ${metaStr}`
  })
)

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'warn' : 'info'),
  format: process.env.NODE_ENV === 'production' ? productionFormat : developmentFormat,
  defaultMeta: { 
    service: '1753-skincare-api',
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0'
  },
  transports: []
})

// Production transports - optimized for cloud logging
if (process.env.NODE_ENV === 'production') {
  // Console transport for Railway/cloud logging
  logger.add(new winston.transports.Console({
    level: 'info',
    handleExceptions: true,
    handleRejections: true
  }))
  
  // Only log errors to console in production to reduce noise
  logger.add(new winston.transports.Console({
    level: 'error',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.json()
    )
  }))
} else {
  // Development transports
  logger.add(new winston.transports.Console({
    format: developmentFormat,
    handleExceptions: true,
    handleRejections: true
  }))
  
  // File logging only in development
  try {
    logger.add(new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }))
    
    logger.add(new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 5242880, // 5MB  
      maxFiles: 5,
    }))
  } catch (error) {
    // Fallback if logs directory can't be created
    console.warn('Could not create log files, using console only')
  }
}

// Enhanced logging methods
export const logError = (message: string, error?: Error, context?: Record<string, any>) => {
  logger.error(message, {
    error: error ? {
      name: error.name,
      message: error.message,
      stack: error.stack
    } : undefined,
    ...context
  })
}

export const logWarning = (message: string, context?: Record<string, any>) => {
  logger.warn(message, context)
}

export const logInfo = (message: string, context?: Record<string, any>) => {
  logger.info(message, context)
}

export const logDebug = (message: string, context?: Record<string, any>) => {
  logger.debug(message, context)
}

// Security logging
export const logSecurityEvent = (event: string, context?: Record<string, any>) => {
  logger.warn(`SECURITY: ${event}`, {
    type: 'security',
    ...context
  })
}

// Performance logging
export const logPerformance = (operation: string, duration: number, context?: Record<string, any>) => {
  logger.info(`PERFORMANCE: ${operation}`, {
    type: 'performance',
    duration_ms: duration,
    ...context
  })
}

// API request logging
export const logApiRequest = (method: string, url: string, statusCode: number, duration: number, userId?: string) => {
  logger.info('API Request', {
    type: 'api_request',
    method,
    url,
    statusCode,
    duration_ms: duration,
    userId
  })
}

export { logger } 