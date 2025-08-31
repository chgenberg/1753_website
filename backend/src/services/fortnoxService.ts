import axios, { AxiosResponse } from 'axios'
import { logger } from '../utils/logger'

interface FortnoxCredentials {
  apiToken: string
  clientSecret: string
  baseUrl: string
}

interface FortnoxCustomer {
  CustomerNumber?: string
  Name: string
  Email?: string
  Phone?: string
  Address1?: string
  Address2?: string
  ZipCode?: string
  City?: string
  Country?: string
  Comments?: string
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
  DeliveredQuantity?: number
  VAT?: number
  Discount?: number
}

interface FortnoxOrder {
  CustomerNumber: string
  OrderDate: string
  DeliveryDate?: string
  OrderRows: FortnoxOrderRow[]
  Comments?: string
  YourReference?: string
  Currency?: string
  PricesInclVat?: boolean
  DeliveryAddress?: {
    Name: string
    Address1: string
    Address2?: string
    ZipCode: string
    City: string
    Country: string
  }
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

  constructor() {
    this.credentials = {
      apiToken: process.env.FORTNOX_API_TOKEN || '',
      clientSecret: process.env.FORTNOX_CLIENT_SECRET || '',
      baseUrl: process.env.FORTNOX_BASE_URL || 'https://api.fortnox.se/3'
    }

    if (!this.credentials.apiToken) {
      logger.warn('Fortnox credentials not configured: missing FORTNOX_API_TOKEN')
    }
  }

  /**
   * Detect if apiToken is an OAuth JWT (Bearer) vs legacy Access-Token.
   */
  private isOAuthToken(): boolean {
    const token = this.credentials.apiToken.trim()
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
      return {
        'Authorization': `Bearer ${this.credentials.apiToken}`,
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

      const response: AxiosResponse<FortnoxResponse<{ Customer: FortnoxCustomer }>> = await axios.post(
        `${this.credentials.baseUrl}/customers`,
        { Customer: customerData },
        { headers: this.getHeaders() }
      )

      if (response.data.ErrorInformation) {
        throw new Error(response.data.ErrorInformation.Message)
      }

      const customerNumber = response.data.Customer.CustomerNumber!
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

      const response = await axios.get(
        `${this.credentials.baseUrl}/customers?email=${encodeURIComponent(email)}`,
        { headers: this.getHeaders() }
      )

      if (response.data.Customers && response.data.Customers.length > 0) {
        return response.data.Customers[0].CustomerNumber
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

      const response: AxiosResponse<FortnoxResponse<{ Article: FortnoxArticle }>> = await axios.post(
        `${this.credentials.baseUrl}/articles`,
        { Article: articleData },
        { headers: this.getHeaders() }
      )

      if (response.data.ErrorInformation) {
        throw new Error(response.data.ErrorInformation.Message)
      }

      const articleNumber = response.data.Article.ArticleNumber!
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

      const response = await axios.get(
        `${this.credentials.baseUrl}/articles/${articleNumber}`,
        { headers: this.getHeaders() }
      )

      return response.data.Article || null

    } catch (error: any) {
      if (error.response?.status === 404) {
        return null
      }
      logger.error('Failed to get article:', error.response?.data || error.message)
      return null
    }
  }

  /**
   * Create order in Fortnox
   */
  async createOrder(orderData: FortnoxOrder): Promise<string> {
    try {
      await this.rateLimitDelay()

      // Debug: log payload we send to Fortnox to diagnose API errors
      logger.info('Creating Fortnox order with payload', { order: orderData })

      const response: AxiosResponse<FortnoxResponse<{ Order: any }>> = await axios.post(
        `${this.credentials.baseUrl}/orders`,
        { Order: orderData },
        { headers: this.getHeaders() }
      )

      if (response.data.ErrorInformation) {
        throw new Error(response.data.ErrorInformation.Message)
      }

      const orderNumber = response.data.Order.DocumentNumber
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
      // Don't throw again since handleFortnoxError already throws
    }
  }

  /**
   * Create invoice in Fortnox
   */
  async createInvoice(invoiceData: FortnoxInvoice): Promise<string> {
    try {
      await this.rateLimitDelay()

      const response: AxiosResponse<FortnoxResponse<{ Invoice: any }>> = await axios.post(
        `${this.credentials.baseUrl}/invoices`,
        { Invoice: invoiceData },
        { headers: this.getHeaders() }
      )

      if (response.data.ErrorInformation) {
        throw new Error(response.data.ErrorInformation.Message)
      }

      const invoiceNumber = response.data.Invoice.DocumentNumber
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
    try {
      const skipArticleCreate = String(process.env.FORTNOX_SKIP_ARTICLE_CREATE || '').toLowerCase() === 'true'

      // 1. Create/find customer
      const customerData: FortnoxCustomer = {
        Name: `${orderDetails.customer.firstName} ${orderDetails.customer.lastName}`,
        Email: orderDetails.customer.email,
        Phone: orderDetails.customer.phone,
        Address1: orderDetails.customer.address,
        Address2: orderDetails.customer.apartment,
        ZipCode: orderDetails.customer.postalCode,
        City: orderDetails.customer.city,
        Country: orderDetails.customer.country,
        Comments: `E-handel kund från 1753skincare.com`
      }

      const customerNumber = await this.createCustomer(customerData)

      // 2. Create/update articles for each product (optional)
      if (!skipArticleCreate) {
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
      } else {
        logger.info('Skipping Fortnox article creation due to FORTNOX_SKIP_ARTICLE_CREATE=true')
      }

      // 3. Create order
      const orderRows: FortnoxOrderRow[] = orderDetails.items.map(item => ({
        ...(skipArticleCreate ? {} : { ArticleNumber: item.sku || item.productId }),
        Description: item.name,
        Price: item.price,
        OrderedQuantity: item.quantity,
        DeliveredQuantity: 0,
        VAT: 25
      }))

      // Add shipping as a separate row if applicable
      if (orderDetails.shipping > 0) {
        orderRows.push({
          // Do not reference a non-existent SHIPPING article
          Description: 'Frakt och hantering',
          Price: orderDetails.shipping,
          OrderedQuantity: 1,
          DeliveredQuantity: 0,
          VAT: 25
        })
      }

      const order: FortnoxOrder = {
        CustomerNumber: customerNumber,
        OrderDate: orderDetails.orderDate.toISOString().split('T')[0],
        OrderRows: orderRows,
        Comments: `E-handelsorder från 1753skincare.com - Order ID: ${orderDetails.orderId}`,
        YourReference: orderDetails.orderId,
        Currency: 'SEK',
        PricesInclVat: true,
        DeliveryAddress: {
          Name: `${orderDetails.customer.firstName} ${orderDetails.customer.lastName}`,
          Address1: orderDetails.customer.address,
          Address2: orderDetails.customer.apartment || '',
          ZipCode: orderDetails.customer.postalCode,
          City: orderDetails.customer.city,
          Country: orderDetails.customer.country
        }
      }

      const orderNumber = await this.createOrder(order)

      return { customerNumber, orderNumber }

    } catch (error) {
      logger.error('Failed to process Fortnox order:', error)
      throw error
    }
  }

  /**
   * Test API connection
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.rateLimitDelay()
      const response = await axios.get(
        `${this.credentials.baseUrl}/companyinformation`,
        { headers: this.getHeaders() }
      )
      return !response.data.ErrorInformation
    } catch (error) {
      logger.error('Fortnox connection test failed:', error)
      return false
    }
  }
}

export const fortnoxService = new FortnoxService()
export default fortnoxService 