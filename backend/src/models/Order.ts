import mongoose, { Document, Schema } from 'mongoose'

export interface IOrderItem {
  productId: string
  variantId?: string
  quantity: number
  price: number
  total: number
  product: {
    name: string
    image: string
    sku: string
  }
}

export interface IOrder extends Document {
  _id: string
  orderNumber: string
  userId: string
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
  items: IOrderItem[]
  subtotal: number
  shipping: number
  tax: number
  discount: number
  total: number
  currency: string
  shippingAddress: {
    firstName: string
    lastName: string
    company?: string
    address1: string
    address2?: string
    city: string
    province: string
    postalCode: string
    country: string
    phone?: string
  }
  billingAddress: {
    firstName: string
    lastName: string
    company?: string
    address1: string
    address2?: string
    city: string
    province: string
    postalCode: string
    country: string
    phone?: string
  }
  paymentMethod: {
    type: 'viva_wallet' | 'card' | 'paypal' | 'klarna'
    brand?: string
    last4?: string
    expiryMonth?: number
    expiryYear?: number
  }
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded' | 'partially_refunded'
  paymentIntentId?: string
  transactionId?: string
  shippingMethod: {
    id: string
    name: string
    description: string
    price: number
    estimatedDays: string
  }
  trackingNumber?: string
  trackingUrl?: string
  notes?: string
  fulfillmentStatus: 'unfulfilled' | 'partial' | 'fulfilled'
  refunds: Array<{
    amount: number
    reason: string
    createdAt: Date
    refundId: string
  }>
  statusHistory: Array<{
    status: string
    timestamp: Date
    note?: string
  }>
  createdAt: Date
  updatedAt: Date
}

const orderItemProductSchema = new Schema({
  name: { type: String, required: true },
  image: { type: String, required: true },
  sku: { type: String, required: true }
}, { _id: false })

const orderItemSchema = new Schema({
  productId: { type: String, required: true },
  variantId: { type: String },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true, min: 0 },
  total: { type: Number, required: true, min: 0 },
  product: orderItemProductSchema
}, { _id: false })

const addressSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  company: { type: String },
  address1: { type: String, required: true },
  address2: { type: String },
  city: { type: String, required: true },
  province: { type: String, required: true },
  postalCode: { type: String, required: true },
  country: { type: String, required: true },
  phone: { type: String }
}, { _id: false })

const paymentMethodSchema = new Schema({
  type: { 
    type: String, 
    enum: ['viva_wallet', 'card', 'paypal', 'klarna'], 
    required: true 
  },
  brand: { type: String },
  last4: { type: String },
  expiryMonth: { type: Number },
  expiryYear: { type: Number }
}, { _id: false })

const shippingMethodSchema = new Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  estimatedDays: { type: String, required: true }
}, { _id: false })

const refundSchema = new Schema({
  amount: { type: Number, required: true, min: 0 },
  reason: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  refundId: { type: String, required: true }
}, { _id: false })

const statusHistorySchema = new Schema({
  status: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  note: { type: String }
}, { _id: false })

const orderSchema = new Schema<IOrder>({
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
    default: 'pending'
  },
  items: {
    type: [orderItemSchema],
    required: true,
    validate: {
      validator: function(items: IOrderItem[]) {
        return items.length > 0
      },
      message: 'Order must have at least one item'
    }
  },
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  shipping: {
    type: Number,
    required: true,
    min: 0
  },
  tax: {
    type: Number,
    required: true,
    min: 0
  },
  discount: {
    type: Number,
    default: 0,
    min: 0
  },
  total: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    required: true,
    default: 'SEK'
  },
  shippingAddress: {
    type: addressSchema,
    required: true
  },
  billingAddress: {
    type: addressSchema,
    required: true
  },
  paymentMethod: {
    type: paymentMethodSchema,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded', 'partially_refunded'],
    default: 'pending'
  },
  paymentIntentId: {
    type: String
  },
  transactionId: {
    type: String
  },
  shippingMethod: {
    type: shippingMethodSchema,
    required: true
  },
  trackingNumber: {
    type: String
  },
  trackingUrl: {
    type: String
  },
  notes: {
    type: String
  },
  fulfillmentStatus: {
    type: String,
    enum: ['unfulfilled', 'partial', 'fulfilled'],
    default: 'unfulfilled'
  },
  refunds: [refundSchema],
  statusHistory: [statusHistorySchema]
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id
      delete ret._id
      delete ret.__v
      return ret
    }
  }
})

// Indexes for performance
orderSchema.index({ orderNumber: 1 })
orderSchema.index({ userId: 1 })
orderSchema.index({ status: 1 })
orderSchema.index({ paymentStatus: 1 })
orderSchema.index({ createdAt: -1 })
orderSchema.index({ 'statusHistory.timestamp': -1 })

// Pre-save middleware to generate order number
orderSchema.pre('save', async function(next) {
  if (this.isNew && !this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments()
    this.orderNumber = `1753-${(count + 1).toString().padStart(6, '0')}`
  }
  
  // Add status to history if status changed
  if (this.isModified('status')) {
    this.statusHistory.push({
      status: this.status,
      timestamp: new Date()
    })
  }
  
  next()
})

export const Order = mongoose.model<IOrder>('Order', orderSchema) 