import express from 'express'
import { logger } from '../utils/logger'
import { prisma } from '../lib/prisma'
import { sybkaService } from '../services/sybkaService'
import { fortnoxService } from '../services/fortnoxService'
import axios from 'axios'

const router = express.Router()

// Helper: extract verification code from multiple possible query keys
function extractVerificationCode(query: any): string | undefined {
  const possibleKeys = [
    'VivaWalletWebhookVerificationCode',
    'verification_code',
    'VerificationCode',
    'verificationCode',
    'code',
    'token',
    'challenge',
    'hub.challenge'
  ]
  for (const key of possibleKeys) {
    const value = query?.[key]
    if (typeof value === 'string' && value.length > 0) return value
    if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'string') return value[0]
  }
  return undefined
}

// NEW: Try extracting verification code from headers as well (Viva variants unknown, be liberal)
function extractVerificationCodeFromHeaders(headers: Record<string, any>): string | undefined {
  if (!headers) return undefined
  const headerEntries = Object.entries(headers)
  for (const [rawKey, rawVal] of headerEntries) {
    const key = String(rawKey).toLowerCase()
    if (!key.includes('verify') && !key.includes('verification') && !key.includes('viva')) continue
    const value = Array.isArray(rawVal) ? rawVal[0] : rawVal
    if (typeof value === 'string' && value.trim().length > 0) return value.trim()
  }
  // Common explicit candidates
  const explicit = [
    'vivawalletwebhookverificationcode',
    'x-viva-webhook-verification',
    'x-vivawallet-webhook-verification',
    'x-verification-code',
    'verification'
  ]
  for (const candidate of explicit) {
    const value = headers?.[candidate]
    if (typeof value === 'string' && value.trim().length > 0) return value.trim()
  }
  return undefined
}

// Helper: fetch Viva verification token per docs and return { Key: string }
async function fetchVivaVerificationKey(): Promise<{ Key: string } | null> {
  try {
    const merchantId = process.env.VIVA_MERCHANT_ID
    const apiKey = process.env.VIVA_API_KEY
    if (!merchantId || !apiKey) {
      logger.warn('Viva verification: missing VIVA_MERCHANT_ID or VIVA_API_KEY env')
      return null
    }
    const isDemo = String(process.env.VIVA_ENV || '').toLowerCase() === 'demo'
    const baseUrl = isDemo ? 'https://demo.vivapayments.com' : 'https://www.vivapayments.com'
    const credentials = Buffer.from(`${merchantId}:${apiKey}`).toString('base64')

    const resp = await fetch(`${baseUrl}/api/messages/config/token`, {
      method: 'GET',
      headers: {
        Authorization: `Basic ${credentials}`
      }
    })

    if (!resp.ok) {
      const text = await resp.text().catch(() => '')
      logger.warn('Viva verification token fetch failed', { status: resp.status, body: text })
      return null
    }

    const parsed: unknown = await resp.json().catch(() => null)
    const key = parsed && typeof parsed === 'object' && parsed !== null && typeof (parsed as any).Key === 'string'
      ? ((parsed as any).Key as string)
      : null
    if (key && key.length > 0) {
      return { Key: key }
    }
    logger.warn('Viva verification token response missing Key field')
    return null
  } catch (err) {
    logger.error('Viva verification token fetch error', { error: err instanceof Error ? err.message : String(err) })
    return null
  }
}

// Enkel webhook-endpoint för Viva Wallet (root level)
router.get('/viva', async (req, res) => {
  console.log('Viva Wallet simple verification:', req.query)
  
  const code = req.query.VivaWalletWebhookVerificationCode as string | undefined
  
  // If Viva sends a verification code, echo it back as plain text
  if (code) {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8')
    return res.status(200).send(String(code))
  }

  // Otherwise, try returning the JSON Key per Viva docs
  const key = await fetchVivaVerificationKey()
  if (key) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    return res.status(200).json(key)
  }

  res.setHeader('Content-Type', 'text/plain; charset=utf-8')
  return res.status(200).send('OK')
})

router.head('/viva', (req, res) => {
  res.status(200).end()
})
router.options('/viva', (req, res) => {
  res.status(200).end()
})

