import { Request, Response, NextFunction } from 'express'
import { prisma } from '../lib/prisma'
import { AppError } from '../middleware/errorHandler'

// @desc    Get all products
// @route   GET /api/products
// @access  Public
export const getProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 12
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = { isActive: true }

    // Category filter
    if (req.query.category) {
      where.category = { contains: req.query.category as string, mode: 'insensitive' }
    }

    // Price range filter
    if (req.query.minPrice || req.query.maxPrice) {
      where.price = {}
      if (req.query.minPrice) where.price.gte = parseFloat(req.query.minPrice as string)
      if (req.query.maxPrice) where.price.lte = parseFloat(req.query.maxPrice as string)
    }

    // Search filter
    if (req.query.search) {
      const searchTerm = req.query.search as string
      where.OR = [
        { name: { contains: searchTerm, mode: 'insensitive' } },
        { description: { contains: searchTerm, mode: 'insensitive' } }
      ]
    }

    // Featured filter
    if (req.query.featured === 'true') {
      where.isFeatured = true
    }

    // Sorting
    let orderBy: any = { createdAt: 'desc' }
    switch (req.query.sort) {
      case 'price-asc':
        orderBy = { price: 'asc' }
        break
      case 'price-desc':
        orderBy = { price: 'desc' }
        break
      case 'newest':
        orderBy = { createdAt: 'desc' }
        break
      case 'oldest':
        orderBy = { createdAt: 'asc' }
        break
      case 'featured':
        orderBy = [
          { isFeatured: 'desc' },
          { createdAt: 'desc' }
        ]
        break
    }

    // Execute query with reviews and calculate ratings
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          reviews: {
            where: { status: 'APPROVED' },
            select: { rating: true }
          },
          _count: {
            select: {
              reviews: {
                where: { status: 'APPROVED' }
              }
            }
          }
        }
      }),
      prisma.product.count({ where })
    ])

    // Calculate ratings for each product
    const productsWithRatings = products.map(product => {
      const approvedReviews = product.reviews || []
      const reviewCount = product._count.reviews
      
      let averageRating = 0
      if (approvedReviews.length > 0) {
        const totalRating = approvedReviews.reduce((sum, review) => sum + review.rating, 0)
        averageRating = totalRating / approvedReviews.length
      }

      // Remove the raw reviews data and replace with rating info
      const { reviews, _count, ...productData } = product
      
      return {
        ...productData,
        rating: {
          average: Math.round(averageRating * 10) / 10, // Round to 1 decimal
          count: reviewCount
        }
      }
    })

    // Pagination info
    const totalPages = Math.ceil(total / limit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1

    res.status(200).json({
      success: true,
      data: productsWithRatings,
      pagination: {
        currentPage: page,
        totalPages,
        totalProducts: total,
        hasNextPage,
        hasPrevPage,
        limit
      }
    })
  } catch (error) {
    next(new AppError('Error fetching products', 500))
  }
}

// @desc    Get single product by slug
// @route   GET /api/products/:slug
// @access  Public
export const getProductBySlug = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { slug } = req.params

    const product = await prisma.product.findUnique({
      where: { slug, isActive: true },
      include: {
        reviews: {
          where: { status: 'APPROVED' },
          select: { rating: true }
        },
        _count: {
          select: {
            reviews: {
              where: { status: 'APPROVED' }
            }
          }
        }
      }
    })

    if (!product) {
      return next(new AppError('Product not found', 404))
    }

    // Calculate rating
    const approvedReviews = product.reviews || []
    const reviewCount = product._count.reviews
    
    let averageRating = 0
    if (approvedReviews.length > 0) {
      const totalRating = approvedReviews.reduce((sum, review) => sum + review.rating, 0)
      averageRating = totalRating / approvedReviews.length
    }

    // Remove the raw reviews data and replace with rating info
    const { reviews, _count, ...productData } = product
    
    const productWithRating = {
      ...productData,
      rating: {
        average: Math.round(averageRating * 10) / 10,
        count: reviewCount
      }
    }

    res.status(200).json({
      success: true,
      data: productWithRating
    })
  } catch (error) {
    next(new AppError('Error fetching product', 500))
  }
}

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
export const getFeaturedProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 4

    const products = await prisma.product.findMany({
      where: { 
        isActive: true,
        isFeatured: true
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        reviews: {
          where: { status: 'APPROVED' },
          select: { rating: true }
        },
        _count: {
          select: {
            reviews: {
              where: { status: 'APPROVED' }
            }
          }
        }
      }
    })

    // Calculate ratings for each product
    const productsWithRatings = products.map(product => {
      const approvedReviews = product.reviews || []
      const reviewCount = product._count.reviews
      
      let averageRating = 0
      if (approvedReviews.length > 0) {
        const totalRating = approvedReviews.reduce((sum, review) => sum + review.rating, 0)
        averageRating = totalRating / approvedReviews.length
      }

      // Remove the raw reviews data and replace with rating info
      const { reviews, _count, ...productData } = product
      
      return {
        ...productData,
        rating: {
          average: Math.round(averageRating * 10) / 10,
          count: reviewCount
        }
      }
    })

    res.status(200).json({
      success: true,
      data: productsWithRatings
    })
  } catch (error) {
    next(new AppError('Error fetching featured products', 500))
  }
} 