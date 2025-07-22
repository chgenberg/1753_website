import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import compression from 'compression'
import cookieParser from 'cookie-parser'
import rateLimit from 'express-rate-limit'

import { errorHandler } from './middleware/errorHandler'
import { notFound } from './middleware/notFound'
import { logger } from './utils/logger'
import { prisma } from './lib/prisma'
import { validateEnv, env } from './config/env'

// Routes
import authRoutes from './routes/auth'
import productRoutes from './routes/products'
import quizRoutes from './routes/quiz'
import reviewRoutes from './routes/reviews'
import newsletterRoutes from './routes/newsletter'
import progressRoutes from './routes/progress'
import knowledgeRoutes from './routes/knowledge'
import blogRoutes from './routes/blog'
import rawMaterialsRoutes from './routes/rawMaterials'
import contactRoutes from './routes/contact'
import orderRoutes from './routes/orders'

// Validate environment variables
const envConfig = validateEnv()

const app = express()
const PORT = process.env.PORT || envConfig.PORT || 5002

// Trust proxy configuration for Railway
// Railway uses specific proxy setup, so we trust the first proxy
app.set('trust proxy', 1)

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}))

// Rate limiting - more lenient for production
const limiter = rateLimit({
  windowMs: parseInt(envConfig.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(envConfig.RATE_LIMIT_MAX_REQUESTS || '1000'), // Increased for production
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/health' || req.path === '/api/health'
  }
})
app.use(limiter)

// CORS - more permissive for production
const corsOrigins = process.env.NODE_ENV === 'production' 
  ? ['https://1753skincare.com', 'https://www.1753skincare.com', 'https://1753website-production.up.railway.app']
  : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002']

app.use(cors({
  origin: envConfig.CORS_ORIGIN === '*' ? true : corsOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}))

// Body parsing middleware
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
app.use(cookieParser())

// Compression
app.use(compression())

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }))
}

// Health check
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    port: PORT,
    database: 'connected'
  })
})

// Simple health check for Railway
app.get('/', (_req, res) => {
  res.status(200).json({
    message: '1753 Skincare API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  })
})

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/quiz', quizRoutes)
app.use('/api/newsletter', newsletterRoutes)
app.use('/api/reviews', reviewRoutes)
app.use('/api/progress', progressRoutes)
app.use('/api/knowledge', knowledgeRoutes)
app.use('/api/blog', blogRoutes)
app.use('/api/raw-materials', rawMaterialsRoutes)
app.use('/api/contact', contactRoutes)
app.use('/api/orders', orderRoutes)

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    success: true, 
    message: 'Backend API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  })
})

// Middleware
app.use(notFound)
app.use(errorHandler)

async function startServer() {
  try {
    console.log('🚀 Starting 1753 Skincare API server...')
    console.log(`📍 NODE_ENV: ${process.env.NODE_ENV}`)
    console.log(`🌐 PORT: ${PORT}`)
    console.log(`🗄️  DATABASE_URL: ${process.env.DATABASE_URL ? 'Set' : 'Missing'}`)
    
    // Database connection with retry logic
    let retries = 5
    while (retries > 0) {
      try {
        await prisma.$connect()
        logger.info('Connected to PostgreSQL via Prisma')
        console.log('✅ Database connection successful')
        break
      } catch (error) {
        retries--
        logger.warn(`Failed to connect to database. Retries left: ${retries}`)
        console.warn(`⚠️  Database connection failed. Retries left: ${retries}`)
        if (retries === 0) {
          console.error('❌ Database connection failed permanently:', error)
          throw error
        }
        await new Promise(resolve => setTimeout(resolve, 5000))
      }
    }

    // Start server
    const server = app.listen(PORT, '0.0.0.0', () => {
      logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
      console.log(`🚀 Server ready at http://0.0.0.0:${PORT}`)
      console.log(`📊 Health check available at http://0.0.0.0:${PORT}/health`)
      console.log(`📋 API routes available at http://0.0.0.0:${PORT}/api`)
    })

    // Test that server is actually responding
    setTimeout(async () => {
      try {
        const response = await fetch(`http://localhost:${PORT}/health`)
        if (response.ok) {
          console.log('✅ Health check endpoint is responding')
        } else {
          console.warn('⚠️  Health check endpoint returned non-200 status:', response.status)
        }
      } catch (error) {
        console.warn('⚠️  Could not test health check endpoint:', error.message)
      }
    }, 2000)

    // Graceful shutdown
    process.on('SIGTERM', () => {
      logger.info('SIGTERM signal received: closing HTTP server')
      console.log('📴 Received SIGTERM, shutting down gracefully...')
      server.close(() => {
        logger.info('HTTP server closed')
        console.log('✅ HTTP server closed')
        prisma.$disconnect()
        process.exit(0)
      })
    })

  } catch (error) {
    logger.error('Failed to start server:', error)
    console.error('❌ Server startup failed:', error)
    
    // In production, exit gracefully
    if (process.env.NODE_ENV === 'production') {
      console.error('💥 Exiting due to startup failure in production')
      process.exit(1)
    } else {
      throw error
    }
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  logger.error('Unhandled Promise Rejection:', err)
  console.error('❌ Unhandled Promise Rejection:', err)
  
  if (process.env.NODE_ENV === 'production') {
    process.exit(1)
  }
})

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  logger.error('Uncaught Exception:', err)
  console.error('❌ Uncaught Exception:', err)
  process.exit(1)
})

startServer()

export default app 