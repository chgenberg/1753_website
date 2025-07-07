import mongoose, { Document, Schema } from 'mongoose'
import bcrypt from 'bcryptjs'

export interface IUser extends Document {
  _id: string
  email: string
  password: string
  firstName: string
  lastName: string
  phone?: string
  dateOfBirth?: Date
  avatar?: string
  skinJourney?: {
    startDate: Date
    currentPhase: string
    progress: Array<{
      date: Date
      skinCondition: number
      notes: string
      photos?: string[]
    }>
    photos: Array<{
      url: string
      date: Date
      type: 'before' | 'progress' | 'after'
    }>
    products: string[] // Product IDs
    notes: string
    nextCheckIn: Date
  }
  preferences: {
    language: 'sv' | 'en' | 'es'
    newsletter: boolean
    skinType: 'dry' | 'oily' | 'combination' | 'sensitive' | 'normal' | 'acne' | 'mature'
    skinConcerns: string[]
    notifications: {
      email: boolean
      sms: boolean
      orderUpdates: boolean
      skinJourneyReminders: boolean
    }
  }
  addresses: Array<{
    type: 'shipping' | 'billing'
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
    isDefault: boolean
  }>
  isEmailVerified: boolean
  emailVerificationToken?: string
  passwordResetToken?: string
  passwordResetExpires?: Date
  lastLogin?: Date
  createdAt: Date
  updatedAt: Date
  comparePassword(candidatePassword: string): Promise<boolean>
}

const skinJourneyEntrySchema = new Schema({
  date: { type: Date, required: true },
  skinCondition: { type: Number, required: true, min: 1, max: 10 },
  notes: { type: String, required: true },
  photos: [{ type: String }]
}, { _id: false })

const skinPhotoSchema = new Schema({
  url: { type: String, required: true },
  date: { type: Date, required: true },
  type: { type: String, enum: ['before', 'progress', 'after'], required: true }
}, { _id: false })

const skinJourneySchema = new Schema({
  startDate: { type: Date, required: true },
  currentPhase: { type: String, required: true },
  progress: [skinJourneyEntrySchema],
  photos: [skinPhotoSchema],
  products: [{ type: String }],
  notes: { type: String, default: '' },
  nextCheckIn: { type: Date, required: true }
}, { _id: false })

const notificationSchema = new Schema({
  email: { type: Boolean, default: true },
  sms: { type: Boolean, default: false },
  orderUpdates: { type: Boolean, default: true },
  skinJourneyReminders: { type: Boolean, default: true }
}, { _id: false })

const preferencesSchema = new Schema({
  language: { type: String, enum: ['sv', 'en', 'es'], default: 'sv' },
  newsletter: { type: Boolean, default: false },
  skinType: { 
    type: String, 
    enum: ['dry', 'oily', 'combination', 'sensitive', 'normal', 'acne', 'mature'],
    required: true 
  },
  skinConcerns: [{ type: String }],
  notifications: notificationSchema
}, { _id: false })

const addressSchema = new Schema({
  type: { type: String, enum: ['shipping', 'billing'], required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  company: { type: String },
  address1: { type: String, required: true },
  address2: { type: String },
  city: { type: String, required: true },
  province: { type: String, required: true },
  postalCode: { type: String, required: true },
  country: { type: String, required: true },
  phone: { type: String },
  isDefault: { type: Boolean, default: false }
})

const userSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  dateOfBirth: {
    type: Date
  },
  avatar: {
    type: String
  },
  skinJourney: skinJourneySchema,
  preferences: {
    type: preferencesSchema,
    required: true
  },
  addresses: [addressSchema],
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: {
    type: String
  },
  passwordResetToken: {
    type: String
  },
  passwordResetExpires: {
    type: Date
  },
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(_doc, ret) {
      ret.id = ret._id
      delete ret._id
      delete ret.__v
      delete ret.password
      delete ret.emailVerificationToken
      delete ret.passwordResetToken
      delete ret.passwordResetExpires
      return ret
    }
  }
})

// Index for performance (remove duplicate email index since unique: true already creates one)
userSchema.index({ 'skinJourney.nextCheckIn': 1 })

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next()
  
  try {
    const salt = await bcrypt.genSalt(12)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error) {
    next(error as Error)
  }
})

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password)
}

export const User = mongoose.model<IUser>('User', userSchema) 