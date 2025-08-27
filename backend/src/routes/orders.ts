import { Router } from 'express'
import { z } from 'zod'
import { vivaWalletService } from '../services/vivaWalletService'
import { logger } from '../utils/logger'
import prisma from '../lib/prisma'

const router = Router()

// Helper functions
function getCountryCode(country: string): string {
  const countryMap: Record<string, string> = {
    'Sverige': 'SE',
    'Sweden': 'SE',
    'Norge': 'NO',
    'Norway': 'NO',
    'Danmark': 'DK',
    'Denmark': 'DK',
    'Finland': 'FI',
    'Tyskland': 'DE',
    'Germany': 'DE',
    'Frankrike': 'FR',
    'France': 'FR',
    'Spanien': 'ES',
    'Spain': 'ES'
  }
  return countryMap[country] || 'SE'
}

function getRequestLang(currency: string): string {
  const langMap: Record<string, string> = {
    'SEK': 'sv-SE',
    'EUR': 'en-GB',
    'USD': 'en-US',
    'GBP': 'en-GB',
    'NOK': 'nb-NO',
    'DKK': 'da-DK'
  }
  return langMap[currency] || 'en-GB'
}

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
  currency: z.enum(['SEK', 'EUR', 'USD', 'GBP', 'NOK', 'DKK']).default('SEK'),
  newsletter: z.boolean(),
  isSubscription: z.boolean().optional(),
  subscriptionInterval: z.enum(['monthly', 'bimonthly', 'quarterly']).optional()
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
    const paymentOrderParams: any = {
      amount: validatedData.total,
      customerTrns: `Order #${order.id}`,
      customer: {
        email: validatedData.customer.email,
        fullName: `${validatedData.customer.firstName} ${validatedData.customer.lastName}`,
        phone: validatedData.customer.phone,
        countryCode: getCountryCode(validatedData.shippingAddress.country),
        requestLang: getRequestLang(validatedData.currency)
      },
      merchantTrns: order.id,
      tags: ['ecommerce', 'webshop']
    }

    // If it's a subscription order, create a recurring payment
    if (validatedData.isSubscription) {
      const subscriptionResult = await vivaWalletService.createSubscriptionOrder({
        amount: validatedData.total,
        currency: validatedData.currency,
        customerEmail: validatedData.customer.email,
        customerName: `${validatedData.customer.firstName} ${validatedData.customer.lastName}`,
        customerPhone: validatedData.customer.phone,
        description: `Prenumeration - ${validatedData.subscriptionInterval}`,
        allowRecurring: true
      })
      
      var paymentOrder = subscriptionResult
    } else {
      var paymentOrder = await vivaWalletService.createPaymentOrder(paymentOrderParams)
    }
    
    // Update order with payment reference (store Viva orderCode)
    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentReference: paymentOrder.orderCode.toString()
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
    
    // Find order by payment reference (stored orderCode)
    const order = await prisma.order.findFirst({
      where: { paymentReference: orderCode }
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
 * Test endpoint to check environment variables
 * GET /api/orders/test/env
 */
router.get('/test/env', async (req, res) => {
  try {
    const envVars = {
      VIVA_MERCHANT_ID: process.env.VIVA_MERCHANT_ID ? '***' + process.env.VIVA_MERCHANT_ID.slice(-4) : 'NOT SET',
      VIVA_API_KEY: process.env.VIVA_API_KEY ? '***' + process.env.VIVA_API_KEY.slice(-4) : 'NOT SET',
      VIVA_SOURCE_CODE: process.env.VIVA_SOURCE_CODE || 'NOT SET',
      VIVA_BASE_URL: process.env.VIVA_BASE_URL || 'NOT SET',
      VIVA_CLIENT_ID: process.env.VIVA_CLIENT_ID ? '***' + process.env.VIVA_CLIENT_ID.slice(-10) : 'NOT SET',
      VIVA_CLIENT_SECRET: process.env.VIVA_CLIENT_SECRET ? '***' + process.env.VIVA_CLIENT_SECRET.slice(-4) : 'NOT SET',
      NODE_ENV: process.env.NODE_ENV || 'NOT SET'
    }

    res.json({
      success: true,
      environment: envVars,
      message: 'Environment variables check'
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * Test endpoint for Viva Wallet with both production and demo URLs
 * GET /api/orders/test/viva-both
 */
router.get('/test/viva-both', async (req, res) => {
  try {
    const axios = require('axios')
    const merchantId = process.env.VIVA_MERCHANT_ID
    const apiKey = process.env.VIVA_API_KEY
    const sourceCode = process.env.VIVA_SOURCE_CODE

    if (!merchantId || !apiKey || !sourceCode) {
      return res.json({
        success: false,
        error: 'Missing Viva Wallet credentials'
      })
    }

    const testOrder = {
      amount: 100, // 1 SEK in cents
      customerTrns: 'Test order',
      customer: {
        email: 'test@example.com',
        fullName: 'Test Customer',
        phone: '+46701234567',
        countryCode: 'SE',
        requestLang: 'sv-SE'
      },
      paymentTimeout: 300,
      preauth: false,
      allowRecurring: false,
      maxInstallments: 1,
      paymentNotification: true,
      disableExactAmount: false,
      disableCash: true,
      disableWallet: false,
      sourceCode: sourceCode,
      merchantTrns: `Test-${Date.now()}`
    }

    const results: any = {}

    // Test production URL
    try {
      const prodResponse = await axios.post(
        'https://api.vivapayments.com/checkout/v2/orders',
        testOrder,
        {
          auth: {
            username: merchantId,
            password: apiKey
          },
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )
      results.production = { success: true, orderCode: prodResponse.data.orderCode }
    } catch (error: any) {
      results.production = { 
        success: false, 
        error: error.message,
        status: error.response?.status,
        data: error.response?.data
      }
    }

    // Test demo URL
    try {
      const demoResponse = await axios.post(
        'https://demo-api.vivapayments.com/checkout/v2/orders',
        testOrder,
        {
          auth: {
            username: merchantId,
            password: apiKey
          },
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )
      results.demo = { success: true, orderCode: demoResponse.data.orderCode }
    } catch (error: any) {
      results.demo = { 
        success: false, 
        error: error.message,
        status: error.response?.status,
        data: error.response?.data
      }
    }

    res.json({
      success: true,
      results: results,
      message: 'Tested both production and demo URLs'
    })

  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * Simple authentication test - just try to get merchant info
 * GET /api/orders/test/viva-auth
 */
router.get('/test/viva-auth', async (req, res) => {
  try {
    const axios = require('axios')
    const merchantId = process.env.VIVA_MERCHANT_ID
    const apiKey = process.env.VIVA_API_KEY

    if (!merchantId || !apiKey) {
      return res.json({
        success: false,
        error: 'Missing Viva Wallet credentials'
      })
    }

    const results: any = {}

    // Test simple GET request to verify auth
    try {
      const response = await axios.get(
        `https://api.vivapayments.com/api/merchants/${merchantId}`,
        {
          auth: {
            username: merchantId,
            password: apiKey
          }
        }
      )
      results.merchantInfo = { success: true, data: response.data }
    } catch (error: any) {
      results.merchantInfo = { 
        success: false, 
        error: error.message,
        status: error.response?.status,
        data: error.response?.data,
        headers: error.response?.headers
      }
    }

    // Also test a simple order lookup (should give 404 but validate auth)
    try {
      const response = await axios.get(
        'https://api.vivapayments.com/api/orders/999999999',
        {
          auth: {
            username: merchantId,
            password: apiKey
          },
          validateStatus: (status) => status === 404 || status === 200
        }
      )
      results.orderLookup = { success: true, status: response.status, message: '404 expected - auth OK' }
    } catch (error: any) {
      results.orderLookup = { 
        success: false, 
        error: error.message,
        status: error.response?.status,
        data: error.response?.data
      }
    }

    res.json({
      success: true,
      credentials: {
        merchantId: merchantId,
        apiKeyLength: apiKey.length,
        apiKeyPrefix: apiKey.substring(0, 3) + '...'
      },
      results: results,
      message: 'Authentication test completed'
    })

  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * Test OAuth authentication for Checkout API
 * GET /api/orders/test/viva-oauth
 */
router.get('/test/viva-oauth', async (req, res) => {
  try {
    const axios = require('axios')
    const clientId = process.env.VIVA_CLIENT_ID
    const clientSecret = process.env.VIVA_CLIENT_SECRET
    const sourceCode = process.env.VIVA_SOURCE_CODE

    if (!clientId || !clientSecret || !sourceCode) {
      return res.json({
        success: false,
        error: 'Missing OAuth credentials',
        available: {
          clientId: !!clientId,
          clientSecret: !!clientSecret,
          sourceCode: !!sourceCode
        }
      })
    }

    const results: any = {}

    // First, get OAuth token
    try {
      const tokenResponse = await axios.post(
        'https://accounts.vivapayments.com/connect/token',
        'grant_type=client_credentials',
        {
          auth: {
            username: clientId,
            password: clientSecret
          },
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      )
      
      const accessToken = tokenResponse.data.access_token
      results.tokenRequest = { success: true, tokenType: tokenResponse.data.token_type }

      // Now try to create an order with the OAuth token
      const testOrder = {
        amount: 100, // 1 SEK in cents
        customerTrns: 'OAuth Test order',
        customer: {
          email: 'test@example.com',
          fullName: 'Test Customer',
          phone: '+46701234567',
          countryCode: 'SE',
          requestLang: 'sv-SE'
        },
        paymentTimeout: 300,
        preauth: false,
        allowRecurring: false,
        maxInstallments: 1,
        paymentNotification: true,
        disableExactAmount: false,
        disableCash: true,
        disableWallet: false,
        sourceCode: sourceCode,
        merchantTrns: `OAuth-Test-${Date.now()}`
      }

      const orderResponse = await axios.post(
        'https://api.vivapayments.com/checkout/v2/orders',
        testOrder,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      )

      results.orderCreation = { success: true, orderCode: orderResponse.data.orderCode }

    } catch (error: any) {
      if (error.config?.url?.includes('connect/token')) {
        results.tokenRequest = { 
          success: false, 
          error: error.message,
          status: error.response?.status,
          data: error.response?.data
        }
      } else {
        results.orderCreation = { 
          success: false, 
          error: error.message,
          status: error.response?.status,
          data: error.response?.data
        }
      }
    }

    res.json({
      success: true,
      credentials: {
        clientId: clientId.substring(0, 10) + '...',
        clientSecretLength: clientSecret.length,
        sourceCode: sourceCode
      },
      results: results,
      message: 'OAuth test completed'
    })

  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * Simple frontend connectivity test
 * GET /api/orders/test/frontend
 */
router.get('/test/frontend', (req, res) => {
  res.json({
    success: true,
    message: 'Backend is reachable from frontend',
    timestamp: new Date().toISOString(),
    cors: 'enabled',
    environment: process.env.NODE_ENV || 'development'
  })
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

/**
 * Test: create subscription order and return checkout URL
 */
router.get('/test/viva-subscription', async (req, res) => {
  try {
    const testOrder = await vivaWalletService.createSubscriptionOrder({
      amount: 1, // 1 SEK
      currency: 'SEK',
      customerEmail: 'test@1753skincare.com',
      customerName: 'Test Subscription',
      description: 'Test Subscription Order',
      allowRecurring: true
    })

    const source = process.env.VIVA_SOURCE_CODE_SUBSCRIPTION || process.env.VIVA_SOURCE_CODE || ''
    const checkoutUrl = `https://www.vivapayments.com/web/checkout?ref=${testOrder.orderCode}&s=${source}`

    return res.json({ success: true, orderCode: testOrder.orderCode, checkoutUrl })
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message })
  }
})

export default router 