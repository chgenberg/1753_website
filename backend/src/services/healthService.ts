import { checkDatabaseHealth } from './databaseService'
import { getCacheStats } from '../middleware/cache'
import { getPerformanceStats } from '../middleware/performance'
import { logWarning, logInfo } from '../utils/logger'

// Health check status types
export type HealthStatus = 'healthy' | 'degraded' | 'unhealthy'

export interface HealthCheck {
  name: string
  status: HealthStatus
  message: string
  duration: number
  details?: Record<string, any>
  error?: string
}

export interface SystemHealth {
  status: HealthStatus
  uptime: number
  timestamp: string
  checks: HealthCheck[]
  summary: {
    total: number
    healthy: number
    degraded: number
    unhealthy: number
  }
}

// Individual health check functions
export class HealthChecks {
  // Database connectivity check
  static async checkDatabase(): Promise<HealthCheck> {
    const startTime = Date.now()
    
    try {
      const dbHealth = await checkDatabaseHealth()
      const duration = Date.now() - startTime
      
      let status: HealthStatus = 'healthy'
      let message = 'Database is responding normally'
      
      if (!dbHealth.isHealthy) {
        status = 'unhealthy'
        message = 'Database connection failed'
      } else if (dbHealth.latency > 1000) {
        status = 'degraded'
        message = 'Database response time is slow'
      } else if (dbHealth.latency > 500) {
        status = 'degraded'
        message = 'Database response time is elevated'
      }
      
      return {
        name: 'database',
        status,
        message,
        duration,
        details: {
          latency: dbHealth.latency,
          isHealthy: dbHealth.isHealthy
        },
        error: dbHealth.error
      }
    } catch (error) {
      return {
        name: 'database',
        status: 'unhealthy',
        message: 'Database health check failed',
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : String(error)
      }
    }
  }

  // Memory usage check
  static async checkMemory(): Promise<HealthCheck> {
    const startTime = Date.now()
    
    try {
      const memoryUsage = process.memoryUsage()
      const memoryInMB = {
        rss: Math.round(memoryUsage.rss / 1024 / 1024),
        heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
        heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
        external: Math.round(memoryUsage.external / 1024 / 1024)
      }
      
      const heapUsagePercent = Math.round((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100)
      
      let status: HealthStatus = 'healthy'
      let message = 'Memory usage is normal'
      
      if (memoryInMB.heapUsed > 800) {
        status = 'unhealthy'
        message = 'Memory usage is critically high'
      } else if (memoryInMB.heapUsed > 500) {
        status = 'degraded'
        message = 'Memory usage is elevated'
      } else if (heapUsagePercent > 90) {
        status = 'degraded'
        message = 'Heap usage percentage is high'
      }
      
      return {
        name: 'memory',
        status,
        message,
        duration: Date.now() - startTime,
        details: {
          ...memoryInMB,
          heapUsagePercent
        }
      }
    } catch (error) {
      return {
        name: 'memory',
        status: 'unhealthy',
        message: 'Memory check failed',
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : String(error)
      }
    }
  }

  // Cache system check
  static async checkCache(): Promise<HealthCheck> {
    const startTime = Date.now()
    
    try {
      const cacheStats = getCacheStats()
      const usagePercent = Math.round((cacheStats.size / cacheStats.maxSize) * 100)
      
      let status: HealthStatus = 'healthy'
      let message = 'Cache is operating normally'
      
      if (usagePercent > 95) {
        status = 'unhealthy'
        message = 'Cache is at critical capacity'
      } else if (usagePercent > 80) {
        status = 'degraded'
        message = 'Cache usage is high'
      }
      
      return {
        name: 'cache',
        status,
        message,
        duration: Date.now() - startTime,
        details: {
          size: cacheStats.size,
          maxSize: cacheStats.maxSize,
          usagePercent,
          type: cacheStats.type
        }
      }
    } catch (error) {
      return {
        name: 'cache',
        status: 'unhealthy',
        message: 'Cache check failed',
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : String(error)
      }
    }
  }

  // API performance check
  static async checkPerformance(): Promise<HealthCheck> {
    const startTime = Date.now()
    
    try {
      const perfStats = getPerformanceStats()
      
      let status: HealthStatus = 'healthy'
      let message = 'API performance is good'
      
      const slowRequestPercent = perfStats.totalRequests > 0 
        ? (perfStats.slowRequests / perfStats.totalRequests) * 100 
        : 0
      
      if (perfStats.averageResponseTime > 2000) {
        status = 'unhealthy'
        message = 'API response times are critically slow'
      } else if (perfStats.averageResponseTime > 1000 || slowRequestPercent > 20) {
        status = 'degraded'
        message = 'API performance is degraded'
      } else if (perfStats.verySlowRequests > 0) {
        status = 'degraded'
        message = 'Some very slow requests detected'
      }
      
      return {
        name: 'performance',
        status,
        message,
        duration: Date.now() - startTime,
        details: {
          averageResponseTime: perfStats.averageResponseTime,
          totalRequests: perfStats.totalRequests,
          slowRequests: perfStats.slowRequests,
          verySlowRequests: perfStats.verySlowRequests,
          slowRequestPercent: Math.round(slowRequestPercent)
        }
      }
    } catch (error) {
      return {
        name: 'performance',
        status: 'unhealthy',
        message: 'Performance check failed',
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : String(error)
      }
    }
  }

  // External services check
  static async checkExternalServices(): Promise<HealthCheck> {
    const startTime = Date.now()
    
    try {
      const services = []
      
      // Check OpenAI API if configured
      if (process.env.OPENAI_API_KEY) {
        try {
          const isValidKey = process.env.OPENAI_API_KEY.startsWith('sk-')
          services.push({
            name: 'OpenAI',
            status: isValidKey ? 'healthy' : 'degraded',
            message: isValidKey ? 'API key configured' : 'Invalid API key format'
          })
        } catch (error) {
          services.push({
            name: 'OpenAI',
            status: 'unhealthy',
            message: 'OpenAI check failed'
          })
        }
      }
      
      const requiredEnvVars = [
        'DATABASE_URL',
        'JWT_SECRET',
        'NEXT_PUBLIC_BACKEND_URL'
      ]
      
      const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName])
      
      let status: HealthStatus = 'healthy'
      let message = 'External services are configured'
      
      if (missingEnvVars.length > 0) {
        status = 'unhealthy'
        message = `Missing environment variables: ${missingEnvVars.join(', ')}`
      } else if (services.some(s => s.status === 'unhealthy')) {
        status = 'unhealthy'
        message = 'Some external services are unhealthy'
      } else if (services.some(s => s.status === 'degraded')) {
        status = 'degraded'
        message = 'Some external services are degraded'
      }
      
      return {
        name: 'external_services',
        status,
        message,
        duration: Date.now() - startTime,
        details: {
          services,
          environmentVariables: {
            total: requiredEnvVars.length,
            configured: requiredEnvVars.length - missingEnvVars.length,
            missing: missingEnvVars
          }
        }
      }
    } catch (error) {
      return {
        name: 'external_services',
        status: 'unhealthy',
        message: 'External services check failed',
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : String(error)
      }
    }
  }
}

