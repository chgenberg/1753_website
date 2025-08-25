import { logger } from '../utils/logger'
import { vivaWalletService } from './vivaWalletService'
import { fortnoxService } from './fortnoxService'
import { ongoingService } from './ongoingService'
import { sybkaService } from './sybkaService'
import { dripService } from './dripService'

interface OrderData {
  // Customer information
  customer: {
    email: string
    firstName: string
    lastName: string
    phone?: string
    address: string
    apartment?: string
    city: string
    postalCode: string
    country: string
  }
  
  // Order items
  items: Array<{
    productId: string
    name: string
    price: number
    quantity: number
    sku?: string
    weight?: number
    variantId?: string
  }>
  
  // Order details
  orderId: string
  subtotal: number
  shipping: number
  tax: number
  total: number
  currency: string
  paymentMethod: 'card' | 'swish'
  
  // Additional data
  orderDate: Date
  newsletter?: boolean
  comments?: string
}

interface PaymentResult {
  success: boolean
  paymentId?: string
  orderCode?: number
  redirectUrl?: string
  error?: string
}

interface OrderProcessResult {
  success: boolean
  orderId: string
  paymentId?: string
  fortnoxOrderNumber?: string
  ongoingOrderNumber?: string
  errors: string[]
  warnings: string[]
}

class OrderService {
  
  /**
   * Create payment order in Viva Wallet
   */
  async createPayment(orderData: OrderData): Promise<PaymentResult> {
    try {
      logger.info(`Creating payment for order: ${orderData.orderId}`)
      
      const paymentOrder = {
        amount: Math.round(orderData.total * 100), // Convert to cents
        customerTrns: `Order ${orderData.orderId} - 1753 Skincare`,
        customer: {
          email: orderData.customer.email,
          fullName: `${orderData.customer.firstName} ${orderData.customer.lastName}`,
          phone: orderData.customer.phone,
          countryCode: this.mapCountryCode(orderData.customer.country),
          requestLang: 'sv-SE'
        },
        paymentTimeout: 1800, // 30 minutes
        merchantTrns: orderData.orderId,
        tags: ['1753skincare', 'ecommerce', orderData.paymentMethod],
        allowRecurring: false,
        maxInstallments: 1,
        disableExactAmount: false,
        disableCash: false,
        disableWallet: false
      }

      const result = await vivaWalletService.createPaymentOrder(paymentOrder)
      
      const redirectUrl = vivaWalletService.createSmartCheckoutUrl(result.orderCode)
      
      return {
        success: true,
        paymentId: result.orderCode.toString(),
        orderCode: result.orderCode,
        redirectUrl
      }

    } catch (error: any) {
      logger.error('Failed to create payment:', error)
      return {
        success: false,
        error: error.message || 'Payment creation failed'
      }
    }
  }

