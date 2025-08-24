import { PrismaClient, Prisma } from '@prisma/client'
import { trackDatabaseQuery } from '../middleware/performance'
import { logWarning, logInfo } from '../utils/logger'

// Enhanced Prisma client with connection pooling and optimization
const createOptimizedPrismaClient = (): PrismaClient => {
  const client = new PrismaClient({
    log: process.env.NODE_ENV === 'development' 
      ? ['warn', 'error']
      : ['warn', 'error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    }
  })

  return client
}

// Global optimized Prisma client
export const prisma = createOptimizedPrismaClient()

// Database connection health check
export const checkDatabaseHealth = async (): Promise<{
  isHealthy: boolean
  latency: number
  error?: string
}> => {
  const startTime = Date.now()
  
  try {
    await prisma.$queryRaw`SELECT 1`
    const latency = Date.now() - startTime
    
    return {
      isHealthy: true,
      latency
    }
  } catch (error) {
    const latency = Date.now() - startTime
    return {
      isHealthy: false,
      latency,
      error: error instanceof Error ? error.message : String(error)
    }
  }
}

// Optimized product queries
export class OptimizedProductService {
  // Get products with optimized includes and filtering
  static async findMany(options: {
    where?: Prisma.ProductWhereInput
    orderBy?: Prisma.ProductOrderByWithRelationInput
    skip?: number
    take?: number
    includeReviews?: boolean
    includeTranslations?: boolean
    locale?: string
  }) {
    return trackDatabaseQuery('products.findMany', async () => {
      const { where = {}, orderBy, skip, take, includeReviews = false, includeTranslations = false, locale } = options

      // Base query with minimal includes for performance
      const baseInclude: Prisma.ProductInclude = {
        _count: {
          select: {
            reviews: {
              where: { status: 'APPROVED' }
            }
          }
        }
      }

      // Add reviews only if needed
      if (includeReviews) {
        baseInclude.reviews = {
          where: { status: 'APPROVED' },
          select: { rating: true },
          take: 100 // Limit to prevent large payloads
        }
      }

      // Add translations only if needed
      if (includeTranslations && locale) {
        baseInclude.translations = {
          where: { locale },
          take: 1
        }
      }

      return prisma.product.findMany({
        where: {
          isActive: true,
          ...where
        },
        orderBy,
        skip,
        take,
        include: baseInclude
      })
    })
  }

  // Get single product with optimized includes
  static async findBySlug(slug: string, locale?: string) {
    return trackDatabaseQuery('products.findBySlug', async () => {
      return prisma.product.findUnique({
        where: { slug },
        include: {
          reviews: {
            where: { status: 'APPROVED' },
            orderBy: { createdAt: 'desc' },
            take: 10, // Limit initial reviews
            include: {
              replies: {
                orderBy: { createdAt: 'asc' }
              }
            }
          },
          _count: {
            select: {
              reviews: {
                where: { status: 'APPROVED' }
              }
            }
          },
          ...(locale && {
            translations: {
              where: { locale },
              take: 1
            }
          })
        }
      })
    })
  }

  // Get featured products with caching-friendly query
  static async findFeatured(limit: number = 6) {
    return trackDatabaseQuery('products.findFeatured', async () => {
      return prisma.product.findMany({
        where: {
          isActive: true,
          isFeatured: true
        },
        orderBy: [
          { createdAt: 'desc' }
        ],
        take: limit,
        include: {
          _count: {
            select: {
              reviews: {
                where: { status: 'APPROVED' }
              }
            }
          }
        }
      })
    })
  }

  // Get related products efficiently
  static async findRelated(productId: string, category?: string, limit: number = 4) {
    return trackDatabaseQuery('products.findRelated', async () => {
      const where: Prisma.ProductWhereInput = {
        isActive: true,
        id: { not: productId }
      }

      if (category) {
        where.category = category
      }

      return prisma.product.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        include: {
          _count: {
            select: {
              reviews: {
                where: { status: 'APPROVED' }
              }
            }
          }
        }
      })
    })
  }
}

// Optimized review queries
export class OptimizedReviewService {
  // Get reviews with pagination and filtering
  static async findMany(options: {
    productId?: string
    status?: string
    skip?: number
    take?: number
    includeProduct?: boolean
  }) {
    return trackDatabaseQuery('reviews.findMany', async () => {
      const { productId, status = 'APPROVED', skip, take, includeProduct = false } = options

      const where: Prisma.ReviewWhereInput = { status: status as any }
      if (productId) {
        where.productId = productId
      }

      return prisma.review.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        include: {
          ...(includeProduct && {
            product: {
              select: {
                name: true,
                slug: true,
                images: true,
                price: true
              }
            }
          }),
          replies: {
            orderBy: { createdAt: 'asc' }
          }
        }
      })
    })
  }

  // Get review statistics for a product
  static async getProductStats(productId: string) {
    return trackDatabaseQuery('reviews.getProductStats', async () => {
      const stats = await prisma.review.groupBy({
        by: ['rating'],
        where: {
          productId,
          status: 'APPROVED'
        },
        _count: {
          rating: true
        }
      })

      const totalReviews = stats.reduce((sum, stat) => sum + stat._count.rating, 0)
      const averageRating = totalReviews > 0 
        ? stats.reduce((sum, stat) => sum + (stat.rating * stat._count.rating), 0) / totalReviews
        : 0

      return {
        totalReviews,
        averageRating: Math.round(averageRating * 10) / 10,
        ratingDistribution: stats.reduce((acc, stat) => {
          acc[stat.rating] = stat._count.rating
          return acc
        }, {} as Record<number, number>)
      }
    })
  }
}