// Main health service
export class HealthService {
  // Run all health checks
  static async runAllChecks(): Promise<SystemHealth> {
    try {
      const checks = await Promise.all([
        HealthChecks.checkDatabase(),
        HealthChecks.checkMemory(),
        HealthChecks.checkCache(),
        HealthChecks.checkPerformance(),
        HealthChecks.checkExternalServices()
      ])
      
      const healthyCounts = {
        healthy: checks.filter(c => c.status === 'healthy').length,
        degraded: checks.filter(c => c.status === 'degraded').length,
        unhealthy: checks.filter(c => c.status === 'unhealthy').length
      }
      
      let overallStatus: HealthStatus = 'healthy'
      if (healthyCounts.unhealthy > 0) {
        overallStatus = 'unhealthy'
      } else if (healthyCounts.degraded > 0) {
        overallStatus = 'degraded'
      }
      
      const systemHealth: SystemHealth = {
        status: overallStatus,
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        checks,
        summary: {
          total: checks.length,
          healthy: healthyCounts.healthy,
          degraded: healthyCounts.degraded,
          unhealthy: healthyCounts.unhealthy
        }
      }
      
      if (overallStatus !== 'healthy') {
        logWarning(`System health is ${overallStatus}`, {
          summary: systemHealth.summary
        })
      }
      
      return systemHealth
    } catch (error) {
      return {
        status: 'unhealthy',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        checks: [{
          name: 'system',
          status: 'unhealthy',
          message: 'Health check system failure',
          duration: 0,
          error: error instanceof Error ? error.message : String(error)
        }],
        summary: {
          total: 1,
          healthy: 0,
          degraded: 0,
          unhealthy: 1
        }
      }
    }
  }

  // Run lightweight health check
  static async runQuickCheck(): Promise<{ status: HealthStatus; message: string; uptime: number }> {
    try {
      const dbHealth = await checkDatabaseHealth()
      const memoryUsage = process.memoryUsage()
      const memoryInMB = Math.round(memoryUsage.heapUsed / 1024 / 1024)
      
      let status: HealthStatus = 'healthy'
      let message = 'System is healthy'
      
      if (!dbHealth.isHealthy) {
        status = 'unhealthy'
        message = 'Database connection failed'
      } else if (memoryInMB > 800) {
        status = 'unhealthy'
        message = 'Memory usage critically high'
      } else if (dbHealth.latency > 1000 || memoryInMB > 500) {
        status = 'degraded'
        message = 'System performance degraded'
      }
      
      return {
        status,
        message,
        uptime: process.uptime()
      }
    } catch (error) {
      return {
        status: 'unhealthy',
        message: 'Quick health check failed',
        uptime: process.uptime()
      }
    }
  }
} 