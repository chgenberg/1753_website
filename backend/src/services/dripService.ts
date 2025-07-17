import axios, { AxiosResponse } from 'axios'
import { logger } from '../utils/logger'

interface DripSubscriber {
  email: string
  first_name?: string
  last_name?: string
  custom_fields?: {
    skin_type?: string
    skin_concerns?: string[]
    source?: string
    interests?: string
  }
  tags?: string[]
}

interface DripResponse {
  subscribers: Array<{
    id: string
    email: string
    status: string
  }>
}

class DripService {
  private apiToken: string
  private accountId: string
  private baseUrl: string

  constructor() {
    this.apiToken = process.env.DRIP_API_TOKEN || ''
    this.accountId = process.env.DRIP_ACCOUNT_ID || ''
    this.baseUrl = `https://api.getdrip.com/v2/${this.accountId}`

    if (!this.apiToken || !this.accountId) {
      logger.warn('Drip API credentials not configured')
    }
  }

  /**
   * Subscribe user to newsletter
   */
  async subscribeUser(subscriberData: DripSubscriber): Promise<boolean> {
    if (!this.apiToken || !this.accountId) {
      logger.error('Drip API not configured')
      return false
    }

    try {
      const response: AxiosResponse<DripResponse> = await axios.post(
        `${this.baseUrl}/subscribers`,
        {
          subscribers: [
            {
              email: subscriberData.email,
              first_name: subscriberData.first_name,
              last_name: subscriberData.last_name,
              custom_fields: {
                skin_type: subscriberData.custom_fields?.skin_type,
                skin_concerns: subscriberData.custom_fields?.skin_concerns?.join(', '),
                source: subscriberData.custom_fields?.source || 'website',
                subscribed_at: new Date().toISOString()
              },
              tags: subscriberData.tags || ['Website Signup']
            }
          ]
        },
        {
          headers: {
            'Authorization': `Basic ${Buffer.from(this.apiToken + ':').toString('base64')}`,
            'Content-Type': 'application/json',
            'User-Agent': '1753 Skincare Website'
          }
        }
      )

      if (response.status === 200 || response.status === 201) {
        logger.info(`Successfully subscribed ${subscriberData.email} to Drip`)
        return true
      } else {
        logger.error(`Failed to subscribe to Drip: ${response.status}`)
        return false
      }
    } catch (error: any) {
      logger.error('Error subscribing to Drip:', {
        error: error.message,
        email: subscriberData.email
      })
      return false
    }
  }

  /**
   * Unsubscribe user from newsletter
   */
  async unsubscribeUser(email: string): Promise<boolean> {
    if (!this.apiToken || !this.accountId) {
      logger.error('Drip API not configured')
      return false
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/subscribers/${email}/unsubscribe`,
        {},
        {
          headers: {
            'Authorization': `Basic ${Buffer.from(this.apiToken + ':').toString('base64')}`,
            'Content-Type': 'application/json'
          }
        }
      )

      if (response.status === 200 || response.status === 204) {
        logger.info(`Successfully unsubscribed ${email} from Drip`)
        return true
      } else {
        logger.error(`Failed to unsubscribe from Drip: ${response.status}`)
        return false
      }
    } catch (error: any) {
      logger.error('Error unsubscribing from Drip:', {
        error: error.message,
        email
      })
      return false
    }
  }

  /**
   * Add tags to subscriber
   */
  async addTagsToSubscriber(email: string, tags: string[]): Promise<boolean> {
    if (!this.apiToken || !this.accountId) {
      logger.error('Drip API not configured')
      return false
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/subscribers/${email}/tags`,
        {
          tags: tags
        },
        {
          headers: {
            'Authorization': `Basic ${Buffer.from(this.apiToken + ':').toString('base64')}`,
            'Content-Type': 'application/json'
          }
        }
      )

      if (response.status === 200 || response.status === 201) {
        logger.info(`Successfully added tags to ${email}:`, tags)
        return true
      } else {
        logger.error(`Failed to add tags in Drip: ${response.status}`)
        return false
      }
    } catch (error: any) {
      logger.error('Error adding tags in Drip:', {
        error: error.message,
        email,
        tags
      })
      return false
    }
  }

  /**
   * Trigger workflow/campaign for subscriber
   */
  async triggerWorkflow(email: string, workflowId: string, customFields?: Record<string, any>): Promise<boolean> {
    if (!this.apiToken || !this.accountId) {
      logger.error('Drip API not configured')
      return false
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/workflows/${workflowId}/subscribers`,
        {
          subscribers: [
            {
              email,
              custom_fields: customFields || {}
            }
          ]
        },
        {
          headers: {
            'Authorization': `Basic ${Buffer.from(this.apiToken + ':').toString('base64')}`,
            'Content-Type': 'application/json'
          }
        }
      )

      if (response.status === 200 || response.status === 201) {
        logger.info(`Successfully triggered workflow ${workflowId} for ${email}`)
        return true
      } else {
        logger.error(`Failed to trigger workflow in Drip: ${response.status}`)
        return false
      }
    } catch (error: any) {
      logger.error('Error triggering workflow in Drip:', {
        error: error.message,
        email,
        workflowId
      })
      return false
    }
  }

  /**
   * Test API connection
   */
  async testConnection(): Promise<boolean> {
    if (!this.apiToken || !this.accountId) {
      return false
    }

    try {
      const response = await axios.get(
        `${this.baseUrl}/subscribers`,
        {
          headers: {
            'Authorization': `Basic ${Buffer.from(this.apiToken + ':').toString('base64')}`,
            'Content-Type': 'application/json'
          },
          params: {
            per_page: 1
          }
        }
      )

      return response.status === 200
    } catch (error) {
      logger.error('Drip connection test failed:', error)
      return false
    }
  }
}

export const dripService = new DripService()

// Helper functions for common use cases
export const subscribeToNewsletter = async (
  email: string, 
  firstName?: string, 
  lastName?: string,
  skinType?: string,
  skinConcerns?: string[]
) => {
  return await dripService.subscribeUser({
    email,
    first_name: firstName,
    last_name: lastName,
    custom_fields: {
      skin_type: skinType,
      skin_concerns: skinConcerns,
      source: 'website_newsletter'
    },
    tags: ['Newsletter Signup']
  })
}

export const subscribeNewCustomer = async (
  email: string,
  firstName: string,
  lastName: string,
  skinType?: string
) => {
  return await dripService.subscribeUser({
    email,
    first_name: firstName,
    last_name: lastName,
    custom_fields: {
      skin_type: skinType,
      source: 'customer_registration'
    },
    tags: ['New Customer']
  })
}

export const triggerOrderConfirmation = async (
  email: string,
  orderData: {
    orderNumber: string
    total: number
    currency: string
    products: string[]
  }
) => {
  // Anpassa workflowId efter era Drip-workflows
  const workflowId = process.env.DRIP_ORDER_CONFIRMATION_WORKFLOW_ID || ''
  
  if (!workflowId) {
    logger.warn('Drip order confirmation workflow not configured')
    return false
  }

  return await dripService.triggerWorkflow(email, workflowId, {
    order_number: orderData.orderNumber,
    order_total: orderData.total,
    order_currency: orderData.currency,
    order_products: orderData.products.join(', ')
  })
}

export default dripService 