import axios, { AxiosResponse } from 'axios'
import { logger } from '../utils/logger'

interface VivaWalletCredentials {
  merchantId: string
  apiKey: string
  sourceCode: string
  baseUrl: string
}

interface SmartCheckoutOrder {
  amount: number // Amount in cents
  customerTrns: string // Customer description
  customer: {
    email: string
    fullName: string
    phone?: string
    countryCode?: string
    requestLang?: string
  }
  paymentTimeout?: number
  merchantTrns?: string
  tags?: string[]
  allowRecurring?: boolean
  maxInstallments?: number
  disableExactAmount?: boolean
  disableCash?: boolean
  disableWallet?: boolean
}

interface SmartCheckoutResponse {
  orderCode: number
  qrCodeUrl?: string
  redirectUrl?: string
}

interface PaymentResult {
  orderId: string
  status: 'pending' | 'completed' | 'failed' | 'cancelled'
  amount: number
  transactionId?: string
  errorMessage?: string
}

class VivaWalletService {
  private credentials: VivaWalletCredentials

  constructor() {
    this.credentials = {
      merchantId: process.env.VIVA_MERCHANT_ID || '',
      apiKey: process.env.VIVA_API_KEY || '',
      sourceCode: process.env.VIVA_SOURCE_CODE || '1753_SKINCARE',
      baseUrl: process.env.VIVA_BASE_URL || 'https://api.vivapayments.com'
    }

    if (!this.credentials.merchantId || !this.credentials.apiKey) {
      logger.warn('Viva Wallet Smart Checkout credentials not configured')
    }
  }

  /**
   * Get authentication headers for Smart Checkout
   */
  private getHeaders() {
    return {
      'Authorization': `Basic ${Buffer.from(`:${this.credentials.apiKey}`).toString('base64')}`,
      'Content-Type': 'application/json'
    }
  }

  /**
   * Create Smart Checkout payment order
   */
  async createPaymentOrder(orderData: SmartCheckoutOrder): Promise<SmartCheckoutResponse> {
    try {
      const payload = {
        amount: orderData.amount,
        customerTrns: orderData.customerTrns,
        customer: {
          email: orderData.customer.email,
          fullName: orderData.customer.fullName,
          phone: orderData.customer.phone,
          countryCode: orderData.customer.countryCode || 'SE',
          requestLang: orderData.customer.requestLang || 'sv-SE'
        },
        paymentTimeout: orderData.paymentTimeout || 1800, // 30 minutes
        merchantTrns: orderData.merchantTrns,
        tags: orderData.tags || [],
        allowRecurring: orderData.allowRecurring || false,
        maxInstallments: orderData.maxInstallments || 1,
        disableExactAmount: orderData.disableExactAmount || false,
        disableCash: orderData.disableCash || false,
        disableWallet: orderData.disableWallet || false,
        sourceCode: this.credentials.sourceCode
      }

      logger.info('Creating Viva Wallet Smart Checkout order', { 
        amount: payload.amount,
        customerEmail: payload.customer.email 
      })

      const response: AxiosResponse<SmartCheckoutResponse> = await axios.post(
        `${this.credentials.baseUrl}/checkout/v2/orders`,
        payload,
        { headers: this.getHeaders() }
      )

      logger.info(`Viva Wallet Smart Checkout order created: ${response.data.orderCode}`)
      return response.data

    } catch (error: any) {
      logger.error('Failed to create Viva Wallet Smart Checkout order:', error.response?.data || error.message)
      throw new Error('Failed to create payment order')
    }
  }

  /**
   * Get payment status
   */
  async getPaymentStatus(orderCode: number): Promise<PaymentResult> {
    try {
      const response = await axios.get(
        `${this.credentials.baseUrl}/checkout/v2/orders/${orderCode}`,
        { headers: this.getHeaders() }
      )

      const order = response.data
      
      return {
        orderId: order.orderCode.toString(),
        status: this.mapVivaStatus(order.stateId),
        amount: order.requestAmount,
        transactionId: order.transactionId
      }

    } catch (error: any) {
      logger.error('Failed to get Viva Wallet payment status:', error.response?.data || error.message)
      return {
        orderId: orderCode.toString(),
        status: 'failed',
        amount: 0,
        errorMessage: 'Failed to check payment status'
      }
    }
  }

