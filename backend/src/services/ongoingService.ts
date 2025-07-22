import axios, { AxiosResponse } from 'axios'
import { logger } from '../utils/logger'

interface OngoingCredentials {
  username: string
  password: string
  goodsOwnerId: number
  baseUrl: string
}

interface OngoingCustomer {
  CustomerNumber?: string
  Name: string
  Address?: string
  PostCode?: string
  City?: string
  CountryCode?: string
  Phone?: string
  Email?: string
  CustomerType?: number
}

interface OngoingOrderLine {
  ArticleNumber: string
  NumberOfItems: number
  Price?: number
  ArticleName?: string
}

interface OngoingOrder {
  OrderNumber: string
  CustomerNumber?: string
  DeliveryInstruction?: string
  Reference?: string
  OrderRemark?: string
  CustomerOrderNumber?: string
  OrderLines: OngoingOrderLine[]
  ConsigneeAddress?: {
    Name: string
    Address: string
    PostCode: string
    City: string
    CountryCode: string
    Phone?: string
    Email?: string
  }
  OrderType?: number
  Priority?: number
  WayOfDelivery?: string
  DeliveryDate?: string
}

interface OngoingArticle {
  ArticleNumber: string
  ArticleName: string
  ProductCode?: string
  BarCode?: string
  Weight?: number
  Length?: number
  Width?: number
  Height?: number
  Price?: number
  PurchasePrice?: number
  ArticleGroupCode?: string
  ArticleUnitCode?: string
}

interface OngoingApiResponse<T> {
  Success: boolean
  Message?: string
  Data?: T
  ErrorCode?: string
}

class OngoingService {
  private credentials: OngoingCredentials
  private authToken: string | null = null
  private tokenExpiry: Date | null = null

  constructor() {
    this.credentials = {
      username: process.env.ONGOING_USERNAME || '',
      password: process.env.ONGOING_PASSWORD || '',
      goodsOwnerId: parseInt(process.env.ONGOING_GOODS_OWNER_ID || '0'),
      baseUrl: process.env.ONGOING_BASE_URL || 'https://api.ongoingsystems.se'
    }

    if (!this.credentials.username || !this.credentials.password || !this.credentials.goodsOwnerId) {
      logger.warn('Ongoing WMS credentials not configured')
    }
  }

