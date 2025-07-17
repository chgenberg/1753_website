import { connectDatabase, disconnectDatabase } from '../lib/prisma'
import prisma from '../lib/prisma'
import mongoose from 'mongoose'
import { logger } from '../utils/logger'

// Import old MongoDB models
import { Product as MongoProduct } from '../models/Product'
import { Review as MongoReview } from '../models/Review'

interface MongoDBConfig {
  uri: string
}

class DatabaseMigration {
  private mongoConfig: MongoDBConfig

  constructor() {
    this.mongoConfig = {
      uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/1753_skincare'
    }
  }

  async connectMongoDB(): Promise<void> {
    try {
      await mongoose.connect(this.mongoConfig.uri)
      logger.info('Connected to MongoDB for migration')
    } catch (error) {
      logger.error('MongoDB connection failed:', error)
      throw error
    }
  }

  async disconnectMongoDB(): Promise<void> {
    try {
      await mongoose.disconnect()
      logger.info('Disconnected from MongoDB')
    } catch (error) {
      logger.error('MongoDB disconnection failed:', error)
    }
  }

  async migrateProducts(): Promise<void> {
    logger.info('Starting product migration...')
    
    try {
      const mongoProducts = await MongoProduct.find({})
      logger.info(`Found ${mongoProducts.length} products in MongoDB`)

      for (const mongoProduct of mongoProducts) {
        try {
          // Check if product already exists
          const existing = await prisma.product.findUnique({
            where: { slug: mongoProduct.slug }
          })

          if (existing) {
            logger.info(`Product ${mongoProduct.slug} already exists, skipping`)
            continue
          }

          // Transform MongoDB product to Prisma format
          const productData = {
            name: mongoProduct.name,
            slug: mongoProduct.slug,
            description: mongoProduct.description || null,
            shortDescription: mongoProduct.shortDescription || null,
            price: mongoProduct.price,
            compareAtPrice: mongoProduct.compareAtPrice || null,
            sku: mongoProduct.sku || null,
            barcode: mongoProduct.barcode || null,
            weight: mongoProduct.weight || null,
            dimensions: mongoProduct.dimensions || null,
            category: mongoProduct.category || null,
            tags: mongoProduct.tags || [],
            images: mongoProduct.images || [],
            variants: mongoProduct.variants || [],
            inventory: mongoProduct.inventory || 0,
            trackInventory: mongoProduct.trackInventory !== undefined ? mongoProduct.trackInventory : true,
            allowBackorder: mongoProduct.allowBackorder !== undefined ? mongoProduct.allowBackorder : false,
            isActive: mongoProduct.isActive !== undefined ? mongoProduct.isActive : true,
            isFeatured: mongoProduct.isFeatured !== undefined ? mongoProduct.isFeatured : false,
            metaTitle: mongoProduct.metaTitle || null,
            metaDescription: mongoProduct.metaDescription || null,
            seoKeywords: mongoProduct.seoKeywords || []
          }

          const newProduct = await prisma.product.create({
            data: productData
          })

          logger.info(`Migrated product: ${newProduct.name}`)
        } catch (error) {
          logger.error(`Error migrating product ${mongoProduct.slug}:`, error)
        }
      }

      logger.info('Product migration completed')
    } catch (error) {
      logger.error('Product migration failed:', error)
      throw error
    }
  }

