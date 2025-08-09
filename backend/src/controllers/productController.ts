import { Request, Response, NextFunction } from 'express'
import { prisma } from '../lib/prisma'
import { AppError } from '../middleware/errorHandler'

const SUPPORTED_LOCALES = ['sv', 'en', 'es', 'de', 'fr'] as const

type SupportedLocale = typeof SUPPORTED_LOCALES[number]

function getRequestedLocale(req: Request): SupportedLocale {
  const q = (req.query.locale as string | undefined)?.toLowerCase()
  if (q && (SUPPORTED_LOCALES as readonly string[]).includes(q)) return q as SupportedLocale
  const h = (req.headers['accept-language'] as string | undefined) || ''
  const candidate = h.split(',')[0]?.split('-')[0]?.toLowerCase()
  if (candidate && (SUPPORTED_LOCALES as readonly string[]).includes(candidate)) return candidate as SupportedLocale
  return 'sv'
}

function overlayProductWithTranslation(p: any, t: any | null) {
  if (!t) return p
  return {
    ...p,
    name: t.name ?? p.name,
    description: t.description ?? p.description,
    longDescription: t.longDescription ?? p.longDescription,
    howToUse: t.howToUse ?? p.howToUse,
    metaTitle: t.metaTitle ?? p.metaTitle,
    metaDescription: t.metaDescription ?? p.metaDescription
  }
}

async function applyTranslations(products: any[], locale: SupportedLocale) {
  if (locale === 'sv' || products.length === 0) return products
  const ids = products.map(p => p.id)
  const translations = await prisma.productTranslation.findMany({
    where: { productId: { in: ids }, locale }
  })
  const byId: Record<string, any> = {}
  for (const t of translations) byId[t.productId] = t
  return products.map(p => overlayProductWithTranslation(p, byId[p.id] || null))
}

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
    const locale = getRequestedLocale(req)

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
        // Custom order for featured products - handle in post-processing
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
    let productsWithRatings = products.map(product => {
      const approvedReviews = product.reviews || []
      const reviewCount = product._count.reviews
      let averageRating = 0
      if (approvedReviews.length > 0) {
        const totalRating = approvedReviews.reduce((sum, review) => sum + review.rating, 0)
        averageRating = totalRating / approvedReviews.length
      }
      const { reviews, _count, ...productData } = product
      return {
        ...productData,
        rating: {
          average: Math.round(averageRating * 10) / 10, // Round to 1 decimal
          count: reviewCount
        }
      }
    })

    // Apply custom ordering for featured products
    if (req.query.sort === 'featured' || req.query.featured === 'true') {
      const customOrder = [
        'duo-kit-ta-da-serum',
        'duo-kit-the-one-i-love', 
        'ta-da-serum',
        'au-naturel-makeup-remover',
        'fungtastic-mushroom-extract',
        'i-love-facial-oil',
        'the-one-facial-oil'
      ]
      productsWithRatings.sort((a, b) => {
        const aIndex = customOrder.indexOf(a.slug)
        const bIndex = customOrder.indexOf(b.slug)
        if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex
        if (aIndex !== -1 && bIndex === -1) return -1
        if (aIndex === -1 && bIndex !== -1) return 1
        if (a.isFeatured && !b.isFeatured) return -1
        if (!a.isFeatured && b.isFeatured) return 1
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      })
    }

    // Apply locale translations
    productsWithRatings = await applyTranslations(productsWithRatings, locale)

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
    const locale = getRequestedLocale(req)

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

    const approvedReviews = product.reviews || []
    const reviewCount = product._count.reviews
    let averageRating = 0
    if (approvedReviews.length > 0) {
      const totalRating = approvedReviews.reduce((sum, review) => sum + review.rating, 0)
      averageRating = totalRating / approvedReviews.length
    }

    const { reviews, _count, ...productData } = product
    let productWithRating: any = {
      ...productData,
      rating: {
        average: Math.round(averageRating * 10) / 10,
        count: reviewCount
      }
    }

    if (locale !== 'sv') {
      const t = await prisma.productTranslation.findUnique({ where: { productId_locale: { productId: product.id, locale } } })
      productWithRating = overlayProductWithTranslation(productWithRating, t)
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
    const locale = getRequestedLocale(req)

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

    let productsWithRatings = products.map(product => {
      const approvedReviews = product.reviews || []
      const reviewCount = product._count.reviews
      let averageRating = 0
      if (approvedReviews.length > 0) {
        const totalRating = approvedReviews.reduce((sum, review) => sum + review.rating, 0)
        averageRating = totalRating / approvedReviews.length
      }
      const { reviews, _count, ...productData } = product
      return {
        ...productData,
        rating: {
          average: Math.round(averageRating * 10) / 10,
          count: reviewCount
        }
      }
    })

    productsWithRatings = await applyTranslations(productsWithRatings, locale)

    res.status(200).json({
      success: true,
      data: productsWithRatings
    })
  } catch (error) {
    next(new AppError('Error fetching featured products', 500))
  }
}

