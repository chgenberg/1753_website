import express from 'express'
import crypto from 'crypto'
import { logger } from '../utils/logger'
import { prisma } from '../lib/prisma'
import { fortnoxService } from '../services/fortnoxService'
import axios from 'axios'
import { ongoingService } from '../services/ongoingService'
import { VivaWalletService } from '../services/vivaWalletService'
// (no default import)

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
    bodyLength: req.body.length,
    queryKeys: Object.keys(req.query),
    queryValues: Object.values(req.query)
  });
  // --- SLUT PÅ DEBUG-LOGGNING ---

  try {
    let payload;
    
    // Check if body is already a parsed object (Railway's doing)
    if (typeof req.body === 'object' && req.body !== null && !Buffer.isBuffer(req.body)) {
      payload = req.body;
      logger.info('Webhook received as parsed object (Railway)', { payload });
    } else {
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
      
      // Strategi 2: Kolla om Viva skickar data i headers
      if (!payload) {
        // Railway kan ibland skicka webhook-data i headers
        const allHeaders = req.headers;
        logger.info('All webhook headers for debugging', { headers: allHeaders });
        
        // Kolla specifika Viva-headers
        const possibleHeaders = ['x-viva-eventdata', 'x-viva-event-data', 'x-webhook-data', 'x-event-data'];
        for (const headerName of possibleHeaders) {
          const headerValue = req.headers[headerName];
          if (headerValue && typeof headerValue === 'string') {
            try {
              payload = JSON.parse(headerValue);
              logger.info(`Successfully parsed webhook payload from header: ${headerName}`, { payload });
              break;
            } catch (e) {
              logger.warn(`Could not parse header ${headerName}:`, e);
            }
          }
        }
      }
      
      // Strategi 3: Försök parsa alla query parameters som potentiell payload
      if (!payload) {
        const queryKeys = Object.keys(req.query);
        logger.info('All query parameters for debugging', { query: req.query });
        
        // Om det finns ett EventTypeId direkt i query, bygg payload från query params
        if (req.query.EventTypeId || req.query.eventTypeId) {
          payload = {
            EventTypeId: parseInt(req.query.EventTypeId as string || req.query.eventTypeId as string),
            EventData: {
              OrderCode: req.query.OrderCode || req.query.orderCode,
              MerchantTrns: req.query.MerchantTrns || req.query.merchantTrns,
              ReferenceNumber: req.query.ReferenceNumber || req.query.referenceNumber,
              CustomerTrns: req.query.CustomerTrns || req.query.customerTrns
            }
          };
          logger.info('Built payload from individual query parameters', { payload });
        } else {
          // Försök parsa JSON från query params
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
      const eventData = payload.EventData || payload.eventData || payload.Data || payload.data || {}
      const orderCode = (eventData.OrderCode || eventData.orderCode || payload.OrderCode || payload.orderCode || '').toString()
      const merchantTrns = (eventData.MerchantTrns || eventData.merchantTrns || payload.MerchantTrns || payload.merchantTrns || '').toString()
      const referenceNumber = (eventData.ReferenceNumber || eventData.referenceNumber || payload.ReferenceNumber || payload.referenceNumber || '').toString()
      const customerTrns = (eventData.CustomerTrns || eventData.customerTrns || payload.CustomerTrns || payload.customerTrns || '').toString()
      
      logger.info('Processing payment webhook', { orderCode, eventType: payload.EventTypeId });
      
      // Försök hitta order först via OrderCode, därefter via MerchantTrns (matcha orderNumber)
      let order = null as any
      if (orderCode) {
        order = await prisma.order.findFirst({
          where: { OR: [ { paymentOrderCode: orderCode }, { paymentReference: orderCode } ] },
          include: { items: { include: { product: true } } }
        })
      }
      if (!order && merchantTrns) {
        order = await prisma.order.findFirst({
          where: { orderNumber: merchantTrns },
          include: { items: { include: { product: true } } }
        })
      }
      // Fallback: try ReferenceNumber (some Viva payloads) and parse from customerTrns
      if (!order && referenceNumber) {
        order = await prisma.order.findFirst({
          where: { orderNumber: referenceNumber },
          include: { items: { include: { product: true } } }
        })
      }
      if (!order && customerTrns) {
        const match = customerTrns.match(/1753-[0-9]{13,}-[A-Z0-9]+/)
        if (match && match[0]) {
          order = await prisma.order.findFirst({
            where: { orderNumber: match[0] },
            include: { items: { include: { product: true } } }
          })
        }
      }

      if (order) {
          logger.info('💳 Payment webhook received - Processing order', {
            orderId: order.id,
            orderNumber: order.orderNumber,
            orderCode,
            eventTypeId: payload.EventTypeId,
            currentStatus: order.status,
            currentPaymentStatus: order.paymentStatus
          })

          // Check if already processed to avoid duplicate processing
          if (order.paymentStatus === 'PAID' && order.status === 'CONFIRMED') {
            logger.info('⚠️  Order already processed (PAID/CONFIRMED), checking if Fortnox sync needed...', {
              orderId: order.id,
              orderNumber: order.orderNumber,
              internalNotes: order.internalNotes
            })
            
            // If not synced to Fortnox yet, trigger sync
            if (!order.internalNotes?.includes('Fortnox order:')) {
              logger.info('🔄 Order paid but not synced to Fortnox, triggering sync...', {
                orderId: order.id,
                orderNumber: order.orderNumber
              })
              await handleOrderStatusChange(order.id, 'CONFIRMED', 'PAID')
            } else {
              logger.info('✅ Order already synced to Fortnox, skipping', {
                orderId: order.id,
                orderNumber: order.orderNumber
              })
            }
            return
          }

          // Uppdatera order med betalningsstatus
          const updatedOrder = await prisma.order.update({
            where: { id: order.id },
            data: { 
              paymentStatus: 'PAID',
              status: 'CONFIRMED', // Automatiskt bekräfta order när betalning är klar
              updatedAt: new Date()
            }
          })

          logger.info('✅ Order payment confirmed and status updated', {
            orderId: updatedOrder.id,
            orderNumber: updatedOrder.orderNumber,
            amount: updatedOrder.totalAmount,
            status: updatedOrder.status,
            paymentStatus: updatedOrder.paymentStatus
          })

          // Trigger Fortnox and Ongoing sync
          logger.info('🚀 Triggering Fortnox and Ongoing sync...', {
            orderId: updatedOrder.id,
            orderNumber: updatedOrder.orderNumber
          })
          
          try {
            await handleOrderStatusChange(updatedOrder.id, 'CONFIRMED', 'PAID')
            logger.info('✅ Order status change processing completed', {
              orderId: updatedOrder.id,
              orderNumber: updatedOrder.orderNumber
            })
          } catch (syncError: any) {
            logger.error('❌ Failed to sync order to Fortnox/Ongoing', {
              orderId: updatedOrder.id,
              orderNumber: updatedOrder.orderNumber,
              error: syncError.message || String(syncError),
              stack: syncError.stack
            })
            // Don't throw - order is already marked as PAID, error is logged and order is marked for retry
          }
      } else {
          logger.warn('Order not found for Viva Wallet webhook', { orderCode, merchantTrns, referenceNumber, customerTrns, searchedFor: { paymentOrderCode: orderCode, paymentReference: orderCode, orderNumber: merchantTrns || referenceNumber || '[parsed from customerTrns]' } })
          
          // Debug: Show recent orders to help identify the issue
          const recentOrders = await prisma.order.findMany({
            select: {
              orderNumber: true,
              paymentOrderCode: true,
              paymentReference: true,
              createdAt: true
            },
            orderBy: { createdAt: 'desc' },
            take: 5
          })
          
          logger.info('Recent orders for debugging', { recentOrders })
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
 * Retry helper with exponential backoff
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelayMs = 1000,
  operationName = 'operation'
): Promise<T> {
  let lastError: Error | null = null
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        const delayMs = Math.min(baseDelayMs * Math.pow(2, attempt - 1), 30000) // Max 30 seconds
        logger.info(`${operationName} - Retry attempt ${attempt}/${maxRetries} after ${delayMs}ms delay`)
        await new Promise(resolve => setTimeout(resolve, delayMs))
      }
      
      return await fn()
    } catch (error: any) {
      lastError = error instanceof Error ? error : new Error(String(error))
      
      // Don't retry on certain errors
      if (error.response?.status === 400 || error.response?.status === 404) {
        logger.error(`${operationName} - Non-retryable error (${error.response.status})`, {
          error: lastError.message
        })
        throw lastError
      }
      
      if (attempt < maxRetries) {
        logger.warn(`${operationName} - Attempt ${attempt + 1} failed, will retry`, {
          error: lastError.message,
          attempt: attempt + 1,
          maxRetries
        })
      } else {
        logger.error(`${operationName} - All ${maxRetries + 1} attempts failed`, {
          error: lastError.message
        })
        throw lastError
      }
    }
  }
  
  throw lastError || new Error(`${operationName} failed after ${maxRetries + 1} attempts`)
}

/**
 * Verify Fortnox token is valid before processing
 */
async function ensureFortnoxTokenValid(): Promise<boolean> {
  try {
    // Check if using OAuth
    const isOAuth = String(process.env.FORTNOX_USE_OAUTH || '').toLowerCase() === 'true'
    
    if (!isOAuth) {
      // Legacy API - just check credentials exist
      return !!(process.env.FORTNOX_API_TOKEN && process.env.FORTNOX_CLIENT_SECRET)
    }
    
    // For OAuth, verify token is valid by testing connection
    const isValid = await fortnoxService.testConnection()
    
    if (!isValid) {
      logger.warn('Fortnox token appears invalid, attempting refresh...')
      try {
        await fortnoxService.debugRefreshAccessToken()
        // Test again after refresh
        return await fortnoxService.testConnection()
      } catch (refreshError) {
        logger.error('Failed to refresh Fortnox token', {
          error: refreshError instanceof Error ? refreshError.message : String(refreshError)
        })
        return false
      }
    }
    
    return true
  } catch (error) {
    logger.error('Error verifying Fortnox token', {
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    return false
  }
}

/**
 * Hantera orderstatusändringar och trigga Sybka/Fortnox-integration
 * Förbättrad med retry-logik och bättre error handling
 */
async function handleOrderStatusChange(orderId: string, status: string, paymentStatus: string) {
  const logContext = { orderId, status, paymentStatus }
  
  try {
    // Check if order is already synced to avoid duplicate processing
    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
      select: { 
        id: true,
        internalNotes: true,
        status: true,
        paymentStatus: true
      }
    })

    if (!existingOrder) {
      logger.error('Order not found for status change', logContext)
      return
    }

    // Check if already synced to Fortnox
    if (existingOrder.internalNotes?.includes('Fortnox order:')) {
      logger.info('Order already synced to Fortnox, skipping', {
        ...logContext,
        orderNumber: existingOrder.id
      })
      return
    }

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
      logger.error('Order not found for status change', logContext)
      return
    }
    
    logger.info('🔄 Processing order status change', {
      orderId,
      orderNumber: order.orderNumber,
      status,
      paymentStatus,
      totalAmount: order.totalAmount,
      itemCount: order.items.length
    })

    // Run Fortnox and Ongoing in parallel for confirmed/paid orders
    if (paymentStatus === 'PAID' || status === 'CONFIRMED' || status === 'PROCESSING') {
      // Verify Fortnox token before processing
      logger.info('🔐 Verifying Fortnox token validity...', logContext)
      const tokenValid = await ensureFortnoxTokenValid()
      
      if (!tokenValid) {
        logger.error('❌ Fortnox token is invalid and refresh failed', logContext)
        // Mark order for manual retry
        await prisma.order.update({
          where: { id: orderId },
          data: { 
            internalNotes: `${order.internalNotes || ''}\n[ERROR] Fortnox sync failed: Invalid token - Manual retry required`.trim()
          }
        })
        throw new Error('Fortnox token invalid and refresh failed')
      }
      
      logger.info('✅ Fortnox token verified', logContext)

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

      // Process Fortnox with retry logic
      let fortnoxResult: PromiseSettledResult<{ customerNumber: string; orderNumber: string }> | null = null
      
      try {
        fortnoxResult = await Promise.allSettled([
          retryWithBackoff(
            async () => {
              logger.info('📤 Processing Fortnox order', { 
                orderId, 
                orderNumber: order.orderNumber,
                customerEmail: order.email,
                itemCount: orderData.items.length
              })
              const result = await fortnoxService.processOrder(orderData)
              
              // Verify order was actually created in Fortnox
              logger.info('✅ Fortnox order processed successfully', {
                orderId,
                orderNumber: order.orderNumber,
                fortnoxOrderNumber: result.orderNumber,
                customerNumber: result.customerNumber
              })
              
              return result
            },
            3, // maxRetries
            2000, // baseDelayMs
            'Fortnox order sync'
          )
        ]).then(results => results[0])
      } catch (fortnoxError: any) {
        logger.error('❌ Fortnox sync failed after retries', {
          orderId,
          orderNumber: order.orderNumber,
          error: fortnoxError.message || String(fortnoxError),
          stack: fortnoxError.stack
        })
        
        // Mark order for manual retry
        await prisma.order.update({
          where: { id: orderId },
          data: { 
            internalNotes: `${order.internalNotes || ''}\n[ERROR] Fortnox sync failed: ${fortnoxError.message || 'Unknown error'} - Manual retry required`.trim()
          }
        })
        
        // Don't throw - let Ongoing process continue
        fortnoxResult = { status: 'rejected', reason: fortnoxError } as PromiseRejectedResult
      }

      // Process Ongoing (non-blocking)
      const ongoingResult = await Promise.allSettled([
        (async () => {
          try {
            logger.info('📤 Processing Ongoing order', { orderId, orderNumber: order.orderNumber })
            const result = await ongoingService.processOrder(orderData)
            logger.info('✅ Ongoing order processed successfully', {
              orderId,
              orderNumber: order.orderNumber,
              ongoingOrderNumber: result.orderNumber
            })
            return result
          } catch (error: any) {
            logger.error('❌ Ongoing sync failed', {
              orderId,
              orderNumber: order.orderNumber,
              error: error.message || String(error)
            })
            throw error
          }
        })()
      ]).then(results => results[0])

      // Update order with integration references
      let internalNotes = order.internalNotes || ''
      
      if (fortnoxResult?.status === 'fulfilled') {
        internalNotes += `\nFortnox order: ${fortnoxResult.value.orderNumber}`
        logger.info('✅ Fortnox sync completed', {
          orderId,
          orderNumber: order.orderNumber,
          fortnoxOrderNumber: fortnoxResult.value.orderNumber
        })
      } else {
        const errorMsg = fortnoxResult?.status === 'rejected' 
          ? (fortnoxResult.reason?.message || 'Unknown error')
          : 'Unknown error'
        logger.error('❌ Fortnox sync failed', {
          orderId,
          orderNumber: order.orderNumber,
          error: errorMsg
        })
        // Don't throw - order is already marked as PAID, we'll retry later
      }

      if (ongoingResult.status === 'fulfilled') {
        internalNotes += `\nOngoing order: ${ongoingResult.value.orderNumber}`
        logger.info('✅ Ongoing sync completed', {
          orderId,
          orderNumber: order.orderNumber
        })
      } else {
        logger.error('❌ Ongoing sync failed', {
          orderId,
          orderNumber: order.orderNumber,
          error: ongoingResult.reason?.message || 'Unknown error'
        })
        // Non-critical - don't fail the whole process
      }

      // Update order with all references
      if (internalNotes !== (order.internalNotes || '')) {
        await prisma.order.update({
          where: { id: orderId },
          data: { internalNotes: internalNotes.trim() }
        })
      }
      
      logger.info('✅ Order status change processing completed', {
        orderId,
        orderNumber: order.orderNumber,
        fortnoxSynced: fortnoxResult?.status === 'fulfilled',
        ongoingSynced: ongoingResult.status === 'fulfilled'
      })
    } else {
      logger.info('⏭️  Order does not meet sync criteria', { 
        orderId, 
        status, 
        paymentStatus,
        reason: 'Not PAID or CONFIRMED/PROCESSING' 
      })
    }

  } catch (error) {
    logger.error('❌ Error handling order status change', {
      orderId,
      status,
      paymentStatus,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    
    // Mark order for manual retry
    try {
      await prisma.order.update({
        where: { id: orderId },
        data: { 
          internalNotes: `[ERROR] Status change processing failed: ${error instanceof Error ? error.message : 'Unknown error'} - Manual retry required`
        }
      })
    } catch (updateError) {
      logger.error('Failed to update order with error note', {
        orderId,
        updateError: updateError instanceof Error ? updateError.message : String(updateError)
      })
    }
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
 * Create test order and trigger webhook processing
 * GET /api/webhooks/create-test-order
 */
router.get('/create-test-order', async (req, res) => {
  try {
    const orderNumber = `1753-TEST-${Date.now()}`
    
    // Pick an existing product to satisfy FK on order_items.productId
    const sampleProduct = await prisma.product.findFirst({
      select: { id: true, name: true, sku: true }
    })
    logger.info('Create test order: selected sample product', { sampleProduct })

    if (!sampleProduct) {
      return res.status(400).json({
        error: 'No products found in database. Create at least one product first to run the test.'
      })
    }

    // Create a test order in database
    const testOrder = await prisma.order.create({
      data: {
        orderNumber,
        email: 'test@1753skincare.com',
        customerName: 'Test Customer',
        phone: '0701234567',
        status: 'PENDING',
        paymentStatus: 'PENDING',
        subtotal: 299,
        shippingAmount: 49,
        totalAmount: 348,
        currency: 'SEK',
        paymentReference: 'TEST123',
        paymentOrderCode: 'TEST123',
        shippingAddress: {
          firstName: 'Test',
          lastName: 'Customer', 
          address: 'Testgatan 1',
          city: 'Stockholm',
          postalCode: '11122',
          country: 'SE'
        },
        billingAddress: {
          firstName: 'Test',
          lastName: 'Customer',
          address: 'Testgatan 1', 
          city: 'Stockholm',
          postalCode: '11122',
          country: 'SE'
        },
        items: {
          create: [
            {
              // Use explicit relation connect to avoid FK issues
              product: { connect: { id: sampleProduct.id } },
              quantity: 1,
              price: 299,
              title: sampleProduct.name || 'Test Product',
              sku: sampleProduct.sku || sampleProduct.id
            }
          ]
        }
      },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    })
    
    logger.info('Test order created', { orderNumber, orderId: testOrder.id })
    
    // Now trigger webhook processing
    const updatedOrder = await prisma.order.update({
      where: { id: testOrder.id },
      data: { 
        paymentStatus: 'PAID',
        status: 'CONFIRMED'
      }
    })
    
    await handleOrderStatusChange(updatedOrder.id, 'CONFIRMED', 'PAID')
    
    res.json({ 
      success: true, 
      message: 'Test order created and processed',
      orderNumber,
      orderId: testOrder.id
    })
    
  } catch (error) {
    logger.error('Test order creation error:', error)
    res.status(500).json({ error: 'Test order failed', details: error.message })
  }
})

/**
 * Manual webhook test endpoint
 * GET /api/webhooks/test-webhook?orderNumber=1753-xxx
 */
router.get('/test-webhook', async (req, res) => {
  try {
    const orderNumber = req.query.orderNumber as string
    
    if (!orderNumber) {
      return res.status(400).json({ error: 'orderNumber required' })
    }
    
    // Find order by orderNumber
    const order = await prisma.order.findFirst({
      where: { orderNumber },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    })
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found', orderNumber })
    }
    
    // Manually trigger the same process as webhook
    logger.info('Manual webhook test triggered', { orderNumber, orderId: order.id })
    
    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: { 
        paymentStatus: 'PAID',
        status: 'CONFIRMED'
      }
    })
    
    await handleOrderStatusChange(updatedOrder.id, 'CONFIRMED', 'PAID')
    
    res.json({ 
      success: true, 
      message: 'Webhook test completed',
      orderNumber,
      orderId: order.id
    })
    
  } catch (error) {
    logger.error('Webhook test error:', error)
    res.status(500).json({ error: 'Test failed' })
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
 * Fortnox OAuth: start authorization
 * GET /api/fortnox/oauth/start
 */
router.get('/fortnox/oauth/start', async (req, res) => {
  try {
    const clientId = process.env.FORTNOX_CLIENT_ID || ''
    // Legacy integrations callback (must match Fortnox registration)
    const redirectUri = process.env.FORTNOX_REDIRECT_URI || `${process.env.BACKEND_URL || ''}/api/integrations/fortnox/callback`
    const rawScopes = (process.env.FORTNOX_SCOPES || 'companyinformation customer article order invoice')
      .replace(/\bcustomers\b/g, 'customer')
      .replace(/\barticles\b/g, 'article')
      .replace(/\borders\b/g, 'order')
      .replace(/\binvoices\b/g, 'invoice')
    const scopes = rawScopes.split(/[\,\s]+/).filter(Boolean).join('%20')
    const state = crypto.randomBytes(16).toString('hex')

    // Set a short-lived cookie to (optionally) validate returned state
    try {
      res.cookie('fortnox_oauth_state', state, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        maxAge: 10 * 60 * 1000,
        path: '/'
      })
    } catch {}

    if (!clientId) {
      return res.status(500).send('FORTNOX_CLIENT_ID is not set')
    }

    const url = `https://apps.fortnox.se/oauth-v1/auth?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scopes}&response_type=code&access_type=offline&state=${encodeURIComponent(state)}`
    return res.redirect(url)
  } catch (error: any) {
    logger.error('Fortnox OAuth start error:', error.message)
    return res.status(500).send('Failed to start Fortnox OAuth flow')
  }
})

/**
 * Fortnox OAuth: callback to exchange code for tokens
 * GET /api/fortnox/oauth/callback?code=...
 */
router.get('/fortnox/oauth/callback', async (req, res) => {
  try {
    const code = req.query.code as string | undefined
    if (!code) {
      return res.status(400).send('Missing code')
    }

    const clientId = process.env.FORTNOX_CLIENT_ID || ''
    const clientSecret = process.env.FORTNOX_CLIENT_SECRET || ''
    // Must exactly match the redirect used in the authorization request
    const redirectUri = process.env.FORTNOX_REDIRECT_URI || `${process.env.BACKEND_URL || ''}/api/integrations/fortnox/callback`

    if (!clientId || !clientSecret) {
      return res.status(500).send('Missing Fortnox OAuth credentials')
    }

    // Exchange code for tokens
    const tokenUrl = 'https://apps.fortnox.se/oauth-v1/token'
    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri
    })

    const tokenResp = await axios.post(tokenUrl, body, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      auth: { username: clientId, password: clientSecret }
    })

    const accessToken = tokenResp.data?.access_token
    const refreshToken = tokenResp.data?.refresh_token

    if (!accessToken || !refreshToken) {
      logger.error('Fortnox OAuth callback: missing tokens', tokenResp.data)
      return res.status(500).send('Fortnox did not return tokens')
    }

    // Try to update Railway variables
    const railwayToken = process.env.RAILWAY_API_TOKEN
    const projectId = process.env.RAILWAY_PROJECT_ID
    const serviceId = process.env.RAILWAY_SERVICE_ID
    const environmentId = process.env.RAILWAY_ENVIRONMENT_ID

    const upsertVar = async (name: string, value: string) => {
      if (!railwayToken || !projectId || !serviceId || !environmentId) return false
      const resp = await axios.post(
        'https://backboard.railway.app/graphql',
        {
          query: `mutation VariableUpsert($input: VariableUpsertInput!){ variableUpsert(input:$input){ id } }`,
          variables: { input: { projectId, environmentId, serviceId, name, value } }
        },
        { headers: { Authorization: `Bearer ${railwayToken}`, 'Content-Type': 'application/json' } }
      )
      return !resp.data?.errors
    }

    const updates = [] as Array<{ name: string, ok: boolean }>
    updates.push({ name: 'FORTNOX_REFRESH_TOKEN', ok: await upsertVar('FORTNOX_REFRESH_TOKEN', refreshToken) })
    updates.push({ name: 'FORTNOX_API_TOKEN', ok: await upsertVar('FORTNOX_API_TOKEN', accessToken) })
    updates.push({ name: 'FORTNOX_USE_OAUTH', ok: await upsertVar('FORTNOX_USE_OAUTH', 'true') })

    // Apply tokens in-memory immediately to avoid restarts
    try {
      const { fortnoxService } = await import('../services/fortnoxService')
      ;(fortnoxService as any).inMemoryAccessToken = accessToken
      ;(fortnoxService as any).inMemoryRefreshToken = refreshToken
      logger.info('Fortnox OAuth tokens applied in-memory for immediate use')
    } catch {}

    logger.info('Fortnox OAuth tokens received and variable update attempts done', { updates })

    // Show a simple success page
    return res.status(200).send(`
      <html>
        <body style="font-family: Inter, Arial; max-width: 640px; margin: 40px auto;">
          <h2>Fortnox inloggning slutförd ✅</h2>
          <p>Access token och refresh token är mottagna.</p>
          <ul>
            <li>FORTNOX_USE_OAUTH = true</li>
            <li>FORTNOX_API_TOKEN uppdaterad: ${updates[1].ok ? '✅' : '⚠️ (krävde manuell)'} </li>
            <li>FORTNOX_REFRESH_TOKEN uppdaterad: ${updates[0].ok ? '✅' : '⚠️ (krävde manuell)'} </li>
          </ul>
          ${!updates[0].ok || !updates[1].ok ? `<p><strong>VIKTIGT:</strong> Kopiera dessa och uppdatera i Railway:<br/>Access token: ${accessToken}<br/>Refresh token: ${refreshToken}</p>` : ''}
          <p>Du kan nu stänga detta fönster.</p>
        </body>
      </html>
    `)
  } catch (error: any) {
    logger.error('Fortnox OAuth callback error:', { message: error.message, data: error.response?.data })
    return res.status(500).send('Failed to complete Fortnox OAuth flow')
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
    const tokenInfo = fortnoxService.getAccessTokenExpiryInfo()
    return res.json({
      success: true,
      environment: envOk,
      token: tokenInfo,
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

// Force refresh token (debug)
router.post('/debug-fortnox/refresh', async (req, res) => {
  try {
    const result = await fortnoxService.debugRefreshAccessToken()
    return res.json({ success: true, result })
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message })
  }
})

// Persist current in-memory Fortnox tokens to Railway env vars (admin/debug)
router.post('/debug-fortnox/persist-env', async (req, res) => {
  try {
    // Access current tokens from service (in-memory)
    const accessToken = (fortnoxService as any).inMemoryAccessToken
    const refreshToken = (fortnoxService as any).inMemoryRefreshToken

    if (!accessToken || !refreshToken) {
      return res.status(400).json({ success: false, error: 'No tokens in memory to persist' })
    }

    const railwayToken = process.env.RAILWAY_API_TOKEN
    const projectId = process.env.RAILWAY_PROJECT_ID
    const serviceId = process.env.RAILWAY_SERVICE_ID
    const environmentId = process.env.RAILWAY_ENVIRONMENT_ID

    if (!railwayToken || !projectId || !serviceId || !environmentId) {
      return res.status(400).json({ success: false, error: 'Railway credentials missing' })
    }

    const axios = (await import('axios')).default
    const upsert = async (name: string, value: string) => axios.post(
      'https://backboard.railway.app/graphql',
      {
        query: `mutation VariableUpsert($input: VariableUpsertInput!){ variableUpsert(input:$input){ id } }`,
        variables: { input: { projectId, environmentId, serviceId, name, value } }
      },
      { headers: { Authorization: `Bearer ${railwayToken}` } }
    )

    const r1 = await upsert('FORTNOX_API_TOKEN', accessToken)
    const r2 = await upsert('FORTNOX_REFRESH_TOKEN', refreshToken)
    const r3 = await upsert('FORTNOX_USE_OAUTH', 'true')

    return res.json({ success: true, persisted: {
      FORTNOX_API_TOKEN: !r1.data?.errors,
      FORTNOX_REFRESH_TOKEN: !r2.data?.errors,
      FORTNOX_USE_OAUTH: !r3.data?.errors
    } })
  } catch (error: any) {
    logger.error('Persist tokens to Railway failed', { error: error.message })
    return res.status(500).json({ success: false, error: error.message })
  }
})

// Ultra-debug webhook endpoint to capture all possible data formats
router.all('/viva-debug', async (req, res) => {
  const timestamp = new Date().toISOString()
  console.log(`\n=== VIVA DEBUG WEBHOOK ${timestamp} ===`)
  console.log('Method:', req.method)
  console.log('URL:', req.url)
  console.log('Original URL:', req.originalUrl)
  console.log('Query:', JSON.stringify(req.query, null, 2))
  console.log('Headers:', JSON.stringify(req.headers, null, 2))
  console.log('Body type:', typeof req.body)
  console.log('Body length:', req.body?.length || 0)
  console.log('Body toString:', req.body?.toString())
  console.log('Raw body:', req.body)
  console.log('=== END VIVA DEBUG ===\n')
  
  // Handle Viva verification (GET requests)
  if (req.method === 'GET') {
    const verificationCode = extractVerificationCode(req.query) || extractVerificationCodeFromHeaders(req.headers as any)
    if (verificationCode) {
      res.setHeader('Content-Type', 'text/plain; charset=utf-8')
      return res.status(200).send(verificationCode)
    }
    
    // Try to return JSON Key per Viva docs
    const key = await fetchVivaVerificationKey()
    if (key) {
      res.setHeader('Content-Type', 'application/json; charset=utf-8')
      return res.status(200).json(key)
    }
  }
  
  // Always respond OK for POST/other methods
  res.status(200).send('DEBUG_OK')
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
    if (!orderCode && !orderId) {
      return res.status(400).json({ success: false, error: 'Order code or orderId is required' })
    }

    // First, verify payment with Viva if orderCode provided
    const vivaService = new VivaWalletService()
    let payment = null as any
    if (orderCode) {
      payment = await vivaService.verifyPayment(parseInt(orderCode))
    }
    
    if (orderCode && !payment) {
      logger.warn('No payment found for order code', { orderCode })
      // Try to find our order by stored Viva order code to return orderNumber for frontend display
      const existing = await prisma.order.findFirst({
        where: { OR: [ { paymentOrderCode: orderCode }, { paymentReference: orderCode } ] },
        select: { id: true, orderNumber: true }
      })
      return res.json({
        success: false,
        status: 'PENDING',
        orderId: existing?.id,
        orderNumber: existing?.orderNumber,
        message: 'Payment not found yet'
      })
    }

    // Check if payment was successful (statusId 'F' means successful)
    if (payment && payment.statusId !== 'F') {
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