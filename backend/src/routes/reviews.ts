import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { authenticateToken as auth } from '../middleware/auth'
import { logger } from '../utils/logger'
import { z } from 'zod'

const router = Router()

// Validation schemas
const createReviewSchema = z.object({
  productId: z.string(),
  rating: z.number().min(1).max(5),
  title: z.string().min(1).max(100),
  body: z.string().min(10).max(2000),
  reviewerName: z.string().min(1).max(50),
  reviewerEmail: z.string().email(),
  reviewerLocation: z.string().optional(),
  skinType: z.string().optional(),
  ageRange: z.string().optional(),
  usageDuration: z.string().optional(),
  skinConcerns: z.array(z.string()).optional(),
  photos: z.array(z.object({
    url: z.string(),
    alt: z.string().optional()
  })).optional()
})

const replySchema = z.object({
  body: z.string().min(1).max(1000),
  authorName: z.string().min(1).max(50)
})

/**
 * GET /api/reviews/product/:productId
 * Get all approved reviews for a product
 */
router.get('/product/:productId', async (req, res) => {
  try {
    const { productId } = req.params
    const { page = 1, limit = 10, sortBy = 'newest' } = req.query

    const pageNum = parseInt(page as string)
    const limitNum = parseInt(limit as string)
    const skip = (pageNum - 1) * limitNum

    // Determine sort order
    let orderBy: any = { createdAt: 'desc' } // newest
    if (sortBy === 'oldest') orderBy = { createdAt: 'asc' }
    if (sortBy === 'highest') orderBy = { rating: 'desc' }
    if (sortBy === 'lowest') orderBy = { rating: 'asc' }
    if (sortBy === 'helpful') orderBy = { helpfulVotes: 'desc' }

    const [reviews, totalCount, averageRating] = await Promise.all([
      prisma.review.findMany({
        where: {
          productId,
          status: 'APPROVED'
        },
        include: {
          replies: {
            orderBy: { createdAt: 'asc' }
          }
        },
        orderBy,
        skip,
        take: limitNum
      }),
      prisma.review.count({
        where: {
          productId,
          status: 'APPROVED'
        }
      }),
      prisma.review.aggregate({
        where: {
          productId,
          status: 'APPROVED'
        },
        _avg: {
          rating: true
        },
        _count: {
          rating: true
        }
      })
    ])

    // Calculate rating distribution
    const ratingDistribution = await prisma.review.groupBy({
      by: ['rating'],
      where: {
        productId,
        status: 'APPROVED'
      },
      _count: {
        rating: true
      }
    })

    const distribution = [1, 2, 3, 4, 5].map(rating => ({
      rating,
      count: ratingDistribution.find(r => r.rating === rating)?._count.rating || 0
    }))

    res.json({
      reviews,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalCount,
        pages: Math.ceil(totalCount / limitNum)
      },
      stats: {
        averageRating: averageRating._avg.rating || 0,
        totalReviews: averageRating._count.rating || 0,
        distribution
      }
    })
  } catch (error: any) {
    logger.error('Error fetching product reviews', { error: error.message, productId: req.params.productId })
    res.status(500).json({ error: 'Failed to fetch reviews' })
  }
})

/**
 * POST /api/reviews
 * Create a new review
 */
router.post('/', async (req, res) => {
  try {
    const validatedData = createReviewSchema.parse(req.body)

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: validatedData.productId }
    })

    if (!product) {
      return res.status(404).json({ error: 'Product not found' })
    }

    // Check if user already reviewed this product (if email provided)
    const existingReview = await prisma.review.findFirst({
      where: {
        productId: validatedData.productId,
        reviewerEmail: validatedData.reviewerEmail
      }
    })

    if (existingReview) {
      return res.status(400).json({ error: 'You have already reviewed this product' })
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        productId: validatedData.productId,
        rating: validatedData.rating,
        title: validatedData.title,
        body: validatedData.body,
        reviewerName: validatedData.reviewerName,
        reviewerEmail: validatedData.reviewerEmail,
        reviewerLocation: validatedData.reviewerLocation,
        skinType: validatedData.skinType,
        ageRange: validatedData.ageRange,
        usageDuration: validatedData.usageDuration,
        photos: validatedData.photos || [],
        skinConcerns: validatedData.skinConcerns || [],
        status: 'PENDING' // Reviews need approval
      },
      include: {
        replies: true
      }
    })

    logger.info('Review created', { reviewId: review.id, productId: validatedData.productId })

    res.status(201).json({
      message: 'Review submitted successfully. It will be published after moderation.',
      review
    })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid data', details: error.errors })
    }
    logger.error('Error creating review', { error: error.message })
    res.status(500).json({ error: 'Failed to create review' })
  }
})

/**
 * POST /api/reviews/:reviewId/reply
 * Add a reply to a review (admin only)
 */
