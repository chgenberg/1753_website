import axios from 'axios'
import { logger } from '../utils/logger'

interface VivaWalletConfig {
  merchantId: string
  apiKey: string
  sourceCode: string
  baseUrl: string
}

interface CreateOrderRequest {
  amount: number
  currency: string
  customerTrns: string
  customer: {
    email: string
    fullName: string
    phone?: string
  }
  paymentTimeout?: number
  preauth?: boolean
  allowRecurring?: boolean
}

interface CreateOrderResponse {
  orderCode: number
  errorCode: number
  errorText: string
  timeStamp: string
  correlationId: string
}

interface PaymentResponse {
  email: string
  amount: number
  orderCode: number
  statusId: string
  fullName: string
  insDate: string
  cardNumber: string
  currencyCode: string
  customerTrns: string
  merchantTrns: string
  transactionTypeId: number
}

export class VivaWalletService {
  private config: VivaWalletConfig
  private accessToken: string | null = null
  private tokenExpiry: number = 0
  private subscriptionSourceCode: string = process.env.VIVA_SOURCE_CODE_SUBSCRIPTION || ''

  constructor() {
    this.config = {
      merchantId: process.env.VIVA_MERCHANT_ID || '',
      apiKey: process.env.VIVA_API_KEY || '',
      sourceCode: process.env.VIVA_SOURCE_CODE || '',
      baseUrl: process.env.VIVA_BASE_URL || 'https://api.vivapayments.com'
    }

    if (!this.config.merchantId || !this.config.apiKey || !this.config.sourceCode) {
      logger.warn('Viva Wallet credentials not configured')
    }
  }

  /**
   * Get OAuth access token for Checkout API
   */
  private async getAccessToken(): Promise<string> {
    const clientId = process.env.VIVA_CLIENT_ID
    const clientSecret = process.env.VIVA_CLIENT_SECRET

    if (!clientId || !clientSecret) {
      throw new Error('Viva Wallet OAuth credentials not configured')
    }

    // Check if we have a valid token
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken
    }

    try {
      const response = await axios.post(
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

      this.accessToken = response.data.access_token
      // Set expiry to 5 minutes before actual expiry for safety
      this.tokenExpiry = Date.now() + (response.data.expires_in - 300) * 1000

      logger.info('Viva Wallet OAuth token obtained successfully')
      return this.accessToken

    } catch (error: any) {
      logger.error('Failed to get Viva Wallet OAuth token:', error.response?.data || error.message)
      throw new Error(`Failed to get OAuth token: ${error.message}`)
    }
  }

