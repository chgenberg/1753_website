import axios, { AxiosResponse } from 'axios'
import { logger } from '../utils/logger'

interface FortnoxCredentials {
  apiToken: string
  clientSecret: string
  baseUrl: string
  clientId?: string
  refreshToken?: string
}

interface FortnoxCustomer {
  Name: string
  Email: string
  Phone1?: string
  Address1?: string
  Address2?: string
  ZipCode?: string
  City?: string
  CountryCode?: string
}

interface FortnoxArticle {
  ArticleNumber?: string
  Description: string
  PurchasePrice?: number
  SalesPrice: number
  Unit?: string
  VAT?: number
  AccountNumber?: number
  StockGoods?: boolean
}

interface FortnoxOrderRow {
  ArticleNumber?: string
  Description?: string
  Price?: number
  OrderedQuantity: number
  DeliveredQuantity: number
  VAT?: number
  Discount?: number
}

interface FortnoxOrder {
  CustomerNumber: string
  OrderDate: string
  OrderRows: FortnoxOrderRow[]
  YourReference?: string
  Currency?: string
  VATIncluded?: boolean
  // Delivery address fields are now top-level
  CustomerName: string
  Address1: string
  Address2?: string
  ZipCode: string
  City: string
  Country: string
}

interface FortnoxInvoice {
  CustomerNumber: string
  InvoiceDate: string
  DueDate: string
  InvoiceRows: FortnoxOrderRow[]
  Comments?: string
  YourReference?: string
  Currency?: string
  VATIncluded?: boolean
}

interface FortnoxResponse<T> {
  ErrorInformation?: {
    Error: number
    Message: string
    Code: string
  }
  [key: string]: T | any
}

class FortnoxService {
  private credentials: FortnoxCredentials
  private delayMs = 500 // 500ms delay between requests
  private inMemoryAccessToken: string
  private inMemoryRefreshToken?: string

  constructor() {
    this.credentials = {
      apiToken: process.env.FORTNOX_API_TOKEN || '',
      clientSecret: process.env.FORTNOX_CLIENT_SECRET || '',
      baseUrl: process.env.FORTNOX_BASE_URL || 'https://api.fortnox.se/3',
      clientId: process.env.FORTNOX_CLIENT_ID,
      refreshToken: process.env.FORTNOX_REFRESH_TOKEN
    }

    this.inMemoryAccessToken = this.credentials.apiToken
    this.inMemoryRefreshToken = this.credentials.refreshToken

    if (!this.credentials.apiToken) {
      logger.warn('Fortnox credentials not configured: missing FORTNOX_API_TOKEN')
    }
  }

  /**
   * Detect if apiToken is an OAuth JWT (Bearer) vs legacy Access-Token.
   */
  private isOAuthToken(): boolean {
    // Force legacy API for now since OAuth scopes are limited
    if (String(process.env.FORTNOX_USE_OAUTH || '').toLowerCase() === 'false') {
      return false
    }
    const token = (this.inMemoryAccessToken || this.credentials.apiToken || '').trim()
    if (!token) return false
    // Heuristics: JWT typically has two dots, often starts with eyJ
    return token.includes('.') && token.split('.').length >= 3 || token.startsWith('eyJ') || String(process.env.FORTNOX_USE_OAUTH || '').toLowerCase() === 'true'
  }

  /**
   * Get default headers for Fortnox API
   */
  private getHeaders() {
    if (this.isOAuthToken()) {
      // OAuth 2.0 Bearer token
      const token = this.inMemoryAccessToken || this.credentials.apiToken
      return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    }
    // Legacy API keys
    return {
      'Access-Token': this.credentials.apiToken,
      'Client-Secret': this.credentials.clientSecret,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  }

  /**
   * Rate limiting helper
   */
  private async rateLimitDelay() {
    await new Promise(resolve => setTimeout(resolve, this.delayMs))
  }

  /**
   * Refresh OAuth access token using refresh token.
   * This will also log the new refresh token so it can be updated in environment variables.
   */
  private async refreshAccessToken(): Promise<void> {
    if (!this.credentials.clientId || !this.credentials.clientSecret || !this.inMemoryRefreshToken) {
      logger.error('Fortnox token refresh failed: missing required credentials (clientId, clientSecret, or refreshToken).')
      throw new Error('Missing Fortnox OAuth credentials for refresh')
    }

    logger.info('Fortnox access token has expired. Attempting to refresh...')

    try {
      const tokenUrl = 'https://apps.fortnox.se/oauth-v1/token'
      const data = new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: this.inMemoryRefreshToken,
      })

      const response = await axios.post(tokenUrl, data, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        auth: {
          username: this.credentials.clientId,
          password: this.credentials.clientSecret,
        },
      })