  /**
   * Cancel payment order
   */
  async cancelPaymentOrder(orderCode: number): Promise<boolean> {
    try {
      await axios.delete(
        `${this.credentials.baseUrl}/checkout/v2/orders/${orderCode}`,
        { headers: this.getHeaders() }
      )

      logger.info(`Viva Wallet payment order cancelled: ${orderCode}`)
      return true

    } catch (error: any) {
      logger.error('Failed to cancel Viva Wallet payment order:', error.response?.data || error.message)
      return false
    }
  }

  /**
   * Verify webhook signature for Smart Checkout
   */
  verifyWebhookSignature(payload: string, signature: string): boolean {
    try {
      // For Smart Checkout, signature verification is optional but recommended
      // The signature is sent in the Authorization header as "Basic [signature]"
      const crypto = require('crypto')
      const expectedSignature = crypto
        .createHmac('sha256', this.credentials.apiKey)
        .update(payload)
        .digest('hex')
      
      return signature === expectedSignature
    } catch (error) {
      logger.error('Failed to verify webhook signature:', error)
      return false
    }
  }

  /**
   * Process Smart Checkout webhook payload
   */
  processWebhook(payload: any): PaymentResult {
    return {
      orderId: payload.OrderCode?.toString() || '',
      status: this.mapVivaStatus(payload.StateId),
      amount: payload.Amount || 0,
      transactionId: payload.TransactionId
    }
  }

  /**
   * Map Viva Wallet status to our internal status
   */
  private mapVivaStatus(stateId: number): 'pending' | 'completed' | 'failed' | 'cancelled' {
    switch (stateId) {
      case 0: return 'pending'     // Pending
      case 1: return 'completed'   // Paid
      case 2: return 'cancelled'   // Cancelled
      case 3: return 'failed'      // Expired
      case 4: return 'failed'      // Error
      case 5: return 'failed'      // Refunded
      default: return 'pending'
    }
  }

  /**
   * Create payment URL for redirect
   */
  createPaymentUrl(orderCode: number): string {
    return `${this.credentials.baseUrl.replace('api.', 'www.')}/web/checkout?ref=${orderCode}`
  }

  /**
   * Create Smart Checkout redirect URL with source code
   */
  createSmartCheckoutUrl(orderCode: number): string {
    return `https://www.vivapayments.com/web/checkout?ref=${orderCode}&s=${this.credentials.sourceCode}`
  }

  /**
   * Test API connection
   */
  async testConnection(): Promise<boolean> {
    try {
      // Test with a simple GET request to verify credentials
      const response = await axios.get(
        `${this.credentials.baseUrl}/checkout/v2/orders/0`, // This will return 404 but validate auth
        { 
          headers: this.getHeaders(),
          validateStatus: (status) => status === 404 || status === 200 // 404 is expected for non-existent order
        }
      )

      logger.info('Viva Wallet Smart Checkout connection test successful')
      return true
    } catch (error: any) {
      if (error.response?.status === 401) {
        logger.error('Viva Wallet authentication failed - check API key')
        return false
      }
      if (error.response?.status === 404) {
        // 404 is expected when testing with order ID 0
        logger.info('Viva Wallet Smart Checkout connection test successful (404 expected)')
        return true
      }
      logger.error('Viva Wallet connection test failed:', error.response?.data || error.message)
      return false
    }
  }

  /**
   * Get merchant info (for validation)
   */
  async getMerchantInfo(): Promise<any> {
    try {
      const response = await axios.get(
        `${this.credentials.baseUrl}/api/merchants/${this.credentials.merchantId}`,
        { headers: this.getHeaders() }
      )

      return response.data
    } catch (error: any) {
      logger.error('Failed to get merchant info:', error.response?.data || error.message)
      throw error
    }
  }
}

export const vivaWalletService = new VivaWalletService()
export default vivaWalletService 