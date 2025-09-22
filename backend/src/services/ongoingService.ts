import axios, { AxiosResponse } from 'axios'
import { logger } from '../utils/logger'

interface OngoingCredentials {
  username: string
  password: string
  goodsOwnerId: number
  baseUrl: string
  goodsOwnerCode: string
  apiType: 'SOAP' | 'REST'
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

interface OngoingSoapResponse {
  Success: boolean
  Message?: string
  OrderId?: number
  CustomerId?: number
  ArticleDefId?: number
  ErrorMessage?: string
}

interface OngoingRestResponse {
  success?: boolean
  data?: any
  message?: string
  error?: string
}

class OngoingService {
  private credentials: OngoingCredentials

  constructor() {
    // Determine API type based on configuration or default to SOAP
    const preferRest = process.env.ONGOING_USE_REST === 'true'
    const apiType = preferRest ? 'REST' : 'SOAP'
    
    // Set base URLs based on API type
    const soapBaseUrl = 'https://api.ongoingsystems.se/Logit/service.asmx'
    const restBaseUrl = 'https://api.ongoingsystems.se/logit/api/v1'
    
    this.credentials = {
      username: process.env.ONGOING_USERNAME || '',
      password: process.env.ONGOING_PASSWORD || '',
      goodsOwnerId: parseInt(process.env.ONGOING_GOODS_OWNER_ID || '135'),
      baseUrl: process.env.ONGOING_BASE_URL || (apiType === 'REST' ? restBaseUrl : soapBaseUrl),
      goodsOwnerCode: process.env.ONGOING_GOODS_OWNER_CODE || '135',
      apiType
    }

    if (!this.credentials.username || !this.credentials.password) {
      logger.warn('Ongoing WMS credentials not configured')
    }

    logger.info(`Ongoing service initialized with ${this.credentials.apiType} API`, {
      baseUrl: this.credentials.baseUrl,
      goodsOwnerId: this.credentials.goodsOwnerId,
      goodsOwnerCode: this.credentials.goodsOwnerCode,
      username: this.credentials.username
    })
  }

