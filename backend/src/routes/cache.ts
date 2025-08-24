import { Router } from 'express'
import { getCacheStats, invalidateCache, cache } from '../middleware/cache'
import { logInfo } from '../utils/logger'
import { asyncHandler } from '../middleware/errorHandler'

const router = Router()

// Get cache statistics
router.get('/stats', asyncHandler(async (req, res) => {
  const stats = getCacheStats()
  
  res.json({
    success: true,
    data: {
      ...stats,
      timestamp: new Date().toISOString()
    }
  })
}))

// Clear entire cache
router.delete('/clear', asyncHandler(async (req, res) => {
  cache.clear()
  logInfo('Cache cleared via API request', {
    ip: req.ip,
    userAgent: req.get('User-Agent')
  })
  
  res.json({
    success: true,
    message: 'Cache cleared successfully'
  })
}))

// Invalidate cache by pattern
router.delete('/invalidate/:pattern', asyncHandler(async (req, res) => {
  const { pattern } = req.params
  
  if (!pattern || pattern.length < 2) {
    return res.status(400).json({
      success: false,
      error: 'Pattern must be at least 2 characters long'
    })
  }
  
  invalidateCache(pattern)
  logInfo(`Cache invalidated for pattern: ${pattern}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent')
  })
  
  res.json({
    success: true,
    message: `Cache invalidated for pattern: ${pattern}`
  })
}))

// Health check for cache
router.get('/health', asyncHandler(async (req, res) => {
  const stats = getCacheStats()
  const isHealthy = stats.size < stats.maxSize * 0.9 // Consider unhealthy if >90% full
  
  res.status(isHealthy ? 200 : 503).json({
    success: isHealthy,
    status: isHealthy ? 'healthy' : 'degraded',
    data: stats,
    message: isHealthy 
      ? 'Cache is operating normally' 
      : 'Cache is near capacity limit'
  })
}))

export default router 