router.post('/:reviewId/reply', auth, async (req, res) => {
  try {
    const { reviewId } = req.params
    const validatedData = replySchema.parse(req.body)

    // Check if review exists
    const review = await prisma.review.findUnique({
      where: { id: reviewId }
    })

    if (!review) {
      return res.status(404).json({ error: 'Review not found' })
    }

    // Create reply
    const reply = await prisma.reviewReply.create({
      data: {
        reviewId,
        authorType: 'ADMIN',
        authorName: validatedData.authorName,
        body: validatedData.body
      }
    })

    logger.info('Review reply created', { replyId: reply.id, reviewId })

    res.status(201).json({
      message: 'Reply added successfully',
      reply
    })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid data', details: error.errors })
    }
    logger.error('Error creating review reply', { error: error.message })
    res.status(500).json({ error: 'Failed to create reply' })
  }
})

/**
 * PUT /api/reviews/:reviewId/helpful
 * Mark a review as helpful
 */
router.put('/:reviewId/helpful', async (req, res) => {
  try {
    const { reviewId } = req.params

    const review = await prisma.review.update({
      where: { id: reviewId },
      data: {
        helpfulVotes: {
          increment: 1
        }
      }
    })

    res.json({
      message: 'Review marked as helpful',
      helpfulVotes: review.helpfulVotes
    })
  } catch (error: any) {
    logger.error('Error marking review as helpful', { error: error.message })
    res.status(500).json({ error: 'Failed to mark review as helpful' })
  }
})

/**
 * PUT /api/reviews/:reviewId/report
 * Report a review
 */
router.put('/:reviewId/report', async (req, res) => {
  try {
    const { reviewId } = req.params

    const review = await prisma.review.update({
      where: { id: reviewId },
      data: {
        reportedCount: {
          increment: 1
        }
      }
    })

    // Auto-hide if too many reports
    if (review.reportedCount >= 5) {
      await prisma.review.update({
        where: { id: reviewId },
        data: { status: 'HIDDEN' }
      })
    }

    res.json({
      message: 'Review reported successfully'
    })
  } catch (error: any) {
    logger.error('Error reporting review', { error: error.message })
    res.status(500).json({ error: 'Failed to report review' })
  }
})

/**
 * Admin endpoints
 */

/**
 * GET /api/reviews/admin/pending
 * Get all pending reviews (admin only)
 */
router.get('/admin/pending', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query

    const pageNum = parseInt(page as string)
    const limitNum = parseInt(limit as string)
    const skip = (pageNum - 1) * limitNum

    const [reviews, totalCount] = await Promise.all([
      prisma.review.findMany({
        where: { status: 'PENDING' },
        include: {
          product: {
            select: { name: true, slug: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum
      }),
      prisma.review.count({
        where: { status: 'PENDING' }
      })
    ])

    res.json({
      reviews,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalCount,
        pages: Math.ceil(totalCount / limitNum)
      }
    })
  } catch (error: any) {
    logger.error('Error fetching pending reviews', { error: error.message })
    res.status(500).json({ error: 'Failed to fetch pending reviews' })
  }
})

/**
 * PUT /api/reviews/admin/:reviewId/approve
 * Approve a review (admin only)
 */
router.put('/admin/:reviewId/approve', auth, async (req, res) => {
  try {
    const { reviewId } = req.params

    const review = await prisma.review.update({
      where: { id: reviewId },
      data: { status: 'APPROVED' }
    })

    logger.info('Review approved', { reviewId })

    res.json({
      message: 'Review approved successfully',
      review
    })
  } catch (error: any) {
    logger.error('Error approving review', { error: error.message })
    res.status(500).json({ error: 'Failed to approve review' })
  }
})

/**
 * PUT /api/reviews/admin/:reviewId/reject
 * Reject a review (admin only)
 */
router.put('/admin/:reviewId/reject', auth, async (req, res) => {
  try {
    const { reviewId } = req.params
    const { moderatorNotes } = req.body

    const review = await prisma.review.update({
      where: { id: reviewId },
      data: { 
        status: 'REJECTED',
        moderatorNotes: moderatorNotes || null
      }
    })

    logger.info('Review rejected', { reviewId })

    res.json({
      message: 'Review rejected successfully',
      review
    })
  } catch (error: any) {
    logger.error('Error rejecting review', { error: error.message })
    res.status(500).json({ error: 'Failed to reject review' })
  }
})

/**
 * GET /api/reviews/stats
 * Get review statistics
 */
router.get('/stats', async (req, res) => {
  try {
    const stats = await prisma.review.groupBy({
      by: ['status'],
      _count: {
        id: true
      }
    })

    const totalReviews = await prisma.review.count()
    const averageRating = await prisma.review.aggregate({
      where: { status: 'APPROVED' },
      _avg: { rating: true }
    })

    res.json({
      totalReviews,
      averageRating: averageRating._avg.rating || 0,
      byStatus: stats.reduce((acc, stat) => {
        acc[stat.status] = stat._count.id
        return acc
      }, {} as Record<string, number>)
    })
  } catch (error: any) {
    logger.error('Error fetching review stats', { error: error.message })
    res.status(500).json({ error: 'Failed to fetch review stats' })
  }
})

export default router 