// @desc    Get related products for a specific product
// @route   GET /api/products/:slug/related
// @access  Public
export const getRelatedProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { slug } = req.params
    const limit = parseInt(req.query.limit as string) || 4
    const locale = getRequestedLocale(req)

    // First get the current product
    const currentProduct = await prisma.product.findUnique({
      where: { slug, isActive: true }
    })

    if (!currentProduct) {
      return next(new AppError('Product not found', 404))
    }

    // Build scoring query for related products
    const relatedProducts = await prisma.product.findMany({
      where: {
        isActive: true,
        id: { not: currentProduct.id } // Exclude current product
      },
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

    // Score and sort products by relevance
    let scoredProducts = relatedProducts.map(product => {
      let score = 0

      // Category match (highest weight)
      if (currentProduct.category && product.category === currentProduct.category) {
        score += 50
      }

      // Skin types overlap
      const currentSkinTypes = currentProduct.skinTypes || []
      const productSkinTypes = product.skinTypes || []
      const skinTypeOverlap = currentSkinTypes.filter(type => productSkinTypes.includes(type)).length
      score += skinTypeOverlap * 15

      // Skin concerns overlap
      const currentConcerns = currentProduct.skinConcerns || []
      const productConcerns = product.skinConcerns || []
      const concernsOverlap = currentConcerns.filter(concern => productConcerns.includes(concern)).length
      score += concernsOverlap * 10

      // Key ingredients overlap
      const currentIngredients = currentProduct.keyIngredients || []
      const productIngredients = product.keyIngredients || []
      const ingredientsOverlap = currentIngredients.filter(ing => productIngredients.includes(ing)).length
      score += ingredientsOverlap * 8

      // Tags overlap
      const currentTags = currentProduct.tags || []
      const productTags = product.tags || []
      const tagsOverlap = currentTags.filter(tag => productTags.includes(tag)).length
      score += tagsOverlap * 5

      // Price similarity (products in similar price range)
      const priceDiff = Math.abs(currentProduct.price - product.price)
      if (priceDiff <= 200) score += 10
      else if (priceDiff <= 500) score += 5

      // Featured products get small boost
      if (product.isFeatured) score += 3

      // Calculate rating for final sorting
      const approvedReviews = product.reviews || []
      const reviewCount = product._count.reviews
      let averageRating = 0
      if (approvedReviews.length > 0) {
        const totalRating = approvedReviews.reduce((sum, review) => sum + review.rating, 0)
        averageRating = totalRating / approvedReviews.length
      }
      const { reviews, _count, ...productData } = product
      return {
        ...productData,
        rating: {
          average: Math.round(averageRating * 10) / 10,
          count: reviewCount
        },
        relevanceScore: score
      }
    })

    // Apply locale translations before sorting (name/desc may matter for UI, score unaffected)
    scoredProducts = await applyTranslations(scoredProducts, locale)

    // Sort by relevance score (descending) and take top results
    const topRelatedProducts = scoredProducts
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, limit)
      .map(({ relevanceScore, ...product }) => product)

    res.status(200).json({
      success: true,
      data: topRelatedProducts,
      meta: {
        currentProduct: currentProduct.name,
        totalAvailable: relatedProducts.length,
        returned: topRelatedProducts.length
      }
    })
  } catch (error) {
    console.error('Error fetching related products:', error)
    next(new AppError('Error fetching related products', 500))
  }
} 