  /**
   * Create a payment order for subscription
   */
  async createSubscriptionOrder(params: {
    amount: number
    currency: string
    customerEmail: string
    customerName: string
    customerPhone?: string
    description: string
    allowRecurring?: boolean
  }): Promise<CreateOrderResponse> {
    try {
      const sourceCodeByCurrency: Record<string, string> = {
        SEK: process.env.VIVA_SOURCE_CODE_SEK || '',
        EUR: process.env.VIVA_SOURCE_CODE_EUR || ''
      }

      const resolvedSourceCode = sourceCodeByCurrency[params.currency] || this.subscriptionSourceCode || this.config.sourceCode

      const orderData = {
        amount: Math.round(params.amount * 100),
        customerTrns: params.description,
        customer: {
          email: params.customerEmail,
          fullName: params.customerName,
          phone: params.customerPhone,
          countryCode: 'SE',
          requestLang: (
            {
              SEK: 'sv-SE',
              EUR: 'en-GB'
            } as Record<string, string>
          )[params.currency] || 'en-GB'
        },
        paymentTimeout: 300,
        preauth: false,
        allowRecurring: params.allowRecurring ?? true,
        maxInstallments: 1,
        paymentNotification: false,
        disableExactAmount: false,
        disableCash: true,
        disableWallet: false,
        enableSwish: true,
        successUrl: `${process.env.FRONTEND_URL || 'https://1753website-production.up.railway.app'}/checkout/success`,
        cancelUrl: `${process.env.FRONTEND_URL || 'https://1753website-production.up.railway.app'}/checkout`,
        failureUrl: `${process.env.FRONTEND_URL || 'https://1753website-production.up.railway.app'}/checkout?error=payment_failed`,
        sourceCode: resolvedSourceCode,
        merchantTrns: `Order-${Date.now()}`
      }

      const accessToken = await this.getAccessToken()

      const response = await axios.post(
        `${this.config.baseUrl}/checkout/v2/orders`,
        orderData,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      )

      logger.info('Viva Wallet order created', { 
        orderCode: response.data.orderCode,
        amount: params.amount,
        currency: params.currency 
      })

      return response.data
    } catch (error: any) {
      logger.error('Failed to create Viva Wallet order', { 
        error: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          auth: error.config?.auth ? 'CONFIGURED' : 'NOT CONFIGURED'
        }
      })
      throw new Error(`Failed to create payment order: ${error.message}`)
    }
  }

  /**
   * Process card payment using token
   */
  async processCardPayment(params: {
    orderCode: string
    cardToken: string
  }): Promise<{
    success: boolean
    transactionId?: string
    error?: string
  }> {
    try {
      const response = await axios.post(
        `${this.config.baseUrl}/nativecheckout/v2/transactions`,
        {
          orderCode: params.orderCode,
          token: params.cardToken
        },
        {
          auth: {
            username: this.config.merchantId,
            password: this.config.apiKey
          },
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )

      if (response.data.statusId === 'F') {
        logger.info('Card payment successful', {
          orderCode: params.orderCode,
          transactionId: response.data.transactionId
        })

        return {
          success: true,
          transactionId: response.data.transactionId
        }
      } else {
        logger.error('Card payment failed', {
          orderCode: params.orderCode,
          statusId: response.data.statusId,
          eventId: response.data.eventId
        })

        return {
          success: false,
          error: response.data.message || 'Payment failed'
        }
      }
    } catch (error: any) {
      logger.error('Error processing card payment', {
        error: error.message,
        response: error.response?.data
      })

      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Payment processing failed'
      }
    }
  }

  /**
   * Get payment URL for checkout
   */
  getPaymentUrl(orderCode: number): string {
    return `https://www.vivapayments.com/web/checkout?ref=${orderCode}&s=${this.config.sourceCode}`
  }

  getPaymentUrlForSource(orderCode: number, sourceCode: string): string {
    return `https://www.vivapayments.com/web/checkout?ref=${orderCode}&s=${sourceCode}`
  }

  /**
   * Verify payment notification
   */
  async verifyPayment(orderCode: number): Promise<PaymentResponse | null> {
    try {
      const response = await axios.get(
        `${this.config.baseUrl}/api/transactions`,
        {
          params: {
            ordercode: orderCode
          },
          auth: {
            username: this.config.merchantId,
            password: this.config.apiKey
          },
          // Treat 404 as "not found yet" instead of throwing
          validateStatus: (status) => status === 200 || status === 404
        }
      )

      if (response.status === 404) {
        return null
      }

      if (response.data && response.data.length > 0) {
        const payment = response.data[0]
        logger.info('Payment verified', { 
          orderCode,
          statusId: payment.statusId,
          amount: payment.amount 
        })
        return payment
      }

      return null
    } catch (error: any) {
      logger.error('Failed to verify payment', { 
        error: error.message,
        orderCode 
      })
      // Fall back to null on transient errors to avoid failing the confirmation page
      return null
    }
  }

  /**
   * Create recurring payment for subscription renewal
   */
  async createRecurringPayment(params: {
    originalOrderCode: number
    amount: number
    currency: string
    description: string
  }): Promise<CreateOrderResponse> {
    try {
      const orderData = {
        amount: Math.round(params.amount * 100), // Convert to cents
        currency: params.currency,
        customerTrns: params.description,
        paymentTimeout: 300,
        allowRecurring: true,
        sourceCode: this.subscriptionSourceCode || this.config.sourceCode,
      }

      const accessToken = await this.getAccessToken()

      const response = await axios.post(
        `${this.config.baseUrl}/checkout/v2/orders`,
        orderData,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      )

      return response.data
    } catch (error: any) {
      logger.error('Failed to create recurring Viva Wallet order', { error: error.message, data: error.response?.data })
      throw new Error(`Failed to create recurring payment: ${error.message}`)
    }
  }

  /**
   * Cancel a recurring payment
   */
  async cancelRecurringPayment(orderCode: number): Promise<boolean> {
    try {
      await axios.delete(
        `${this.config.baseUrl}/api/orders/recurring/${orderCode}`,
        {
          auth: {
            username: this.config.merchantId,
            password: this.config.apiKey
          }
        }
      )

      logger.info('Recurring payment cancelled', { orderCode })
      return true
    } catch (error: any) {
      logger.error('Failed to cancel recurring payment', { 
        error: error.message,
        orderCode 
      })
      return false
    }
  }

  /**
   * Refund a payment
   */
  async refundPayment(transactionId: string, amount?: number): Promise<boolean> {
    try {
      const refundData: any = {
        transactionId
      }

      if (amount) {
        refundData.amount = Math.round(amount * 100) // Convert to cents
      }

      await axios.post(
        `${this.config.baseUrl}/api/transactions/refund`,
        refundData,
        {
          auth: {
            username: this.config.merchantId,
            password: this.config.apiKey
          },
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )

      logger.info('Payment refunded', { transactionId, amount })
      return true
    } catch (error: any) {
      logger.error('Failed to refund payment', { 
        error: error.message,
        transactionId 
      })
      return false
    }
  }

  /**
   * Test API connection
   */
  async testConnection(): Promise<boolean> {
    try {
      // Test with a simple request to verify credentials
      const response = await axios.get(
        `${this.config.baseUrl}/api/orders/0`, // This will return 404 but validate auth
        { 
          auth: {
            username: this.config.merchantId,
            password: this.config.apiKey
          },
          validateStatus: (status) => status === 404 || status === 200 // 404 is expected for non-existent order
        }
      )

      logger.info('Viva Wallet connection test successful')
      return true
    } catch (error: any) {
      if (error.response?.status === 401) {
        logger.error('Viva Wallet authentication failed - check API key')
        return false
      }
      if (error.response?.status === 404) {
        // 404 is expected when testing with order ID 0
        logger.info('Viva Wallet connection test successful (404 expected)')
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
        `${this.config.baseUrl}/api/merchants/${this.config.merchantId}`,
        {
          auth: {
            username: this.config.merchantId,
            password: this.config.apiKey
          }
        }
      )

      return response.data
    } catch (error: any) {
      logger.error('Failed to get merchant info:', error.response?.data || error.message)
      throw error
    }
  }

  /**
   * Create payment order (legacy method for compatibility)
   */
  async createPaymentOrder(orderData: any): Promise<CreateOrderResponse> {
    try {
      const sourceCodeByCurrency: Record<string, string> = {
        SEK: process.env.VIVA_SOURCE_CODE_SEK || '',
        EUR: process.env.VIVA_SOURCE_CODE_EUR || ''
      }

      const currency = orderData.currency || 'SEK'
      const resolvedSourceCode = sourceCodeByCurrency[currency] || this.config.sourceCode

      const vivaOrderData = {
        amount: Math.round(orderData.amount * 100), // Convert to cents for Viva API
        customerTrns: orderData.customerTrns,
        customer: {
          email: orderData.customer.email,
          fullName: orderData.customer.fullName,
          phone: orderData.customer.phone,
          countryCode: orderData.customer.countryCode || 'SE',
          requestLang: orderData.customer.requestLang || 'sv-SE'
        },
        paymentTimeout: orderData.paymentTimeout || 1800,
        preauth: orderData.preauth || false,
        allowRecurring: orderData.allowRecurring || false,
        maxInstallments: orderData.maxInstallments || 1,
        paymentNotification: false,
        disableExactAmount: orderData.disableExactAmount || false,
        disableCash: orderData.disableCash || false,
        disableWallet: orderData.disableWallet || false,
        enableSwish: orderData.enableSwish || true, // Enable Swish by default
        successUrl: `${process.env.FRONTEND_URL || 'https://1753website-production.up.railway.app'}/checkout/success`,
        cancelUrl: `${process.env.FRONTEND_URL || 'https://1753website-production.up.railway.app'}/checkout`,
        failureUrl: `${process.env.FRONTEND_URL || 'https://1753website-production.up.railway.app'}/checkout?error=payment_failed`,
        sourceCode: resolvedSourceCode,
        merchantTrns: orderData.merchantTrns || `Order-${Date.now()}`
      }

      const accessToken = await this.getAccessToken()

      const response = await axios.post(
        `${this.config.baseUrl}/checkout/v2/orders`,
        vivaOrderData,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      )

             logger.info('Viva Wallet order created', { 
         orderCode: response.data.orderCode,
         fullResponse: response.data,
         amount: orderData.amount,
         currency,
         enableSwish: vivaOrderData.enableSwish,
         sourceCode: resolvedSourceCode,
         requestData: {
           amount: vivaOrderData.amount,
           enableSwish: vivaOrderData.enableSwish,
           disableCash: vivaOrderData.disableCash,
           disableWallet: vivaOrderData.disableWallet
         }
       })

             return {
         orderCode: response.data.orderCode,
         errorCode: 0,
         errorText: '',
         timeStamp: new Date().toISOString(),
         correlationId: ''
       }

    } catch (error: any) {
      logger.error('Failed to create Viva Wallet order', { 
        error: error.response?.data || error.message,
      amount: orderData.amount,
        currency: orderData.currency
      })
      throw new Error(`Failed to create payment order: ${error.response?.data?.message || error.message}`)
    }
  }

  /**
   * Create Smart Checkout URL (legacy method)
   */
  createSmartCheckoutUrl(orderCode: number): string {
    return this.getPaymentUrl(orderCode)
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(payload: string, signature: string): boolean {
    try {
      const crypto = require('crypto')
      const expectedSignature = crypto
        .createHmac('sha256', this.config.apiKey)
        .update(payload)
        .digest('hex')
      
      return signature === expectedSignature
    } catch (error) {
      logger.error('Failed to verify webhook signature:', error)
      return false
    }
  }

  /**
   * Process webhook payload
   */
  processWebhook(payload: any): any {
    return {
      orderId: payload.OrderCode?.toString() || '',
      status: this.mapVivaStatus(payload.StateId),
      amount: payload.Amount || 0,
      transactionId: payload.TransactionId
    }
  }

  /**
   * Map Viva status to internal status
   */
  private mapVivaStatus(stateId: number): string {
    switch (stateId) {
      case 0: return 'pending'
      case 1: return 'completed'
      case 2: return 'cancelled'
      case 3: return 'failed'
      case 4: return 'failed'
      case 5: return 'refunded'
      default: return 'pending'
    }
  }
}

export const vivaWalletService = new VivaWalletService() 