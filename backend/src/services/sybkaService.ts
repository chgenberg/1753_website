import axios, { AxiosResponse } from 'axios'
import { logger } from '../utils/logger'

interface SybkaOrderData {
  shop_order_id: string
  currency: string
  grand_total: number
  shipping_firstname: string
  shipping_lastname: string
  shipping_street: string
  shipping_postcode: string
  shipping_city: string
  shipping_country: string
  shipping_email: string
  order_rows: Array<{
    sku: string
    name: string
    qty_ordered: number
    price: number
  }>
  fortnox_invoice_id?: string
  payment_gateway: string
  transaction_id: string
}

interface SybkaOrderResponse {
  success: boolean
  order_id?: string
  message?: string
  error?: string
}

interface SybkaCompletedOrder {
  order_id: string
  shop_order_id: string
  status: string
  tracking_number?: string
  carrier?: string
  shipped_at?: string
  fortnox_invoice_id?: string
}

class SybkaService {
  private baseUrl: string

  constructor() {
    this.baseUrl = process.env.SYBKA_SYNC_URL || 'http://localhost:8000'
    
    if (!this.baseUrl) {
      logger.warn('Sybka+ sync URL not configured')
    }
  }

  /**
   * Send order to Sybka+ for fulfillment
   */
  async createOrder(orderData: SybkaOrderData): Promise<SybkaOrderResponse> {
    try {
      logger.info(`Sending order to Sybka+: ${orderData.shop_order_id}`)

      const response: AxiosResponse<SybkaOrderResponse> = await axios.post(
        `${this.baseUrl}/api/sybka/orders`,
        orderData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          timeout: 30000 // 30 seconds
        }
      )

      if (response.data.success) {
        logger.info(`Sybka+ order created successfully: ${response.data.order_id}`)
      } else {
        logger.error(`Sybka+ order creation failed: ${response.data.error}`)
      }

      return response.data

    } catch (error: any) {
      logger.error('Failed to create Sybka+ order:', error.message)
      
      if (error.response) {
        logger.error('Sybka+ API error response:', error.response.data)
      }

      return {
        success: false,
        error: error.message || 'Failed to create Sybka+ order'
      }
    }
  }

  /**
   * Get completed orders from Sybka+
   */
  async getCompletedOrders(): Promise<SybkaCompletedOrder[]> {
    try {
      const response: AxiosResponse<{ completed_orders: SybkaCompletedOrder[] }> = await axios.get(
        `${this.baseUrl}/api/sybka/orders/completed`,
        {
          headers: {
            'Accept': 'application/json'
          },
          timeout: 15000
        }
      )

      return response.data.completed_orders || []

    } catch (error: any) {
      logger.error('Failed to get completed Sybka+ orders:', error.message)
      return []
    }
  }

  /**
   * Test connection to Sybka+ service
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.baseUrl}/api/sybka/test`, {
        timeout: 10000
      })
      
      return response.status === 200
    } catch (error) {
      logger.error('Sybka+ connection test failed:', error)
      return false
    }
  }
}

export const sybkaService = new SybkaService() 