  /**
   * Process payment webhook from Viva Wallet
   */
  async processPaymentWebhook(payload: any, signature: string): Promise<OrderProcessResult> {
    const result: OrderProcessResult = {
      success: false,
      orderId: '',
      errors: [],
      warnings: []
    }

    try {
      // Verify webhook signature
      const payloadString = JSON.stringify(payload)
      if (!vivaWalletService.verifyWebhookSignature(payloadString, signature)) {
        result.errors.push('Invalid webhook signature')
        return result
      }

      // Process payment result
      const paymentResult = vivaWalletService.processWebhook(payload)
      result.orderId = paymentResult.orderId
      result.paymentId = paymentResult.transactionId

      if (paymentResult.status !== 'completed') {
        result.errors.push(`Payment not completed: ${paymentResult.status}`)
        return result
      }

      logger.info(`Payment completed for order: ${result.orderId}`)

      // Get order data from database/storage
      // This is a placeholder - you'll need to implement order storage
      const orderData = await this.getOrderData(result.orderId)
      if (!orderData) {
        result.errors.push('Order data not found')
        return result
      }

      // Process order in parallel: Fortnox first, then Sybka+ (which handles Ongoing)
      const [fortnoxResult, sybkaResult] = await Promise.allSettled([
        this.processFortnoxOrder(orderData),
        this.processSybkaOrder(orderData, paymentResult.transactionId)
      ])

      // Handle Fortnox result
      if (fortnoxResult.status === 'fulfilled') {
        result.fortnoxOrderNumber = fortnoxResult.value.orderNumber
        logger.info(`Fortnox order created: ${result.fortnoxOrderNumber}`)
      } else {
        result.warnings.push(`Fortnox integration failed: ${fortnoxResult.reason}`)
        logger.error('Fortnox processing failed:', fortnoxResult.reason)
      }

      // Handle Sybka+ result
      if (sybkaResult.status === 'fulfilled') {
        result.ongoingOrderNumber = sybkaResult.value.order_id
        logger.info(`Sybka+ order created: ${result.ongoingOrderNumber}`)
      } else {
        result.warnings.push(`Sybka+ integration failed: ${sybkaResult.reason}`)
        logger.error('Sybka+ processing failed:', sybkaResult.reason)
      }

      // Update order status in database
      await this.updateOrderStatus(result.orderId, {
        status: 'paid',
        paymentId: result.paymentId,
        fortnoxOrderNumber: result.fortnoxOrderNumber,
        ongoingOrderNumber: result.ongoingOrderNumber,
        processedAt: new Date()
      })

      // Send confirmation email and update Drip
      await this.sendOrderConfirmation(orderData, result)

      result.success = true
      logger.info(`Order processed successfully: ${result.orderId}`)

    } catch (error: any) {
      logger.error('Error processing payment webhook:', error)
      result.errors.push(error.message || 'Unknown error')
    }

    return result
  }

