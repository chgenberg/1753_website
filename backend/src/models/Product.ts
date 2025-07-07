import mongoose, { Document, Schema } from 'mongoose'

export interface IProduct extends Document {
  _id: string
  name: string
  slug: string
  description: string
  longDescription: string
  price: number
  compareAtPrice?: number
  images: Array<{
    url: string
    alt: string
    position: number
  }>
  variants: Array<{
    name: string
    price: number
    compareAtPrice?: number
    sku: string
    inventory: {
      quantity: number
      trackQuantity: boolean
    }
    options: {
      size?: string
      color?: string
    }
  }>
  category: {
    id: string
    name: string
    slug: string
  }
  tags: string[]
  ingredients: Array<{
    name: string
    description: string
    benefits: string[]
    concentration?: string
  }>
  skinTypes: Array<'dry' | 'oily' | 'combination' | 'sensitive' | 'normal' | 'acne' | 'mature'>
  benefits: string[]
  howToUse: string
  featured: boolean
  bestseller: boolean
  newProduct: boolean
  saleProduct: boolean
  inventory: {
    quantity: number
    sku: string
    trackQuantity: boolean
  }
  seo: {
    title: string
    description: string
    keywords: string[]
  }
  status: 'active' | 'draft' | 'archived'
  publishedAt?: Date
  createdAt: Date
  updatedAt: Date
}

const imageSchema = new Schema({
  url: { type: String, required: true },
  alt: { type: String, required: true },
  position: { type: Number, required: true, default: 0 }
}, { _id: false })

const variantInventorySchema = new Schema({
  quantity: { type: Number, required: true, default: 0 },
  trackQuantity: { type: Boolean, default: true }
}, { _id: false })

const variantOptionsSchema = new Schema({
  size: { type: String },
  color: { type: String }
}, { _id: false })

const variantSchema = new Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  compareAtPrice: { type: Number },
  sku: { type: String, required: true },
  inventory: variantInventorySchema,
  options: variantOptionsSchema
})

const categorySchema = new Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  slug: { type: String, required: true }
}, { _id: false })

const ingredientSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  benefits: [{ type: String }],
  concentration: { type: String }
}, { _id: false })

const inventorySchema = new Schema({
  quantity: { type: Number, required: true, default: 0 },
  sku: { type: String, required: true, unique: true },
  trackQuantity: { type: Boolean, default: true }
}, { _id: false })

const seoSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  keywords: [{ type: String }]
}, { _id: false })

const productSchema = new Schema<IProduct>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    required: true
  },
  longDescription: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  compareAtPrice: {
    type: Number,
    min: 0
  },
  images: [imageSchema],
  variants: [variantSchema],
  category: {
    type: categorySchema,
    required: true
  },
  tags: [{ type: String }],
  ingredients: [ingredientSchema],
  skinTypes: [{
    type: String,
    enum: ['dry', 'oily', 'combination', 'sensitive', 'normal', 'acne', 'mature']
  }],
  benefits: [{ type: String }],
  howToUse: {
    type: String,
    required: true
  },
  featured: {
    type: Boolean,
    default: false
  },
  bestseller: {
    type: Boolean,
    default: false
  },
  newProduct: {
    type: Boolean,
    default: false
  },
  saleProduct: {
    type: Boolean,
    default: false
  },
  inventory: {
    type: inventorySchema,
    required: true
  },
  seo: {
    type: seoSchema,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'draft', 'archived'],
    default: 'draft'
  },
  publishedAt: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(_doc, ret) {
      ret.id = ret._id
      delete ret._id
      delete ret.__v
      return ret
    }
  }
})

// Indexes for performance (remove duplicate slug index since unique: true already creates one)
productSchema.index({ status: 1 })
productSchema.index({ featured: 1 })
productSchema.index({ bestseller: 1 })
productSchema.index({ 'category.slug': 1 })
productSchema.index({ tags: 1 })
productSchema.index({ skinTypes: 1 })
productSchema.index({ price: 1 })
productSchema.index({ createdAt: -1 })

// Text search index
productSchema.index({
  name: 'text',
  description: 'text',
  longDescription: 'text',
  tags: 'text'
})

// Pre-save middleware
productSchema.pre('save', function(next) {
  if (this.status === 'active' && !this.publishedAt) {
    this.publishedAt = new Date()
  }
  next()
})

export const Product = mongoose.model<IProduct>('Product', productSchema) 