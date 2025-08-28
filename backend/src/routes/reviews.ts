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
         body: validatedData.review,
         reviewerName: validatedData.customerName,
         reviewerEmail: validatedData.customerEmail,
         isVerifiedPurchase: verifiedPurchase || validatedData.verified || false,
         status: verifiedPurchase ? 'APPROVED' : 'PENDING', // Auto-approve verified purchases
         photos: images.map(img => ({ url: `/uploads/reviews/${img.filename}`, alt: '' })),
         helpfulVotes: 0
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
    const { page = '1', limit = '10', sort = 'newest', locale } = req.query as any
    
    const pageNum = parseInt(page as string)
    const limitNum = parseInt(limit as string)
    const skip = (pageNum - 1) * limitNum
    const loc = typeof locale === 'string' ? locale.toLowerCase() : undefined
    
    // Sort options
    const orderBy = sort === 'helpful' 
      ? { helpfulVotes: 'desc' as const }
      : { createdAt: 'desc' as const }
    
    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: {
          productId,
          status: 'APPROVED'
        },
        orderBy,
        skip,
        take: limitNum,
        select: {
          id: true,
          rating: true,
          title: true,
          body: true,
          reviewerName: true,
          isVerifiedPurchase: true,
          photos: true,
          helpfulVotes: true,
          createdAt: true,
          translations: loc ? {
            where: { locale: loc },
            select: { title: true, body: true }
          } : false as any
        }
      }),
      prisma.review.count({
        where: {
          productId,
          status: 'APPROVED'
        }
      })
    ])
    
    const mapped = reviews.map((r: any) => {
      const tr = Array.isArray(r.translations) && r.translations[0]
      return {
        ...r,
        title: tr?.title || r.title,
        body: tr?.body || r.body,
        translations: undefined
      }
    })
    
    // Get rating distribution
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
      reviews: mapped,
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
         helpfulVotes: helpful ? { increment: 1 } : undefined
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

/**
 * List all reviews
 */
router.get('/', async (req, res) => {
  try {
    const { page = '1', limit = '10', locale } = req.query as any
    const pageNum = parseInt(page as string)
    const limitNum = parseInt(limit as string)
    const skip = (pageNum - 1) * limitNum
    const loc = typeof locale === 'string' ? locale.toLowerCase() : undefined

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { status: 'APPROVED' },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
        select: {
          id: true,
          rating: true,
          title: true,
          body: true,
          reviewerName: true,
          isVerifiedPurchase: true,
          photos: true,
          helpfulVotes: true,
          createdAt: true,
          translations: loc ? {
            where: { locale: loc },
            select: { title: true, body: true }
          } : false as any
        }
      }),
      prisma.review.count({ where: { status: 'APPROVED' } })
    ])

    const mapped = reviews.map((r: any) => {
      const tr = Array.isArray(r.translations) && r.translations[0]
      return {
        ...r,
        title: tr?.title || r.title,
        body: tr?.body || r.body,
        translations: undefined
      }
    })

    res.json({ success: true, reviews: mapped, total })
  } catch (error) {
    logger.error('Error listing reviews:', error)
    res.status(500).json({ success: false, error: 'Failed to list reviews' })
  }
})

/**
 * Get review statistics
 */
router.get('/stats', async (req, res) => {
  try {
    const total = await prisma.review.count({ where: { status: 'APPROVED' } })
    const average = await prisma.review.aggregate({
      _avg: { rating: true },
      where: { status: 'APPROVED' }
    })

    res.json({
      success: true,
      averageRating: Math.round((average._avg.rating || 0) * 10) / 10,
      total
    })
  } catch (error) {
    logger.error('Error getting review stats:', error)
    res.status(500).json({ success: false, error: 'Failed to get stats' })
  }
})

/**
 * Get product review statistics
 */
router.get('/product/:productId/stats', async (req, res) => {
  try {
    const { productId } = req.params
    const total = await prisma.review.count({ where: { status: 'APPROVED', productId } })
    const average = await prisma.review.aggregate({
      _avg: { rating: true },
      where: { status: 'APPROVED', productId }
    })

    res.json({
      success: true,
      averageRating: Math.round((average._avg.rating || 0) * 10) / 10,
      total
    })
  } catch (error) {
    logger.error('Error getting product review stats:', error)
    res.status(500).json({ success: false, error: 'Failed to get stats' })
  }
})

// Helper functions
async function updateProductRating(productId: string) {
  // Product rating calculation - could be implemented later
  // when averageRating and reviewCount fields are added to Product model
  console.log(`Product rating update requested for ${productId}`)
}

async function getRecommendPercentage(productId: string): Promise<number> {
  const totalReviews = await prisma.review.count({
    where: {
      productId,
      status: 'APPROVED'
    }
  })
  
  if (totalReviews === 0) return 0
  
  // For now, return a placeholder percentage
  // This could be enhanced when wouldRecommend field is added
  return 85 // Placeholder recommendation percentage
}

export default router 