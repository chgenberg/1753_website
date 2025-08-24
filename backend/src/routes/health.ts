import { Router } from 'express'
import { HealthService, HealthChecks } from '../services/healthService'
import { logInfo } from '../utils/logger'
import { asyncHandler } from '../middleware/errorHandler'

const router = Router()

// Comprehensive health check
router.get('/', asyncHandler(async (req, res) => {
  const health = await HealthService.runAllChecks()
  
  const statusCode = health.status === 'healthy' ? 200 : 
                    health.status === 'degraded' ? 200 : 503
  
  res.status(statusCode).json({
    success: health.status !== 'unhealthy',
    data: health
  })
}))

// Quick health check (for load balancers)
router.get('/quick', asyncHandler(async (req, res) => {
  const health = await HealthService.runQuickCheck()
  
  const statusCode = health.status === 'healthy' ? 200 : 
                    health.status === 'degraded' ? 200 : 503
  
  res.status(statusCode).json({
    success: health.status !== 'unhealthy',
    data: health
  })
}))

// Liveness probe (Kubernetes/Docker health check)
router.get('/live', asyncHandler(async (req, res) => {
  // Simple check - is the process running?
  res.status(200).json({
    success: true,
    status: 'alive',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    pid: process.pid
  })
}))

// Readiness probe (is the app ready to serve traffic?)
router.get('/ready', asyncHandler(async (req, res) => {
  const health = await HealthService.runQuickCheck()
  
  const isReady = health.status !== 'unhealthy'
  const statusCode = isReady ? 200 : 503
  
  res.status(statusCode).json({
    success: isReady,
    status: isReady ? 'ready' : 'not_ready',
    message: health.message,
    timestamp: new Date().toISOString(),
    uptime: health.uptime
  })
}))

// Individual health checks
router.get('/database', asyncHandler(async (req, res) => {
  const check = await HealthChecks.checkDatabase()
  const statusCode = check.status === 'unhealthy' ? 503 : 200
  
  res.status(statusCode).json({
    success: check.status !== 'unhealthy',
    data: check
  })
}))

router.get('/memory', asyncHandler(async (req, res) => {
  const check = await HealthChecks.checkMemory()
  const statusCode = check.status === 'unhealthy' ? 503 : 200
  
  res.status(statusCode).json({
    success: check.status !== 'unhealthy',
    data: check
  })
}))

router.get('/cache', asyncHandler(async (req, res) => {
  const check = await HealthChecks.checkCache()
  const statusCode = check.status === 'unhealthy' ? 503 : 200
  
  res.status(statusCode).json({
    success: check.status !== 'unhealthy',
    data: check
  })
}))

router.get('/performance', asyncHandler(async (req, res) => {
  const check = await HealthChecks.checkPerformance()
  const statusCode = check.status === 'unhealthy' ? 503 : 200
  
  res.status(statusCode).json({
    success: check.status !== 'unhealthy',
    data: check
  })
}))

router.get('/external', asyncHandler(async (req, res) => {
  const check = await HealthChecks.checkExternalServices()
  const statusCode = check.status === 'unhealthy' ? 503 : 200
  
  res.status(statusCode).json({
    success: check.status !== 'unhealthy',
    data: check
  })
}))

// System information endpoint
router.get('/system', asyncHandler(async (req, res) => {
  const systemInfo = {
    node: {
      version: process.version,
      platform: process.platform,
      arch: process.arch,
      uptime: process.uptime(),
      pid: process.pid
    },
    environment: {
      nodeEnv: process.env.NODE_ENV,
      port: process.env.PORT,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    },
    memory: process.memoryUsage(),
    cpu: process.cpuUsage(),
    timestamp: new Date().toISOString()
  }
  
  res.json({
    success: true,
    data: systemInfo
  })
}))

// Health check history (simple in-memory storage)
const healthHistory: Array<{
  timestamp: string
  status: string
  duration: number
}> = []

const MAX_HISTORY_ENTRIES = 100

