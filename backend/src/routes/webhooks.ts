import express from 'express'
import { logger } from '../utils/logger'
import { prisma } from '../lib/prisma'
import { fortnoxService } from '../services/fortnoxService'
import axios from 'axios'
import { ongoingService } from '../services/ongoingService'
import { VivaWalletService } from '../services/vivaWalletService'

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
  // --- OMFATTANDE DEBUG-LOGGNING ---
  logger.info('VIVA WEBHOOK RECEIVED (RAW)', {
    timestamp: new Date().toISOString(),
    headers: req.headers,
    body: req.body.toString(),
    query: req.query,
    method: req.method,
    url: req.originalUrl,
  });
  // --- SLUT PÅ DEBUG-LOGGNING ---

  try {
    let payload;
    const bodyStr = req.body.toString();

    // Kontrollera om kroppen är den felaktiga strängen "[object Object]"
    if (bodyStr.toLowerCase().includes('[object object]')) {
      logger.warn('Received malformed "[object Object]" string in webhook body. Attempting multiple parsing strategies.');
      
      // Strategi 1: Försök parsa från query parameters
      const eventData = req.query.eventData || req.query.EventData;
      if (typeof eventData === 'string') {
        try {
          payload = JSON.parse(eventData);
          logger.info('Successfully parsed webhook payload from query parameter', { payload });
        } catch (parseError) {
          logger.error('Failed to parse eventData from query:', parseError);
        }
      }
      
      // Strategi 2: Försök parsa alla query parameters som potentiell payload
      if (!payload) {
        const queryKeys = Object.keys(req.query);
        for (const key of queryKeys) {
          const value = req.query[key];
          if (typeof value === 'string' && value.startsWith('{')) {
            try {
              payload = JSON.parse(value);
              logger.info(`Successfully parsed webhook payload from query key: ${key}`, { payload });
              break;
            } catch (parseError) {
              // Continue trying other keys
            }
          }
        }
      }
      
      // Strategi 3: Skapa en mock payload för testning
      if (!payload) {
        logger.warn('No valid payload found, creating mock payload for debugging');
        payload = {
          EventTypeId: 1796, // Payment Created
          EventData: {
            OrderCode: req.query.orderCode || req.query.OrderCode || 'UNKNOWN'
          }
        };
      }
    } else {
      payload = JSON.parse(bodyStr);
    }
    
    // Svara omedelbart med 200 OK för att bekräfta mottagning
    res.status(200).send('OK')

    // Hantera olika event-typer
    logger.info('Processing webhook payload', { 
      eventTypeId: payload.EventTypeId, 
      orderCode: payload.EventData?.OrderCode,
      fullPayload: payload 
    });
    
    if (payload.EventTypeId === 1796 || payload.EventTypeId === 1797) { // Payment Created eller Transaction Payment Created
      const orderCode = payload.EventData?.OrderCode
      
      logger.info('Processing payment webhook', { orderCode, eventType: payload.EventTypeId });
      
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
    
    logger.info('Processing order status change', {
      orderId,
      orderNumber: order.orderNumber,
      status,
      paymentStatus
    })

    // Run Fortnox and Ongoing in parallel for confirmed/paid orders
    if (paymentStatus === 'PAID' || status === 'CONFIRMED' || status === 'PROCESSING') {
      const orderData = {
        customer: {
          email: order.email,
          firstName: (order.shippingAddress as any)?.firstName || (order.billingAddress as any)?.firstName || order.customerName?.split(' ')[0] || 'Customer',
          lastName: (order.shippingAddress as any)?.lastName || (order.billingAddress as any)?.lastName || order.customerName?.split(' ').slice(1).join(' ') || order.orderNumber,
          phone: (order.shippingAddress as any)?.phone || (order.billingAddress as any)?.phone || order.phone || '',
          address: (order.shippingAddress as any)?.address || (order.billingAddress as any)?.address || '',
          apartment: (order.shippingAddress as any)?.apartment || (order.billingAddress as any)?.apartment,
          city: (order.shippingAddress as any)?.city || (order.billingAddress as any)?.city || '',
          postalCode: (order.shippingAddress as any)?.postalCode || (order.billingAddress as any)?.postalCode || '',
          country: (order.shippingAddress as any)?.country || (order.billingAddress as any)?.country || 'SE'
        },
        items: order.items.map(item => ({
          productId: item.productId,
          name: item.product?.name || 'Okänd produkt',
          price: item.price,
          quantity: item.quantity,
          sku: item.product?.sku || item.productId,
          weight: item.product?.weight
        })),
        orderId: order.orderNumber,
        total: order.totalAmount,
        shipping: order.shippingAmount,
        orderDate: order.createdAt,
        deliveryInstruction: order.customerNotes
      }

      // Process Fortnox and Ongoing in parallel
      const [fortnoxResult, ongoingResult] = await Promise.allSettled([
        (async () => {
          logger.info('Processing Fortnox order', { orderId, orderNumber: order.orderNumber })
          const result = await fortnoxService.processOrder(orderData)
          logger.info('Fortnox order processed successfully', {
            orderId,
            customerNumber: result.customerNumber,
            orderNumber: result.orderNumber
          })
          return result
        })(),
        (async () => {
          logger.info('Processing Ongoing order', { orderId, orderNumber: order.orderNumber })
          const result = await ongoingService.processOrder(orderData)
          logger.info('Ongoing order processed successfully', {
            orderId,
            customerNumber: result.customerNumber,
            orderNumber: result.orderNumber
          })
          return result
        })()
      ])

      // Update order with integration references
      let internalNotes = order.internalNotes || ''
      
      if (fortnoxResult.status === 'fulfilled') {
        internalNotes += `\nFortnox order: ${fortnoxResult.value.orderNumber}`
      } else {
        logger.error('Failed to process Fortnox order', {
          orderId,
          error: fortnoxResult.reason?.message || 'Unknown error'
        })
        // Kasta ett fel för att signalera att synken misslyckades
        throw new Error(`Fortnox sync failed: ${fortnoxResult.reason?.message || 'Unknown error'}`)
      }

      if (ongoingResult.status === 'fulfilled') {
        internalNotes += `\nOngoing order: ${ongoingResult.value.orderNumber}`
      } else {
        logger.error('Failed to process Ongoing order', {
          orderId,
          error: ongoingResult.reason?.message || 'Unknown error'
        })
        // Valfritt: Kasta fel även för Ongoing, eller bara logga
        // throw new Error(`Ongoing sync failed: ${ongoingResult.reason?.message || 'Unknown error'}`)
      }

      // Update order with all references
      if (internalNotes !== (order.internalNotes || '')) {
        await prisma.order.update({
          where: { id: orderId },
          data: { internalNotes: internalNotes.trim() }
        })
      }
    } else {
      logger.info('Order does not meet sync criteria', { 
        orderId, 
        status, 
        paymentStatus,
        reason: 'Not PAID or CONFIRMED/PROCESSING' 
      })
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
 * Debug endpoint for Ongoing WMS
 * GET /api/webhooks/debug-ongoing
 */
router.get('/debug-ongoing', async (req, res) => {
  try {
    const hasCredentials = !!(
      process.env.ONGOING_USERNAME &&
      process.env.ONGOING_PASSWORD &&
      process.env.ONGOING_GOODS_OWNER_ID
    )

    const directModeEnabled = process.env.ONGOING_DIRECT_MODE === 'true'
    
    // Test connection if credentials are present
    let connectionStatus = false
    let connectionError = null
    
    if (hasCredentials) {
      try {
        connectionStatus = await ongoingService.testConnection()
      } catch (error: any) {
        connectionError = error.message
      }
    }

    res.json({
      ongoing: {
        credentials_configured: hasCredentials,
        direct_mode_enabled: directModeEnabled,
        connection: connectionStatus,
        connection_error: connectionError,
        base_url: process.env.ONGOING_BASE_URL || 'https://api.ongoingsystems.se',
        goods_owner_id: process.env.ONGOING_GOODS_OWNER_ID
      },
      current_flow: directModeEnabled ? 'Direct to Fortnox + Ongoing' : 'Via Sybka+'
    })
  } catch (error) {
    logger.error('Failed to get Ongoing debug info', error)
    res.status(500).json({ error: 'Failed to get Ongoing debug info' })
  }
})

/**
 * Get available order statuses
 * GET /api/webhooks/order-statuses
 * 
 * This endpoint is used by Synka+ to fetch available order statuses
 */
router.get('/order-statuses', async (req, res) => {
  try {
    // Define all available order statuses
    const orderStatuses = [
      { value: 'PENDING', label: 'Pending' },
      { value: 'CONFIRMED', label: 'Confirmed' },
      { value: 'PROCESSING', label: 'Processing' },
      { value: 'SHIPPED', label: 'Shipped' },
      { value: 'DELIVERED', label: 'Delivered' },
      { value: 'CANCELLED', label: 'Cancelled' },
      { value: 'REFUNDED', label: 'Refunded' }
    ]

    const paymentStatuses = [
      { value: 'PENDING', label: 'Pending' },
      { value: 'PAID', label: 'Paid' },
      { value: 'PARTIALLY_PAID', label: 'Partially Paid' },
      { value: 'REFUNDED', label: 'Refunded' },
      { value: 'FAILED', label: 'Failed' }
    ]

    res.json({
      success: true,
      order_statuses: orderStatuses,
      payment_statuses: paymentStatuses
    })
  } catch (error: any) {
    logger.error('Get order statuses error:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
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
 * Debug endpoint för integrations
 * GET /api/webhooks/debug-integrations
 */
router.get('/debug-integrations', async (req, res) => {
  try {
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
      FORTNOX_API_TOKEN: !!process.env.FORTNOX_API_TOKEN,
      FORTNOX_CLIENT_SECRET: !!process.env.FORTNOX_CLIENT_SECRET,
      FORTNOX_BASE_URL: !!process.env.FORTNOX_BASE_URL,
      ONGOING_USERNAME: !!process.env.ONGOING_USERNAME,
      ONGOING_PASSWORD: !!process.env.ONGOING_PASSWORD,
      ONGOING_BASE_URL: !!process.env.ONGOING_BASE_URL,
      NODE_ENV: process.env.NODE_ENV
    }

    // Test connections
    let fortnoxTest = false
    let ongoingTest = false
    try {
      fortnoxTest = await fortnoxService.testConnection()
    } catch (error) {
      logger.error('Fortnox test failed:', error)
    }
    try {
      ongoingTest = await ongoingService.testConnection()
    } catch (error) {
      logger.error('Ongoing test failed:', error)
    }

    res.json({
      success: true,
      debug_info: {
        environment: envCheck,
        fortnox_connection: fortnoxTest,
        ongoing_connection: ongoingTest,
        recent_orders: recentOrders.map(order => ({
          id: order.id,
          orderNumber: order.orderNumber,
          status: order.status,
          paymentStatus: order.paymentStatus,
          totalAmount: order.totalAmount,
          createdAt: order.createdAt,
          shouldSync: order.paymentStatus === 'PAID' || ['CONFIRMED', 'PROCESSING'].includes(order.status)
        }))
      }
    })
  } catch (error: any) {
    logger.error('Integrations debug endpoint error:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * Manual trigger for integrations sync
 * POST /api/webhooks/manual-sybka-sync
 */
router.post('/manual-sybka-sync', express.json(), async (req, res) => {
  try {
    const { orderId } = req.body
    
    if (!orderId) {
      return res.status(400).json({ error: 'orderId is required' })
    }

    logger.info('Manual integration sync triggered', { orderId })

    // Force trigger the integration
    await handleOrderStatusChange(orderId, 'CONFIRMED', 'PAID')
    
    res.json({
      success: true,
      message: `Manual sync triggered for order ${orderId}`
    })
  } catch (error: any) {
    logger.error('Manual integration sync error:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * Sync all pending orders to Fortnox/Ongoing
 * POST /api/webhooks/sync-all-orders
 */
router.post('/sync-all-orders', express.json(), async (req, res) => {
  try {
    logger.info('Manual sync of all pending orders triggered')

    // Find all orders that should be synced
    const pendingOrders = await prisma.order.findMany({
      where: {
        OR: [
          {
            status: { in: ['CONFIRMED', 'PROCESSING'] },
            paymentStatus: 'PAID'
          }
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

    logger.info(`Found ${pendingOrders.length} pending orders to sync`)

    const results = []
    
    for (const order of pendingOrders) {
      try {
        logger.info('Syncing order', { orderId: order.id, orderNumber: order.orderNumber })
        
        // Trigger the integration for this order
        await handleOrderStatusChange(order.id, 'CONFIRMED', 'PAID')
        
        results.push({
          orderId: order.id,
          orderNumber: order.orderNumber,
          success: true
        })
        
      } catch (error: any) {
        logger.error(`Failed to sync order ${order.orderNumber}:`, error)
        results.push({
          orderId: order.id,
          orderNumber: order.orderNumber,
          success: false,
          error: error.message
        })
      }
    }
    
    const successCount = results.filter(r => r.success).length
    const failureCount = results.filter(r => !r.success).length
    
    res.json({
      success: true,
      message: `Sync completed: ${successCount} successful, ${failureCount} failed`,
      results: results
    })
    
  } catch (error: any) {
    logger.error('Manual sync all orders error:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * Temporary debug endpoint to view recent orders
 * GET /api/webhooks/debug/recent-orders
 */
router.get('/debug/recent-orders', async (req, res) => {
  // Add a simple secret query param to protect this endpoint
  const secret = process.env.DEBUG_SECRET || '1753'
  if (req.query.secret !== secret) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    const orders = await prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, // Lägg till id
        orderNumber: true,
        status: true,
        paymentStatus: true,
        totalAmount: true,
        createdAt: true,
        internalNotes: true,
        email: true
      }
    })

    res.json({
      success: true,
      orders: orders.map(o => ({
        ...o,
        shouldSync: o.paymentStatus === 'PAID' || ['CONFIRMED', 'PROCESSING'].includes(o.status),
      }))
    })
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message })
  }
})

/**
 * Test integration endpoint
 * GET /api/webhooks/test-integration?orderId=...
 */
router.get('/test-integration', async (req, res) => {
  try {
    const orderId = (req.query.orderId as string) || ''
    if (!orderId) {
      return res.status(400).json({ success: false, error: 'orderId is required' })
    }

    logger.info('Testing integration for order', { orderId })

    // Trigger the integration
    await handleOrderStatusChange(orderId, 'CONFIRMED', 'PAID')

    return res.status(200).json({
      success: true,
      message: `Integration test triggered for order ${orderId}`
    })
  } catch (error: any) {
    logger.error('Test integration error:', error)
    return res.status(500).json({ success: false, error: error.message })
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

// Verify order status after successful payment redirect
router.post('/verify-order-status', async (req, res) => {
  const { orderCode, orderId } = req.body
  
  logger.info('Order status verification requested', { orderCode, orderId })
  
  try {
    if (!orderCode) {
      return res.status(400).json({
        success: false,
        error: 'Order code is required'
      })
    }

    // First, verify payment with Viva
    const vivaService = new VivaWalletService()
    const payment = await vivaService.verifyPayment(parseInt(orderCode))
    
    if (!payment) {
      logger.warn('No payment found for order code', { orderCode })
      return res.json({
        success: false,
        status: 'PENDING',
        message: 'Payment not found yet'
      })
    }

    // Check if payment was successful (statusId 'F' means successful)
    if (payment.statusId !== 'F') {
      logger.warn('Payment not successful', { orderCode, statusId: payment.statusId })
      return res.json({
        success: false,
        status: 'FAILED',
        message: 'Payment was not successful'
      })
    }

    // Find order in database
    let order
    if (orderId) {
      order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { items: true }
      })
    } else {
      // Try to find by orderCode
      order = await prisma.order.findFirst({
        where: { 
          OR: [
            { paymentOrderCode: orderCode }
          ]
        },
        include: { items: true }
      })
    }

    if (!order) {
      logger.error('Order not found in database', { orderCode, orderId })
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      })
    }

    // Update order status if needed
    if (order.status !== 'CONFIRMED' && order.paymentStatus !== 'PAID') {
      logger.info('Updating order status to CONFIRMED and payment status to PAID', { orderId: order.id })
      
      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: 'CONFIRMED',
          paymentStatus: 'PAID',
          transactionId: payment.transactionTypeId ? payment.transactionTypeId.toString() : undefined,
          updatedAt: new Date()
        }
      })

      // Handle status change (sync to Fortnox/Ongoing)
      await handleOrderStatusChange(order.id, 'CONFIRMED', 'PAID')
      
      logger.info('Order status updated successfully', { orderId: order.id, orderCode })
    }

    return res.json({
      success: true,
      status: 'CONFIRMED',
      paymentStatus: 'PAID',
      orderId: order.id,
      orderNumber: order.orderNumber,
      message: 'Order verified and updated'
    })
    
  } catch (error: any) {
    logger.error('Error verifying order status', {
      error: error.message,
      orderCode,
      orderId
    })
    
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to verify order status'
    })
  }
})

export default router 