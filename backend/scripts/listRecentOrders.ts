import { PrismaClient } from '@prisma/client'
import { logger } from '../src/utils/logger'

const prisma = new PrismaClient()

async function listRecentOrders() {
  try {
    logger.info('Fetching the 10 most recent orders from the database...')

    const recentOrders = await prisma.order.findMany({
      take: 10,
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        orderNumber: true,
        createdAt: true,
        status: true,
        paymentStatus: true,
        totalAmount: true,
        email: true,
        internalNotes: true,
      },
    })

    if (recentOrders.length === 0) {
      logger.info('No orders found in the database.')
      return
    }

    console.log('\n--- Recent Orders ---')
    console.table(
      recentOrders.map(order => ({
        ...order,
        createdAt: new Date(order.createdAt).toLocaleString('sv-SE'),
        shouldSync: order.paymentStatus === 'PAID' || ['CONFIRMED', 'PROCESSING'].includes(order.status),
      }))
    )
    console.log('---------------------\n')
    
    const pendingCount = recentOrders.filter(o => o.paymentStatus === 'PAID' || ['CONFIRMED', 'PROCESSING'].includes(o.status)).length
    logger.info(`${pendingCount} out of the ${recentOrders.length} most recent orders are eligible for syncing.`)


  } catch (error) {
    logger.error('Failed to fetch recent orders:', error)
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  listRecentOrders()
} 