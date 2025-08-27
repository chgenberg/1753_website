import { Router } from 'express'
import { z } from 'zod'
import { vivaWalletService } from '../services/vivaWalletService'
import { logger } from '../utils/logger'
import prisma from '../lib/prisma'

const router = Router()

// Schema for order creation
const createOrderSchema = z.object({
  customer: z.object({
    email: z.string().email(),
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    phone: z.string().min(1)
  }),
  shippingAddress: z.object({
    address: z.string().min(1),
    apartment: z.string().optional(),
    city: z.string().min(1),
    postalCode: z.string().min(1),
    country: z.string().min(1)
  }),
  items: z.array(z.object({
    productId: z.string(),
    variantId: z.string().optional(),
    quantity: z.number().positive(),
    price: z.number().positive()
  })).min(1),
  discountCode: z.string().optional(),
  subtotal: z.number().positive(),
  shippingCost: z.number().min(0),
  total: z.number().positive(),
  newsletter: z.boolean()
})

/**
 * Create a new order and payment
 */
router.post('/create', async (req, res) => {
  try {
    const validatedData = createOrderSchema.parse(req.body)
    
    // Generate order number
    const orderNumber = `1753-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    
    // Create order in database
    const order = await prisma.order.create({
      data: {
        orderNumber,
        email: validatedData.customer.email,
        customerName: `${validatedData.customer.firstName} ${validatedData.customer.lastName}`,
        customerPhone: validatedData.customer.phone,
        phone: validatedData.customer.phone,
        shippingAddress: {
          firstName: validatedData.customer.firstName,
          lastName: validatedData.customer.lastName,
          address: validatedData.shippingAddress.address,
          apartment: validatedData.shippingAddress.apartment,
          city: validatedData.shippingAddress.city,
          postalCode: validatedData.shippingAddress.postalCode,
          country: validatedData.shippingAddress.country
        },
        billingAddress: {
          firstName: validatedData.customer.firstName,
          lastName: validatedData.customer.lastName,
          address: validatedData.shippingAddress.address,
          apartment: validatedData.shippingAddress.apartment,
          city: validatedData.shippingAddress.city,
          postalCode: validatedData.shippingAddress.postalCode,
          country: validatedData.shippingAddress.country
        },
        items: {
          create: validatedData.items.map(item => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            price: item.price,
            title: 'Product' // This should be fetched from the product
          }))
        },
        subtotal: validatedData.subtotal,
        shippingAmount: validatedData.shippingCost,
        totalAmount: validatedData.total,
        status: 'PENDING',
        paymentStatus: 'PENDING'
      },
      include: {
        items: true
      }
    })
    
    // Create payment order in Viva Wallet
    const paymentOrder = await vivaWalletService.createPaymentOrder({
      amount: validatedData.total,
      customerTrns: `Order #${order.id}`,
      customer: {
        email: validatedData.customer.email,
        fullName: `${validatedData.customer.firstName} ${validatedData.customer.lastName}`,
        phone: validatedData.customer.phone,
        countryCode: 'SE',
        requestLang: 'sv-SE'
      },
      merchantTrns: order.id,
      tags: ['ecommerce', 'webshop']
    })
    
    // Update order with payment order code
    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentOrderCode: paymentOrder.orderCode.toString()
      }
    })
    
    logger.info('Order created successfully', {
      orderId: order.id,
      vivaOrderCode: paymentOrder.orderCode
    })
    
    res.json({
      success: true,
      orderId: order.id,
      orderCode: paymentOrder.orderCode.toString(),
      amount: validatedData.total
    })
  } catch (error: any) {
    logger.error('Error creating order:', error)
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid order data',
        details: error.errors
      })
    }
    
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create order'
    })
  }
})

/**
 * Complete payment after card tokenization
 */
router.post('/complete-payment', async (req, res) => {
  try {
    const { orderCode, cardToken } = req.body
    
    if (!orderCode || !cardToken) {
      return res.status(400).json({
        success: false,
        error: 'Missing orderCode or cardToken'
      })
    }
    
    // Find order by payment order code
    const order = await prisma.order.findFirst({
      where: { paymentOrderCode: orderCode }
    })
    
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      })
    }
    
    // Process the payment with Viva Wallet
    const paymentResult = await vivaWalletService.processCardPayment({
      orderCode,
      cardToken
    })
    
    // Update order with payment result
    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: paymentResult.success ? 'PAID' : 'FAILED',
        status: paymentResult.success ? 'PROCESSING' : 'CANCELLED',
        transactionId: paymentResult.transactionId
      }
    })
    
    if (paymentResult.success) {
      // Create order in Ongoing WMS
      // This would be implemented when Ongoing is fully integrated
      logger.info('Payment completed successfully', {
        orderId: order.id,
        transactionId: paymentResult.transactionId
      })
      
      res.json({
        success: true,
        transactionId: paymentResult.transactionId
      })
    } else {
      res.status(400).json({
        success: false,
        error: paymentResult.error || 'Payment failed'
      })
    }
  } catch (error: any) {
    logger.error('Error completing payment:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to complete payment'
    })
  }
})

/**
 * Test endpoint for Viva Wallet integration
 */
router.get('/test/viva-wallet', async (req, res) => {
  try {
    // Create a test payment order
    const testOrder = await vivaWalletService.createPaymentOrder({
      amount: 100, // 100 SEK
      customerTrns: 'Test Order - 1753 Skincare',
      customer: {
        email: 'test@1753skincare.com',
        fullName: 'Test Customer',
        phone: '+46701234567',
        countryCode: 'SE',
        requestLang: 'sv-SE'
      },
      merchantTrns: `TEST-${Date.now()}`,
      tags: ['test', 'integration']
    })

    res.json({
      success: true,
      message: 'Viva Wallet test order created',
      orderCode: testOrder.orderCode,
      checkoutUrl: vivaWalletService.getPaymentUrl(testOrder.orderCode)
    })
  } catch (error: any) {
    logger.error('Viva Wallet test failed:', error)
    res.status(500).json({
      success: false,
      error: error.message,
      details: error.response?.data
    })
  }
})

export default router 