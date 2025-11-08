import { logger } from '../utils/logger'
import { prisma } from '../lib/prisma'

/**
 * Interface for webhook processing results
 */
export interface WebhookProcessingResult {
  success: boolean
  orderId?: string
  orderNumber?: string
  fortnoxOrderNumber?: string
  error?: string
  retryable?: boolean
  timestamp: Date
}

/**
 * Enum for webhook event statuses
 */
export enum WebhookEventStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SUCCESS = 'SUCCESS',
  FAILED_RETRYABLE = 'FAILED_RETRYABLE',
  FAILED_PERMANENT = 'FAILED_PERMANENT'
}

/**
 * Helper to log webhook processing
 */
export async function logWebhookEvent(
  eventType: string,
  payload: any,
  status: WebhookEventStatus,
  result: WebhookProcessingResult,
  metadata?: Record<string, any>
): Promise<void> {
  try {
    const logEntry = {
      eventType,
      status,
      payload: JSON.stringify(payload).substring(0, 500), // Limit payload size
      result,
      metadata,
      processedAt: new Date()
    }

    logger.info(`Webhook event ${eventType} - ${status}`, logEntry)

    // Optional: Store in database for audit trail
    // await storeWebhookLog(logEntry)
  } catch (error) {
    logger.error('Failed to log webhook event:', error)
  }
}

/**
 * Determine if an error is retryable
 */
export function isRetryableError(error: any): boolean {
  // Network errors
  if (error.code === 'ECONNREFUSED' || error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT') {
    return true
  }

  // 5xx server errors
  if (error.response?.status >= 500 && error.response?.status <= 599) {
    return true
  }

  // Rate limiting
  if (error.response?.status === 429) {
    return true
  }

  // Specific Fortnox rate limit (429 Too Many Requests)
  if (error.response?.status === 429) {
    return true
  }

  return false
}

/**
 * Calculate exponential backoff delay
 */
export function getRetryDelay(retryCount: number, baseDelayMs = 1000): number {
  // Exponential backoff: 1s, 2s, 4s, 8s, 16s, etc. (max 5 minutes)
  const delay = Math.min(baseDelayMs * Math.pow(2, retryCount), 5 * 60 * 1000)
  // Add jitter (±20%)
  const jitter = delay * 0.2 * (Math.random() * 2 - 1)
  return Math.round(delay + jitter)
}

/**
 * Validate order exists and has correct payment status
 */
export async function validateOrderForPaymentProcessing(
  orderId?: string,
  orderNumber?: string,
  paymentOrderCode?: string
): Promise<{ valid: boolean; order?: any; error?: string }> {
  try {
    let order = null

    // Try to find by primary ID first
    if (orderId) {
      order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { items: { include: { product: true } } }
      })
    }

    // Fallback: Try by orderNumber
    if (!order && orderNumber) {
      order = await prisma.order.findFirst({
        where: { orderNumber },
        include: { items: { include: { product: true } } }
      })
    }

    // Fallback: Try by payment code
    if (!order && paymentOrderCode) {
      order = await prisma.order.findFirst({
        where: { 
          OR: [
            { paymentOrderCode },
            { paymentReference: paymentOrderCode }
          ]
        },
        include: { items: { include: { product: true } } }
      })
    }

    if (!order) {
      return {
        valid: false,
        error: `Order not found (searched: orderId=${orderId}, orderNumber=${orderNumber}, paymentOrderCode=${paymentOrderCode})`
      }
    }

    // Check if order is already processed
    if (order.paymentStatus === 'PAID' && order.status === 'CONFIRMED') {
      logger.warn('Order already processed', {
        orderId: order.id,
        orderNumber: order.orderNumber
      })
      // Return as valid but already processed (idempotent)
      return { valid: true, order }
    }

    return { valid: true, order }
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Validation failed'
    }
  }
}

/**
 * Safe order status update with error handling
 */
export async function safeUpdateOrderStatus(
  orderId: string,
  status: string,
  paymentStatus: string
): Promise<{ success: boolean; order?: any; error?: string }> {
  try {
    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        status,
        paymentStatus,
        updatedAt: new Date()
      },
      include: { items: { include: { product: true } } }
    })

    logger.info('Order status updated successfully', {
      orderId,
      orderNumber: order.orderNumber,
      status,
      paymentStatus
    })

    return { success: true, order }
  } catch (error) {
    logger.error('Failed to update order status:', {
      orderId,
      error: error instanceof Error ? error.message : 'Unknown error'
    })

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Update failed'
    }
  }
}

/**
 * Check if Fortnox integration can be processed (has valid credentials)
 */
export function canProcessFortnox(): boolean {
  const hasToken = !!process.env.FORTNOX_API_TOKEN
  const hasSecret = !!process.env.FORTNOX_CLIENT_SECRET
  const hasUrl = !!process.env.FORTNOX_BASE_URL

  if (!hasToken || !hasSecret || !hasUrl) {
    logger.warn('Fortnox integration not available - missing credentials', {
      hasToken,
      hasSecret,
      hasUrl
    })
    return false
  }

  return true
}

/**
 * Check if Ongoing integration can be processed (has valid credentials)
 */
export function canProcessOngoing(): boolean {
  const hasUsername = !!process.env.ONGOING_USERNAME
  const hasPassword = !!process.env.ONGOING_PASSWORD
  const hasGoodsOwnerId = !!process.env.ONGOING_GOODS_OWNER_ID

  if (!hasUsername || !hasPassword || !hasGoodsOwnerId) {
    logger.warn('Ongoing integration not available - missing credentials', {
      hasUsername,
      hasPassword,
      hasGoodsOwnerId
    })
    return false
  }

  return true
}

/**
 * Retry webhook processing with exponential backoff
 */
export async function retryWebhookProcessing(
  processingFn: () => Promise<any>,
  maxRetries = 3,
  initialDelayMs = 1000,
  operationName = 'webhook processing'
): Promise<{ success: boolean; result?: any; error?: string; retriesUsed: number }> {
  let lastError: Error | null = null
  let retriesUsed = 0

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      logger.info(`${operationName} - Attempt ${attempt + 1}/${maxRetries + 1}`)

      const result = await processingFn()

      if (attempt > 0) {
        logger.info(`${operationName} succeeded after ${attempt} retry(ies)`)
      }

      return { success: true, result, retriesUsed: attempt }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      if (!isRetryableError(error)) {
        logger.error(`${operationName} failed with non-retryable error:`, lastError.message)
        return {
          success: false,
          error: lastError.message,
          retriesUsed: attempt
        }
      }

      if (attempt < maxRetries) {
        const delayMs = getRetryDelay(attempt, initialDelayMs)
        logger.warn(`${operationName} failed (retryable) - Retrying in ${delayMs}ms`, {
          attempt,
          error: lastError.message
        })

        await new Promise(resolve => setTimeout(resolve, delayMs))
      }
    }
  }

  return {
    success: false,
    error: `${operationName} failed after ${maxRetries + 1} attempts: ${lastError?.message}`,
    retriesUsed: maxRetries + 1
  }
}

/**
 * Format webhook payload for logging (safe version)
 */
export function formatWebhookPayload(payload: any): any {
  try {
    // Create a copy to avoid modifying original
    const copy = JSON.parse(JSON.stringify(payload))

    // Remove sensitive fields
    if (copy.EventData) {
      if (copy.EventData.CardNumber) {
        copy.EventData.CardNumber = '****'
      }
      if (copy.EventData.CardToken) {
        copy.EventData.CardToken = '****'
      }
    }

    return copy
  } catch {
    return '[payload too complex to format]'
  }
}
