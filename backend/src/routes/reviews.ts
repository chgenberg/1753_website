import { Router } from 'express'
import { z } from 'zod'
import { logger } from '../utils/logger'
import prisma from '../lib/prisma'
import multer from 'multer'
import path from 'path'
import fs from 'fs/promises'

const router = Router()

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../../uploads/reviews')
    try {
      await fs.mkdir(uploadPath, { recursive: true })
      cb(null, uploadPath)
    } catch (error) {
      cb(error as Error, '')
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, `review-${uniqueSuffix}${path.extname(file.originalname)}`)
  }
})

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
    files: 3 // Max 3 images
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
    const mimetype = allowedTypes.test(file.mimetype)
    
    if (mimetype && extname) {
      return cb(null, true)
    } else {
      cb(new Error('Only images are allowed'))
    }
  }
})

// Schema for review creation
const createReviewSchema = z.object({
  rating: z.string().transform(val => parseInt(val)).pipe(z.number().min(1).max(5)),
  title: z.string().optional(),
  review: z.string().min(10, 'Review must be at least 10 characters'),
  recommend: z.string().transform(val => val === 'true'),
  productId: z.string(),
  orderNumber: z.string().optional(),
  customerName: z.string(),
  customerEmail: z.string().email(),
  verified: z.string().transform(val => val === 'true').optional()
})

/**
 * Create a new review
 */
router.post('/create', upload.array('images', 3), async (req, res) => {
  try {
    const validatedData = createReviewSchema.parse(req.body)
    const images = req.files as Express.Multer.File[]
    
    // Verify if this is a real purchase
    let verifiedPurchase = false
    if (validatedData.orderNumber) {
      const order = await prisma.order.findFirst({
        where: {
          orderNumber: validatedData.orderNumber,
          email: validatedData.customerEmail,
          paymentStatus: 'PAID'
        },
        include: {
          items: true
        }
      })
      
      if (order) {
        // Check if the product was in this order
        const productInOrder = order.items.some(item => item.productId === validatedData.productId)
        verifiedPurchase = productInOrder
      }
    }
    
    // Create the review
    const review = await prisma.review.create({
      data: {
        productId: validatedData.productId,
        rating: validatedData.rating,
        title: validatedData.title || '',
        comment: validatedData.review,
        reviewerName: validatedData.customerName,
        reviewerEmail: validatedData.customerEmail,
        wouldRecommend: validatedData.recommend,
        verifiedPurchase: verifiedPurchase || validatedData.verified || false,
        approved: true, // Auto-approve verified purchases
        images: images.map(img => `/uploads/reviews/${img.filename}`),
        helpful: 0,
        notHelpful: 0
      }
    })
    
    // Update product rating
    await updateProductRating(validatedData.productId)
    
    logger.info('Review created successfully', {
      reviewId: review.id,
      productId: validatedData.productId,
      verified: verifiedPurchase
    })
    
    res.json({
      success: true,
      review,
      message: 'Tack för din recension!'
    })
  } catch (error: any) {
    logger.error('Error creating review:', error)
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid review data',
        details: error.errors
      })
    }
    
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create review'
    })
  }
})

/**
 * Get reviews for a product
 */
router.get('/product/:productId', async (req, res) => {
  try {
    const { productId } = req.params
    const { page = '1', limit = '10', sort = 'newest' } = req.query
    
    const pageNum = parseInt(page as string)
    const limitNum = parseInt(limit as string)
    const skip = (pageNum - 1) * limitNum
    
    // Sort options
    const orderBy = sort === 'helpful' 
      ? { helpful: 'desc' as const }
      : { createdAt: 'desc' as const }
    
    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: {
          productId,
          approved: true
        },
        orderBy,
        skip,
        take: limitNum,
        select: {
          id: true,
          rating: true,
          title: true,
          comment: true,
          reviewerName: true,
          verifiedPurchase: true,
          wouldRecommend: true,
          images: true,
          helpful: true,
          notHelpful: true,
          createdAt: true
        }
      }),
      prisma.review.count({
        where: {
          productId,
          approved: true
        }
      })
    ])
    
    // Get rating distribution
    const ratingDistribution = await prisma.review.groupBy({
      by: ['rating'],
      where: {
        productId,
        approved: true
      },
      _count: {
        rating: true
      }
    })
    
    const distribution = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0
    }
    
    ratingDistribution.forEach(item => {
      distribution[item.rating as keyof typeof distribution] = item._count.rating
    })
    
    res.json({
      success: true,
      reviews,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum)
      },
      statistics: {
        totalReviews: total,
        ratingDistribution: distribution,
        recommendPercentage: await getRecommendPercentage(productId)
      }
    })
  } catch (error) {
    logger.error('Error fetching reviews:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch reviews'
    })
  }
})

/**
 * Mark review as helpful/not helpful
 */
router.post('/:reviewId/helpful', async (req, res) => {
  try {
    const { reviewId } = req.params
    const { helpful } = req.body
    
    const review = await prisma.review.update({
      where: { id: reviewId },
      data: {
        helpful: helpful ? { increment: 1 } : undefined,
        notHelpful: !helpful ? { increment: 1 } : undefined
      }
    })
    
    res.json({
      success: true,
      review
    })
  } catch (error) {
    logger.error('Error updating review helpfulness:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to update review'
    })
  }
})

// Helper functions
async function updateProductRating(productId: string) {
  const reviews = await prisma.review.findMany({
    where: {
      productId,
      approved: true
    },
    select: {
      rating: true
    }
  })
  
  if (reviews.length === 0) return
  
  const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
  
  await prisma.product.update({
    where: { id: productId },
    data: {
      averageRating: Math.round(averageRating * 10) / 10,
      reviewCount: reviews.length
    }
  })
}

async function getRecommendPercentage(productId: string): Promise<number> {
  const [totalRecommend, totalReviews] = await Promise.all([
    prisma.review.count({
      where: {
        productId,
        approved: true,
        wouldRecommend: true
      }
    }),
    prisma.review.count({
      where: {
        productId,
        approved: true
      }
    })
  ])
  
  if (totalReviews === 0) return 0
  return Math.round((totalRecommend / totalReviews) * 100)
}

export default router 