router.post('/viva', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    console.log('Viva Wallet simple webhook:', req.body.toString())
    
    const payload = JSON.parse(req.body.toString())
    res.status(200).send('OK')

    // Samma orderhantering
    if (payload.EventTypeId === 1796 || payload.EventTypeId === 1797) {
      const orderCode = payload.EventData?.OrderCode
      
      if (orderCode) {
        const order = await prisma.order.findFirst({
          where: { 
            OR: [
              { paymentOrderCode: orderCode },
              { paymentReference: orderCode }
            ]
          },
          include: {
            items: {
              include: {
                product: true
              }
            }
          }
        })

        if (order) {
          const updatedOrder = await prisma.order.update({
            where: { id: order.id },
            data: { 
              paymentStatus: 'PAID',
              status: 'CONFIRMED'
            }
          })

          await handleOrderStatusChange(updatedOrder.id, 'CONFIRMED', 'PAID')
        }
      }
    }
  } catch (error) {
    console.error('Viva webhook error:', error)
    res.status(200).send('ERROR')
  }
})

/**
 * Webhook för betalningsbekräftelser från Viva Wallet
 */
// GET-endpoint för webhook-verifiering
router.get('/payment/viva', async (req, res) => {
  // Utökad loggning för debugging
  logger.info('Viva Wallet webhook verification request', {
    query: req.query,
    headers: req.headers,
    url: req.url,
    originalUrl: req.originalUrl,
    path: req.path,
    method: req.method,
    protocol: req.protocol,
    host: req.get('host')
  })
  
  const verificationCode = extractVerificationCode(req.query) || extractVerificationCodeFromHeaders(req.headers as any)
  
  if (verificationCode) {
    // Echo back the verification code as plain text
    res.setHeader('Content-Type', 'text/plain; charset=utf-8')
    logger.info('Returning verification code', { code: verificationCode })
    return res.status(200).send(verificationCode)
  }

  // Per Viva docs, attempt to return JSON {"Key":"..."}
  const key = await fetchVivaVerificationKey()
  if (key) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    return res.status(200).json(key)
  }

  // Fallback
  res.setHeader('Content-Type', 'text/plain; charset=utf-8')
  logger.info('No verification code found and no Key available, returning OK')
  return res.status(200).send('OK')
})

// Explicit HEAD & OPTIONS for compatibility
router.head('/payment/viva', (req, res) => {
  const code = extractVerificationCode(req.query) || extractVerificationCodeFromHeaders(req.headers as any)
  res.setHeader('Content-Type', 'text/plain; charset=utf-8')
  res.status(200).send(code || 'OK')
})

router.options('/payment/viva', (req, res) => {
  res.setHeader('Allow', 'GET,POST,HEAD,OPTIONS')
  res.setHeader('Content-Type', 'text/plain; charset=utf-8')
  res.status(200).send('OK')
})

// Alternativ endpoint för Viva Wallet webhook-verifiering
router.get('/viva-webhook', async (req, res) => {
  logger.info('Viva Wallet alternative webhook verification', {
    query: req.query,
    headers: req.headers
  })
  
  const verificationCode = extractVerificationCode(req.query) || extractVerificationCodeFromHeaders(req.headers as any)
  
  if (verificationCode) {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8')
    return res.status(200).send(verificationCode)
  }

  const key = await fetchVivaVerificationKey()
  if (key) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    return res.status(200).json(key)
  }

  res.setHeader('Content-Type', 'text/plain; charset=utf-8')
  return res.status(200).send('OK')
})

router.head('/viva-webhook', (req, res) => {
  const code = extractVerificationCode(req.query) || extractVerificationCodeFromHeaders(req.headers as any)
  res.setHeader('Content-Type', 'text/plain; charset=utf-8')
  res.status(200).send(code || 'OK')
})

router.options('/viva-webhook', (req, res) => {
  res.setHeader('Allow', 'GET,POST,HEAD,OPTIONS')
  res.setHeader('Content-Type', 'text/plain; charset=utf-8')
  res.status(200).send('OK')
})

// Alias endpoint to avoid configuration mistakes
router.get('/viva-wallet', async (req, res) => {
  logger.info('Viva Wallet viva-wallet endpoint verification', {
    query: req.query,
    headers: req.headers
  })
  
  const verificationCode = extractVerificationCode(req.query) || extractVerificationCodeFromHeaders(req.headers as any)
  
  if (verificationCode) {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8')
    return res.status(200).send(verificationCode)
  }

  const key = await fetchVivaVerificationKey()
  if (key) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    return res.status(200).json(key)
  }

  res.setHeader('Content-Type', 'text/plain; charset=utf-8')
  return res.status(200).send('OK')
})

