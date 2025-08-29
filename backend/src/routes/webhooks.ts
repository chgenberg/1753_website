import express from 'express'
import { logger } from '../utils/logger'
import { prisma } from '../lib/prisma'
import { sybkaService } from '../services/sybkaService'
import { fortnoxService } from '../services/fortnoxService'

const router = express.Router()

/**
 * Webhook för betalningsbekräftelser från Viva Wallet
 */
// GET-endpoint för webhook-verifiering
router.get('/payment/viva', (req, res) => {
  logger.info('Viva Wallet webhook verification request', {
    query: req.query,
    headers: req.headers
  })
  
  // Viva Wallet kan skicka en verifieringskod i query params
  const verificationCode = req.query.VivaWalletWebhookVerificationCode
  if (verificationCode) {
    // Svara med verifieringskoden för att bekräfta webhook
    res.status(200).send(verificationCode)
  } else {
    res.status(200).send('OK')
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

    if (!orderId || !status || !paymentStatus) {
      return res.status(400).json({ 
        error: 'Missing required fields: orderId, status, paymentStatus' 
      })
    }

    await handleOrderStatusChange(orderId, status, paymentStatus)
    
    res.status(200).json({ 
      success: true, 
      message: 'Status change processed',
      teamId: sybkaService.getStatusMapping().team_id
    })
  } catch (error) {
    logger.error('Test status change error:', error)
    res.status(500).json({ error: 'Test failed' })
  }
})

export default router 