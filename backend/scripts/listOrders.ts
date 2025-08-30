import { prisma } from '../src/lib/prisma'

async function listOrders() {
  try {
    console.log('Fetching orders from database...\n')
    
    const orders = await prisma.order.findMany({
      select: {
        id: true,
        orderNumber: true,
        email: true,
        status: true,
        paymentStatus: true,
        totalAmount: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 20 // Visa de 20 senaste ordrarna
    })

    if (orders.length === 0) {
      console.log('No orders found in database')
      return
    }

    console.log(`Found ${orders.length} recent orders:\n`)
    console.log('ID                              | Order Number          | Email                    | Status      | Payment     | Amount  | Date')
    console.log('--------------------------------|----------------------|--------------------------|-------------|-------------|---------|------------')
    
    orders.forEach(order => {
      const date = new Date(order.createdAt).toLocaleDateString('sv-SE')
      const id = order.id.padEnd(30)
      const orderNum = (order.orderNumber || 'N/A').padEnd(20)
      const email = order.email.padEnd(24).substring(0, 24)
      const status = order.status.padEnd(11)
      const payment = order.paymentStatus.padEnd(11)
      const amount = order.totalAmount.toString().padStart(7)
      
      console.log(`${id} | ${orderNum} | ${email} | ${status} | ${payment} | ${amount} | ${date}`)
    })

    console.log('\n✅ Use any of the IDs above to test order synchronization')
    
  } catch (error) {
    console.error('Error fetching orders:', error)
  } finally {
    await prisma.$disconnect()
  }
}

listOrders() 