router.head('/viva-wallet', (req, res) => {
  const code = extractVerificationCode(req.query) || extractVerificationCodeFromHeaders(req.headers as any)
  res.setHeader('Content-Type', 'text/plain; charset=utf-8')
  res.status(200).send(code || 'OK')
})

router.options('/viva-wallet', (req, res) => {
  res.setHeader('Allow', 'GET,POST,HEAD,OPTIONS')
  res.setHeader('Content-Type', 'text/plain; charset=utf-8')
  res.status(200).send('OK')
})

// POST-endpoint för webhook-events (alternativ)
router.post('/viva-webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    logger.info('Viva Wallet alternative webhook received', {
      body: req.body.toString(),
      headers: req.headers
    })

    const payload = JSON.parse(req.body.toString())
    
    // Svara omedelbart
    res.status(200).send('OK')

    // Samma hantering som huvudendpointen
    if (payload.EventTypeId === 1796 || payload.EventTypeId === 1797) {
      const orderCode = payload.EventData?.OrderCode
      
      if (orderCode) {
        const order = await prisma.order.findFirst({
          where: { 
            OR: [
              { paymentOrderCode: orderCode },
              { paymentReference: orderCode }
            ]
          },
          include: {
            items: {
              include: {
                product: true
              }
            }
          }
        })

        if (order) {
          const updatedOrder = await prisma.order.update({
            where: { id: order.id },
            data: { 
              paymentStatus: 'PAID',
              status: 'CONFIRMED'
            }
          })

          logger.info('Order payment confirmed via alternative webhook', {
            orderId: updatedOrder.id,
            orderNumber: updatedOrder.orderNumber,
            amount: updatedOrder.totalAmount
          })

          await handleOrderStatusChange(updatedOrder.id, 'CONFIRMED', 'PAID')
        }
      }
    }
  } catch (error) {
    logger.error('Alternative Viva Wallet webhook error:', error)
    if (!res.headersSent) {
      res.status(200).send('ERROR')
    }
  }
})

// POST-endpoint för webhook-events
router.post('/payment/viva', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    // Logga raw body för debugging
    logger.info('Viva Wallet webhook raw body', {
      body: req.body.toString(),
      headers: req.headers
    })

    const payload = JSON.parse(req.body.toString())
    
    logger.info('Viva Wallet webhook received', {
      eventType: payload.EventTypeId,
      orderCode: payload.EventData?.OrderCode,
      fullPayload: payload
    })

    // Svara omedelbart med 200 OK för att bekräfta mottagning
    res.status(200).send('OK')

    // Hantera olika event-typer
    if (payload.EventTypeId === 1796 || payload.EventTypeId === 1797) { // Payment Created eller Transaction Payment Created
      const orderCode = payload.EventData?.OrderCode
      
      if (orderCode) {
        // Hitta order med paymentOrderCode eller paymentReference
        const order = await prisma.order.findFirst({
          where: { 
            OR: [
              { paymentOrderCode: orderCode },
              { paymentReference: orderCode }
            ]
          },
          include: {
            items: {
              include: {
                product: true
              }
            }
          }
        })

        if (order) {
          // Uppdatera order med betalningsstatus
          const updatedOrder = await prisma.order.update({
            where: { id: order.id },
            data: { 
              paymentStatus: 'PAID',
              status: 'CONFIRMED' // Automatiskt bekräfta order när betalning är klar
            }
          })

          logger.info('Order payment confirmed', {
            orderId: updatedOrder.id,
            orderNumber: updatedOrder.orderNumber,
            amount: updatedOrder.totalAmount
          })

          // Kontrollera om vi ska skapa faktura och skicka till Sybka
          await handleOrderStatusChange(updatedOrder.id, 'CONFIRMED', 'PAID')
        } else {
          logger.warn('Order not found for Viva Wallet webhook', { orderCode })
        }
      }
    } else {
      logger.info('Unhandled Viva Wallet event type', { eventTypeId: payload.EventTypeId })
    }
  } catch (error) {
    logger.error('Viva Wallet webhook error:', error)
    // Även vid fel, svara med 200 för att undvika retry
    if (!res.headersSent) {
      res.status(200).send('ERROR')
    }
  }
})

/**
 * Webhook för orderstatusändringar (intern)
 */