  async migrateReviews(): Promise<void> {
    logger.info('Starting review migration...')
    
    try {
      const mongoReviews = await MongoReview.find({})
      logger.info(`Found ${mongoReviews.length} reviews in MongoDB`)

      for (const mongoReview of mongoReviews) {
        try {
          // Find the corresponding product in PostgreSQL
          const product = await prisma.product.findFirst({
            where: {
              OR: [
                { id: mongoReview.productId },
                { slug: mongoReview.productId } // In case productId is actually a slug
              ]
            }
          })

          if (!product) {
            logger.warn(`Product not found for review, skipping review for productId: ${mongoReview.productId}`)
            continue
          }

          // Check if review already exists (by external ID or unique combination)
          const existing = await prisma.review.findFirst({
            where: {
              AND: [
                { productId: product.id },
                { reviewerEmail: mongoReview.reviewer?.email || mongoReview.reviewerEmail },
                { body: mongoReview.body }
              ]
            }
          })

          if (existing) {
            logger.info(`Review already exists, skipping`)
            continue
          }

          // Transform MongoDB review to Prisma format
          const reviewData = {
            productId: product.id,
            rating: mongoReview.rating,
            title: mongoReview.title,
            body: mongoReview.body,
            reviewerName: mongoReview.reviewer?.name || mongoReview.reviewerName || 'Anonymous',
            reviewerEmail: mongoReview.reviewer?.email || mongoReview.reviewerEmail || '',
            reviewerLocation: mongoReview.reviewerLocation || null,
            isVerified: mongoReview.reviewer?.isVerified || mongoReview.isVerified || false,
            isVerifiedPurchase: mongoReview.isVerifiedPurchase || false,
            photos: mongoReview.photos || [],
            helpfulVotes: mongoReview.helpfulVotes || 0,
            reportedCount: mongoReview.reportedCount || 0,
            status: this.mapReviewStatus(mongoReview.status),
            moderatorNotes: mongoReview.moderatorNotes || null,
            source: mongoReview.source || null,
            externalId: mongoReview.externalId || null,
            skinType: mongoReview.metadata?.skinType || null,
            ageRange: mongoReview.metadata?.ageRange || null,
            usageDuration: mongoReview.metadata?.usageDuration || null,
            skinConcerns: mongoReview.metadata?.skinConcerns || [],
            dripSubscriberId: mongoReview.dripData?.subscriberId || null,
            dripCampaignId: mongoReview.dripData?.campaignId || null,
            dripWorkflowTriggered: mongoReview.dripData?.workflowTriggered || false
          }

          const newReview = await prisma.review.create({
            data: reviewData
          })

          // Migrate review replies if they exist
          if (mongoReview.replies && mongoReview.replies.length > 0) {
            for (const reply of mongoReview.replies) {
              await prisma.reviewReply.create({
                data: {
                  reviewId: newReview.id,
                  authorType: reply.authorType === 'admin' ? 'ADMIN' : 'CUSTOMER',
                  authorName: reply.authorName,
                  body: reply.body,
                  createdAt: reply.createdAt || new Date()
                }
              })
            }
          }

          logger.info(`Migrated review: ${newReview.id}`)
        } catch (error) {
          logger.error(`Error migrating review:`, error)
        }
      }

      logger.info('Review migration completed')
    } catch (error) {
      logger.error('Review migration failed:', error)
      throw error
    }
  }

  private mapReviewStatus(status?: string): 'PENDING' | 'APPROVED' | 'REJECTED' | 'HIDDEN' {
    switch (status) {
      case 'approved': return 'APPROVED'
      case 'rejected': return 'REJECTED'
      case 'hidden': return 'HIDDEN'
      case 'pending':
      default: return 'PENDING'
    }
  }

  async migrateAll(): Promise<void> {
    try {
      logger.info('Starting complete database migration from MongoDB to PostgreSQL')
      
      // Connect to both databases
      await this.connectMongoDB()
      await connectDatabase()

      // Run migrations in order (due to foreign key dependencies)
      await this.migrateProducts()
      await this.migrateReviews()

      logger.info('Migration completed successfully!')
    } catch (error) {
      logger.error('Migration failed:', error)
      throw error
    } finally {
      await this.disconnectMongoDB()
      await disconnectDatabase()
    }
  }

  async clearPostgreSQL(): Promise<void> {
    logger.info('Clearing PostgreSQL database...')
    
    try {
      await connectDatabase()
      
      // Delete in reverse order due to foreign key constraints
      await prisma.reviewReply.deleteMany({})
      await prisma.review.deleteMany({})
      await prisma.orderItem.deleteMany({})
      await prisma.order.deleteMany({})
      await prisma.productDiscount.deleteMany({})
      await prisma.discount.deleteMany({})
      await prisma.product.deleteMany({})
      await prisma.skinJourneyEntry.deleteMany({})
      await prisma.address.deleteMany({})
      await prisma.user.deleteMany({})
      await prisma.newsletterSubscriber.deleteMany({})
      
      logger.info('PostgreSQL database cleared')
    } catch (error) {
      logger.error('Failed to clear PostgreSQL:', error)
      throw error
    } finally {
      await disconnectDatabase()
    }
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2)
  const command = args[0]

  const migration = new DatabaseMigration()

  try {
    switch (command) {
      case 'clear':
        await migration.clearPostgreSQL()
        break
      case 'products':
        await migration.connectMongoDB()
        await connectDatabase()
        await migration.migrateProducts()
        await migration.disconnectMongoDB()
        await disconnectDatabase()
        break
      case 'reviews':
        await migration.connectMongoDB()
        await connectDatabase()
        await migration.migrateReviews()
        await migration.disconnectMongoDB()
        await disconnectDatabase()
        break
      case 'all':
      default:
        await migration.migrateAll()
        break
    }
  } catch (error) {
    logger.error('Migration failed:', error)
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}

export default DatabaseMigration 