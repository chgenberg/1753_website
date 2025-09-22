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
  // Delivery address (Fortnox naming)
  DeliveryName?: string
  DeliveryAddress1?: string
  DeliveryAddress2?: string
  DeliveryZipCode?: string
  DeliveryCity?: string
  DeliveryCountryCode?: string
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

    // Start proactive refresh timer if using OAuth
    if (this.isOAuthToken()) {
      this.startProactiveRefresh()
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
    let headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  
    if (this.isOAuthToken()) {
      const token = this.inMemoryAccessToken || this.credentials.apiToken;
      headers['Authorization'] = `Bearer ${token}`;
    } else {
      headers['Access-Token'] = this.credentials.apiToken;
      headers['Client-Secret'] = this.credentials.clientSecret;
    }
    
    // Säkerställ att inga undefined värden skickas, vilket kan få axios att agera konstigt
    Object.keys(headers).forEach(key => {
      if (headers[key] === undefined) {
        delete headers[key];
      }
    });

    return headers;
  }

  /**
   * Rate limiting helper
   */
  private async rateLimitDelay() {
    await new Promise(resolve => setTimeout(resolve, this.delayMs))
  }

  /**
   * Update refresh token in Railway using Railway API
   */
  private async updateRefreshTokenInRailway(newRefreshToken: string): Promise<boolean> {
    try {
      const railwayToken = process.env.RAILWAY_API_TOKEN
      const projectId = process.env.RAILWAY_PROJECT_ID
      const serviceId = process.env.RAILWAY_SERVICE_ID
      const environmentId = process.env.RAILWAY_ENVIRONMENT_ID

      if (!railwayToken || !projectId || !serviceId || !environmentId) {
        logger.warn('Railway API credentials not configured for automatic token update')
        return false
      }

      const response = await axios.post(
        `https://backboard.railway.app/graphql`,
        {
          query: `
            mutation VariableUpsert($input: VariableUpsertInput!) {
              variableUpsert(input: $input) {
                id
              }
            }
          `,
          variables: {
            input: {
              projectId: projectId,
              environmentId: environmentId,
              serviceId: serviceId,
              name: "FORTNOX_REFRESH_TOKEN",
              value: newRefreshToken
            }
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${railwayToken}`,
            'Content-Type': 'application/json'
          }
        }
      )

      if (response.data.errors) {
        logger.error('Railway API error:', response.data.errors)
        return false
      }

      logger.info('✅ Successfully updated FORTNOX_REFRESH_TOKEN in Railway automatically!')
      return true

    } catch (error: any) {
      logger.error('Failed to update Railway variable automatically:', error.message)
      return false
    }
  }

  /**
   * Refresh OAuth access token using refresh token.
   * This will also save the new refresh token to database or log it for manual update.
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

      if (newRefreshToken && newRefreshToken !== this.inMemoryRefreshToken) {
        this.inMemoryRefreshToken = newRefreshToken
        
        // Try to update Railway automatically first
        const railwayUpdated = await this.updateRefreshTokenInRailway(newRefreshToken)
        
        if (railwayUpdated) {
          logger.info('🎉 Refresh token updated automatically in Railway! No manual action needed.')
        } else {
          // Fallback to manual logging
          logger.warn(
            '🔑 NEW FORTNOX REFRESH TOKEN GENERATED! Update FORTNOX_REFRESH_TOKEN in Railway variables:',
            { newRefreshToken }
          )
          console.log(`\n🔑 IMPORTANT: Update FORTNOX_REFRESH_TOKEN in Railway to:\n${newRefreshToken}\n`)
        }
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
   * Proactive refresh: checks token expiry periodically and refreshes before expiry
   */
  private startProactiveRefresh() {
    const CHECK_INTERVAL_MS = 10 * 60 * 1000 // every 10 minutes
    const REFRESH_BEFORE_MS = 5 * 60 * 1000  // refresh if <5 minutes left

    const getJwtExpMs = (token: string): number | null => {
      try {
        const parts = token.split('.')
        if (parts.length < 2) return null
        const payloadJson = Buffer.from(parts[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8')
        const payload = JSON.parse(payloadJson)
        if (typeof payload.exp === 'number') return payload.exp * 1000
        return null
      } catch {
        return null
      }
    }

    const tick = async () => {
      try {
        if (!this.isOAuthToken() || !this.inMemoryAccessToken || !this.inMemoryRefreshToken) return
        const expMs = getJwtExpMs(this.inMemoryAccessToken)
        if (!expMs) return
        const now = Date.now()
        const timeLeft = expMs - now
        if (timeLeft <= REFRESH_BEFORE_MS) {
          logger.info('[Fortnox] Proactive refresh: token close to expiry, refreshing...')
          await this.refreshAccessToken()
        }
      } catch (err: any) {
        logger.warn('[Fortnox] Proactive refresh tick failed', { error: err?.message })
      }
    }

    // immediate check and then interval
    setTimeout(tick, 5 * 1000)
    setInterval(tick, CHECK_INTERVAL_MS)
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
    const url = `${this.credentials.baseUrl}/customers`;
    const params = { email: email };
    logger.info('[Fortnox] Finding customer by email with GET and URL params', { url, params });

    try {
      await this.rateLimitDelay();

      const exec = () => axios.get(url, { 
        headers: this.getHeaders(),
        params: params, // Använd 'params' för att garantera att det blir query-parametrar
      });

      const response = await this.withRefreshRetry(exec);

      if (response.data?.Customers?.length > 0) {
        const customerNumber = response.data.Customers[0].CustomerNumber;
        logger.info(`[Fortnox] Found customer: ${customerNumber}`);
        return customerNumber;
      }
      
      logger.info('[Fortnox] Customer not found by email.');
      return null;

    } catch (error: any) {
      logger.error('[Fortnox] Error finding customer by email', { 
        errorMessage: error.message,
        errorResponse: error.response?.data 
      });
      // Returnera null så att en ny kund kan skapas
      return null;
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
          data: error.response.data,
          orderRef: orderData.YourReference
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
    const logContext = { orderId: orderDetails.orderId, email: orderDetails.customer.email };
    logger.info('[Fortnox] Starting order processing', logContext);

    try {
      const skipArticleCreate = String(process.env.FORTNOX_SKIP_ARTICLE_CREATE).toLowerCase() === 'true'

      // --- Step 1: Find or Create Customer ---
      logger.info('[Fortnox] Step 1: Find or Create Customer', logContext);
      let customerNumber: string | null = null
      
      // Always attempt to find existing customer by email first
      customerNumber = await this.findCustomerByEmail(orderDetails.customer.email)
      
      // If not found, create a new customer (even for internal/test emails)
      if (!customerNumber) {
        logger.info('[Fortnox] Customer not found. Creating new customer...', logContext);
        const customerData: FortnoxCustomer = {
          Name: `${orderDetails.customer.firstName} ${orderDetails.customer.lastName}`,
          Email: orderDetails.customer.email,
          Phone1: orderDetails.customer.phone,
          Address1: orderDetails.customer.address,
          Address2: orderDetails.customer.apartment,
          ZipCode: orderDetails.customer.postalCode,
          City: orderDetails.customer.city,
          CountryCode: orderDetails.customer.country === 'Sverige' ? 'SE' : orderDetails.customer.country,
        };
        customerNumber = await this.createCustomer(customerData);
        logger.info(`[Fortnox] New customer created with number: ${customerNumber}`, logContext);
      } else {
        logger.info(`[Fortnox] Found existing customer with number: ${customerNumber}`, logContext);
      }

      if (!customerNumber) {
        throw new Error('Could not find or create Fortnox customer');
      }
      logger.info('[Fortnox] Step 1 COMPLETE.', logContext);


      // --- Step 2: Create Articles (if not skipped) ---
      logger.info('[Fortnox] Step 2: Create Articles', { ...logContext, skipArticleCreate });
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
        logger.info('[Fortnox] Skipping article creation.', logContext);
      }
      logger.info('[Fortnox] Step 2 COMPLETE.', logContext);

      // --- Step 3: Create Order ---
      logger.info('[Fortnox] Step 3: Create Order', logContext);
      const orderRows: FortnoxOrderRow[] = orderDetails.items.map(item => {
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

      if (orderDetails.shipping > 0) {
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
        Currency: 'SEK',
        VATIncluded: true,
        // Correct Fortnox delivery address fields
        DeliveryName: `${orderDetails.customer.firstName} ${orderDetails.customer.lastName}`,
        DeliveryAddress1: orderDetails.customer.address,
        DeliveryAddress2: orderDetails.customer.apartment,
        DeliveryZipCode: orderDetails.customer.postalCode,
        DeliveryCity: orderDetails.customer.city,
        DeliveryCountryCode: (orderDetails.customer.country || 'SE'),
      }

      logger.info('[Fortnox] Final order payload constructed. Calling createOrder...', { ...logContext, payloadItems: orderRows.length });
      const orderNumber = await this.createOrder(orderPayload);
      logger.info(`[Fortnox] Order created successfully with number: ${orderNumber}`, logContext);
      logger.info('[Fortnox] Step 3 COMPLETE.', logContext);
      
      return { customerNumber, orderNumber }

    } catch (error) {
      logger.error('[Fortnox] Order processing failed catastrophically.', { ...logContext, error: error instanceof Error ? error.message : String(error) });
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