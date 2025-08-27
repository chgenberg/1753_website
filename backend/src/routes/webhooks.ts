import { Router } from 'express'
import { vivaWalletService } from '../services/vivaWalletService'
import { sendEmail } from '../services/emailService'
import { logger } from '../utils/logger'
import prisma from '../lib/prisma'

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

router.get('/viva-wallet', (_req, res) => {
  const validationKey = process.env.VIVA_WALLET_WEBHOOK_SECRET || 'default-validation-key'
  // Viva Selfcare often expects JSON: { Key: "<validationKey>" }
  res.status(200).json({ Key: validationKey })
})

export default router 