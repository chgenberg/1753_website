import { PrismaClient } from '@prisma/client'
import { sendEmail } from '../src/services/emailService'
import { logger } from '../src/utils/logger'

const prisma = new PrismaClient()

async function sendReviewRequests() {
  console.log('🔍 Looking for orders eligible for review requests...')
  
  try {
    // Calculate date 3 weeks ago (21 days)
    const threeWeeksAgo = new Date()
    threeWeeksAgo.setDate(threeWeeksAgo.getDate() - 21)
    
    // Calculate date 22 days ago (to avoid sending multiple times)
    const twentyTwoDaysAgo = new Date()
    twentyTwoDaysAgo.setDate(twentyTwoDaysAgo.getDate() - 22)
    
    // Find orders that are exactly 21 days old and have been paid
    const eligibleOrders = await prisma.order.findMany({
      where: {
        paymentStatus: 'PAID',
        status: {
          in: ['PROCESSING', 'SHIPPED', 'DELIVERED']
        },
        createdAt: {
          gte: twentyTwoDaysAgo,
          lte: threeWeeksAgo
        },
        // Only send to orders that haven't received a review request yet
        reviewRequestSent: {
          not: true
        }
      },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    })
    
    console.log(`📧 Found ${eligibleOrders.length} orders eligible for review requests`)
    
    let successCount = 0
    let errorCount = 0
    
    for (const order of eligibleOrders) {
      try {
        const firstName = order.customerName?.split(' ')[0] || 'Kund'
        const mainProduct = order.items[0]?.product
        const productName = mainProduct?.name || 'dina produkter'
        const productId = mainProduct?.id || ''
        
        // Include product ID and customer info in review URL for auto-fill
        const reviewUrl = `https://1753skincare.com/sv/recensioner/ny?order=${order.orderNumber}&product=${productId}&name=${encodeURIComponent(order.customerName || '')}&email=${encodeURIComponent(order.email)}`
        const unsubscribeUrl = `https://1753skincare.com/sv/avsluta-recensionspaminnelser?email=${encodeURIComponent(order.email)}`
        
        // Calculate estimated delivery date (order date + 4 days)
        const deliveryDate = new Date(order.createdAt)
        deliveryDate.setDate(deliveryDate.getDate() + 4)
        
        await sendEmail({
          to: order.email,
          subject: `${firstName}, vad tyckte du om ${productName}?`,
          template: 'reviewRequest',
          data: {
            firstName,
            orderNumber: order.orderNumber,
            productName,
            deliveryDate: deliveryDate.toLocaleDateString('sv-SE'),
            reviewUrl,
            unsubscribeUrl
          }
        })
        
        // Mark order as having received review request
        await prisma.order.update({
          where: { id: order.id },
          data: { reviewRequestSent: true }
        })
        
        successCount++
        console.log(`✅ Review request sent to ${order.email} for order ${order.orderNumber}`)
        
        // Add small delay to avoid overwhelming email server
        await new Promise(resolve => setTimeout(resolve, 1000))
        
      } catch (error) {
        errorCount++
        console.error(`❌ Failed to send review request for order ${order.orderNumber}:`, error)
        logger.error('Review request failed', {
          orderId: order.id,
          email: order.email,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }
    
    console.log(`\n📊 Review request summary:`)
    console.log(`   ✅ Successfully sent: ${successCount}`)
    console.log(`   ❌ Failed: ${errorCount}`)
    console.log(`   📧 Total processed: ${eligibleOrders.length}`)
    
    if (successCount > 0) {
      logger.info('Review requests sent successfully', {
        successCount,
        errorCount,
        totalProcessed: eligibleOrders.length
      })
    }
    
  } catch (error) {
    console.error('❌ Error in review request process:', error)
    logger.error('Review request process failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
sendReviewRequests()
  .then(() => {
    console.log('🎉 Review request process completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Review request process failed:', error)
    process.exit(1)
  }) 