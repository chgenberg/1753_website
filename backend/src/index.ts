import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { PrismaClient } from '@prisma/client'
import { validateEnv, env } from './config/env'
import { errorHandler, notFoundHandler } from './middleware/errorHandler'
import { requestLogger } from './middleware/requestLogger'
import { performanceMiddleware } from './middleware/performance'
import { logInfo, logError, logger } from './utils/logger'

// Routes
import adminRoutes from './routes/admin'
import authRoutes from './routes/auth'
import blogRoutes from './routes/blog'
import cacheRoutes from './routes/cache'
import contactRoutes from './routes/contact'
import databaseRoutes from './routes/database'
import discountRoutes from './routes/discounts'
import healthRoutes from './routes/health'
import knowledgeRoutes from './routes/knowledge'
import newsletterRoutes from './routes/newsletter'
import orderRoutes from './routes/orders'
import performanceRoutes from './routes/performance'
import productRoutes from './routes/products'
import quizRoutes from './routes/quiz'
import rawMaterialsRoutes from './routes/rawMaterials'
import retailersRoutes from './routes/retailers'
import reviewRoutes from './routes/reviews'
import subscriptionRoutes from './routes/subscriptions'
import ongoingRoutes from './routes/ongoing'
import webhookRoutes from './routes/webhooks'
import integrationsRoutes from './routes/integrations'
import { fortnoxService } from './services/fortnoxService'
// Initialize
const app = express()
const PORT = parseInt(process.env.PORT || '5002')
const prisma = new PrismaClient()

// Validate environment
validateEnv()

// Trust proxy (important for Railway/cloud deployments)
app.set('trust proxy', 1)

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}))

// CORS configuration
const corsOptions = {
  origin: env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN.split(','),
  credentials: true,
  optionsSuccessStatus: 200
}
app.use(cors(corsOptions))

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(env.RATE_LIMIT_WINDOW_MS),
  max: parseInt(env.RATE_LIMIT_MAX_REQUESTS),
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: Math.ceil(parseInt(env.RATE_LIMIT_WINDOW_MS) / 1000 / 60)
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logError('Rate limit exceeded', undefined, {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.url
    })
    res.status(429).json({
      error: 'Too many requests from this IP, please try again later.',
      retryAfter: Math.ceil(parseInt(env.RATE_LIMIT_WINDOW_MS) / 1000 / 60)
    })
  }
})
app.use(limiter)

// Request logging middleware
app.use(requestLogger)

// Performance monitoring middleware
app.use(performanceMiddleware)

// Body parsing
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version || '1.0.0'
  })
})

