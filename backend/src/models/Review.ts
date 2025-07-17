import mongoose, { Document, Schema } from 'mongoose'

export interface IReview extends Document {
  _id: string
  productId: string
  userId: string
  orderId?: string
  rating: number // 1-5 stars
  title: string
  body: string
  reviewer: {
    name: string
    email: string
    isVerified: boolean
  }
  isVerifiedPurchase: boolean
  photos: Array<{
    url: string
    alt: string
    uploadedAt: Date
  }>
  helpfulVotes: number
  reportedCount: number
  status: 'pending' | 'approved' | 'rejected' | 'hidden'
  moderatorNotes?: string
  replies: Array<{
    authorType: 'customer' | 'admin'
    authorName: string
    body: string
    createdAt: Date
  }>
  metadata: {
    skinType?: string
    ageRange?: string
    usageDuration?: string
    skinConcerns?: string[]
  }
  dripData: {
    subscriberId?: string
    campaignId?: string
    workflowTriggered: boolean
  }
  createdAt: Date
  updatedAt: Date
}

const reviewSchema = new Schema<IReview>({
  productId: {
    type: String,
    required: true,
    index: true
  },
  userId: {
    type: String,
    required: true,
    index: true
  },
  orderId: {
    type: String,
    index: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  title: {
    type: String,
    required: true,
    maxlength: 200
  },
  body: {
    type: String,
    required: true,
    maxlength: 2000
  },
  reviewer: {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    isVerified: {
      type: Boolean,
      default: false
    }
  },
  isVerifiedPurchase: {
    type: Boolean,
    default: false
  },
  photos: [{
    url: {
      type: String,
      required: true
    },
    alt: {
      type: String,
      default: ''
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  helpfulVotes: {
    type: Number,
    default: 0
  },
  reportedCount: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'hidden'],
    default: 'pending'
  },
  moderatorNotes: String,
  replies: [{
    authorType: {
      type: String,
      enum: ['customer', 'admin'],
      required: true
    },
    authorName: {
      type: String,
      required: true
    },
    body: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  metadata: {
    skinType: String,
    ageRange: String,
    usageDuration: String,
    skinConcerns: [String]
  },
  dripData: {
    subscriberId: String,
    campaignId: String,
    workflowTriggered: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Index för prestanda
reviewSchema.index({ productId: 1, status: 1, createdAt: -1 })
reviewSchema.index({ userId: 1, createdAt: -1 })
reviewSchema.index({ rating: 1, status: 1 })
reviewSchema.index({ 'reviewer.email': 1 })

// Virtual för genomsnittligt betyg per produkt
reviewSchema.virtual('averageRating').get(function() {
  return this.rating
})

export const Review = mongoose.model<IReview>('Review', reviewSchema)
export default Review 