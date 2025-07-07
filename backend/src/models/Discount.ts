import mongoose, { Document, Schema } from 'mongoose'

export interface IDiscount extends Document {
  code: string
  name: string
  description?: string
  type: 'percentage' | 'fixed_amount' | 'free_shipping'
  value: number // Percentage (0-100) or fixed amount in SEK
  minimumOrderAmount?: number
  maximumDiscountAmount?: number
  usageLimit?: number
  usageCount: number
  perCustomerLimit?: number
  validFrom: Date
  validUntil: Date
  isActive: boolean
  applicableProducts?: mongoose.Types.ObjectId[]
  excludedProducts?: mongoose.Types.ObjectId[]
  applicableCategories?: string[]
  excludedCategories?: string[]
  firstTimeCustomerOnly: boolean
  stackable: boolean
  createdBy: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const discountSchema = new Schema<IDiscount>({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
    minlength: 3,
    maxlength: 50
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  type: {
    type: String,
    enum: ['percentage', 'fixed_amount', 'free_shipping'],
    required: true
  },
  value: {
    type: Number,
    required: true,
    min: 0
  },
  minimumOrderAmount: {
    type: Number,
    min: 0,
    default: 0
  },
  maximumDiscountAmount: {
    type: Number,
    min: 0
  },
  usageLimit: {
    type: Number,
    min: 1
  },
  usageCount: {
    type: Number,
    default: 0,
    min: 0
  },
  perCustomerLimit: {
    type: Number,
    min: 1,
    default: 1
  },
  validFrom: {
    type: Date,
    required: true
  },
  validUntil: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  applicableProducts: [{
    type: Schema.Types.ObjectId,
    ref: 'Product'
  }],
  excludedProducts: [{
    type: Schema.Types.ObjectId,
    ref: 'Product'
  }],
  applicableCategories: [{
    type: String,
    trim: true
  }],
  excludedCategories: [{
    type: String,
    trim: true
  }],
  firstTimeCustomerOnly: {
    type: Boolean,
    default: false
  },
  stackable: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
})

// Indexes för bättre prestanda
discountSchema.index({ code: 1 })
discountSchema.index({ validFrom: 1, validUntil: 1 })
discountSchema.index({ isActive: 1 })

// Validation
discountSchema.pre('save', function(next) {
  if (this.validFrom >= this.validUntil) {
    next(new Error('Valid from date must be before valid until date'))
  }
  
  if (this.type === 'percentage' && this.value > 100) {
    next(new Error('Percentage discount cannot exceed 100%'))
  }
  
  if (this.usageLimit && this.usageCount > this.usageLimit) {
    next(new Error('Usage count cannot exceed usage limit'))
  }
  
  next()
})

export default mongoose.model<IDiscount>('Discount', discountSchema) 