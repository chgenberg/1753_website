import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkReviews() {
  try {
    console.log('🔍 Checking existing reviews in database...\n')

    // Count total reviews
    const totalReviews = await prisma.review.count()
    console.log(`📊 Total reviews: ${totalReviews}`)

    if (totalReviews === 0) {
      console.log('❌ No reviews found in database')
      return
    }

    // Get reviews by status
    const reviewsByStatus = await prisma.review.groupBy({
      by: ['status'],
      _count: {
        id: true
      }
    })

    console.log('\n📈 Reviews by status:')
    reviewsByStatus.forEach(group => {
      console.log(`  ${group.status}: ${group._count.id}`)
    })

    // Get latest 10 reviews
    const latestReviews = await prisma.review.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        product: {
          select: { name: true, slug: true }
        }
      }
    })

    console.log('\n🕒 Latest 10 reviews:')
    latestReviews.forEach((review, index) => {
      console.log(`${index + 1}. ${review.title} (${review.rating}⭐)`)
      console.log(`   Product: ${review.product?.name || 'Unknown'}`)
      console.log(`   Author: ${review.reviewerName}`)
      console.log(`   Status: ${review.status}`)
      console.log(`   Created: ${review.createdAt.toISOString()}`)
      console.log(`   ID: ${review.id}\n`)
    })

    // Get average rating
    const avgRating = await prisma.review.aggregate({
      where: { status: 'APPROVED' },
      _avg: { rating: true },
      _count: { rating: true }
    })

    console.log(`📊 Average rating (approved): ${avgRating._avg.rating?.toFixed(2) || 'N/A'} (${avgRating._count.rating} reviews)`)

    // Check for any external sources
    const externalSources = await prisma.review.groupBy({
      by: ['source'],
      _count: { id: true },
      where: {
        source: { not: null }
      }
    })

    if (externalSources.length > 0) {
      console.log('\n🔗 Reviews by source:')
      externalSources.forEach(group => {
        console.log(`  ${group.source}: ${group._count.id}`)
      })
    }

  } catch (error) {
    console.error('❌ Error checking reviews:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkReviews() 