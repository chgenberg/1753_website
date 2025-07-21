import express from 'express'
import { param, query } from 'express-validator'
import { prisma } from '../lib/prisma'
import { logger } from '../utils/logger'
import { Request, Response } from 'express'

const router = express.Router()

// Validation middleware
const handleValidation = (req: any, res: any, next: any) => {
  const errors = require('express-validator').validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    })
  }
  next()
}

/**
 * GET /api/reviews/product/:productSlug
 * Hämta recensioner för en specifik produkt baserat på slug
 */
router.get('/product/:productSlug', 
  [
    param('productSlug').isString().withMessage('Invalid product slug'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
    query('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    query('sortBy').optional().isIn(['newest', 'oldest', 'highest', 'lowest', 'helpful']).withMessage('Invalid sort option')
  ],
  handleValidation,
  async (req, res) => {
    try {
      const { productSlug } = req.params
      const { 
        page = 1, 
        limit = 10, 
        rating, 
        sortBy = 'newest' 
      } = req.query

      // First find the product by slug
      const product = await prisma.product.findUnique({
        where: { slug: productSlug },
        select: { id: true }
      })

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        })
      }

      // Build where clause for reviews
      const where: any = {
        productId: product.id,
        status: 'APPROVED'
      }

      if (rating) {
        where.rating = parseInt(rating as string)
      }

      // Build orderBy
      let orderBy: any = {}
      switch (sortBy) {
        case 'newest':
          orderBy = { createdAt: 'desc' }
          break
        case 'oldest':
          orderBy = { createdAt: 'asc' }
          break
        case 'highest':
          orderBy = [{ rating: 'desc' }, { createdAt: 'desc' }]
          break
        case 'lowest':
          orderBy = [{ rating: 'asc' }, { createdAt: 'desc' }]
          break
        case 'helpful':
          orderBy = [{ helpfulVotes: 'desc' }, { createdAt: 'desc' }]
          break
      }

      const skip = (parseInt(page as string) - 1) * parseInt(limit as string)

      // Get reviews and stats
      const [reviews, totalReviews, stats] = await Promise.all([
        prisma.review.findMany({
          where,
          orderBy,
          skip,
          take: parseInt(limit as string)
        }),
        prisma.review.count({ where }),
        getProductStats(product.id)
      ])

      const pagination = {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total: totalReviews,
        pages: Math.ceil(totalReviews / parseInt(limit as string)),
        hasNext: parseInt(page as string) < Math.ceil(totalReviews / parseInt(limit as string)),
        hasPrev: parseInt(page as string) > 1
      }

      res.json({
        success: true,
        data: {
          reviews,
          pagination,
          stats
        }
      })
    } catch (error: any) {
      logger.error('Error fetching product reviews:', error)
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch reviews'
      })
    }
  }
)

/**
 * GET /api/reviews/product/:productSlug/stats
 * Hämta statistik för en produkt baserat på slug
 */
router.get('/product/:productSlug/stats',
  [
    param('productSlug').isString().withMessage('Invalid product slug')
  ],
  handleValidation,
  async (req, res) => {
    try {
      const { productSlug } = req.params

      // First find the product by slug
      const product = await prisma.product.findUnique({
        where: { slug: productSlug },
        select: { id: true }
      })

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        })
      }

      const stats = await getProductStats(product.id)

      res.json({
        success: true,
        data: stats
      })
    } catch (error: any) {
      logger.error('Error fetching product stats:', error)
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch stats'
      })
    }
  }
)

/**
 * GET /api/reviews/featured
 * Hämta utvalda recensioner för startsidan
 */
router.get('/featured', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 6

    const reviews = await prisma.review.findMany({
      where: {
        status: 'APPROVED',
        rating: { gte: 4 } // Endast 4-5 stjärnor
      },
      orderBy: [
        { helpfulVotes: 'desc' },
        { createdAt: 'desc' }
      ],
      take: limit,
      include: {
        product: {
          select: {
            name: true,
            slug: true
          }
        }
      }
    })

    res.json({
      success: true,
      data: reviews
    })
  } catch (error: any) {
    logger.error('Error fetching featured reviews:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch featured reviews'
    })
  }
})

/**
 * GET /api/reviews
 * Hämta alla godkända recensioner med filtrering
 */
router.get('/', async (req: Request, res: Response) => {
  const { page = 1, limit = 10, includePending } = req.query;
  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);

  const where: any = {};
  if (!includePending || includePending !== 'true') {
    where.status = 'APPROVED';
  }

  try {
    const reviews = await prisma.review.findMany({
      where,
      take: limitNum,
      skip: (pageNum - 1) * limitNum,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        product: {
          select: {
            name: true,
            slug: true,
          }
        }
      }
    });

    const totalCount = await prisma.review.count({ where });

    res.json({
      reviews,
      totalCount,
      hasMore: (pageNum * limitNum) < totalCount,
      currentPage: pageNum,
      totalPages: Math.ceil(totalCount / limitNum)
    });
  } catch (error) {
    logger.error('Error fetching reviews:', error)
    res.status(500).json({ error: 'Failed to fetch reviews' })
  }
})

/**
 * GET /api/reviews/stats
 * Hämta statistik för alla godkända recensioner
 */
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const includePending = req.query.includePending !== undefined

    const stats = await prisma.review.aggregate({
      where: includePending ? {} : { status: 'APPROVED' },
      _count: true,
      _avg: {
        rating: true
      }
    })

    const ratingDistribution = await prisma.review.groupBy({
      by: ['rating'],
      where: { status: 'APPROVED' },
      _count: true,
      orderBy: {
        rating: 'desc'
      }
    })

    // Convert to object format
    const distribution: Record<number, number> = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0
    }

    ratingDistribution.forEach(item => {
      distribution[item.rating] = item._count
    })

    res.json({
      totalReviews: stats._count,
      averageRating: stats._avg.rating || 0,
      ratingDistribution: distribution
    })
  } catch (error) {
    logger.error('Error fetching review stats:', error)
    res.status(500).json({ error: 'Failed to fetch review statistics' })
  }
})

/**
 * Helper function to get product statistics
 */
async function getProductStats(productId: string) {
  const reviews = await prisma.review.findMany({
    where: {
      productId,
      status: 'APPROVED'
    },
    select: {
      rating: true
    }
  })

  const totalReviews = reviews.length
  const averageRating = totalReviews > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews 
    : 0

  // Calculate rating distribution
  const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  reviews.forEach(review => {
    ratingDistribution[review.rating as keyof typeof ratingDistribution]++
  })

  // Get recent reviews
  const recentReviews = await prisma.review.findMany({
    where: {
      productId,
      status: 'APPROVED'
    },
    orderBy: { createdAt: 'desc' },
    take: 3
  })

  return {
    averageRating: Math.round(averageRating * 10) / 10,
    totalReviews,
    ratingDistribution,
    recentReviews
  }
}

export default router 