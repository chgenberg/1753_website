import { Review, IReview } from '../models/Review'
import { Product } from '../models/Product'
import { Order } from '../models/Order'
import { dripService } from './dripService'
import { logger } from '../utils/logger'

export interface CreateReviewData {
  productId: string
  userId: string
  orderId?: string
  rating: number
  title: string
  body: string
  reviewer: {
    name: string
    email: string
  }
  metadata?: {
    skinType?: string
    ageRange?: string
    usageDuration?: string
    skinConcerns?: string[]
  }
  photos?: Array<{
    url: string
    alt: string
  }>
}

export interface ReviewStats {
  averageRating: number
  totalReviews: number
  ratingDistribution: {
    1: number
    2: number
    3: number
    4: number
    5: number
  }
  recentReviews: IReview[]
}

class ReviewService {
  /**
   * Skapa en ny recension
   */
  async createReview(data: CreateReviewData): Promise<IReview> {
    try {
      // Kontrollera om produkten existerar
      const product = await Product.findById(data.productId)
      if (!product) {
        throw new Error('Product not found')
      }

      // Kontrollera verifierat köp om orderId finns
      let isVerifiedPurchase = false
      if (data.orderId) {
        const order = await Order.findOne({
          _id: data.orderId,
          userId: data.userId,
          'items.productId': data.productId,
          status: { $in: ['delivered', 'completed'] }
        })
        isVerifiedPurchase = !!order
      }

      // Skapa recensionen
      const review = new Review({
        productId: data.productId,
        userId: data.userId,
        orderId: data.orderId,
        rating: data.rating,
        title: data.title,
        body: data.body,
        reviewer: {
          name: data.reviewer.name,
          email: data.reviewer.email,
          isVerified: false // Kan verifieras senare via email
        },
        isVerifiedPurchase,
        photos: data.photos || [],
        metadata: data.metadata || {},
        status: 'pending' // Alla recensioner börjar som pending
      })

      const savedReview = await review.save()

      // Trigga Drip workflow för ny recension
      await this.triggerDripWorkflow(savedReview, 'review_submitted')

      // Tagga användaren i Drip
      await this.tagUserInDrip(data.reviewer.email, [
        'Left Review',
        `${data.rating}-Star Review`,
        `Reviewed ${product.name}`
      ])

      logger.info(`New review created for product ${data.productId} by ${data.reviewer.email}`)
      
      return savedReview
    } catch (error: any) {
      logger.error('Error creating review:', error)
      throw new Error(`Failed to create review: ${error.message}`)
    }
  }

  /**
   * Hämta recensioner för en produkt
   */
  async getProductReviews(
    productId: string, 
    page: number = 1, 
    limit: number = 10,
    rating?: number,
    sortBy: 'newest' | 'oldest' | 'highest' | 'lowest' | 'helpful' = 'newest'
  ): Promise<{ reviews: IReview[], pagination: any, stats: ReviewStats }> {
    try {
      const filter: any = { 
        productId, 
        status: 'approved' 
      }

      if (rating) {
        filter.rating = rating
      }

      // Sortering
      let sort: any = {}
      switch (sortBy) {
        case 'newest':
          sort = { createdAt: -1 }
          break
        case 'oldest':
          sort = { createdAt: 1 }
          break
        case 'highest':
          sort = { rating: -1, createdAt: -1 }
          break
        case 'lowest':
          sort = { rating: 1, createdAt: -1 }
          break
        case 'helpful':
          sort = { helpfulVotes: -1, createdAt: -1 }
          break
      }

      const skip = (page - 1) * limit

      const [reviews, totalReviews, stats] = await Promise.all([
        Review.find(filter)
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .lean(),
        Review.countDocuments(filter),
        this.getProductStats(productId)
      ])

      const pagination = {
        page,
        limit,
        total: totalReviews,
        pages: Math.ceil(totalReviews / limit),
        hasNext: page < Math.ceil(totalReviews / limit),
        hasPrev: page > 1
      }

      return {
        reviews: reviews as IReview[],
        pagination,
        stats
      }
    } catch (error: any) {
      logger.error('Error fetching product reviews:', error)
      throw new Error(`Failed to fetch reviews: ${error.message}`)
    }
  }

