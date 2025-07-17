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
import { validateEnv } from './config/env'

// Routes
import authRoutes from './routes/auth'
import productRoutes from './routes/products'
import quizRoutes from './routes/quiz'
// TODO: Add these routes when implemented
// import userRoutes from './routes/users'
// import orderRoutes from './routes/orders'
// import cartRoutes from './routes/cart'
// import paymentRoutes from './routes/payments'
import reviewRoutes from './routes/reviews'
import newsletterRoutes from './routes/newsletter'
// import contentRoutes from './routes/content'
// import uploadRoutes from './routes/uploads'
// import webhookRoutes from './routes/webhooks'

// Validate environment variables
validateEnv()

const app = express()
const PORT = process.env.PORT || 5002

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}))

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
})
app.use(limiter)

// CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
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
    environment: process.env.NODE_ENV
  })
})

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/quiz', quizRoutes)
app.use('/api/newsletter', newsletterRoutes)
// TODO: Uncomment when routes are implemented
// app.use('/api/users', userRoutes)
// app.use('/api/orders', orderRoutes)
// app.use('/api/cart', cartRoutes)
// app.use('/api/payments', paymentRoutes)
app.use('/api/reviews', reviewRoutes)
// app.use('/api/content', contentRoutes)
// app.use('/api/uploads', uploadRoutes)
// app.use('/api/webhooks', webhookRoutes)

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    success: true, 
    message: 'Backend API is running',
    timestamp: new Date().toISOString()
  })
})

// Middleware
app.use(notFound)
app.use(errorHandler)

async function startServer() {
  try {
    // Test PostgreSQL connection
    await prisma.$connect()
    logger.info('Connected to PostgreSQL via Prisma')

    // Start server
    app.listen(PORT, () => {
      logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
    })
  } catch (error) {
    logger.error('Failed to start server:', error)
    process.exit(1)
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  logger.error('Unhandled Promise Rejection:', err)
  process.exit(1)
})

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  logger.error('Uncaught Exception:', err)
  process.exit(1)
})

startServer()

export default app 