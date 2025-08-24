import { Request, Response, NextFunction } from 'express'
import { logPerformance, logWarning } from '../utils/logger'

// Performance metrics storage
interface PerformanceMetric {
  endpoint: string
  method: string
  duration: number
  timestamp: number
  statusCode: number
  memoryUsage: NodeJS.MemoryUsage
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = []
  private maxMetrics = 1000 // Keep last 1000 metrics
  private slowThreshold = 1000 // 1 second
  private verySlowThreshold = 5000 // 5 seconds

  addMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric)
    
    // Keep only recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics)
    }

    // Log slow requests
    if (metric.duration > this.verySlowThreshold) {
      logWarning(`Very slow request detected: ${metric.method} ${metric.endpoint}`, {
        duration_ms: metric.duration,
        statusCode: metric.statusCode,
        memoryUsage: metric.memoryUsage
      })
    } else if (metric.duration > this.slowThreshold) {
      logPerformance(`Slow request: ${metric.method} ${metric.endpoint}`, metric.duration, {
        statusCode: metric.statusCode
      })
    }
  }

  getStats(): {
    totalRequests: number
    averageResponseTime: number
    slowRequests: number
    verySlowRequests: number
    topSlowEndpoints: Array<{ endpoint: string; avgDuration: number; count: number }>
    memoryStats: NodeJS.MemoryUsage
  } {
    if (this.metrics.length === 0) {
      return {
        totalRequests: 0,
        averageResponseTime: 0,
        slowRequests: 0,
        verySlowRequests: 0,
        topSlowEndpoints: [],
        memoryStats: process.memoryUsage()
      }
    }

    const totalRequests = this.metrics.length
    const averageResponseTime = this.metrics.reduce((sum, m) => sum + m.duration, 0) / totalRequests
    const slowRequests = this.metrics.filter(m => m.duration > this.slowThreshold).length
    const verySlowRequests = this.metrics.filter(m => m.duration > this.verySlowThreshold).length

    // Calculate top slow endpoints
    const endpointStats = new Map<string, { totalDuration: number; count: number }>()
    
    this.metrics.forEach(metric => {
      const key = `${metric.method} ${metric.endpoint}`
      const existing = endpointStats.get(key) || { totalDuration: 0, count: 0 }
      endpointStats.set(key, {
        totalDuration: existing.totalDuration + metric.duration,
        count: existing.count + 1
      })
    })

    const topSlowEndpoints = Array.from(endpointStats.entries())
      .map(([endpoint, stats]) => ({
        endpoint,
        avgDuration: stats.totalDuration / stats.count,
        count: stats.count
      }))
      .sort((a, b) => b.avgDuration - a.avgDuration)
      .slice(0, 10)

    return {
      totalRequests,
      averageResponseTime: Math.round(averageResponseTime),
      slowRequests,
      verySlowRequests,
      topSlowEndpoints,
      memoryStats: process.memoryUsage()
    }
  }

  clearMetrics(): void {
    this.metrics = []
  }
}

// Global performance monitor instance
const performanceMonitor = new PerformanceMonitor()

// Performance monitoring middleware
export const performanceMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now()
  const startMemory = process.memoryUsage()

  // Override res.end to capture metrics
  const originalEnd = res.end.bind(res)
  res.end = function(chunk?: any, encoding?: any, cb?: () => void) {
    const duration = Date.now() - startTime
    const endMemory = process.memoryUsage()

    // Calculate memory delta
    const memoryDelta: NodeJS.MemoryUsage = {
      rss: endMemory.rss - startMemory.rss,
      heapTotal: endMemory.heapTotal - startMemory.heapTotal,
      heapUsed: endMemory.heapUsed - startMemory.heapUsed,
      external: endMemory.external - startMemory.external,
      arrayBuffers: endMemory.arrayBuffers - startMemory.arrayBuffers
    }

    // Add metric
    performanceMonitor.addMetric({
      endpoint: req.path,
      method: req.method,
      duration,
      timestamp: Date.now(),
      statusCode: res.statusCode,
      memoryUsage: memoryDelta
    })

    return originalEnd(chunk, encoding, cb)
  }

  next()
}

// Database query performance tracking
export const trackDatabaseQuery = async <T>(
  queryName: string,
  queryFn: () => Promise<T>
): Promise<T> => {
  const startTime = Date.now()
  
  try {
    const result = await queryFn()
    const duration = Date.now() - startTime
    
    if (duration > 500) { // Log slow database queries
      logWarning(`Slow database query: ${queryName}`, {
        duration_ms: duration,
        type: 'database_query'
      })
    } else if (process.env.NODE_ENV === 'development') {
      logPerformance(`Database query: ${queryName}`, duration)
    }
    
    return result
  } catch (error) {
    const duration = Date.now() - startTime
    logWarning(`Failed database query: ${queryName}`, {
      duration_ms: duration,
      error: error instanceof Error ? error.message : String(error),
      type: 'database_query'
    })
    throw error
  }
}

// External API call performance tracking
export const trackExternalAPI = async <T>(
  apiName: string,
  apiFn: () => Promise<T>
): Promise<T> => {
  const startTime = Date.now()
  
  try {
    const result = await apiFn()
    const duration = Date.now() - startTime
    
    if (duration > 2000) { // Log slow external API calls
      logWarning(`Slow external API call: ${apiName}`, {
        duration_ms: duration,
        type: 'external_api'
      })
    } else if (process.env.NODE_ENV === 'development') {
      logPerformance(`External API call: ${apiName}`, duration)
    }
    
    return result
  } catch (error) {
    const duration = Date.now() - startTime
    logWarning(`Failed external API call: ${apiName}`, {
      duration_ms: duration,
      error: error instanceof Error ? error.message : String(error),
      type: 'external_api'
    })
    throw error
  }
}

// Memory usage monitoring
export const checkMemoryUsage = (): void => {
  const usage = process.memoryUsage()
  const usageInMB = {
    rss: Math.round(usage.rss / 1024 / 1024),
    heapTotal: Math.round(usage.heapTotal / 1024 / 1024),
    heapUsed: Math.round(usage.heapUsed / 1024 / 1024),
    external: Math.round(usage.external / 1024 / 1024)
  }

  // Warn if memory usage is high
  if (usageInMB.heapUsed > 500) { // 500MB threshold
    logWarning('High memory usage detected', {
      memoryUsage: usageInMB,
      type: 'memory_usage'
    })
  }

  if (process.env.NODE_ENV === 'development') {
    console.log('📊 Memory Usage:', usageInMB)
  }
}

// Performance stats getter
export const getPerformanceStats = () => {
  return performanceMonitor.getStats()
}

// Clear performance metrics
export const clearPerformanceMetrics = () => {
  performanceMonitor.clearMetrics()
}

// Start memory monitoring (run every 5 minutes in production)
if (process.env.NODE_ENV === 'production') {
  setInterval(checkMemoryUsage, 5 * 60 * 1000)
}

export { performanceMonitor } 