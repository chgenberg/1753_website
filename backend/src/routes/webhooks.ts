import { Router } from 'express'
import axios from 'axios'
import { vivaWalletService } from '../services/vivaWalletService'
import { sendEmail } from '../services/emailService'
import { logger } from '../utils/logger'
import prisma from '../lib/prisma'
import { fortnoxService } from '../services/fortnoxService'
import { sybkaService } from '../services/sybkaService'

const router = Router()

/**
 * Viva Wallet webhook endpoint
 * Called when payment status changes
 */
router.post('/viva-wallet', async (req, res) => {
  try {
    const payload = req.body
    logger.info('Received Viva Wallet webhook', { payload })

    // Verify webhook signature if configured
    const signature = req.headers['x-viva-signature'] as string
    if (signature && process.env.VIVA_WALLET_WEBHOOK_SECRET) {
      const isValid = vivaWalletService.verifyWebhookSignature(
        JSON.stringify(payload),
        signature
      )
      
      if (!isValid) {
        logger.warn('Invalid Viva Wallet webhook signature')
        return res.status(401).json({ error: 'Invalid signature' })
      }
    }

    // Process the webhook
    const webhookData = vivaWalletService.processWebhook(payload)
    
    if (!webhookData.orderId) {
      logger.warn('No order ID in webhook payload')
      return res.status(400).json({ error: 'No order ID' })
    }

    // Find the order by payment reference (Viva orderCode)
    const order = await prisma.order.findFirst({
      where: { 
        paymentReference: webhookData.orderId 
      },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    })

    if (!order) {
      logger.warn('Order not found for webhook', { orderId: webhookData.orderId })
      return res.status(404).json({ error: 'Order not found' })
    }

    // Update order status based on payment status
    let orderStatus = 'PENDING'
    let paymentStatus = 'PENDING'

    switch (webhookData.status) {
      case 'completed':
        orderStatus = 'PROCESSING'
        paymentStatus = 'PAID'
        break
      case 'cancelled':
        orderStatus = 'CANCELLED'
        paymentStatus = 'CANCELLED'
        break
      case 'failed':
        orderStatus = 'CANCELLED'
        paymentStatus = 'FAILED'
        break
      case 'refunded':
        orderStatus = 'REFUNDED'
        paymentStatus = 'REFUNDED'
        break
    }

    // Update order in database
    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: orderStatus as any,
        paymentStatus: paymentStatus as any,
        transactionId: webhookData.transactionId
      }
    })

    // Send order confirmation email if payment was successful
    if (paymentStatus === 'PAID') {
      try {
        await sendEmail({
          to: order.email,
          subject: `Orderbekräftelse #${order.orderNumber}`,
          template: 'orderConfirmation',
          data: {
            firstName: order.customerName?.split(' ')[0] || 'Kund',
            orderNumber: order.orderNumber,
            orderDate: new Date().toLocaleDateString('sv-SE'),
            items: order.items.map(item => ({
              name: item.product.name,
              quantity: item.quantity,
              total: item.price * item.quantity
            })),
            total: order.totalAmount,
            currency: 'kr',
            shippingAddress: order.shippingAddress as any
          }
        })
        
        logger.info('Order confirmation email sent via webhook', {
          orderId: order.id,
          email: order.email
        })
      } catch (emailError) {
        logger.error('Failed to send order confirmation email via webhook:', emailError)
      }

      // Fortnox + Sybka+ integrations (idempotent best-effort)
      try {
        const alreadyIntegrated = (order.internalNotes || '').includes('Fortnox:') || (order.internalNotes || '').includes('Sybka:')
        if (!alreadyIntegrated) {
          const shipping = order.shippingAddress as any

          // Build items list
          const items = order.items.map(item => ({
            productId: item.productId,
            name: item.product?.name || item.title || 'Produkt',
            price: item.price,
            quantity: item.quantity,
            sku: item.sku || item.product?.sku || undefined
          }))

          // 1) Create order in Fortnox
          let fortnoxOrderNumber: string | undefined
          try {
            fortnoxOrderNumber = (await fortnoxService.processOrder({
              customer: {
                email: order.email,
                firstName: shipping?.firstName || (order.customerName?.split(' ')[0] || ''),
                lastName: shipping?.lastName || (order.customerName?.split(' ').slice(1).join(' ') || ''),
                phone: order.customerPhone || order.phone || undefined,
                address: shipping?.address || shipping?.address1 || '',
                apartment: shipping?.apartment || shipping?.address2 || undefined,
                city: shipping?.city || '',
                postalCode: shipping?.postalCode || shipping?.zip || '',
                country: shipping?.country || 'SE'
              },
              items,
              orderId: order.orderNumber,
              total: order.totalAmount,
              shipping: order.shippingAmount || 0,
              orderDate: order.createdAt
            })).orderNumber
          } catch (err: any) {
            logger.error('Fortnox processing failed:', err?.message || err)
          }

          // 2) Send order to Sybka+ (which handles Ongoing)
          let sybkaOrderId: string | undefined
          try {
            const street = [shipping?.address || shipping?.address1, shipping?.apartment || shipping?.address2].filter(Boolean).join(', ')
            const sybkaResp = await sybkaService.createOrder({
              shop_order_id: order.orderNumber,
              currency: order.currency || 'SEK',
              grand_total: order.totalAmount,
              shipping_firstname: shipping?.firstName || (order.customerName?.split(' ')[0] || ''),
              shipping_lastname: shipping?.lastName || (order.customerName?.split(' ').slice(1).join(' ') || ''),
              shipping_street: street,
              shipping_postcode: shipping?.postalCode || shipping?.zip || '',
              shipping_city: shipping?.city || '',
              shipping_country: shipping?.country || 'SE',
              shipping_email: order.email,
              order_rows: items.map(i => ({
                sku: i.sku || i.productId,
                name: i.name,
                qty_ordered: i.quantity,
                price: i.price
              })),
              payment_gateway: 'vivawallet',
              transaction_id: webhookData.transactionId || ''
            })
            if (sybkaResp.success) {
              sybkaOrderId = sybkaResp.order_id
            } else {
              logger.error('Sybka+ order creation failed:', sybkaResp.error)
            }
          } catch (err: any) {
            logger.error('Sybka+ processing failed:', err?.message || err)
          }

          // Persist external refs in internalNotes
          const noteParts: string[] = []
          if (fortnoxOrderNumber) noteParts.push(`Fortnox: ${fortnoxOrderNumber}`)
          if (sybkaOrderId) noteParts.push(`Sybka: ${sybkaOrderId}`)
          if (noteParts.length > 0) {
            const nextNotes = `${order.internalNotes ? order.internalNotes + ' | ' : ''}${noteParts.join(' | ')}`
            await prisma.order.update({
              where: { id: order.id },
              data: { internalNotes: nextNotes }
            })
          }
        } else {
          logger.info('Skipping Fortnox/Sybka integration as notes suggest it already ran', { orderId: order.id })
        }
      } catch (integrationErr: any) {
        logger.error('Post-payment integration block failed:', integrationErr?.message || integrationErr)
      }
    }

    logger.info('Webhook processed successfully', {
      orderId: order.id,
      status: webhookData.status,
      paymentStatus
    })

    res.json({ success: true })
  } catch (error) {
    logger.error('Error processing Viva Wallet webhook:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

/**
 * Validation endpoints used by Viva Wallet UI when adding the webhook
 */
router.head('/viva-wallet', (_req, res) => {
  res.status(200).send('OK')
})

router.options('/viva-wallet', (_req, res) => {
  res.setHeader('Allow', 'GET,POST,HEAD,OPTIONS')
  res.status(200).send('OK')
})

router.get('/viva-wallet', async (_req, res) => {
  try {
    // Viva requires us to echo back the verification Key received from their API
    const merchantId = process.env.VIVA_MERCHANT_ID
    const apiKey = process.env.VIVA_API_KEY
    const baseUrl = process.env.VIVA_BASE_URL?.includes('demo')
      ? 'https://demo.vivapayments.com'
      : 'https://www.vivapayments.com'

    if (!merchantId || !apiKey) {
      // Fallback to env-provided key if merchant creds are not configured
      const fallbackKey = process.env.VIVA_WALLET_WEBHOOK_SECRET || 'default-validation-key'
      return res.status(200).json({ Key: fallbackKey })
    }

    const credentials = Buffer.from(`${merchantId}:${apiKey}`).toString('base64')
    const resp = await axios.get(`${baseUrl}/api/messages/config/token`, {
      headers: {
        Authorization: `Basic ${credentials}`
      },
      timeout: 5000
    })

    const key = resp.data?.Key || process.env.VIVA_WALLET_WEBHOOK_SECRET || 'default-validation-key'
    res.status(200).json({ Key: key })
  } catch (err: any) {
    logger.error('Failed to fetch Viva verification key', { error: err.message })
    const fallbackKey = process.env.VIVA_WALLET_WEBHOOK_SECRET || 'default-validation-key'
    res.status(200).json({ Key: fallbackKey })
  }
})

export default router 