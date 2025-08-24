import { Router } from 'express'
import { 
  checkDatabaseHealth, 
  getConnectionPoolStats, 
  DatabaseMaintenance,
  OptimizedProductService,
  OptimizedReviewService 
} from '../services/databaseService'
import { logInfo } from '../utils/logger'
import { asyncHandler } from '../middleware/errorHandler'

const router = Router()

// Database health check
router.get('/health', asyncHandler(async (req, res) => {
  const health = await checkDatabaseHealth()
  
  res.status(health.isHealthy ? 200 : 503).json({
    success: health.isHealthy,
    data: {
      status: health.isHealthy ? 'healthy' : 'unhealthy',
      latency: health.latency,
      error: health.error,
      timestamp: new Date().toISOString()
    }
  })
}))

// Connection pool statistics
router.get('/connections', asyncHandler(async (req, res) => {
  const stats = getConnectionPoolStats()
  
  res.json({
    success: true,
    data: {
      ...stats,
      timestamp: new Date().toISOString()
    }
  })
}))

// Database statistics and performance metrics
router.get('/stats', asyncHandler(async (req, res) => {
  const health = await checkDatabaseHealth()
  const connectionStats = getConnectionPoolStats()
  
  // Get basic table counts for overview
  const tableStats = await Promise.allSettled([
    OptimizedProductService.findMany({ take: 1 }).then(() => 'products_accessible'),
    OptimizedReviewService.findMany({ take: 1 }).then(() => 'reviews_accessible')
  ])

  res.json({
    success: true,
    data: {
      health: {
        isHealthy: health.isHealthy,
        latency: health.latency
      },
      connections: connectionStats,
      tables: {
        products: tableStats[0].status === 'fulfilled' ? 'accessible' : 'error',
        reviews: tableStats[1].status === 'fulfilled' ? 'accessible' : 'error'
      },
      timestamp: new Date().toISOString()
    }
  })
}))

// Analyze slow queries (production only)
router.get('/slow-queries', asyncHandler(async (req, res) => {
  if (process.env.NODE_ENV !== 'production') {
    return res.status(403).json({
      success: false,
      error: 'Slow query analysis is only available in production'
    })
  }

  const slowQueries = await DatabaseMaintenance.analyzeSlowQueries()
  
  res.json({
    success: true,
    data: {
      slowQueries: slowQueries || [],
      timestamp: new Date().toISOString()
    }
  })
}))

// Database maintenance operations
router.post('/maintenance/cleanup', asyncHandler(async (req, res) => {
  const result = await DatabaseMaintenance.cleanupOldData()
  
  logInfo('Database cleanup performed', {
    ...result,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  })

  res.json({
    success: true,
    message: 'Database cleanup completed',
    data: result
  })
}))

// Update database statistics
router.post('/maintenance/analyze', asyncHandler(async (req, res) => {
  await DatabaseMaintenance.updateStatistics()
  
  logInfo('Database statistics updated', {
    ip: req.ip,
    userAgent: req.get('User-Agent')
  })

  res.json({
    success: true,
    message: 'Database statistics updated successfully'
  })
}))

// Test database performance with sample queries
router.get('/performance-test', asyncHandler(async (req, res) => {
  const startTime = Date.now()
  
  try {
    // Run a series of test queries to measure performance
    const tests = await Promise.all([
      // Test 1: Simple product query
      OptimizedProductService.findMany({ take: 10 }).then(() => ({
        name: 'products_simple',
        status: 'success'
      })).catch(err => ({
        name: 'products_simple',
        status: 'error',
        error: err.message
      })),
      
      // Test 2: Featured products
      OptimizedProductService.findFeatured(5).then(() => ({
        name: 'products_featured',
        status: 'success'
      })).catch(err => ({
        name: 'products_featured',
        status: 'error',
        error: err.message
      })),
      
      // Test 3: Reviews query
      OptimizedReviewService.findMany({ take: 10 }).then(() => ({
        name: 'reviews_simple',
        status: 'success'
      })).catch(err => ({
        name: 'reviews_simple',
        status: 'error',
        error: err.message
      }))
    ])

    const totalDuration = Date.now() - startTime
    const successfulTests = tests.filter(t => t.status === 'success').length
    const failedTests = tests.filter(t => t.status === 'error').length

    res.json({
      success: failedTests === 0,
      data: {
        totalDuration,
        testsRun: tests.length,
        successful: successfulTests,
        failed: failedTests,
        tests,
        averageDuration: Math.round(totalDuration / tests.length),
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    const totalDuration = Date.now() - startTime
    
    res.status(500).json({
      success: false,
      error: 'Performance test failed',
      data: {
        totalDuration,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      }
    })
  }
}))

// Get database schema information
router.get('/schema', asyncHandler(async (req, res) => {
  try {
    // This would typically query information_schema or pg_catalog
    // For now, return basic schema info
    const schemaInfo = {
      database: 'postgresql',
      version: 'unknown',
      tables: [
        'users', 'products', 'orders', 'order_items', 'reviews', 
        'addresses', 'blog_posts', 'contact_submissions', 'raw_materials',
        'discount_codes', 'quiz_submissions'
      ],
      indexes: 'See migration files for index definitions',
      constraints: 'Foreign keys and unique constraints active'
    }

    res.json({
      success: true,
      data: {
        ...schemaInfo,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve schema information',
      details: error instanceof Error ? error.message : String(error)
    })
  }
}))

export default router 