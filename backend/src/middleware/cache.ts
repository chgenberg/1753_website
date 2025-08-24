import { Request, Response, NextFunction } from 'express'
import { logInfo, logDebug } from '../utils/logger'

// In-memory cache implementation
class MemoryCache {
  private cache = new Map<string, { data: any; expires: number }>()
  private maxSize = 1000 // Maximum number of cached items
  private defaultTTL = 300 // 5 minutes default TTL

  set(key: string, value: any, ttl?: number): void {
    // Clean up expired entries if cache is getting full
    if (this.cache.size >= this.maxSize) {
      this.cleanup()
    }

    const expires = Date.now() + (ttl || this.defaultTTL) * 1000
    this.cache.set(key, { data: value, expires })
    
    if (process.env.NODE_ENV === 'development') {
      logDebug(`Cache SET: ${key} (TTL: ${ttl || this.defaultTTL}s)`)
    }
  }

  get(key: string): any | null {
    const item = this.cache.get(key)
    
    if (!item) {
      if (process.env.NODE_ENV === 'development') {
        logDebug(`Cache MISS: ${key}`)
      }
      return null
    }

    if (Date.now() > item.expires) {
      this.cache.delete(key)
      if (process.env.NODE_ENV === 'development') {
        logDebug(`Cache EXPIRED: ${key}`)
      }
      return null
    }

    if (process.env.NODE_ENV === 'development') {
      logDebug(`Cache HIT: ${key}`)
    }
    return item.data
  }

  delete(key: string): void {
    this.cache.delete(key)
    if (process.env.NODE_ENV === 'development') {
      logDebug(`Cache DELETE: ${key}`)
    }
  }

  clear(): void {
    this.cache.clear()
    logInfo('Cache cleared')
  }

  private cleanup(): void {
    const now = Date.now()
    let cleaned = 0
    
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expires) {
        this.cache.delete(key)
        cleaned++
      }
    }
    
    // If still too full, remove oldest entries
    if (this.cache.size >= this.maxSize) {
      const entries = Array.from(this.cache.entries())
      const toRemove = entries.slice(0, Math.floor(this.maxSize * 0.2)) // Remove 20%
      toRemove.forEach(([key]) => this.cache.delete(key))
      cleaned += toRemove.length
    }
    
    if (cleaned > 0) {
      logInfo(`Cache cleanup: removed ${cleaned} entries`)
    }
  }

  getStats(): { size: number; maxSize: number; hitRate?: number } {
    return {
      size: this.cache.size,
      maxSize: this.maxSize
    }
  }
}

// Global cache instance
const cache = new MemoryCache()

// Cache key generator
export const generateCacheKey = (req: Request, prefix?: string): string => {
  const baseKey = `${req.method}:${req.path}`
  const queryKey = Object.keys(req.query).length > 0 
    ? `:${JSON.stringify(req.query)}` 
    : ''
  const userKey = (req as any).user?.id ? `:user:${(req as any).user.id}` : ''
  
  return `${prefix || 'api'}:${baseKey}${queryKey}${userKey}`
}

// Cache middleware factory
export const cacheMiddleware = (options: {
  ttl?: number
  keyPrefix?: string
  condition?: (req: Request) => boolean
  skipCache?: (req: Request) => boolean
} = {}) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { ttl = 300, keyPrefix, condition, skipCache } = options

    // Skip caching for non-GET requests
    if (req.method !== 'GET') {
      return next()
    }

    // Skip if condition not met
    if (condition && !condition(req)) {
      return next()
    }

    // Skip if explicitly requested
    if (skipCache && skipCache(req)) {
      return next()
    }

    // Skip if cache-control header says no-cache
    if (req.headers['cache-control']?.includes('no-cache')) {
      return next()
    }

    const cacheKey = generateCacheKey(req, keyPrefix)
    const cachedData = cache.get(cacheKey)

    if (cachedData) {
      // Add cache headers
      res.setHeader('X-Cache', 'HIT')
      res.setHeader('X-Cache-Key', cacheKey)
      return res.json(cachedData)
    }

    // Override res.json to cache the response
    const originalJson = res.json.bind(res)
    res.json = function(data: any) {
      // Only cache successful responses
      if (res.statusCode >= 200 && res.statusCode < 300) {
        cache.set(cacheKey, data, ttl)
        res.setHeader('X-Cache', 'MISS')
        res.setHeader('X-Cache-Key', cacheKey)
        res.setHeader('Cache-Control', `public, max-age=${ttl}`)
      }
      
      return originalJson(data)
    }

    next()
  }
}

// Specific cache middlewares for different endpoints
export const productCache = cacheMiddleware({
  ttl: 600, // 10 minutes
  keyPrefix: 'products',
  condition: (req) => !req.query.fresh // Skip cache if ?fresh=true
})

export const blogCache = cacheMiddleware({
  ttl: 3600, // 1 hour
  keyPrefix: 'blog'
})

export const knowledgeCache = cacheMiddleware({
  ttl: 1800, // 30 minutes
  keyPrefix: 'knowledge'
})

export const reviewCache = cacheMiddleware({
  ttl: 300, // 5 minutes
  keyPrefix: 'reviews'
})

export const staticDataCache = cacheMiddleware({
  ttl: 7200, // 2 hours
  keyPrefix: 'static'
})

// Cache invalidation helpers
export const invalidateCache = (pattern: string): void => {
  // For memory cache, we'll implement pattern matching
  const keys = Array.from((cache as any).cache.keys())
  const matchingKeys = keys.filter((key: string) => key.includes(pattern))
  
  matchingKeys.forEach((key: string) => cache.delete(key))
  
  if (matchingKeys.length > 0) {
    logInfo(`Cache invalidation: removed ${matchingKeys.length} keys matching "${pattern}"`)
  }
}

export const invalidateProductCache = () => invalidateCache('products')
export const invalidateBlogCache = () => invalidateCache('blog')
export const invalidateKnowledgeCache = () => invalidateCache('knowledge')

// Cache warming - preload frequently accessed data
export const warmCache = async (): Promise<void> => {
  if (process.env.NODE_ENV === 'production') {
    logInfo('Starting cache warming...')
    
    try {
      // Warm up common endpoints
      const commonEndpoints = [
        '/api/products',
        '/api/blog',
        '/api/knowledge/content',
        '/api/retailers'
      ]
      
      // This would typically make internal requests to warm the cache
      // For now, we'll just log the intention
      logInfo(`Would warm cache for ${commonEndpoints.length} endpoints`)
      
    } catch (error) {
      console.error('Cache warming failed:', error)
    }
  }
}

// Cache stats endpoint data
export const getCacheStats = () => {
  return {
    ...cache.getStats(),
    type: 'memory',
    uptime: process.uptime()
  }
}

// Export the cache instance for direct access if needed
export { cache }

// Cleanup interval - run every 5 minutes
if (process.env.NODE_ENV === 'production') {
  setInterval(() => {
    (cache as any).cleanup()
  }, 5 * 60 * 1000)
} 