  /**
   * Hämta statistik för en produkt
   */
  async getProductStats(productId: string): Promise<ReviewStats> {
    try {
      const pipeline = [
        { $match: { productId, status: 'approved' } },
        {
          $group: {
            _id: null,
            averageRating: { $avg: '$rating' },
            totalReviews: { $sum: 1 },
            ratings: { $push: '$rating' }
          }
        }
      ]

      const [result] = await Review.aggregate(pipeline)
      
      if (!result) {
        return {
          averageRating: 0,
          totalReviews: 0,
          ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
          recentReviews: []
        }
      }

      // Räkna fördelning
      const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      result.ratings.forEach((rating: number) => {
        ratingDistribution[rating as keyof typeof ratingDistribution]++
      })

      // Hämta senaste recensioner
      const recentReviews = await Review.find({ 
        productId, 
        status: 'approved' 
      })
        .sort({ createdAt: -1 })
        .limit(3)
        .lean() as IReview[]

      return {
        averageRating: Math.round(result.averageRating * 10) / 10,
        totalReviews: result.totalReviews,
        ratingDistribution,
        recentReviews
      }
    } catch (error: any) {
      logger.error('Error fetching product stats:', error)
      throw new Error(`Failed to fetch stats: ${error.message}`)
    }
  }

  /**
   * Godkänn en recension
   */
  async approveReview(reviewId: string, moderatorNotes?: string): Promise<IReview> {
    try {
      const review = await Review.findByIdAndUpdate(
        reviewId,
        { 
          status: 'approved',
          moderatorNotes 
        },
        { new: true }
      )

      if (!review) {
        throw new Error('Review not found')
      }

      // Trigga Drip workflow för godkänd recension
      await this.triggerDripWorkflow(review, 'review_approved')

      logger.info(`Review ${reviewId} approved`)
      return review
    } catch (error: any) {
      logger.error('Error approving review:', error)
      throw new Error(`Failed to approve review: ${error.message}`)
    }
  }

  /**
   * Skicka recensionsförfrågan via Drip efter leverans
   */
  async sendReviewRequest(orderId: string): Promise<boolean> {
    try {
      const order = await Order.findById(orderId)
        .populate('userId')
        .populate('items.productId')

      if (!order || order.status !== 'delivered') {
        return false
      }

      // Vänta 3 dagar efter leverans innan vi skickar review request
      const deliveryDate = order.updatedAt
      const threeDaysLater = new Date(deliveryDate.getTime() + (3 * 24 * 60 * 60 * 1000))
      
      if (new Date() < threeDaysLater) {
        return false
      }

      const user = order.userId as any
      const products = order.items.map(item => (item.productId as any).name).join(', ')

      // Trigga Drip workflow för recensionsförfrågan
      const workflowId = process.env.DRIP_REVIEW_REQUEST_WORKFLOW_ID
      if (workflowId) {
        await dripService.triggerWorkflow(user.email, workflowId, {
          customer_name: user.firstName,
          order_number: order.orderNumber,
          products_purchased: products,
          review_link: `${process.env.FRONTEND_URL}/reviews/write?order=${orderId}`
        })

        // Tagga användaren
        await this.tagUserInDrip(user.email, ['Review Request Sent'])

        logger.info(`Review request sent for order ${orderId}`)
        return true
      }

      return false
    } catch (error: any) {
      logger.error('Error sending review request:', error)
      return false
    }
  }

  /**
   * Hämta alla recensioner för startsidan
   */
  async getFeaturedReviews(limit: number = 6): Promise<IReview[]> {
    try {
      return await Review.find({ 
        status: 'approved',
        rating: { $gte: 4 }, // Endast 4-5 stjärnor
        'photos.0': { $exists: true } // Endast med bilder
      })
        .sort({ helpfulVotes: -1, createdAt: -1 })
        .limit(limit)
        .populate('productId', 'name slug')
        .lean() as IReview[]
    } catch (error: any) {
      logger.error('Error fetching featured reviews:', error)
      return []
    }
  }

  /**
   * Trigga Drip workflow
   */
  private async triggerDripWorkflow(review: IReview, eventType: string): Promise<void> {
    try {
      const workflowMap: Record<string, string | undefined> = {
        'review_submitted': process.env.DRIP_REVIEW_SUBMITTED_WORKFLOW_ID,
        'review_approved': process.env.DRIP_REVIEW_APPROVED_WORKFLOW_ID
      }

      const workflowId = workflowMap[eventType]
      if (!workflowId) return

      await dripService.triggerWorkflow(review.reviewer.email, workflowId, {
        reviewer_name: review.reviewer.name,
        product_name: 'Product', // Du kan hämta produktnamn här
        rating: review.rating,
        review_title: review.title,
        review_body: review.body
      })
    } catch (error) {
      logger.error('Error triggering Drip workflow:', error)
    }
  }

  /**
   * Tagga användare i Drip
   */
  private async tagUserInDrip(email: string, tags: string[]): Promise<void> {
    try {
      await dripService.addTagsToSubscriber(email, tags)
    } catch (error) {
      logger.error('Error tagging user in Drip:', error)
    }
  }
}

export const reviewService = new ReviewService()
export default reviewService 