router.get('/history', asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: {
      entries: healthHistory.slice(-50), // Return last 50 entries
      total: healthHistory.length,
      maxEntries: MAX_HISTORY_ENTRIES
    }
  })
}))

// Trigger manual health check and store in history
router.post('/check', asyncHandler(async (req, res) => {
  const startTime = Date.now()
  const health = await HealthService.runAllChecks()
  const duration = Date.now() - startTime
  
  // Store in history
  healthHistory.push({
    timestamp: health.timestamp,
    status: health.status,
    duration
  })
  
  // Keep history size manageable
  if (healthHistory.length > MAX_HISTORY_ENTRIES) {
    healthHistory.splice(0, healthHistory.length - MAX_HISTORY_ENTRIES)
  }
  
  logInfo('Manual health check performed', {
    status: health.status,
    duration,
    summary: health.summary,
    ip: req.ip
  })
  
  const statusCode = health.status === 'healthy' ? 200 : 
                    health.status === 'degraded' ? 200 : 503
  
  res.status(statusCode).json({
    success: health.status !== 'unhealthy',
    data: {
      ...health,
      checkDuration: duration
    }
  })
}))

// Health metrics for monitoring systems
router.get('/metrics', asyncHandler(async (req, res) => {
  const health = await HealthService.runAllChecks()
  
  // Convert to Prometheus-style metrics format
  const metrics = [
    `# HELP system_health_status System health status (0=unhealthy, 1=degraded, 2=healthy)`,
    `# TYPE system_health_status gauge`,
    `system_health_status{instance="${process.env.RAILWAY_SERVICE_NAME || 'api'}"} ${
      health.status === 'healthy' ? 2 : health.status === 'degraded' ? 1 : 0
    }`,
    '',
    `# HELP system_uptime_seconds System uptime in seconds`,
    `# TYPE system_uptime_seconds counter`,
    `system_uptime_seconds{instance="${process.env.RAILWAY_SERVICE_NAME || 'api'}"} ${process.uptime()}`,
    '',
    `# HELP health_checks_total Total number of health checks`,
    `# TYPE health_checks_total gauge`,
    `health_checks_total{instance="${process.env.RAILWAY_SERVICE_NAME || 'api'}"} ${health.summary.total}`,
    '',
    `# HELP health_checks_healthy Number of healthy checks`,
    `# TYPE health_checks_healthy gauge`,
    `health_checks_healthy{instance="${process.env.RAILWAY_SERVICE_NAME || 'api'}"} ${health.summary.healthy}`,
    '',
    `# HELP health_checks_degraded Number of degraded checks`,
    `# TYPE health_checks_degraded gauge`,
    `health_checks_degraded{instance="${process.env.RAILWAY_SERVICE_NAME || 'api'}"} ${health.summary.degraded}`,
    '',
    `# HELP health_checks_unhealthy Number of unhealthy checks`,
    `# TYPE health_checks_unhealthy gauge`,
    `health_checks_unhealthy{instance="${process.env.RAILWAY_SERVICE_NAME || 'api'}"} ${health.summary.unhealthy}`,
    ''
  ]
  
  // Add individual check metrics
  health.checks.forEach(check => {
    const statusValue = check.status === 'healthy' ? 2 : check.status === 'degraded' ? 1 : 0
    metrics.push(
      `# HELP health_check_${check.name}_status Health check status for ${check.name}`,
      `# TYPE health_check_${check.name}_status gauge`,
      `health_check_${check.name}_status{instance="${process.env.RAILWAY_SERVICE_NAME || 'api'}"} ${statusValue}`,
      '',
      `# HELP health_check_${check.name}_duration_ms Duration of ${check.name} health check in milliseconds`,
      `# TYPE health_check_${check.name}_duration_ms gauge`,
      `health_check_${check.name}_duration_ms{instance="${process.env.RAILWAY_SERVICE_NAME || 'api'}"} ${check.duration}`,
      ''
    )
  })
  
  res.set('Content-Type', 'text/plain; version=0.0.4; charset=utf-8')
  res.send(metrics.join('\n'))
}))

export default router 