// Optimized order queries
export class OptimizedOrderService {
  // Get user orders with minimal includes
  static async findUserOrders(userId: string, options: {
    skip?: number
    take?: number
    status?: string
  } = {}) {
    return trackDatabaseQuery('orders.findUserOrders', async () => {
      const { skip, take, status } = options
      const where: Prisma.OrderWhereInput = { userId }
      
      if (status) {
        where.status = status as any
      }

      return prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        include: {
          items: {
            include: {
              product: {
                select: {
                  name: true,
                  slug: true,
                  images: true
                }
              }
            }
          }
        }
      })
    })
  }

  // Get order by ID with full details
  static async findById(orderId: string) {
    return trackDatabaseQuery('orders.findById', async () => {
      return prisma.order.findUnique({
        where: { id: orderId },
        include: {
          items: {
            include: {
              product: {
                select: {
                  name: true,
                  slug: true,
                  images: true,
                  price: true
                }
              }
            }
          },
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      })
    })
  }
}

// Optimized user queries
export class OptimizedUserService {
  // Find user by email with minimal data
  static async findByEmail(email: string) {
    return trackDatabaseQuery('users.findByEmail', async () => {
      return prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          password: true,
          firstName: true,
          lastName: true,
          isEmailVerified: true,
          lastLogin: true
        }
      })
    })
  }

  // Get user profile with related data
  static async getProfile(userId: string) {
    return trackDatabaseQuery('users.getProfile', async () => {
      return prisma.user.findUnique({
        where: { id: userId },
        include: {
          addresses: {
            orderBy: { isDefault: 'desc' }
          },
          _count: {
            select: {
              orders: true,
              reviews: true
            }
          }
        }
      })
    })
  }
}

// Database maintenance and optimization
export class DatabaseMaintenance {
  // Analyze query performance
  static async analyzeSlowQueries() {
    if (process.env.NODE_ENV === 'production') {
      try {
        // PostgreSQL specific query to find slow queries
        const slowQueries = await prisma.$queryRaw`
          SELECT query, calls, total_time, mean_time, rows
          FROM pg_stat_statements 
          WHERE mean_time > 100 
          ORDER BY mean_time DESC 
          LIMIT 10
        `
        
        logInfo('Slow queries analysis completed', { slowQueries })
        return slowQueries
      } catch (error) {
        logWarning('Failed to analyze slow queries', {
          error: error instanceof Error ? error.message : String(error)
        })
      }
    }
  }

  // Clean up old data
  static async cleanupOldData() {
    return trackDatabaseQuery('maintenance.cleanupOldData', async () => {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      
      // Clean up old unverified users
      const deletedUsers = await prisma.user.deleteMany({
        where: {
          isEmailVerified: false,
          createdAt: { lt: thirtyDaysAgo }
        }
      })

      // Clean up old pending reviews
      const deletedReviews = await prisma.review.deleteMany({
        where: {
          status: 'PENDING',
          createdAt: { lt: thirtyDaysAgo }
        }
      })

      logInfo('Database cleanup completed', {
        deletedUsers: deletedUsers.count,
        deletedReviews: deletedReviews.count
      })

      return {
        deletedUsers: deletedUsers.count,
        deletedReviews: deletedReviews.count
      }
    })
  }

  // Update database statistics
  static async updateStatistics() {
    if (process.env.NODE_ENV === 'production') {
      try {
        await prisma.$queryRaw`ANALYZE`
        logInfo('Database statistics updated')
      } catch (error) {
        logWarning('Failed to update database statistics', {
          error: error instanceof Error ? error.message : String(error)
        })
      }
    }
  }
}

// Connection pool monitoring
export const getConnectionPoolStats = () => {
  // This would be implemented based on your connection pool library
  // For now, return basic info
  return {
    activeConnections: 'N/A', // Would need connection pool library
    idleConnections: 'N/A',
    totalConnections: 'N/A',
    maxConnections: process.env.DATABASE_MAX_CONNECTIONS || 'default'
  }
}

// Graceful shutdown
export const closeDatabaseConnection = async () => {
  try {
    await prisma.$disconnect()
    logInfo('Database connection closed gracefully')
  } catch (error) {
    logWarning('Error closing database connection', {
      error: error instanceof Error ? error.message : String(error)
    })
  }
} 