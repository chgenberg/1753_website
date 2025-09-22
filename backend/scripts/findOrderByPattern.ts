import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function findOrder() {
  const pattern = '1757694135283'
  
  const orders = await prisma.order.findMany({
    where: {
      OR: [
        { orderNumber: { contains: pattern } },
        { paymentOrderCode: { contains: pattern } }
      ]
    },
    select: {
      id: true,
      orderNumber: true,
      status: true,
      paymentStatus: true,
      paymentOrderCode: true,
      createdAt: true
    }
  })
  
  if (orders.length > 0) {
    console.log(`Found ${orders.length} orders matching pattern "${pattern}":`)
    orders.forEach(order => {
      console.log(`\nOrder: ${order.orderNumber}`)
      console.log(`- ID: ${order.id}`)
      console.log(`- Status: ${order.status}`)
      console.log(`- Payment Status: ${order.paymentStatus}`)
      console.log(`- Payment Order Code: ${order.paymentOrderCode}`)
      console.log(`- Created: ${order.createdAt}`)
    })
  } else {
    console.log(`No orders found with pattern "${pattern}"`)
  }
  
  await prisma.$disconnect()
}

findOrder().catch(console.error)