  /**
   * Process order in Fortnox
   */
  private async processFortnoxOrder(orderData: OrderData): Promise<{ customerNumber: string; orderNumber: string }> {
    return await fortnoxService.processOrder({
      customer: orderData.customer,
      items: orderData.items.map(item => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        sku: item.sku
      })),
      orderId: orderData.orderId,
      total: orderData.total,
      shipping: orderData.shipping,
      orderDate: orderData.orderDate
    })
  }

  /**
   * Process order in Sybka+ (which handles Ongoing fulfillment)
   */
  private async processSybkaOrder(orderData: OrderData, transactionId: string): Promise<{ order_id: string }> {
    const sybkaOrderData = {
      shop_order_id: orderData.orderId,
      currency: orderData.currency || 'SEK',
      grand_total: orderData.total,
      shipping_firstname: orderData.customer.firstName,
      shipping_lastname: orderData.customer.lastName,
      shipping_street: `${orderData.customer.address}${orderData.customer.apartment ? ', ' + orderData.customer.apartment : ''}`,
      shipping_postcode: orderData.customer.postalCode,
      shipping_city: orderData.customer.city,
      shipping_country: orderData.customer.country,
      shipping_email: orderData.customer.email,
      order_rows: orderData.items.map(item => ({
        sku: item.sku || item.productId,
        name: item.name,
        qty_ordered: item.quantity,
        price: item.price
      })),
      payment_gateway: 'vivawallet',
      transaction_id: transactionId
    }

    const result = await sybkaService.createOrder(sybkaOrderData)
    
    if (!result.success) {
      throw new Error(result.error || 'Sybka+ order creation failed')
    }

    return { order_id: result.order_id || '' }
  }

  /**
   * Process order in Ongoing WMS (legacy - now handled by Sybka+)
   */
  private async processOngoingOrder(orderData: OrderData): Promise<{ customerNumber: string; orderNumber: string }> {
    return await ongoingService.processOrder({
      customer: orderData.customer,
      items: orderData.items.map(item => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        sku: item.sku,
        weight: item.weight
      })),
      orderId: orderData.orderId,
      shipping: orderData.shipping,
      orderDate: orderData.orderDate,
      deliveryInstruction: orderData.comments
    })
  }

  /**
   * Send order confirmation emails and update Drip
   */
  private async sendOrderConfirmation(orderData: OrderData, result: OrderProcessResult): Promise<void> {
    try {
      // Update customer in Drip with purchase information
      if (orderData.customer.email) {
        await dripService.triggerWorkflow(
          orderData.customer.email,
          'order_confirmation', // This should be configured in Drip
          {
            order_id: orderData.orderId,
            order_total: orderData.total,
            order_items: orderData.items.map(item => item.name).join(', '),
            customer_name: `${orderData.customer.firstName} ${orderData.customer.lastName}`,
            fortnox_order: result.fortnoxOrderNumber,
            ongoing_order: result.ongoingOrderNumber
          }
        )

        // Add customer tags
        await dripService.addTagsToSubscriber(orderData.customer.email, [
          'Customer',
          'Purchase Completed',
          `Order-${orderData.orderId}`
        ])
      }

    } catch (error) {
      logger.error('Failed to send order confirmation:', error)
    }
  }

  /**
   * Map country names to country codes for Viva Wallet
   */
  private mapCountryCode(country: string): string {
    const countryMap: { [key: string]: string } = {
      'Sverige': 'SE',
      'Sweden': 'SE',
      'SE': 'SE',
      'Norge': 'NO',
      'Norway': 'NO',
      'NO': 'NO',
      'Danmark': 'DK',
      'Denmark': 'DK',
      'DK': 'DK',
      'Finland': 'FI',
      'FI': 'FI'
    }

    return countryMap[country] || 'SE'
  }

  /**
   * Get order data from storage (placeholder)
   * In a real implementation, this would fetch from your database
   */
  private async getOrderData(orderId: string): Promise<OrderData | null> {
    // Placeholder - implement your order storage/retrieval logic
    // This could be from Prisma, Redis, or any other storage
    logger.warn(`getOrderData not implemented for order: ${orderId}`)
    return null
  }

  /**
   * Update order status in storage (placeholder)
   */
  private async updateOrderStatus(orderId: string, updates: {
    status: string
    paymentId?: string
    fortnoxOrderNumber?: string
    ongoingOrderNumber?: string
    processedAt: Date
  }): Promise<void> {
    // Placeholder - implement your order status update logic
    logger.info(`Order status updated: ${orderId}`, updates)
  }

  /**
   * Check order status across all systems
   */
  async getOrderStatus(orderId: string): Promise<{
    orderId: string
    paymentStatus?: string
    fortnoxStatus?: string
    ongoingStatus?: string
    trackingNumber?: string
  }> {
    try {
      // Get order data from storage
      const orderData = await this.getOrderData(orderId)
      if (!orderData) {
        throw new Error('Order not found')
      }

      // Check status in all systems (in parallel)
      const results = await Promise.allSettled([
        // Add logic to check payment status if needed
        // Add logic to check Fortnox status if needed  
        ongoingService.getOrderStatus(orderId)
      ])

      const ongoingResult = results[0].status === 'fulfilled' ? results[0].value : null

      return {
        orderId,
        ongoingStatus: ongoingResult?.status,
        trackingNumber: ongoingResult?.trackingNumber
      }

    } catch (error: any) {
      logger.error('Failed to get order status:', error)
      throw error
    }
  }

  /**
   * Test all integrations
   */
  async testIntegrations(): Promise<{
    vivaWallet: boolean
    fortnox: boolean
    sybka: boolean
    ongoing: boolean
  }> {
    const [viva, fortnox, sybka, ongoing] = await Promise.allSettled([
      vivaWalletService.testConnection(),
      fortnoxService.testConnection(),
      sybkaService.testConnection(),
      ongoingService.testConnection()
    ])

    return {
      vivaWallet: viva.status === 'fulfilled' ? viva.value : false,
      fortnox: fortnox.status === 'fulfilled' ? fortnox.value : false,
      sybka: sybka.status === 'fulfilled' ? sybka.value : false,
      ongoing: ongoing.status === 'fulfilled' ? ongoing.value : false
    }
  }
}

export const orderService = new OrderService()
export default orderService 