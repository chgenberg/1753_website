import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function cleanupDummyData() {
  console.log('🧹 Starting cleanup of dummy data...')
  
  try {
    // 1. Clean up orders for ch.genberg@gmail.com
    console.log('\n📧 Cleaning up orders for ch.genberg@gmail.com...')
    
    // First, get all orders for this email
    const ordersToDelete = await prisma.order.findMany({
      where: {
        email: 'ch.genberg@gmail.com'
      },
      include: {
        items: true,
        discounts: true
      }
    })
    
    console.log(`Found ${ordersToDelete.length} orders to delete`)
    
    if (ordersToDelete.length > 0) {
      // Delete order items first (due to foreign key constraints)
      for (const order of ordersToDelete) {
        console.log(`  Deleting order ${order.orderNumber} (${order.items.length} items, ${order.discounts.length} discounts)`)
        
        // Delete order discounts
        await prisma.orderDiscount.deleteMany({
          where: { orderId: order.id }
        })
        
        // Delete order items
        await prisma.orderItem.deleteMany({
          where: { orderId: order.id }
        })
      }
      
      // Now delete the orders themselves
      const deletedOrders = await prisma.order.deleteMany({
        where: {
          email: 'ch.genberg@gmail.com'
        }
      })
      
      console.log(`✅ Deleted ${deletedOrders.count} orders for ch.genberg@gmail.com`)
    }
    
    // 2. Clean up test users (if any)
    console.log('\n👤 Cleaning up test users...')
    
    const testEmails = [
      'test@example.com',
      'dummy@test.com',
      'test@test.com',
      'demo@example.com'
    ]
    
    for (const email of testEmails) {
      const testUser = await prisma.user.findUnique({
        where: { email },
        include: {
          orders: true,
          reviews: true,
          addresses: true
        }
      })
      
      if (testUser) {
        console.log(`  Found test user: ${email}`)
        
        // Delete user's orders (cascade will handle items and discounts)
        await prisma.order.deleteMany({
          where: { userId: testUser.id }
        })
        
        // Delete user's reviews
        await prisma.review.deleteMany({
          where: { userId: testUser.id }
        })
        
        // Delete user's addresses
        await prisma.address.deleteMany({
          where: { userId: testUser.id }
        })
        
        // Delete the user
        await prisma.user.delete({
          where: { id: testUser.id }
        })
        
        console.log(`  ✅ Deleted test user: ${email}`)
      }
    }
    
    // 3. Clean up test orders (orders without users but with test-like data)
    console.log('\n📦 Cleaning up test orders...')
    
    const testOrders = await prisma.order.findMany({
      where: {
        OR: [
          { email: { contains: 'test' } },
          { email: { contains: 'example' } },
          { email: { contains: 'demo' } },
          { customerName: { contains: 'Test' } },
          { customerName: { contains: 'Demo' } },
          { orderNumber: { startsWith: 'TEST' } },
          { orderNumber: { startsWith: 'DEMO' } }
        ]
      }
    })
    
    if (testOrders.length > 0) {
      console.log(`Found ${testOrders.length} test orders`)
      
      for (const order of testOrders) {
        console.log(`  Deleting test order: ${order.orderNumber} (${order.email})`)
        
        // Delete order discounts
        await prisma.orderDiscount.deleteMany({
          where: { orderId: order.id }
        })
        
        // Delete order items
        await prisma.orderItem.deleteMany({
          where: { orderId: order.id }
        })
        
        // Delete the order
        await prisma.order.delete({
          where: { id: order.id }
        })
      }
      
      console.log(`✅ Deleted ${testOrders.length} test orders`)
    }
    
    // 4. Clean up test reviews
    console.log('\n⭐ Cleaning up test reviews...')
    
    const testReviews = await prisma.review.deleteMany({
      where: {
        OR: [
          { reviewerEmail: { contains: 'test' } },
          { reviewerEmail: { contains: 'example' } },
          { reviewerName: { contains: 'Test' } },
          { reviewerName: { contains: 'Demo' } },
          { body: { contains: 'test review' } },
          { body: { contains: 'dummy' } }
        ]
      }
    })
    
    console.log(`✅ Deleted ${testReviews.count} test reviews`)
    
    // 5. Clean up test contact submissions
    console.log('\n📧 Cleaning up test contact submissions...')
    
    const testContacts = await prisma.contactSubmission.deleteMany({
      where: {
        OR: [
          { email: { contains: 'test' } },
          { email: { contains: 'example' } },
          { name: { contains: 'Test' } },
          { name: { contains: 'Demo' } },
          { message: { contains: 'test message' } }
        ]
      }
    })
    
    console.log(`✅ Deleted ${testContacts.count} test contact submissions`)
    
    // 6. Clean up test quiz submissions
    console.log('\n🧠 Cleaning up test quiz submissions...')
    
    const testQuizzes = await prisma.quizSubmission.deleteMany({
      where: {
        OR: [
          { email: { contains: 'test' } },
          { email: { contains: 'example' } },
          { name: { contains: 'Test' } },
          { name: { contains: 'Demo' } }
        ]
      }
    })
    
    console.log(`✅ Deleted ${testQuizzes.count} test quiz submissions`)
    
    // 7. Clean up test newsletter subscribers
    console.log('\n📰 Cleaning up test newsletter subscribers...')
    
    const testSubscribers = await prisma.newsletterSubscriber.deleteMany({
      where: {
        OR: [
          { email: { contains: 'test' } },
          { email: { contains: 'example' } },
          { firstName: { contains: 'Test' } },
          { firstName: { contains: 'Demo' } }
        ]
      }
    })
    
    console.log(`✅ Deleted ${testSubscribers.count} test newsletter subscribers`)
    
    // 8. Show summary of remaining data
    console.log('\n📊 Database summary after cleanup:')
    
    const counts = await Promise.all([
      prisma.order.count(),
      prisma.user.count(),
      prisma.review.count(),
      prisma.contactSubmission.count(),
      prisma.quizSubmission.count(),
      prisma.newsletterSubscriber.count()
    ])
    
    console.log(`  Orders: ${counts[0]}`)
    console.log(`  Users: ${counts[1]}`)
    console.log(`  Reviews: ${counts[2]}`)
    console.log(`  Contact submissions: ${counts[3]}`)
    console.log(`  Quiz submissions: ${counts[4]}`)
    console.log(`  Newsletter subscribers: ${counts[5]}`)
    
    console.log('\n✅ Cleanup completed successfully!')
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the cleanup
cleanupDummyData()
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  }) 