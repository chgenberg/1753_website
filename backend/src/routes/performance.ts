import { Router } from 'express'
import { getPerformanceStats, clearPerformanceMetrics, checkMemoryUsage } from '../middleware/performance'
import { getCacheStats } from '../middleware/cache'
import { logInfo } from '../utils/logger'
import { asyncHandler } from '../middleware/errorHandler'

const router = Router()

// Get comprehensive performance statistics
router.get('/stats', asyncHandler(async (req, res) => {
  const performanceStats = getPerformanceStats()
  const cacheStats = getCacheStats()
  const systemStats = {
    uptime: process.uptime(),
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
    pid: process.pid,
    memoryUsage: process.memoryUsage(),
    cpuUsage: process.cpuUsage()
  }

  res.json({
    success: true,
    data: {
      performance: performanceStats,
      cache: cacheStats,
      system: systemStats,
      timestamp: new Date().toISOString()
    }
  })
}))

// Get detailed memory information
router.get('/memory', asyncHandler(async (req, res) => {
  const memoryUsage = process.memoryUsage()
  const memoryInMB = {
    rss: Math.round(memoryUsage.rss / 1024 / 1024),
    heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
    heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
    external: Math.round(memoryUsage.external / 1024 / 1024),
    arrayBuffers: Math.round(memoryUsage.arrayBuffers / 1024 / 1024)
  }

  const heapUsagePercent = Math.round((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100)
  
  res.json({
    success: true,
    data: {
      raw: memoryUsage,
      mb: memoryInMB,
      heapUsagePercent,
      isHighUsage: memoryInMB.heapUsed > 500,
      timestamp: new Date().toISOString()
    }
  })
}))

// Force memory check and get current status
router.post('/memory/check', asyncHandler(async (req, res) => {
  checkMemoryUsage()
  
  const memoryUsage = process.memoryUsage()
  const memoryInMB = {
    rss: Math.round(memoryUsage.rss / 1024 / 1024),
    heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
    heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
    external: Math.round(memoryUsage.external / 1024 / 1024)
  }

  logInfo('Manual memory check performed', {
    memoryUsage: memoryInMB,
    ip: req.ip
  })

  res.json({
    success: true,
    message: 'Memory check completed',
    data: {
      memoryUsage: memoryInMB,
      timestamp: new Date().toISOString()
    }
  })
}))

// Clear performance metrics
router.delete('/metrics', asyncHandler(async (req, res) => {
  clearPerformanceMetrics()
  
  logInfo('Performance metrics cleared', {
    ip: req.ip,
    userAgent: req.get('User-Agent')
  })

  res.json({
    success: true,
    message: 'Performance metrics cleared successfully'
  })
}))

// Health check with performance indicators
router.get('/health', asyncHandler(async (req, res) => {
  const performanceStats = getPerformanceStats()
  const memoryUsage = process.memoryUsage()
  const memoryInMB = Math.round(memoryUsage.heapUsed / 1024 / 1024)
  
  // Determine health status
  const isMemoryHealthy = memoryInMB < 500 // Less than 500MB
  const isResponseTimeHealthy = performanceStats.averageResponseTime < 1000 // Less than 1 second
  const isSlowRequestsHealthy = (performanceStats.slowRequests / Math.max(performanceStats.totalRequests, 1)) < 0.1 // Less than 10% slow
  
  const isHealthy = isMemoryHealthy && isResponseTimeHealthy && isSlowRequestsHealthy
  
  const healthStatus = {
    status: isHealthy ? 'healthy' : 'degraded',
    checks: {
      memory: {
        status: isMemoryHealthy ? 'pass' : 'warn',
        value: `${memoryInMB}MB`,
        threshold: '500MB'
      },
      responseTime: {
        status: isResponseTimeHealthy ? 'pass' : 'warn',
        value: `${performanceStats.averageResponseTime}ms`,
        threshold: '1000ms'
      },
      slowRequests: {
        status: isSlowRequestsHealthy ? 'pass' : 'warn',
        value: `${performanceStats.slowRequests}/${performanceStats.totalRequests}`,
        percentage: `${Math.round((performanceStats.slowRequests / Math.max(performanceStats.totalRequests, 1)) * 100)}%`
      }
    },
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  }

  res.status(isHealthy ? 200 : 503).json({
    success: isHealthy,
    data: healthStatus
  })
}))

// Get system information
router.get('/system', asyncHandler(async (req, res) => {
  const systemInfo = {
    node: {
      version: process.version,
      platform: process.platform,
      arch: process.arch,
      pid: process.pid,
      uptime: process.uptime(),
      argv: process.argv,
      execPath: process.execPath
    },
    environment: {
      nodeEnv: process.env.NODE_ENV,
      port: process.env.PORT,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    },
    resources: {
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage()
    }
  }

  res.json({
    success: true,
    data: systemInfo
  })
}))

export default router 