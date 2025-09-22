import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkOrderStatus() {
  const orderNumber = '1753-1757694135283'
  
  const order = await prisma.order.findUnique({
    where: { orderNumber },
    select: {
      id: true,
      orderNumber: true,
      status: true,
      paymentStatus: true,
      paymentOrderCode: true,
      totalAmount: true,
      items: {
        include: {
          product: {
            select: {
              name: true,
              price: true
            }
          }
        }
      }
    }
  })
  
  if (order) {
    console.log('Order found:')
    console.log('- ID:', order.id)
    console.log('- Order Number:', order.orderNumber)
    console.log('- Status:', order.status)
    console.log('- Payment Status:', order.paymentStatus)
    console.log('- Payment Order Code:', order.paymentOrderCode)
    console.log('- Total Amount:', order.totalAmount)
    console.log('- Items:')
    order.items.forEach(item => {
      console.log(`  - ${item.product?.name || 'Unknown'}: ${item.quantity}x ${item.price} kr`)
    })
  } else {
    console.log('Order not found')
  }
  
  await prisma.$disconnect()
}

checkOrderStatus().catch(console.error)
