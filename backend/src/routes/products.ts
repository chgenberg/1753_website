import express from 'express'
import { query } from 'express-validator'
import { validate } from '../middleware/validate'
import {
  getProducts,
  getProductBySlug,
  getFeaturedProducts,
} from '../controllers/productController'

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
    .withMessage('Category must be a string'),
  query('sort')
    .optional()
    .isIn(['price-asc', 'price-desc', 'newest', 'oldest', 'featured'])
    .withMessage('Invalid sort option'),
  query('featured')
    .optional()
    .isBoolean()
    .withMessage('Featured must be a boolean'),
  query('search')
    .optional()
    .isString()
    .withMessage('Search must be a string'),
  query('minPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum price must be a positive number'),
  query('maxPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Maximum price must be a positive number'),
]

const limitValidation = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50'),
]

// Routes
router.get('/', getProductsValidation, validate, getProducts)
router.get('/featured', limitValidation, validate, getFeaturedProducts)
router.get('/:slug', getProductBySlug)

export default router 