  /**
   * Get authentication token
   */
  private async getAuthToken(): Promise<string> {
    if (this.authToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
      return this.authToken
    }

    try {
      const response = await axios.post(
        `${this.credentials.baseUrl}/api/v1/authenticate`,
        {
          UserName: this.credentials.username,
          Password: this.credentials.password,
          GoodsOwnerId: this.credentials.goodsOwnerId
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )

      if (response.data.Success) {
        this.authToken = response.data.Data.Token
        // Tokens typically expire in 24 hours, set expiry to 23 hours for safety
        this.tokenExpiry = new Date(Date.now() + (23 * 60 * 60 * 1000))
        return this.authToken
      } else {
        throw new Error(response.data.Message || 'Authentication failed')
      }

    } catch (error: any) {
      logger.error('Failed to authenticate with Ongoing WMS:', error.response?.data || error.message)
      throw new Error('Ongoing WMS authentication failed')
    }
  }

  /**
   * Get default headers for API requests
   */
  private async getHeaders() {
    const token = await this.getAuthToken()
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }

  /**
   * Handle Ongoing API errors
   */
  private handleOngoingError(error: any, operation: string) {
    if (error.response?.data?.Success === false) {
      const errorMessage = error.response.data.Message || 'Unknown error'
      logger.error(`Ongoing ${operation} error:`, {
        message: errorMessage,
        errorCode: error.response.data.ErrorCode
      })
      throw new Error(`Ongoing error: ${errorMessage}`)
    } else {
      logger.error(`Ongoing ${operation} error:`, error.response?.data || error.message)
      throw new Error(`Ongoing ${operation} failed`)
    }
  }

  /**
   * Create or update customer
   */
  async createCustomer(customerData: OngoingCustomer): Promise<string> {
    try {
      const headers = await this.getHeaders()

      // Check if customer already exists
      if (customerData.Email) {
        const existingCustomer = await this.findCustomerByEmail(customerData.Email)
        if (existingCustomer) {
          logger.info(`Using existing Ongoing customer: ${existingCustomer}`)
          return existingCustomer
        }
      }

      const response: AxiosResponse<OngoingApiResponse<{ CustomerNumber: string }>> = await axios.post(
        `${this.credentials.baseUrl}/api/v1/customers`,
        {
          GoodsOwnerId: this.credentials.goodsOwnerId,
          ...customerData,
          CustomerType: customerData.CustomerType || 1 // 1 = End customer
        },
        { headers }
      )

      if (!response.data.Success) {
        throw new Error(response.data.Message || 'Failed to create customer')
      }

      const customerNumber = response.data.Data?.CustomerNumber || customerData.CustomerNumber!
      logger.info(`Ongoing customer created: ${customerNumber}`)
      return customerNumber

    } catch (error: any) {
      this.handleOngoingError(error, 'customer creation')
      throw error
    }
  }

  /**
   * Find customer by email
   */
  async findCustomerByEmail(email: string): Promise<string | null> {
    try {
      const headers = await this.getHeaders()

      const response = await axios.get(
        `${this.credentials.baseUrl}/api/v1/customers`,
        {
          headers,
          params: {
            GoodsOwnerId: this.credentials.goodsOwnerId,
            Email: email
          }
        }
      )

      if (response.data.Success && response.data.Data && response.data.Data.length > 0) {
        return response.data.Data[0].CustomerNumber
      }

      return null

    } catch (error: any) {
      logger.error('Failed to find customer by email:', error.response?.data || error.message)
      return null
    }
  }

  /**
   * Create or update article
   */
  async createArticle(articleData: OngoingArticle): Promise<string> {
    try {
      const headers = await this.getHeaders()

      // Check if article already exists
      const existingArticle = await this.getArticle(articleData.ArticleNumber)
      if (existingArticle) {
        logger.info(`Using existing Ongoing article: ${articleData.ArticleNumber}`)
        return articleData.ArticleNumber
      }

      const response: AxiosResponse<OngoingApiResponse<any>> = await axios.post(
        `${this.credentials.baseUrl}/api/v1/articles`,
        {
          GoodsOwnerId: this.credentials.goodsOwnerId,
          ...articleData,
          ArticleUnitCode: articleData.ArticleUnitCode || 'ST' // Default to pieces
        },
        { headers }
      )

      if (!response.data.Success) {
        throw new Error(response.data.Message || 'Failed to create article')
      }

      logger.info(`Ongoing article created: ${articleData.ArticleNumber}`)
      return articleData.ArticleNumber

    } catch (error: any) {
      this.handleOngoingError(error, 'article creation')
      throw error
    }
  }

  /**
   * Get article by number
   */
  async getArticle(articleNumber: string): Promise<OngoingArticle | null> {
    try {
      const headers = await this.getHeaders()

      const response = await axios.get(
        `${this.credentials.baseUrl}/api/v1/articles/${articleNumber}`,
        {
          headers,
          params: {
            GoodsOwnerId: this.credentials.goodsOwnerId
          }
        }
      )

      if (response.data.Success && response.data.Data) {
        return response.data.Data
      }

      return null

    } catch (error: any) {
      if (error.response?.status === 404) {
        return null
      }
      logger.error('Failed to get article:', error.response?.data || error.message)
      return null
    }
  }

  /**
   * Create order for fulfillment
   */
  async createOrder(orderData: OngoingOrder): Promise<string> {
    try {
      const headers = await this.getHeaders()

      const response: AxiosResponse<OngoingApiResponse<{ OrderNumber: string }>> = await axios.post(
        `${this.credentials.baseUrl}/api/v1/orders`,
        {
          GoodsOwnerId: this.credentials.goodsOwnerId,
          ...orderData,
          OrderType: orderData.OrderType || 1, // 1 = Sales order
          Priority: orderData.Priority || 5, // Normal priority
          WayOfDelivery: orderData.WayOfDelivery || 'Standard'
        },
        { headers }
      )

      if (!response.data.Success) {
        throw new Error(response.data.Message || 'Failed to create order')
      }

      const orderNumber = response.data.Data?.OrderNumber || orderData.OrderNumber
      logger.info(`Ongoing order created: ${orderNumber}`)
      return orderNumber

    } catch (error: any) {
      this.handleOngoingError(error, 'order creation')
      throw error
    }
  }

  /**
   * Get order status
   */
  async getOrderStatus(orderNumber: string): Promise<{
    status: string
    trackingNumber?: string
    shipped?: boolean
    delivered?: boolean
  }> {
    try {
      const headers = await this.getHeaders()

      const response = await axios.get(
        `${this.credentials.baseUrl}/api/v1/orders/${orderNumber}`,
        {
          headers,
          params: {
            GoodsOwnerId: this.credentials.goodsOwnerId
          }
        }
      )

      if (response.data.Success && response.data.Data) {
        const order = response.data.Data
        return {
          status: order.OrderStatus || 'unknown',
          trackingNumber: order.TrackingNumber,
          shipped: order.OrderStatus === 'Shipped',
          delivered: order.OrderStatus === 'Delivered'
        }
      }

      return { status: 'unknown' }

    } catch (error: any) {
      logger.error('Failed to get order status:', error.response?.data || error.message)
      return { status: 'error' }
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
      weight?: number
    }>
    orderId: string
    shipping: number
    orderDate: Date
    deliveryInstruction?: string
  }): Promise<{ customerNumber: string; orderNumber: string }> {
    try {
      // 1. Create/find customer
      const customerData: OngoingCustomer = {
        CustomerNumber: orderDetails.customer.email, // Use email as customer number
        Name: `${orderDetails.customer.firstName} ${orderDetails.customer.lastName}`,
        Address: orderDetails.customer.address,
        PostCode: orderDetails.customer.postalCode,
        City: orderDetails.customer.city,
        CountryCode: this.mapCountryCode(orderDetails.customer.country),
        Phone: orderDetails.customer.phone,
        Email: orderDetails.customer.email,
        CustomerType: 1 // End customer
      }

      const customerNumber = await this.createCustomer(customerData)

      // 2. Create/update articles for each product
      for (const item of orderDetails.items) {
        const articleData: OngoingArticle = {
          ArticleNumber: item.sku || item.productId,
          ArticleName: item.name,
          Weight: item.weight || 0.1, // Default weight in kg
          Price: item.price,
          ArticleUnitCode: 'ST' // Pieces
        }

        await this.createArticle(articleData)
      }

      // 3. Create order
      const orderLines: OngoingOrderLine[] = orderDetails.items.map(item => ({
        ArticleNumber: item.sku || item.productId,
        NumberOfItems: item.quantity,
        Price: item.price,
        ArticleName: item.name
      }))

      const order: OngoingOrder = {
        OrderNumber: orderDetails.orderId,
        CustomerNumber: customerNumber,
        OrderLines: orderLines,
        ConsigneeAddress: {
          Name: `${orderDetails.customer.firstName} ${orderDetails.customer.lastName}`,
          Address: `${orderDetails.customer.address}${orderDetails.customer.apartment ? `, ${orderDetails.customer.apartment}` : ''}`,
          PostCode: orderDetails.customer.postalCode,
          City: orderDetails.customer.city,
          CountryCode: this.mapCountryCode(orderDetails.customer.country),
          Phone: orderDetails.customer.phone,
          Email: orderDetails.customer.email
        },
        DeliveryInstruction: orderDetails.deliveryInstruction || 'Standardleverans från 1753skincare.com',
        Reference: `E-handel: ${orderDetails.orderId}`,
        OrderRemark: `Beställning från 1753skincare.com - ${orderDetails.orderDate.toISOString()}`,
        CustomerOrderNumber: orderDetails.orderId,
        OrderType: 1, // Sales order
        Priority: 5, // Normal priority
        WayOfDelivery: 'Standard'
      }

      const orderNumber = await this.createOrder(order)

      return { customerNumber, orderNumber }

    } catch (error) {
      logger.error('Failed to process Ongoing order:', error)
      throw error
    }
  }

  /**
   * Map country names to country codes
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

    return countryMap[country] || 'SE' // Default to Sweden
  }

  /**
   * Test API connection
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.getAuthToken()
      return true
    } catch (error) {
      logger.error('Ongoing WMS connection test failed:', error)
      return false
    }
  }
}

export const ongoingService = new OngoingService()
export default ongoingService 