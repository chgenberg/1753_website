import { Request, Response, NextFunction } from 'express'
import { Product } from '../models/Product'
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

    // Build query
    const query: any = { status: 'active' }

    // Category filter
    if (req.query.category) {
      query['category.slug'] = req.query.category
    }

    // Skin type filter
    if (req.query.skinType) {
      query.skinTypes = { $in: [req.query.skinType] }
    }

    // Price range filter
    if (req.query.minPrice || req.query.maxPrice) {
      query.price = {}
      if (req.query.minPrice) query.price.$gte = parseFloat(req.query.minPrice as string)
      if (req.query.maxPrice) query.price.$lte = parseFloat(req.query.maxPrice as string)
    }

    // Search filter
    if (req.query.search) {
      query.$text = { $search: req.query.search as string }
    }

    // Tags filter
    if (req.query.tags) {
      const tags = (req.query.tags as string).split(',')
      query.tags = { $in: tags }
    }

    // Feature filters
    if (req.query.featured === 'true') query.featured = true
    if (req.query.bestseller === 'true') query.bestseller = true
    if (req.query.new === 'true') query.newProduct = true
    if (req.query.sale === 'true') query.saleProduct = true

    // Sorting
    let sort: any = {}
    switch (req.query.sort) {
      case 'price-asc':
        sort = { price: 1 }
        break
      case 'price-desc':
        sort = { price: -1 }
        break
      case 'name':
        sort = { name: 1 }
        break
      case 'newest':
        sort = { createdAt: -1 }
        break
      default:
        sort = { featured: -1, bestseller: -1, createdAt: -1 }
    }

    // Execute query
    const products = await Product.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .select('-__v')

    const total = await Product.countDocuments(query)

    res.status(200).json({
      success: true,
      data: products,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Get single product
// @route   GET /api/products/:slug
// @access  Public
export const getProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const product = await Product.findOne({
      slug: req.params.slug,
      status: 'active',
    })

    if (!product) {
      throw new AppError('Product not found', 404)
    }

    res.status(200).json({
      success: true,
      data: product,
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Get product categories
// @route   GET /api/products/categories
// @access  Public
export const getCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const categories = await Product.aggregate([
      { $match: { status: 'active' } },
      {
        $group: {
          _id: '$category.slug',
          name: { $first: '$category.name' },
          count: { $sum: 1 },
        },
      },
      { $sort: { name: 1 } },
    ])

    res.status(200).json({
      success: true,
      data: categories.map(cat => ({
        slug: cat._id,
        name: cat.name,
        count: cat.count,
      })),
    })
  } catch (error) {
    next(error)
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
    const limit = parseInt(req.query.limit as string) || 8

    const products = await Product.find({
      status: 'active',
      featured: true,
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('-__v')

    res.status(200).json({
      success: true,
      data: products,
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Get bestseller products
// @route   GET /api/products/bestsellers
// @access  Public
export const getBestsellerProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 8

    const products = await Product.find({
      status: 'active',
      bestseller: true,
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('-__v')

    res.status(200).json({
      success: true,
      data: products,
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Get new products
// @route   GET /api/products/new
// @access  Public
export const getNewProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 8

    const products = await Product.find({
      status: 'active',
      newProduct: true,
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('-__v')

    res.status(200).json({
      success: true,
      data: products,
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Get products by skin type
// @route   GET /api/products/skin-type/:skinType
// @access  Public
export const getProductsBySkinType = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { skinType } = req.params
    const limit = parseInt(req.query.limit as string) || 12

    const products = await Product.find({
      status: 'active',
      skinTypes: { $in: [skinType] },
    })
      .sort({ featured: -1, bestseller: -1, createdAt: -1 })
      .limit(limit)
      .select('-__v')

    res.status(200).json({
      success: true,
      data: products,
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Search products
// @route   GET /api/products/search
// @access  Public
export const searchProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { q } = req.query
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 12
    const skip = (page - 1) * limit

    if (!q || typeof q !== 'string') {
      throw new AppError('Search query is required', 400)
    }

    const query = {
      status: 'active',
      $text: { $search: q },
    }

    const products = await Product.find(query, { score: { $meta: 'textScore' } })
      .sort({ score: { $meta: 'textScore' } })
      .skip(skip)
      .limit(limit)
      .select('-__v')

    const total = await Product.countDocuments(query)

    res.status(200).json({
      success: true,
      data: products,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        query: q,
      },
    })
  } catch (error) {
    next(error)
  }
} 