  /**
   * Get REST API headers
   */
  private getRestHeaders() {
    const auth = Buffer.from(`${this.credentials.username}:${this.credentials.password}`).toString('base64')
    return {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${auth}`
    }
  }

  /**
   * Get SOAP headers for Ongoing WMS
   */
  private getSoapHeaders() {
    return {
      'Content-Type': 'text/xml; charset=utf-8',
      'SOAPAction': ''
    }
  }

  /**
   * Create SOAP envelope
   */
  private createSoapEnvelope(operation: string, body: string): string {
    return `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tns="http://ongoingsystems.se/WSI">
  <soap:Body>
    <tns:${operation}>
      <tns:GoodsOwnerCode>${this.credentials.goodsOwnerCode}</tns:GoodsOwnerCode>
      <tns:UserName>${this.credentials.username}</tns:UserName>
      <tns:Password>${this.credentials.password}</tns:Password>
      ${body}
    </tns:${operation}>
  </soap:Body>
</soap:Envelope>`
  }

  /**
   * Parse SOAP response
   */
  private parseSoapResponse(xmlResponse: string): any {
    try {
      // Handle SOAP faults first
      if (xmlResponse.includes('soap:Fault') || xmlResponse.includes('soap:fault')) {
        const faultStringMatch = xmlResponse.match(/<faultstring[^>]*>([^<]+)<\/faultstring>/)
        if (faultStringMatch) {
          return {
            Success: false,
            ErrorMessage: faultStringMatch[1]
          }
        }
      }

      // Parse successful responses
      const successMatch = xmlResponse.match(/<Success>([^<]+)<\/Success>/)
      const messageMatch = xmlResponse.match(/<Message>([^<]*)<\/Message>/)
      const errorMatch = xmlResponse.match(/<ErrorMessage>([^<]*)<\/ErrorMessage>/)
      const orderIdMatch = xmlResponse.match(/<OrderId>([^<]+)<\/OrderId>/)
      const customerIdMatch = xmlResponse.match(/<CustomerId>([^<]+)<\/CustomerId>/)
      
      return {
        Success: successMatch ? successMatch[1] === 'true' : false,
        Message: messageMatch ? messageMatch[1] : '',
        ErrorMessage: errorMatch ? errorMatch[1] : '',
        OrderId: orderIdMatch ? parseInt(orderIdMatch[1]) : null,
        CustomerId: customerIdMatch ? parseInt(customerIdMatch[1]) : null
      }
    } catch (error) {
      logger.error('Failed to parse SOAP response:', error)
      return { Success: false, ErrorMessage: 'Failed to parse response' }
    }
  }

  /**
   * Handle Ongoing API errors
   */
  private handleOngoingError(error: any, operation: string) {
    if (error.response?.data) {
      if (this.credentials.apiType === 'SOAP') {
        const parsed = this.parseSoapResponse(error.response.data)
        if (!parsed.Success) {
          const errorMessage = parsed.ErrorMessage || parsed.Message || 'Unknown SOAP error'
          logger.error(`Ongoing SOAP ${operation} error:`, { 
            message: errorMessage,
            status: error.response.status,
            url: error.config?.url 
          })
          throw new Error(`Ongoing error: ${errorMessage}`)
        }
      } else {
        logger.error(`Ongoing REST ${operation} error:`, {
          status: error.response.status,
          data: error.response.data,
          url: error.config?.url
        })
        throw new Error(`Ongoing REST error: ${error.response.data.message || error.response.statusText}`)
      }
    }
    logger.error(`Ongoing ${operation} error:`, error.message)
    throw new Error(`Ongoing ${operation} failed: ${error.message}`)
  }

  /**
   * Create or update customer via SOAP
   */
  private async createCustomerSoap(customerData: OngoingCustomer): Promise<string> {
    const customerXml = `
      <tns:Customer>
        <tns:CustomerOperation>CreateOrUpdate</tns:CustomerOperation>
        <tns:CustomerIdentification>CustomerNumber</tns:CustomerIdentification>
        <tns:CustomerNumber>${customerData.CustomerNumber || customerData.Email || 'UNKNOWN'}</tns:CustomerNumber>
        <tns:Name>${customerData.Name || 'Customer'}</tns:Name>
        <tns:Address>${customerData.Address || 'Unknown'}</tns:Address>
        <tns:PostCode>${customerData.PostCode || '00000'}</tns:PostCode>
        <tns:City>${customerData.City || 'Unknown'}</tns:City>
        <tns:CountryCode>${customerData.CountryCode || 'SE'}</tns:CountryCode>
        <tns:TelePhone>${customerData.Phone || ''}</tns:TelePhone>
        <tns:Email>${customerData.Email || ''}</tns:Email>
        <tns:IsVisible>true</tns:IsVisible>
        <tns:NotifyBySMS>false</tns:NotifyBySMS>
        <tns:NotifyByEmail>true</tns:NotifyByEmail>
        <tns:NotifyByTelephone>false</tns:NotifyByTelephone>
      </tns:Customer>`

    const soapEnvelope = this.createSoapEnvelope('ProcessCustomer', customerXml)
    
    const response = await axios.post(
      this.credentials.baseUrl,
      soapEnvelope,
      { 
        headers: {
          ...this.getSoapHeaders(),
          'SOAPAction': 'http://ongoingsystems.se/WSI/ProcessCustomer'
        }
      }
    )

    const parsed = this.parseSoapResponse(response.data)
    
    if (!parsed.Success) {
      throw new Error(parsed.ErrorMessage || parsed.Message || 'Customer creation failed')
    }

    return customerData.CustomerNumber || customerData.Email || 'UNKNOWN'
  }

  /**
   * Create or update customer via REST
   */
  private async createCustomerRest(customerData: OngoingCustomer): Promise<string> {
    const payload = {
      customerNumber: customerData.CustomerNumber || customerData.Email || 'UNKNOWN',
      name: customerData.Name || 'Customer',
      address: customerData.Address || 'Unknown',
      postCode: customerData.PostCode || '00000',
      city: customerData.City || 'Unknown',
      countryCode: customerData.CountryCode || 'SE',
      phone: customerData.Phone || '',
      email: customerData.Email || '',
      goodsOwnerId: this.credentials.goodsOwnerId
    }

    const response = await axios.post(
      `${this.credentials.baseUrl}/customers`,
      payload,
      { headers: this.getRestHeaders() }
    )

    if (response.data.success === false) {
      throw new Error(response.data.message || 'Customer creation failed')
    }

    return payload.customerNumber
  }

  /**
   * Create or update customer
   */
  async createCustomer(customerData: OngoingCustomer): Promise<string> {
    try {
      logger.info(`Creating Ongoing ${this.credentials.apiType} customer: ${customerData.Email}`, {
        customerNumber: customerData.CustomerNumber || customerData.Email,
        name: customerData.Name,
        email: customerData.Email,
        phone: customerData.Phone,
        address: customerData.Address,
        city: customerData.City,
        postCode: customerData.PostCode,
        countryCode: customerData.CountryCode,
        apiType: this.credentials.apiType
      })

      const customerNumber = this.credentials.apiType === 'SOAP' 
        ? await this.createCustomerSoap(customerData)
        : await this.createCustomerRest(customerData)

      logger.info(`Ongoing ${this.credentials.apiType} customer created: ${customerNumber}`)
      return customerNumber

    } catch (error: any) {
      logger.error(`Ongoing ${this.credentials.apiType} customer creation failed:`, {
        error: error.message,
        status: error.response?.status,
        data: error.response?.data
      })
      this.handleOngoingError(error, 'customer creation')
      throw error
    }
  }

  /**
   * Find customer by email (simplified for both APIs)
   */
  async findCustomerByEmail(email: string): Promise<string | null> {
    // For both APIs, we'll skip the find operation and let createCustomer handle duplicates
    logger.info(`${this.credentials.apiType}: Skipping customer lookup for ${email}, will use CreateOrUpdate`)
    return null
  }

  /**
   * Create or update article via SOAP
   */
  private async createArticleSoap(articleData: OngoingArticle): Promise<string> {
    const articleXml = `
      <tns:art>
        <tns:ArticleOperation>CreateOrUpdate</tns:ArticleOperation>
        <tns:ArticleIdentification>ArticleNumber</tns:ArticleIdentification>
        <tns:ArticleNumber>${articleData.ArticleNumber}</tns:ArticleNumber>
        <tns:ArticleName>${articleData.ArticleName}</tns:ArticleName>
        <tns:ProductCode>${articleData.ProductCode || articleData.ArticleNumber}</tns:ProductCode>
        <tns:BarCode>${articleData.BarCode || articleData.ArticleNumber}</tns:BarCode>
        <tns:Weight>${articleData.Weight || 0}</tns:Weight>
        <tns:Length>${articleData.Length || 0}</tns:Length>
        <tns:Width>${articleData.Width || 0}</tns:Width>
        <tns:Height>${articleData.Height || 0}</tns:Height>
        <tns:Price>${articleData.Price || 0}</tns:Price>
        <tns:PurchasePrice>${articleData.PurchasePrice || 0}</tns:PurchasePrice>
        <tns:IsStockArticle>true</tns:IsStockArticle>
        <tns:ArticleUnitCode>${articleData.ArticleUnitCode || 'ST'}</tns:ArticleUnitCode>
      </tns:art>`

    const soapEnvelope = this.createSoapEnvelope('ProcessArticle', articleXml)

    const response = await axios.post(
      this.credentials.baseUrl,
      soapEnvelope,
      { 
        headers: {
          ...this.getSoapHeaders(),
          'SOAPAction': 'http://ongoingsystems.se/WSI/ProcessArticle'
        }
      }
    )

    const parsed = this.parseSoapResponse(response.data)
    
    if (!parsed.Success) {
      throw new Error(parsed.ErrorMessage || parsed.Message || 'Article creation failed')
    }

    return articleData.ArticleNumber
  }

  /**
   * Create or update article via REST
   */
  private async createArticleRest(articleData: OngoingArticle): Promise<string> {
    const payload = {
      articleNumber: articleData.ArticleNumber,
      articleName: articleData.ArticleName,
      productCode: articleData.ProductCode || articleData.ArticleNumber,
      barCode: articleData.BarCode || articleData.ArticleNumber,
      weight: articleData.Weight || 0,
      length: articleData.Length || 0,
      width: articleData.Width || 0,
      height: articleData.Height || 0,
      price: articleData.Price || 0,
      purchasePrice: articleData.PurchasePrice || 0,
      articleUnitCode: articleData.ArticleUnitCode || 'ST',
      goodsOwnerId: this.credentials.goodsOwnerId
    }

    const response = await axios.post(
      `${this.credentials.baseUrl}/articles`,
      payload,
      { headers: this.getRestHeaders() }
    )

    if (response.data.success === false) {
      throw new Error(response.data.message || 'Article creation failed')
    }

    return articleData.ArticleNumber
  }

  /**
   * Create or update article
   */
  async createArticle(articleData: OngoingArticle): Promise<string> {
    try {
      logger.info(`Creating Ongoing ${this.credentials.apiType} article: ${articleData.ArticleNumber}`)

      const articleNumber = this.credentials.apiType === 'SOAP'
        ? await this.createArticleSoap(articleData)
        : await this.createArticleRest(articleData)

      logger.info(`Ongoing ${this.credentials.apiType} article created: ${articleNumber}`)
      return articleNumber

    } catch (error: any) {
      logger.error(`Ongoing ${this.credentials.apiType} article creation error:`, error.response?.data || error.message)
      this.handleOngoingError(error, 'article creation')
      throw error
    }
  }

  /**
   * Get article by number (simplified)
   */
  async getArticle(articleNumber: string): Promise<OngoingArticle | null> {
    // Skip lookup and let createArticle handle duplicates
    logger.info(`${this.credentials.apiType}: Skipping article lookup for ${articleNumber}, will use CreateOrUpdate`)
    return null
  }

  /**
   * Create order via SOAP
   */
  private async createOrderSoap(orderData: OngoingOrder): Promise<string> {
    const orderLinesXml = orderData.OrderLines.map(line => `
        <tns:CustomerOrderLine>
          <tns:OrderLineIdentification>ExternalOrderLineCode</tns:OrderLineIdentification>
          <tns:ArticleIdentification>ArticleNumber</tns:ArticleIdentification>
          <tns:ExternalOrderLineCode>${line.ArticleNumber}-${Date.now()}</tns:ExternalOrderLineCode>
          <tns:ArticleNumber>${line.ArticleNumber}</tns:ArticleNumber>
          <tns:NumberOfItems>${line.NumberOfItems}</tns:NumberOfItems>
          <tns:LinePrice>${line.Price || 0}</tns:LinePrice>
          <tns:DoPick>true</tns:DoPick>
        </tns:CustomerOrderLine>`).join('')

    const customerXml = `
        <tns:Customer>
          <tns:CustomerOperation>Find</tns:CustomerOperation>
          <tns:CustomerIdentification>CustomerNumber</tns:CustomerIdentification>
          <tns:CustomerNumber>${orderData.CustomerNumber}</tns:CustomerNumber>
        </tns:Customer>`

    const orderXml = `
      <tns:co>
        <tns:OrderInfo>
          <tns:OrderIdentification>GoodsOwnerOrderNumber</tns:OrderIdentification>
          <tns:OrderOperation>Create</tns:OrderOperation>
          <tns:GoodsOwnerOrderNumber>${orderData.OrderNumber}</tns:GoodsOwnerOrderNumber>
          <tns:DeliveryDate>${orderData.DeliveryDate || new Date().toISOString()}</tns:DeliveryDate>
          <tns:OrderRemark>${orderData.OrderRemark || ''}</tns:OrderRemark>
          <tns:DeliveryInstruction>${orderData.DeliveryInstruction || ''}</tns:DeliveryInstruction>
        </tns:OrderInfo>
        <tns:GoodsOwner>
          <tns:GoodsOwnerIdentification>SystemId</tns:GoodsOwnerIdentification>
          <tns:GoodsOwnerId>${this.credentials.goodsOwnerId}</tns:GoodsOwnerId>
        </tns:GoodsOwner>
        ${customerXml}
        <tns:CustomerOrderLines>
          ${orderLinesXml}
        </tns:CustomerOrderLines>
      </tns:co>`

    const soapEnvelope = this.createSoapEnvelope('ProcessOrder', orderXml)

    const response = await axios.post(
      this.credentials.baseUrl,
      soapEnvelope,
      { 
        headers: {
          ...this.getSoapHeaders(),
          'SOAPAction': 'http://ongoingsystems.se/WSI/ProcessOrder'
        }
      }
    )

    const parsed = this.parseSoapResponse(response.data)
    
    if (!parsed.Success) {
      throw new Error(parsed.ErrorMessage || parsed.Message || 'Order creation failed')
    }

    return String(parsed.OrderId || orderData.OrderNumber)
  }

  /**
   * Create order via REST
   */
  private async createOrderRest(orderData: OngoingOrder): Promise<string> {
    const payload = {
      orderNumber: orderData.OrderNumber,
      customerNumber: orderData.CustomerNumber,
      orderLines: orderData.OrderLines.map(line => ({
        articleNumber: line.ArticleNumber,
        articleName: line.ArticleName,
        numberOfItems: line.NumberOfItems,
        price: line.Price || 0
      })),
      deliveryInstruction: orderData.DeliveryInstruction,
      orderRemark: orderData.OrderRemark,
      deliveryDate: orderData.DeliveryDate || new Date().toISOString(),
      goodsOwnerId: this.credentials.goodsOwnerId
    }

    const response = await axios.post(
      `${this.credentials.baseUrl}/orders`,
      payload,
      { headers: this.getRestHeaders() }
    )

    if (response.data.success === false) {
      throw new Error(response.data.message || 'Order creation failed')
    }

    return response.data.orderId || orderData.OrderNumber
  }

  /**
   * Create order
   */
  async createOrder(orderData: OngoingOrder): Promise<string> {
    try {
      logger.info(`Creating Ongoing ${this.credentials.apiType} order: ${orderData.OrderNumber}`)

      const orderNumber = this.credentials.apiType === 'SOAP'
        ? await this.createOrderSoap(orderData)
        : await this.createOrderRest(orderData)

      logger.info(`Ongoing ${this.credentials.apiType} order created: ${orderNumber}`)
      return orderNumber

    } catch (error: any) {
      logger.error(`Ongoing ${this.credentials.apiType} order creation error:`, error.response?.data || error.message)
      this.handleOngoingError(error, 'order creation')
      throw error
    }
  }

  /**
   * Process complete order (customer + order)
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
      // 1. Create customer
      const customerData: OngoingCustomer = {
        CustomerNumber: orderDetails.customer.email,
        Name: `${orderDetails.customer.firstName} ${orderDetails.customer.lastName}`,
        Email: orderDetails.customer.email,
        Phone: orderDetails.customer.phone,
        Address: `${orderDetails.customer.address}${orderDetails.customer.apartment ? ' ' + orderDetails.customer.apartment : ''}`,
        PostCode: orderDetails.customer.postalCode,
        City: orderDetails.customer.city,
        CountryCode: orderDetails.customer.country
      }

      const customerNumber = await this.createCustomer(customerData)

      // 2. Create order
      const orderLines: OngoingOrderLine[] = orderDetails.items.map(item => ({
        ArticleNumber: item.sku || item.productId,
        ArticleName: item.name,
        NumberOfItems: item.quantity,
        Price: item.price
      }))

      // Add shipping as separate line if applicable
      if (orderDetails.shipping > 0) {
        orderLines.push({
          ArticleNumber: 'SHIPPING',
          ArticleName: 'Frakt och hantering',
          NumberOfItems: 1,
          Price: orderDetails.shipping
        })
      }

      // Use simple standard delivery method to avoid issues
      const wayOfDelivery = 'Standard'
      
      logger.info('Setting delivery method for Ongoing order', {
        orderId: orderDetails.orderId,
        country: orderDetails.customer.country,
        wayOfDelivery
      })

      const order: OngoingOrder = {
        OrderNumber: orderDetails.orderId,
        CustomerNumber: customerNumber,
        OrderLines: orderLines,
        DeliveryInstruction: orderDetails.deliveryInstruction,
        OrderRemark: `E-handelsorder från 1753skincare.com`,
        DeliveryDate: orderDetails.orderDate.toISOString(),
        WayOfDelivery: wayOfDelivery
      }

      const orderNumber = await this.createOrder(order)

      return { customerNumber, orderNumber }

    } catch (error) {
      logger.error('Failed to process Ongoing SOAP order:', error)
      throw error
    }
  }

  /**
   * Test SOAP API connection
   */
  private async testConnectionSoap(): Promise<boolean> {
    try {
      // Try GetInventory as a basic test that should work
      const soapEnvelope = this.createSoapEnvelope('GetInventory', '')
      
      const response = await axios.post(
        this.credentials.baseUrl,
        soapEnvelope,
        { 
          headers: {
            ...this.getSoapHeaders(),
            'SOAPAction': 'http://ongoingsystems.se/WSI/GetInventory'
          }
        }
      )

      const parsed = this.parseSoapResponse(response.data)
      return parsed.Success || response.status === 200
    } catch (error: any) {
      logger.error('Ongoing SOAP connection test failed:', {
        message: error.message,
        status: error.response?.status,
        url: error.config?.url
      })
      return false
    }
  }

  /**
   * Test REST API connection
   */
  private async testConnectionRest(): Promise<boolean> {
    try {
      const response = await axios.get(
        `${this.credentials.baseUrl}/customers`,
        { 
          headers: this.getRestHeaders(),
          params: { limit: 1 }
        }
      )

      return response.status === 200
    } catch (error: any) {
      logger.error('Ongoing REST connection test failed:', {
        message: error.message,
        status: error.response?.status,
        url: error.config?.url
      })
      return false
    }
  }

  /**
   * Test API connection
   */
  async testConnection(): Promise<boolean> {
    logger.info(`Testing Ongoing ${this.credentials.apiType} connection...`)
    
    const isConnected = this.credentials.apiType === 'SOAP'
      ? await this.testConnectionSoap()
      : await this.testConnectionRest()

    logger.info(`Ongoing ${this.credentials.apiType} connection test: ${isConnected ? 'SUCCESS' : 'FAILED'}`)
    return isConnected
  }
}

export const ongoingService = new OngoingService()
export default ongoingService 