// API routes
app.use('/api/admin', adminRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/blog', blogRoutes)
app.use('/api/cache', cacheRoutes)
app.use('/api/contact', contactRoutes)
app.use('/api/database', databaseRoutes)
app.use('/api/discounts', discountRoutes)
app.use('/api/health', healthRoutes)
app.use('/api/knowledge', knowledgeRoutes)
app.use('/api/newsletter', newsletterRoutes)
app.use('/api/performance', performanceRoutes)
app.use('/api/products', productRoutes)
app.use('/api/quiz', quizRoutes)
app.use('/api/raw-materials', rawMaterialsRoutes)
app.use('/api/retailers', retailersRoutes)
app.use('/api/reviews', reviewRoutes)
app.use('/api/subscriptions', subscriptionRoutes)
app.use('/api/ongoing', ongoingRoutes)
app.use('/api/webhooks', webhookRoutes)
app.use('/api/integrations', integrationsRoutes)

// OAuth callback route (direct path for Fortnox redirect URI)
app.get('/oauth/callback', (req, res) => {
  const { code, state, error, error_description } = req.query as Record<string, string | undefined>
  
  if (error) {
    return res.status(400).json({
      success: false,
      error: { message: error, description: error_description },
      timestamp: new Date().toISOString()
    })
  }
  
  if (!code) {
    return res.status(400).json({
      success: false,
      error: { message: 'No authorization code received' },
      timestamp: new Date().toISOString()
    })
  }
  
  // Return success page with authorization code
  const nonce = require('crypto').randomBytes(16).toString('base64')
  const html = `<!doctype html>
<html lang="sv">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Fortnox OAuth Success</title>
  <style>
    body { font-family: system-ui, sans-serif; margin: 2rem; line-height: 1.5; background: #f9fafb; }
    .container { max-width: 600px; margin: 0 auto; background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .success { color: #16a34a; font-size: 1.2em; margin-bottom: 1rem; }
    .code-section { background: #f3f4f6; padding: 1rem; border-radius: 8px; margin: 1rem 0; }
    .code { font-family: monospace; word-break: break-all; background: #1f2937; color: #f9fafb; padding: 1rem; border-radius: 6px; }
    .next-step { background: #dbeafe; padding: 1rem; border-radius: 8px; margin-top: 1rem; }
  </style>
</head>
<body>
  <div class="container">
    <div class="success">✅ Fortnox OAuth Success!</div>
    <p>Authorization code received successfully.</p>
    
    <div class="code-section">
      <strong>Authorization Code:</strong>
      <div class="code">${code}</div>
    </div>
    
    <div class="next-step">
      <strong>Next step:</strong> Run this command in your terminal:
      <div class="code">railway run npx ts-node scripts/exchangeFortnoxCode.ts ${code}</div>
    </div>
  </div>
</body>
</html>`

  res
    .status(200)
    .header('Content-Security-Policy', `script-src 'nonce-${nonce}' 'strict-dynamic'; object-src 'none'; base-uri 'none';`)
    .send(html)
})

// Aliases for Fortnox OAuth start/callback under /api to avoid confusion
app.get('/api/fortnox/oauth/start', (req, res) => {
  // Redirect to the actual mounted route under /api/webhooks
  return res.redirect(302, '/api/webhooks/fortnox/oauth/start')
})

app.get('/api/fortnox/oauth/callback', (req, res) => {
  // Redirect to the direct callback we recommend registering
  const qs = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : ''
  return res.redirect(302, `/oauth/callback${qs}`)
})

// Debug middleware for orders route (only in development)
if (process.env.NODE_ENV === 'development') {
  app.use('/api/orders', (req, res, next) => {
    console.log(`🚀 Request to /api/orders: ${req.method} ${req.url}`)
    console.log(`   Original URL: ${req.originalUrl}`)
    console.log(`   Base URL: ${req.baseUrl}`)
    console.log(`   Path: ${req.path}`)
    next()
  })
}

app.use('/api/orders', orderRoutes)

// 404 handler for unknown routes
app.use(notFoundHandler)

// Global error handler (must be last)
app.use(errorHandler)

async function startServer() {
  try {
    // Only show detailed startup info in development
    if (process.env.NODE_ENV === 'development') {
      console.log('🚀 Starting 1753 Skincare API server...')
      console.log(`📍 NODE_ENV: ${process.env.NODE_ENV}`)
      console.log(`🌐 PORT: ${PORT}`)
      console.log(`🗄️  DATABASE_URL: ${process.env.DATABASE_URL ? 'Set' : 'Missing'}`)
    }
    
    // Database connection with retry logic
    let retries = 5
    while (retries > 0) {
      try {
        await prisma.$connect()
        logger.info('Connected to PostgreSQL via Prisma')
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ Database connection successful')
        }
        break
      } catch (error) {
        retries--
        logger.warn(`Failed to connect to database. Retries left: ${retries}`)
        if (process.env.NODE_ENV === 'development') {
          console.warn(`⚠️  Database connection failed. Retries left: ${retries}`)
        }
        if (retries === 0) {
          console.error('❌ Database connection failed permanently:', error)
          throw error
        }
        await new Promise(resolve => setTimeout(resolve, 5000))
      }
    }

    // Start server
    const server = app.listen(PORT, '0.0.0.0', () => {
      logInfo(`Server started successfully`, {
        port: PORT,
        environment: process.env.NODE_ENV,
        cors_origin: env.CORS_ORIGIN
      })
      
      // Start Fortnox proactive token refresh
      if (process.env.FORTNOX_USE_OAUTH === 'true') {
        try {
          fortnoxService.startProactiveRefresh()
          console.log(`✅ Fortnox proactive token refresh started`)
        } catch (error) {
          console.warn(`⚠️  Could not start Fortnox proactive refresh:`, error.message)
        }
      }
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`🚀 Server ready at http://0.0.0.0:${PORT}`)
        console.log(`📊 Health check available at http://0.0.0.0:${PORT}/health`)
        console.log(`📋 API routes available at http://0.0.0.0:${PORT}/api`)
      }
    })

    // Test that server is actually responding (only in development)
    if (process.env.NODE_ENV === 'development') {
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
    }

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      logInfo('SIGTERM received, shutting down gracefully')
      server.close(() => {
        logInfo('Server closed')
        prisma.$disconnect()
        process.exit(0)
      })
    })

    process.on('SIGINT', async () => {
      logInfo('SIGINT received, shutting down gracefully')
      server.close(() => {
        logInfo('Server closed')
        prisma.$disconnect()
        process.exit(0)
      })
    })

  } catch (error) {
    console.error('❌ Failed to start server:', error)
    logError('Failed to start server', error instanceof Error ? error : new Error(String(error)))
    process.exit(1)
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  logError('Unhandled Promise Rejection', err)
  
  if (process.env.NODE_ENV === 'production') {
    process.exit(1)
  }
})

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  logError('Uncaught Exception', err)
  console.error('❌ Uncaught Exception:', err)
  process.exit(1)
})

startServer() 