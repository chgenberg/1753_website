import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function listRecentOrders() {
  const orders = await prisma.order.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    select: {
      orderNumber: true,
      status: true,
      paymentStatus: true,
      paymentOrderCode: true,
      totalAmount: true,
      createdAt: true,
      items: {
        include: {
          product: {
            select: { name: true }
          }
        }
      }
    }
  })
  
  console.log(`Found ${orders.length} recent orders:\n`)
  
  orders.forEach(order => {
    console.log(`Order: ${order.orderNumber}`)
    console.log(`- Created: ${order.createdAt}`)
    console.log(`- Status: ${order.status}`)
    console.log(`- Payment Status: ${order.paymentStatus}`)
    console.log(`- Payment Order Code: ${order.paymentOrderCode}`)
    console.log(`- Total: ${order.totalAmount} kr`)
    console.log(`- Items: ${order.items.map(i => i.product?.name || 'Unknown').join(', ')}`)
    console.log('---')
  })
  
  await prisma.$disconnect()
}

listRecentOrders().catch(console.error)
