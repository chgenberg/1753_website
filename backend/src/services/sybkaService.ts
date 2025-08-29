import axios, { AxiosResponse } from 'axios'
import { logger } from '../utils/logger'

interface SybkaOrderData {
  shop_order_id: string
  shop_order_increment_id: string
  order_date: string
  currency: string
  grand_total: number
  subtotal: number
  discount_amount: number
  subtotal_incl_tax: number
  tax_amount: number
  shipping_amount: number
  shipping_incl_tax: number
  shipping_tax_amount: number
  status: 'pending' | 'confirmed' | 'processing' | 'completed' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
  fulfillment_status: 'unfulfilled' | 'partial' | 'fulfilled'
  billing_email: string
  billing_firstname: string
  billing_lastname: string
  billing_street: string
  billing_city: string
  billing_postcode: string
  billing_country: string
  billing_phone?: string
  shipping_email: string
  shipping_firstname: string
  shipping_lastname: string
  shipping_street: string
  shipping_city: string
  shipping_postcode: string
  shipping_country: string
  shipping_phone?: string
  order_rows: SybkaOrderRow[]
  fortnox_invoice_id?: string
  team_id?: string
}

interface SybkaOrderRow {
  sku: string
  name: string
  qty_ordered: number
  price: number
  price_incl_tax: number
  row_total: number
  row_total_incl_tax: number
  tax_amount: number
  tax_percent: number
}

interface SybkaOrderResponse {
  success: boolean
  order_id?: string
  error?: string
  message?: string
}

interface SybkaCompletedOrder {
  shop_order_id: string
  status: string
  fulfillment_status: string
  tracking_number?: string
  shipped_at?: string
  delivered_at?: string
  fortnox_invoice_id?: string
}

interface SybkaStatusMapping {
  // Status som triggar fakturaskapande i Fortnox
  invoice_triggers: string[]
  // Status som triggar orderskapande i Sybka
  order_triggers: string[]
  // Team-ID för mappning
  team_id: string
}

class SybkaService {
  private baseUrl: string
  private accessToken: string
  private teamId: string
  private statusMapping: SybkaStatusMapping

  constructor() {
    this.baseUrl = process.env.SYBKA_SYNC_URL || 'http://localhost:8000'
    this.accessToken = process.env.SYNKA_ACCESS_TOKEN || ''
    this.teamId = process.env.SYNKA_TEAM_ID || '844'
    
    // Konfigurera statusmappning baserat på Synka Plus rekommendationer
    this.statusMapping = {
      invoice_triggers: ['CONFIRMED', 'PROCESSING'], // Skapa faktura när order bekräftas/behandlas
      order_triggers: ['PAID'], // Skicka till Sybka när betalning är klar
      team_id: this.teamId
    }

    if (!this.accessToken || !this.teamId) {
      logger.warn('Sybka+ sync credentials not configured', {
        hasToken: !!this.accessToken,
        teamId: this.teamId
      })
    }
  }

  /**
   * Send order to Sybka+ for fulfillment
   */
  async createOrder(orderData: SybkaOrderData): Promise<SybkaOrderResponse> {
    try {
      logger.info(`Sending order to Sybka+: ${orderData.shop_order_id}`, {
        teamId: this.teamId,
        status: orderData.status
      })

      const response: AxiosResponse<SybkaOrderResponse> = await axios.post(
        `${this.baseUrl}/api/sybka/orders`,
        {
          ...orderData,
          team_id: this.teamId
        },
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'X-TeamID': this.teamId,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      )

      if (response.data.success) {
        logger.info(`Sybka+ order created successfully: ${response.data.order_id}`, {
          teamId: this.teamId
        })
      } else {
        logger.error(`Sybka+ order creation failed: ${response.data.error}`, {
          teamId: this.teamId,
          orderId: orderData.shop_order_id
        })
      }

      return response.data

    } catch (error: any) {
      logger.error('Failed to create Sybka+ order:', {
        error: error.message,
        teamId: this.teamId,
        orderId: orderData.shop_order_id
      })

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
            'Authorization': `Bearer ${this.accessToken}`,
            'X-TeamID': this.teamId
          },
          timeout: 30000
        }
      )

      return response.data.completed_orders || []

    } catch (error: any) {
      logger.error('Failed to get completed Sybka+ orders:', {
        error: error.message,
        teamId: this.teamId
      })
      return []
    }
  }

  /**
   * Check if order status should trigger invoice creation
   */
  shouldCreateInvoice(status: string, paymentStatus: string): boolean {
    return paymentStatus === 'PAID' && this.statusMapping.invoice_triggers.includes(status)
  }

  /**
   * Check if order status should trigger Sybka order creation
   */
  shouldCreateSybkaOrder(status: string, paymentStatus: string): boolean {
    return this.statusMapping.order_triggers.includes(paymentStatus)
  }

  /**
   * Get status mapping configuration
   */
  getStatusMapping(): SybkaStatusMapping {
    return this.statusMapping
  }

  /**
   * Update status mapping (för framtida konfiguration)
   */
  updateStatusMapping(mapping: Partial<SybkaStatusMapping>): void {
    this.statusMapping = { ...this.statusMapping, ...mapping }
    logger.info('Sybka status mapping updated', {
      teamId: this.teamId,
      mapping: this.statusMapping
    })
  }

  /**
   * Test connection to Sybka+ service
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.baseUrl}/api/sybka/test`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'X-TeamID': this.teamId
        },
        timeout: 10000
      })
      
      logger.info('Sybka+ connection test successful', {
        teamId: this.teamId,
        status: response.status
      })
      return response.status === 200
    } catch (error: any) {
      logger.error('Sybka+ connection test failed:', {
        error: error.message,
        teamId: this.teamId
      })
      return false
    }
  }
}

export const sybkaService = new SybkaService() 