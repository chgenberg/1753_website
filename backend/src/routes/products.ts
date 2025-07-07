import express from 'express'
import { query } from 'express-validator'
import { validate } from '../middleware/validate'
import { optionalAuth } from '../middleware/auth'
import {
  getProducts,
  getProduct,
  getCategories,
  getFeaturedProducts,
  getBestsellerProducts,
  getNewProducts,
  getProductsBySkinType,
  searchProducts,
} from '../controllers/productController'
import { Product } from '../models/Product'
import { Request, Response } from 'express'

const router = express.Router()

// Validation rules
const getProductsValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50'),
  query('category')
    .optional()
    .isString()
    .trim()
    .withMessage('Category must be a string'),
  query('skinType')
    .optional()
    .isIn(['dry', 'oily', 'combination', 'sensitive', 'normal', 'acne', 'mature'])
    .withMessage('Invalid skin type'),
  query('minPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum price must be a positive number'),
  query('maxPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Maximum price must be a positive number'),
  query('sort')
    .optional()
    .isIn(['price-asc', 'price-desc', 'name', 'newest', 'featured'])
    .withMessage('Invalid sort option'),
  query('search')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Search query must be at least 2 characters'),
  query('tags')
    .optional()
    .isString()
    .withMessage('Tags must be a comma-separated string'),
  query('featured')
    .optional()
    .isBoolean()
    .withMessage('Featured must be a boolean'),
  query('bestseller')
    .optional()
    .isBoolean()
    .withMessage('Bestseller must be a boolean'),
  query('new')
    .optional()
    .isBoolean()
    .withMessage('New must be a boolean'),
  query('sale')
    .optional()
    .isBoolean()
    .withMessage('Sale must be a boolean'),
]

const searchValidation = [
  query('q')
    .notEmpty()
    .isString()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Search query must be at least 2 characters'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50'),
]

const limitValidation = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50'),
]

// Routes
router.get('/', getProductsValidation, validate, optionalAuth, getProducts)
router.get('/categories', getCategories)
router.get('/featured', limitValidation, validate, getFeaturedProducts)
router.get('/bestsellers', limitValidation, validate, getBestsellerProducts)
router.get('/new', limitValidation, validate, getNewProducts)
router.get('/search', searchValidation, validate, searchProducts)
router.get('/skin-type/:skinType', limitValidation, validate, getProductsBySkinType)
router.get('/:slug', async (req: Request, res: Response) => {
  try {
    const product = await Product.findOne({ 
      slug: req.params.slug,
      status: 'active' 
    })
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      })
    }
    
    res.json({
      success: true,
      product
    })
  } catch (error) {
    console.error('Error fetching product:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching product'
    })
  }
})

export default router 