      const newAccessToken = response.data.access_token
      const newRefreshToken = response.data.refresh_token

      if (!newAccessToken) {
        throw new Error('No access_token in Fortnox refresh response')
      }

      this.inMemoryAccessToken = newAccessToken
      logger.info('Fortnox access token refreshed successfully (in-memory).')

      if (newRefreshToken) {
        this.inMemoryRefreshToken = newRefreshToken
        logger.warn(
          'A new Fortnox refresh token was generated. You MUST update the FORTNOX_REFRESH_TOKEN environment variable to ensure continued operation after a server restart.',
          { newRefreshToken: '****************' } // Avoid logging the full token
        )
        // For debugging purposes, you might want to log it, but be careful in production
        console.log(`NEW FORTNOX REFRESH TOKEN: ${newRefreshToken}`)
      }
    } catch (error: any) {
      logger.error('Failed to refresh Fortnox access token.', {
        status: error.response?.status,
        data: error.response?.data,
      })
      
      if (error.response?.data?.error === 'invalid_grant') {
        logger.error('The Fortnox refresh token is invalid or has expired. A new authorization is required.')
      }

      throw new Error(`Failed to refresh Fortnox access token: ${error.message}`)
    }
  }

  /**
   * Execute a Fortnox request and on 401, refresh token once and retry
   */
  private async withRefreshRetry<T>(fn: () => Promise<T>): Promise<T> {
    try {
      return await fn()
    } catch (error: any) {
      const status = error?.response?.status
      if (status === 401 && this.isOAuthToken() && this.inMemoryRefreshToken) {
        await this.refreshAccessToken()
        return await fn()
      }
      throw error
    }
  }

  /**
   * Handle Fortnox API errors
   */
  private handleFortnoxError(error: any, operation: string) {
    if (error.response?.data?.ErrorInformation) {
      const errorInfo = error.response.data.ErrorInformation
      logger.error(`Fortnox ${operation} error:`, {
        error: errorInfo.Error,
        message: errorInfo.Message,
        code: errorInfo.Code
      })
      throw new Error(`Fortnox error: ${errorInfo.Message}`)
    } else if (error.response?.data) {
      logger.error(`Fortnox ${operation} error:`, error.response.data)
      throw new Error(`Fortnox error: ${JSON.stringify(error.response.data)}`)
    } else {
      logger.error(`Fortnox ${operation} error:`, error.message || error)
      throw new Error(`Fortnox error: ${error.message || 'Unknown error'}`)
    }
  }

  /**
   * Create or update customer
   */
  async createCustomer(customerData: FortnoxCustomer): Promise<string> {
    try {
      await this.rateLimitDelay()

      // First try to find existing customer by email
      if (customerData.Email) {
        const existingCustomer = await this.findCustomerByEmail(customerData.Email)
        if (existingCustomer) {
          logger.info(`Using existing Fortnox customer: ${existingCustomer}`)
          return existingCustomer
        }
      }

      const exec = async () => {
        const response: AxiosResponse<FortnoxResponse<{ Customer: FortnoxCustomer }>> = await axios.post(
          `${this.credentials.baseUrl}/customers`,
          { Customer: customerData },
          { headers: this.getHeaders() }
        )
        if (response.data.ErrorInformation) {
          throw new Error(response.data.ErrorInformation.Message)
        }
        return response
      }

      const response = await this.withRefreshRetry(exec)
      const customerNumber = (response as any).data.Customer.CustomerNumber!
      logger.info(`Fortnox customer created: ${customerNumber}`)
      return customerNumber

    } catch (error: any) {
      this.handleFortnoxError(error, 'customer creation')
      throw error
    }
  }

  /**
   * Find customer by email
   */
  async findCustomerByEmail(email: string): Promise<string | null> {
    try {
      await this.rateLimitDelay()

      const exec = async () => axios.get(
        `${this.credentials.baseUrl}/customers?email=${encodeURIComponent(email)}`,
        { headers: this.getHeaders() }
      )

      const response = await this.withRefreshRetry(exec)

      if ((response as any).data.Customers && (response as any).data.Customers.length > 0) {
        return (response as any).data.Customers[0].CustomerNumber
      }

      return null

    } catch (error: any) {
      logger.error('Failed to find customer by email:', error.response?.data || error.message)
      return null
    }
  }

  /**
   * Create or update article (product)
   */
  async createArticle(articleData: FortnoxArticle): Promise<string> {
    try {
      await this.rateLimitDelay()

      // Try to find existing article first
      if (articleData.ArticleNumber) {
        const existingArticle = await this.getArticle(articleData.ArticleNumber)
        if (existingArticle) {
          logger.info(`Using existing Fortnox article: ${articleData.ArticleNumber}`)
          return articleData.ArticleNumber
        }
      }

      const exec = async () => {
        const response: AxiosResponse<FortnoxResponse<{ Article: FortnoxArticle }>> = await axios.post(
          `${this.credentials.baseUrl}/articles`,
          { Article: articleData },
          { headers: this.getHeaders() }
        )
        if (response.data.ErrorInformation) {
          throw new Error(response.data.ErrorInformation.Message)
        }
        return response
      }

      await this.withRefreshRetry(exec)
      const articleNumber = articleData.ArticleNumber!
      logger.info(`Fortnox article created: ${articleNumber}`)
      return articleNumber

    } catch (error: any) {
      this.handleFortnoxError(error, 'article creation')
      throw error
    }
  }

  /**
   * Get article by number
   */
  async getArticle(articleNumber: string): Promise<FortnoxArticle | null> {
    try {
      await this.rateLimitDelay()

      const exec = async () => axios.get(
        `${this.credentials.baseUrl}/articles/${articleNumber}`,
        { headers: this.getHeaders() }
      )

      const response = await this.withRefreshRetry(exec)
      return (response as any).data.Article || null

    } catch (error: any) {
      if (error.response?.status === 404) {
        return null
      }
      logger.error('Failed to get article:', error.response?.data || error.message)
      return null
    }
  }

  /**
   * Create order
   */
  async createOrder(orderData: FortnoxOrder): Promise<string> {
    try {
      await this.rateLimitDelay()
      const payload = { Order: orderData }
      const exec = () => axios.post(`${this.credentials.baseUrl}/orders`, payload, { headers: this.getHeaders() })
      const response = await this.withRefreshRetry(exec)
      
      const order = (response.data as FortnoxResponse<any>).Order

      const orderNumber = order.DocumentNumber
      logger.info(`Fortnox order created: ${orderNumber}`)
      return orderNumber

    } catch (error: any) {
      if (error.response) {
        logger.error('Fortnox order creation raw error response:', {
          status: error.response.status,
          data: error.response.data
        })
      }
      this.handleFortnoxError(error, 'order creation')
    }
  }

  /**
   * Create invoice in Fortnox
   */
  async createInvoice(invoiceData: FortnoxInvoice): Promise<string> {
    try {
      await this.rateLimitDelay()

      const exec = async () => {
        const response: AxiosResponse<FortnoxResponse<{ Invoice: any }>> = await axios.post(
          `${this.credentials.baseUrl}/invoices`,
          { Invoice: invoiceData },
          { headers: this.getHeaders() }
        )
        if (response.data.ErrorInformation) {
          throw new Error(response.data.ErrorInformation.Message)
        }
        return response
      }

      const response = await this.withRefreshRetry(exec)

      const invoiceNumber = (response as any).data.Invoice.DocumentNumber
      logger.info(`Fortnox invoice created: ${invoiceNumber}`)
      return invoiceNumber

    } catch (error: any) {
      this.handleFortnoxError(error, 'invoice creation')
      throw error
    }
  }

  /**
   * Process complete order (customer + articles + order)
   */
  async processOrder(orderDetails: {
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
    items: Array<{
      productId: string
      name: string
      price: number
      quantity: number
      sku?: string
    }>
    orderId: string
    total: number
    shipping: number
    orderDate: Date
  }): Promise<{ customerNumber: string; orderNumber: string }> {
    logger.info('[FortnoxProcess] Starting order processing', { orderId: orderDetails.orderId })
    try {
      const skipArticleCreate = String(process.env.FORTNOX_SKIP_ARTICLE_CREATE).toLowerCase() === 'true'
      logger.info('[FortnoxProcess] Step 1: Check for existing customer', { email: orderDetails.customer.email })

      let customerNumber: string | null = null

      // If customer email ends with 1753skincare.com, skip customer creation and try to find them
      if (orderDetails.customer.email.endsWith('@1753skincare.com')) {
        logger.info('[FortnoxProcess] Internal email detected, skipping customer creation check.')
        customerNumber = await this.findCustomerByEmail(orderDetails.customer.email)
      } else {
        customerNumber = await this.findCustomerByEmail(orderDetails.customer.email)
      }
      logger.info(`[FortnoxProcess] Existing customer check complete. Found: ${customerNumber || 'None'}`)
      
      // If customer doesn't exist, create them
      if (!customerNumber && !orderDetails.customer.email.endsWith('@1753skincare.com')) {
        logger.info('[FortnoxProcess] No existing customer found, creating a new one.')
        const customerPayload: FortnoxCustomer = {
          Name: `${orderDetails.customer.firstName} ${orderDetails.customer.lastName}`,
          Email: orderDetails.customer.email,
          Phone1: orderDetails.customer.phone,
          Address1: orderDetails.customer.address,
          Address2: orderDetails.customer.apartment,
          ZipCode: orderDetails.customer.postalCode,
          City: orderDetails.customer.city,
          CountryCode: orderDetails.customer.country === 'Sverige' ? 'SE' : orderDetails.customer.country,
        }
        customerNumber = await this.createCustomer(customerPayload)
        logger.info(`[FortnoxProcess] New customer created with number: ${customerNumber}`)
      }

      if (!customerNumber) {
        logger.error('[FortnoxProcess] CRITICAL: Could not find or create Fortnox customer. Aborting.')
        throw new Error('Could not find or create Fortnox customer')
      }

      // 2. Create articles if they don't exist
      if (!skipArticleCreate) {
        logger.info('[FortnoxProcess] Step 2: Creating articles (if needed)')
        for (const item of orderDetails.items) {
          const articleData: FortnoxArticle = {
            ArticleNumber: item.sku || item.productId,
            Description: item.name,
            SalesPrice: item.price,
            Unit: 'st',
            VAT: 25, // 25% Swedish VAT
            AccountNumber: 3001, // Sales account
            StockGoods: true
          }
          await this.createArticle(articleData)
        }
        logger.info('[FortnoxProcess] Article creation step complete.')
      } else {
        logger.info('[FortnoxProcess] Step 2: Skipping article creation.')
      }

      // 3. Create order
      logger.info('[FortnoxProcess] Step 3: Constructing order payload')
      // Map order items to Fortnox order rows
      const orderRows: FortnoxOrderRow[] = orderDetails.items.map(item => {
        // Determine VAT rate (assuming 25% for now, this could be more dynamic)
        const vatRate = 25

        const row: FortnoxOrderRow = {
          Description: item.name,
          Price: item.price,
          OrderedQuantity: item.quantity,
          DeliveredQuantity: item.quantity,
          VAT: vatRate,
        }
        
        if (item.sku) {
          row.ArticleNumber = item.sku
        }

        return row
      })

      // Add shipping as a separate row if applicable
      if (orderDetails.shipping > 0) {
        logger.info('[FortnoxProcess] Adding shipping row to order.')
        orderRows.push({
          Description: 'Frakt',
          Price: orderDetails.shipping,
          OrderedQuantity: 1,
          DeliveredQuantity: 1,
          VAT: 25, // Assuming 25% VAT on shipping
        })
      }

      const orderPayload: FortnoxOrder = {
        CustomerNumber: customerNumber,
        OrderDate: orderDetails.orderDate.toISOString().split('T')[0],
        OrderRows: orderRows,
        YourReference: orderDetails.orderId,
        Currency: orderDetails.items[0].price > 500 ? 'SEK' : 'EUR', // Simple currency detection
        VATIncluded: true,
        // Delivery address fields are now at the root of the Order object
        CustomerName: `${orderDetails.customer.firstName} ${orderDetails.customer.lastName}`,
        Address1: orderDetails.customer.address,
        Address2: orderDetails.customer.apartment,
        ZipCode: orderDetails.customer.postalCode,
        City: orderDetails.customer.city,
        Country: orderDetails.customer.country,
      }

      logger.info('[FortnoxProcess] Order payload constructed. Submitting to Fortnox...')
      const orderNumber = await this.createOrder(orderPayload)
      logger.info(`[FortnoxProcess] Successfully created Fortnox order: ${orderNumber}`)

      return { customerNumber, orderNumber }

    } catch (error) {
      logger.error('[FortnoxProcess] An error occurred during order processing', { 
        orderId: orderDetails.orderId,
        error: error instanceof Error ? error.message : String(error)
      })
      throw error
    }
  }

  /**
   * Test API connection
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.rateLimitDelay()
      const exec = async () => axios.get(
        `${this.credentials.baseUrl}/companyinformation`,
        { headers: this.getHeaders() }
      )
      const response = await this.withRefreshRetry(exec)
      return !(response as any).data.ErrorInformation
    } catch (error) {
      logger.error('Fortnox connection test failed:', error)
      return false
    }
  }
}

export const fortnoxService = new FortnoxService()
export default fortnoxService 