router.post('/order-status-change', express.json(), async (req, res) => {
  try {
    const { orderId, status, paymentStatus } = req.body

    logger.info('Order status change webhook', {
      orderId,
      status,
      paymentStatus
    })

    await handleOrderStatusChange(orderId, status, paymentStatus)

    res.status(200).json({ success: true })
  } catch (error) {
    logger.error('Order status change webhook error:', error)
    res.status(500).json({ error: 'Status change processing failed' })
  }
})

/**
 * Hantera orderstatusändringar och trigga Sybka/Fortnox-integration
 */
async function handleOrderStatusChange(orderId: string, status: string, paymentStatus: string) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: true
          }
        },
        user: true
      }
    })

    if (!order) {
      logger.error('Order not found for status change', { orderId })
      return
    }

    const statusMapping = sybkaService.getStatusMapping()
    
    logger.info('Processing order status change', {
      orderId,
      orderNumber: order.orderNumber,
      status,
      paymentStatus,
      teamId: statusMapping.team_id,
      shouldCreateInvoice: sybkaService.shouldCreateInvoice(status, paymentStatus),
      shouldCreateSybkaOrder: sybkaService.shouldCreateSybkaOrder(status, paymentStatus)
    })

    // 1. Skapa faktura i Fortnox om status triggar det
    if (sybkaService.shouldCreateInvoice(status, paymentStatus)) {
      try {
        logger.info('Creating Fortnox invoice', {
          orderId,
          orderNumber: order.orderNumber,
          teamId: statusMapping.team_id
        })

        // Bygga customer-objektet från order
        const shippingAddr = order.shippingAddress as any
        const billingAddr = order.billingAddress as any
        
        const fortnoxResult = await fortnoxService.processOrder({
          customer: {
            email: order.email,
            firstName: shippingAddr?.firstName || billingAddr?.firstName || '',
            lastName: shippingAddr?.lastName || billingAddr?.lastName || '',
            phone: shippingAddr?.phone || billingAddr?.phone || order.phone || '',
            address: shippingAddr?.address || billingAddr?.address || '',
            apartment: shippingAddr?.apartment || billingAddr?.apartment,
            city: shippingAddr?.city || billingAddr?.city || '',
            postalCode: shippingAddr?.postalCode || billingAddr?.postalCode || '',
            country: shippingAddr?.country || billingAddr?.country || 'SE'
          },
          items: order.items.map(item => ({
            productId: item.productId,
            name: item.product?.name || 'Okänd produkt',
            price: item.price,
            quantity: item.quantity,
            sku: item.product?.sku || item.productId
          })),
          orderId: order.orderNumber,
          total: order.totalAmount,
          shipping: order.shippingAmount,
          orderDate: order.createdAt
        })

        // Uppdatera order med Fortnox-referens
        await prisma.order.update({
          where: { id: orderId },
          data: { 
            internalNotes: `Fortnox order: ${fortnoxResult.orderNumber}${order.internalNotes ? '\n' + order.internalNotes : ''}` 
          }
        })

        logger.info('Fortnox invoice created successfully', {
          orderId,
          fortnoxOrderNumber: fortnoxResult.orderNumber,
          teamId: statusMapping.team_id
        })

      } catch (error) {
        logger.error('Failed to create Fortnox invoice', {
          orderId,
          error: error instanceof Error ? error.message : 'Unknown error',
          teamId: statusMapping.team_id
        })
      }
    }

    // 2. Skicka order till Sybka för fulfillment om status triggar det
    if (sybkaService.shouldCreateSybkaOrder(status, paymentStatus)) {
      try {
        logger.info('Creating Sybka order', {
          orderId,
          orderNumber: order.orderNumber,
          teamId: statusMapping.team_id
        })

        const sybkaOrderData = {
          shop_order_id: order.orderNumber,
          shop_order_increment_id: `1753-${order.orderNumber}`,
          order_date: order.createdAt.toISOString().split('T')[0],
          currency: order.currency,
          grand_total: order.totalAmount,
          subtotal: order.subtotal,
          discount_amount: order.discountAmount,
          subtotal_incl_tax: order.totalAmount,
          tax_amount: order.taxAmount,
          shipping_amount: order.shippingAmount,
          shipping_incl_tax: order.shippingAmount,
          shipping_tax_amount: 0,
          status: status.toLowerCase() as any,
          fulfillment_status: 'unfulfilled' as const,
          billing_email: order.email,
          billing_firstname: (order.billingAddress as any)?.firstName || '',
          billing_lastname: (order.billingAddress as any)?.lastName || '',
          billing_street: (order.billingAddress as any)?.address || '',
          billing_city: (order.billingAddress as any)?.city || '',
          billing_postcode: (order.billingAddress as any)?.postalCode || '',
          billing_country: (order.billingAddress as any)?.country || 'SE',
          billing_phone: (order.billingAddress as any)?.phone || '',
          shipping_email: order.email,
          shipping_firstname: (order.shippingAddress as any)?.firstName || '',
          shipping_lastname: (order.shippingAddress as any)?.lastName || '',
          shipping_street: (order.shippingAddress as any)?.address || '',
          shipping_city: (order.shippingAddress as any)?.city || '',
          shipping_postcode: (order.shippingAddress as any)?.postalCode || '',
          shipping_country: (order.shippingAddress as any)?.country || 'SE',
          shipping_phone: (order.shippingAddress as any)?.phone || '',
          order_rows: order.items.map(item => ({
            sku: item.product?.sku || item.productId,
            name: item.product?.name || 'Okänd produkt',
            qty_ordered: item.quantity,
            price: item.price,
            price_incl_tax: item.price * 1.25, // Anta 25% moms
            row_total: item.quantity * item.price,
            row_total_incl_tax: item.quantity * item.price * 1.25,
            tax_amount: item.quantity * item.price * 0.25,
            tax_percent: 25
          })),
          team_id: statusMapping.team_id
        }

        const result = await sybkaService.createOrder(sybkaOrderData)
        
        if (result.success) {
          logger.info('Sybka order created successfully', {
            orderId,
            sybkaOrderId: result.order_id,
            teamId: statusMapping.team_id
          })
        } else {
          logger.error('Failed to create Sybka order', {
            orderId,
            error: result.error,
            teamId: statusMapping.team_id
          })
        }

      } catch (error) {
        logger.error('Failed to create Sybka order', {
          orderId,
          error: error instanceof Error ? error.message : 'Unknown error',
          teamId: statusMapping.team_id
        })
      }
    }

  } catch (error) {
    logger.error('Error handling order status change', {
      orderId,
      status,
      paymentStatus,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

/**
 * Webhook för Fortnox-events (framtida användning)
 */
router.post('/fortnox', express.json(), async (req, res) => {
  try {
    logger.info('Fortnox webhook received', req.body)
    
    // Här kan vi hantera events från Fortnox om behövs
    res.status(200).json({ received: true })
  } catch (error) {
    logger.error('Fortnox webhook error:', error)
    res.status(500).json({ error: 'Webhook processing failed' })
  }
})

/**
 * Test endpoint för att trigga statusändringar manuellt
 */
router.post('/test-status-change', express.json(), async (req, res) => {
  try {
    const { orderId, status, paymentStatus } = req.body

    logger.info('Manual order status change', {
      orderId,
      status,
      paymentStatus
    })

    // Först uppdatera ordern i databasen
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { 
        status: status as any,
        paymentStatus: paymentStatus as any
      }
    })

    logger.info('Order status updated in database', {
      orderId,
      oldStatus: updatedOrder.status,
      newStatus: status,
      oldPaymentStatus: updatedOrder.paymentStatus,
      newPaymentStatus: paymentStatus
    })

    // Sedan kör integrations-logiken
    await handleOrderStatusChange(orderId, status, paymentStatus)
    
    res.status(200).json({ 
      success: true, 
      message: 'Status change processed and integrations triggered',
      teamId: sybkaService.getStatusMapping().team_id,
      updatedOrder: {
        id: updatedOrder.id,
        status,
        paymentStatus
      }
    })
  } catch (error) {
    logger.error('Order status change error:', error)
    res.status(500).json({ error: 'Status change processing failed', details: error.message })
  }
})

/**
 * Debug endpoint för Sybka+ integration
 * GET /api/webhooks/debug-sybka
 */
router.get('/debug-sybka', async (req, res) => {
  try {
    const statusMapping = sybkaService.getStatusMapping()
    
    // Test connection
    const connectionTest = await sybkaService.testConnection()
    
    // Get recent orders
    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    })

    // Check environment variables
    const envCheck = {
      SYBKA_SYNC_URL: !!process.env.SYBKA_SYNC_URL,
      SYNKA_ACCESS_TOKEN: !!process.env.SYNKA_ACCESS_TOKEN,
      SYNKA_TEAM_ID: !!process.env.SYNKA_TEAM_ID,
      FORTNOX_API_TOKEN: !!process.env.FORTNOX_API_TOKEN,
      FORTNOX_CLIENT_SECRET: !!process.env.FORTNOX_CLIENT_SECRET,
      FORTNOX_BASE_URL: !!process.env.FORTNOX_BASE_URL,
      NODE_ENV: process.env.NODE_ENV
    }

    // Test Fortnox connection
    let fortnoxTest = false
    try {
      fortnoxTest = await fortnoxService.testConnection()
    } catch (error) {
      logger.error('Fortnox test failed:', error)
    }

    res.json({
      success: true,
      debug_info: {
        environment: envCheck,
        sybka_connection: connectionTest,
        fortnox_connection: fortnoxTest,
        status_mapping: statusMapping,
        recent_orders: recentOrders.map(order => ({
          id: order.id,
          orderNumber: order.orderNumber,
          status: order.status,
          paymentStatus: order.paymentStatus,
          totalAmount: order.totalAmount,
          createdAt: order.createdAt,
          shouldCreateInvoice: sybkaService.shouldCreateInvoice(order.status, order.paymentStatus),
          shouldCreateSybkaOrder: sybkaService.shouldCreateSybkaOrder(order.status, order.paymentStatus)
        }))
      }
    })
  } catch (error: any) {
    logger.error('Sybka debug endpoint error:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * Manual trigger för att skicka en specifik order till Sybka+
 * POST /api/webhooks/manual-sybka-sync
 */
router.post('/manual-sybka-sync', express.json(), async (req, res) => {
  try {
    const { orderId } = req.body
    
    if (!orderId) {
      return res.status(400).json({ error: 'orderId is required' })
    }

    logger.info('Manual Sybka sync triggered', { orderId })

    // Force trigger the integration
    await handleOrderStatusChange(orderId, 'CONFIRMED', 'PAID')
    
    res.json({
      success: true,
      message: `Manual sync triggered for order ${orderId}`
    })
  } catch (error: any) {
    logger.error('Manual Sybka sync error:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * Fortnox debug endpoint with detailed error reporting
 * GET /api/webhooks/debug-fortnox
 */
router.get('/debug-fortnox', async (req, res) => {
  const baseUrl = process.env.FORTNOX_BASE_URL || 'https://api.fortnox.se/3'
  const token = (process.env.FORTNOX_API_TOKEN || '').trim()
  const isJwt = token && (token.includes('.') && token.split('.').length >= 3 || token.startsWith('eyJ'))
  const headers = isJwt ? {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  } : {
    'Access-Token': process.env.FORTNOX_API_TOKEN || '',
    'Client-Secret': process.env.FORTNOX_CLIENT_SECRET || '',
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }

  const envOk = {
    FORTNOX_API_TOKEN: !!process.env.FORTNOX_API_TOKEN,
    FORTNOX_CLIENT_SECRET: !!process.env.FORTNOX_CLIENT_SECRET,
    FORTNOX_BASE_URL: !!process.env.FORTNOX_BASE_URL,
    AUTH_MODE: isJwt ? 'oauth_bearer' : 'legacy_headers'
  }

  try {
    const resp = await axios.get(`${baseUrl}/companyinformation`, { headers })
    return res.json({
      success: true,
      environment: envOk,
      response: {
        status: resp.status,
        data: resp.data
      }
    })
  } catch (error: any) {
    const status = error?.response?.status
    const data = error?.response?.data
    logger.error('Fortnox debug error', { status, data })
    return res.status(200).json({
      success: false,
      environment: envOk,
      error: {
        status: status || null,
        data: data || error?.message || 'Unknown error'
      }
    })
  }
})

// Test endpoint - super enkel
router.all('/test-viva', async (req, res) => {
  console.log('TEST VIVA WEBHOOK:', {
    method: req.method,
    query: req.query,
    headers: req.headers
  })
  
  // Om det finns en VivaWalletWebhookVerificationCode, returnera den
  const code = (req.query.VivaWalletWebhookVerificationCode as string | undefined) || extractVerificationCodeFromHeaders(req.headers as any)
  if (code) {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8')
    return res.type('text/plain').send(String(code))
  }

  // Annars försök returnera JSON Key enligt Viva-dokumentation
  const key = await fetchVivaVerificationKey()
  if (key) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    return res.status(200).json(key)
  }

  res.setHeader('Content-Type', 'text/plain; charset=utf-8')
  return res.type('text/plain').send('OK')
})

export default router 