import { PrismaClient, SubscriptionStatus, InvoiceStatus, AddOnOrderStatus } from '@prisma/client'
import { vivaWalletService } from './vivaWalletService'
import { logger } from '../utils/logger'
import { addDays, addMonths, addYears } from 'date-fns'

const prisma = new PrismaClient()

interface CreateSubscriptionParams {
  userId: string
  planId: string
  paymentMethodId?: string
  trialDays?: number
}

interface SubscriptionPlanData {
  name: string
  description?: string
  price: number
  currency?: string
  interval: 'monthly' | 'quarterly' | 'yearly'
  intervalCount?: number
  trialDays?: number
  features?: string[]
}

export class SubscriptionService {
  /**
   * Create a new subscription plan
   */
  async createSubscriptionPlan(data: SubscriptionPlanData) {
    try {
      const plan = await prisma.subscriptionPlan.create({
        data: {
          name: data.name,
          description: data.description,
          price: data.price,
          currency: data.currency || 'SEK',
          interval: data.interval,
          intervalCount: data.intervalCount || 1,
          trialDays: data.trialDays || 0,
          features: data.features || []
        }
      })

      logger.info('Subscription plan created', { planId: plan.id, name: plan.name })
      return plan
    } catch (error: any) {
      logger.error('Failed to create subscription plan', { error: error.message })
      throw new Error(`Failed to create subscription plan: ${error.message}`)
    }
  }

  /**
   * Create a new subscription for a user
   */
  async createSubscription(params: CreateSubscriptionParams) {
    try {
      const plan = await prisma.subscriptionPlan.findUnique({
        where: { id: params.planId }
      })

      if (!plan) {
        throw new Error('Subscription plan not found')
      }

      const user = await prisma.user.findUnique({
        where: { id: params.userId }
      })

      if (!user) {
        throw new Error('User not found')
      }

      const now = new Date()
      let currentPeriodStart = now
      let currentPeriodEnd = this.calculateNextBillingDate(now, plan.interval, plan.intervalCount)
      let trialStart = null
      let trialEnd = null
      let status: SubscriptionStatus = SubscriptionStatus.ACTIVE

      // Handle trial period
      if (plan.trialDays && plan.trialDays > 0) {
        trialStart = now
        trialEnd = addDays(now, plan.trialDays)
        currentPeriodStart = trialEnd
        currentPeriodEnd = this.calculateNextBillingDate(trialEnd, plan.interval, plan.intervalCount)
        status = SubscriptionStatus.TRIALING
      }

      const subscription = await prisma.subscription.create({
        data: {
          userId: params.userId,
          planId: params.planId,
          status,
          currentPeriodStart,
          currentPeriodEnd,
          trialStart,
          trialEnd,
          vivaPaymentMethodId: params.paymentMethodId
        },
        include: {
          plan: true,
          user: true
        }
      })

      // Create initial invoice if not in trial
      if (status === SubscriptionStatus.ACTIVE) {
        await this.createInvoice(subscription.id, plan.price, currentPeriodEnd)
      }

      logger.info('Subscription created', { 
        subscriptionId: subscription.id,
        userId: params.userId,
        planId: params.planId,
        status 
      })

      return subscription
    } catch (error: any) {
      logger.error('Failed to create subscription', { error: error.message })
      throw new Error(`Failed to create subscription: ${error.message}`)
    }
  }

  /**
   * Process subscription renewal
   */
  async processSubscriptionRenewal(subscriptionId: string) {
    try {
      const subscription = await prisma.subscription.findUnique({
        where: { id: subscriptionId },
        include: { plan: true, user: true }
      })

      if (!subscription) {
        throw new Error('Subscription not found')
      }

      if (subscription.status === SubscriptionStatus.CANCELED) {
        logger.info('Skipping renewal for canceled subscription', { subscriptionId })
        return
      }

      // Create Viva Wallet payment order
      const vivaOrder = await vivaWalletService.createSubscriptionOrder({
        amount: subscription.plan.price,
        currency: subscription.plan.currency,
        customerEmail: subscription.user.email,
        customerName: `${subscription.user.firstName} ${subscription.user.lastName}`,
        customerPhone: subscription.user.phone || undefined,
        description: `${subscription.plan.name} - Renewal`,
        allowRecurring: true
      })

      // Create invoice
      const invoice = await this.createInvoice(
        subscriptionId,
        subscription.plan.price,
        subscription.currentPeriodEnd,
        vivaOrder.orderCode.toString()
      )

      // If we have a saved payment method, try to charge it automatically
      if (subscription.vivaPaymentMethodId) {
        try {
          const recurringPayment = await vivaWalletService.createRecurringPayment({
            originalOrderCode: parseInt(subscription.vivaPaymentMethodId),
            amount: subscription.plan.price,
            currency: subscription.plan.currency,
            description: `${subscription.plan.name} - Renewal`
          })

          // Update invoice with payment info
          await prisma.invoice.update({
            where: { id: invoice.id },
            data: {
              vivaOrderId: recurringPayment.orderCode.toString(),
              status: InvoiceStatus.PENDING
            }
          })

          logger.info('Recurring payment initiated', { 
            subscriptionId,
            invoiceId: invoice.id,
            orderCode: recurringPayment.orderCode 
          })

        } catch (paymentError: any) {
          logger.error('Failed to process recurring payment', { 
            subscriptionId,
            error: paymentError.message 
          })
          
          // Mark subscription as past due
          await prisma.subscription.update({
            where: { id: subscriptionId },
            data: { status: SubscriptionStatus.PAST_DUE }
          })
        }
      }

      return invoice
    } catch (error: any) {
      logger.error('Failed to process subscription renewal', { 
        subscriptionId,
        error: error.message 
      })
      throw new Error(`Failed to process renewal: ${error.message}`)
    }
  }

  /**
   * Cancel a subscription
   */
  async cancelSubscription(subscriptionId: string, cancelAtPeriodEnd: boolean = true) {
    try {
      const updateData: any = {
        canceledAt: new Date()
      }

      if (cancelAtPeriodEnd) {
        updateData.cancelAtPeriodEnd = true
      } else {
        updateData.status = SubscriptionStatus.CANCELED
      }

      const subscription = await prisma.subscription.update({
        where: { id: subscriptionId },
        data: updateData,
        include: { plan: true }
      })

      // Cancel recurring payments in Viva Wallet if immediate cancellation
      if (!cancelAtPeriodEnd && subscription.vivaPaymentMethodId) {
        await vivaWalletService.cancelRecurringPayment(
          parseInt(subscription.vivaPaymentMethodId)
        )
      }

      logger.info('Subscription canceled', { 
        subscriptionId,
        cancelAtPeriodEnd,
        status: subscription.status 
      })

      return subscription
    } catch (error: any) {
      logger.error('Failed to cancel subscription', { 
        subscriptionId,
        error: error.message 
      })
      throw new Error(`Failed to cancel subscription: ${error.message}`)
    }
  }

  /**
   * Get user subscriptions
   */
  async getUserSubscriptions(userId: string) {
    try {
      const subscriptions = await prisma.subscription.findMany({
        where: { userId },
        include: {
          plan: true,
          invoices: {
            orderBy: { createdAt: 'desc' },
            take: 5
          }
        },
        orderBy: { createdAt: 'desc' }
      })

      return subscriptions
    } catch (error: any) {
      logger.error('Failed to get user subscriptions', { userId, error: error.message })
      throw new Error(`Failed to get subscriptions: ${error.message}`)
    }
  }

  /**
   * Get all subscription plans
   */
  async getSubscriptionPlans() {
    try {
      const plans = await prisma.subscriptionPlan.findMany({
        where: { isActive: true },
        orderBy: { price: 'asc' }
      })

      return plans
    } catch (error: any) {
      logger.error('Failed to get subscription plans', { error: error.message })
      throw new Error(`Failed to get subscription plans: ${error.message}`)
    }
  }

  /**
   * Create an invoice for a subscription
   */
  private async createInvoice(
    subscriptionId: string,
    amount: number,
    dueDate: Date,
    vivaOrderId?: string
  ) {
    try {
      const invoice = await prisma.invoice.create({
        data: {
          subscriptionId,
          amount,
          currency: 'SEK',
          status: InvoiceStatus.PENDING,
          dueDate,
          vivaOrderId
        }
      })

      return invoice
    } catch (error: any) {
      logger.error('Failed to create invoice', { 
        subscriptionId,
        error: error.message 
      })
      throw new Error(`Failed to create invoice: ${error.message}`)
    }
  }

  /**
   * Calculate next billing date based on interval
   */
  private calculateNextBillingDate(
    startDate: Date,
    interval: string,
    intervalCount: number
  ): Date {
    switch (interval) {
      case 'monthly':
        return addMonths(startDate, intervalCount)
      case 'quarterly':
        return addMonths(startDate, intervalCount * 3)
      case 'yearly':
        return addYears(startDate, intervalCount)
      default:
        return addMonths(startDate, 1) // Default to monthly
    }
  }

  /**
   * Process payment webhook from Viva Wallet
   */
  async processPaymentWebhook(orderCode: string, status: string) {
    try {
      // Find invoice by Viva order ID
      const invoice = await prisma.invoice.findFirst({
        where: { vivaOrderId: orderCode },
        include: { 
          subscription: {
            include: { plan: true }
          }
        }
      })

      if (!invoice) {
        logger.warn('Invoice not found for Viva order', { orderCode })
        return
      }

      if (status === 'completed' || status === 'captured') {
        // Payment successful
        await prisma.invoice.update({
          where: { id: invoice.id },
          data: {
            status: InvoiceStatus.PAID,
            paidAt: new Date()
          }
        })

        // Update subscription status and period
        const nextPeriodEnd = this.calculateNextBillingDate(
          invoice.subscription.currentPeriodEnd,
          invoice.subscription.plan.interval,
          invoice.subscription.plan.intervalCount
        )

        await prisma.subscription.update({
          where: { id: invoice.subscriptionId },
          data: {
            status: SubscriptionStatus.ACTIVE,
            currentPeriodStart: invoice.subscription.currentPeriodEnd,
            currentPeriodEnd: nextPeriodEnd
          }
        })

        logger.info('Subscription payment processed successfully', { 
          invoiceId: invoice.id,
          subscriptionId: invoice.subscriptionId 
        })

      } else if (status === 'failed' || status === 'declined') {
        // Payment failed
        await prisma.invoice.update({
          where: { id: invoice.id },
          data: { status: InvoiceStatus.FAILED }
        })

        await prisma.subscription.update({
          where: { id: invoice.subscriptionId },
          data: { status: SubscriptionStatus.PAST_DUE }
        })

        logger.warn('Subscription payment failed', { 
          invoiceId: invoice.id,
          subscriptionId: invoice.subscriptionId 
        })
      }

    } catch (error: any) {
      logger.error('Failed to process payment webhook', { 
        orderCode,
        error: error.message 
      })
    }
  }

  /**
   * Pause a subscription for 1-3 months
   */
  async pauseSubscription(subscriptionId: string, pauseMonths: number, reason?: string) {
    try {
      if (pauseMonths < 1 || pauseMonths > 3) {
        throw new Error('Pause duration must be between 1-3 months')
      }

      const subscription = await prisma.subscription.findUnique({
        where: { id: subscriptionId },
        include: { plan: true }
      })

      if (!subscription) {
        throw new Error('Subscription not found')
      }

      if (subscription.status !== SubscriptionStatus.ACTIVE) {
        throw new Error('Only active subscriptions can be paused')
      }

      const pausedAt = new Date()
      const pausedUntil = addMonths(pausedAt, pauseMonths)

      const updatedSubscription = await prisma.subscription.update({
        where: { id: subscriptionId },
        data: {
          status: SubscriptionStatus.PAUSED,
          pausedAt,
          pausedUntil,
          pauseReason: reason,
          // Extend current period by pause duration
          currentPeriodEnd: addMonths(subscription.currentPeriodEnd, pauseMonths)
        },
        include: { plan: true }
      })

      logger.info('Subscription paused', {
        subscriptionId,
        pauseMonths,
        pausedUntil,
        reason
      })

      return updatedSubscription
    } catch (error: any) {
      logger.error('Failed to pause subscription', {
        subscriptionId,
        error: error.message
      })
      throw new Error(`Failed to pause subscription: ${error.message}`)
    }
  }

  /**
   * Resume a paused subscription
   */
  async resumeSubscription(subscriptionId: string) {
    try {
      const subscription = await prisma.subscription.findUnique({
        where: { id: subscriptionId },
        include: { plan: true }
      })

      if (!subscription) {
        throw new Error('Subscription not found')
      }

      if (subscription.status !== SubscriptionStatus.PAUSED) {
        throw new Error('Only paused subscriptions can be resumed')
      }

      const updatedSubscription = await prisma.subscription.update({
        where: { id: subscriptionId },
        data: {
          status: SubscriptionStatus.ACTIVE,
          pausedAt: null,
          pausedUntil: null,
          pauseReason: null
        },
        include: { plan: true }
      })

      logger.info('Subscription resumed', { subscriptionId })

      return updatedSubscription
    } catch (error: any) {
      logger.error('Failed to resume subscription', {
        subscriptionId,
        error: error.message
      })
      throw new Error(`Failed to resume subscription: ${error.message}`)
    }
  }

  /**
   * Change subscription delivery frequency
   */
  async changeSubscriptionFrequency(
    subscriptionId: string,
    newInterval: 'monthly' | 'quarterly' | 'yearly',
    newIntervalCount: number = 1
  ) {
    try {
      const subscription = await prisma.subscription.findUnique({
        where: { id: subscriptionId },
        include: { plan: true }
      })

      if (!subscription) {
        throw new Error('Subscription not found')
      }

      if (subscription.status === SubscriptionStatus.CANCELED) {
        throw new Error('Cannot change frequency of canceled subscription')
      }

      // Calculate new period end based on new frequency
      const currentPeriodStart = subscription.currentPeriodStart
      const newPeriodEnd = this.calculateNextBillingDate(
        currentPeriodStart,
        newInterval,
        newIntervalCount
      )

      const updatedSubscription = await prisma.subscription.update({
        where: { id: subscriptionId },
        data: {
          customInterval: newInterval,
          customIntervalCount: newIntervalCount,
          currentPeriodEnd: newPeriodEnd
        },
        include: { plan: true }
      })

      logger.info('Subscription frequency changed', {
        subscriptionId,
        oldInterval: subscription.plan.interval,
        oldIntervalCount: subscription.plan.intervalCount,
        newInterval,
        newIntervalCount
      })

      return updatedSubscription
    } catch (error: any) {
      logger.error('Failed to change subscription frequency', {
        subscriptionId,
        error: error.message
      })
      throw new Error(`Failed to change frequency: ${error.message}`)
    }
  }

  /**
   * Add extra product to subscription with subscriber discount
   */
  async addSubscriptionProduct(
    subscriptionId: string,
    productId: string,
    quantity: number = 1,
    discountPercent: number = 15 // Default 15% subscriber discount
  ) {
    try {
      const subscription = await prisma.subscription.findUnique({
        where: { id: subscriptionId },
        include: { plan: true }
      })

      if (!subscription) {
        throw new Error('Subscription not found')
      }

      if (subscription.status !== SubscriptionStatus.ACTIVE) {
        throw new Error('Only active subscriptions can add products')
      }

      const product = await prisma.product.findUnique({
        where: { id: productId }
      })

      if (!product) {
        throw new Error('Product not found')
      }

      if (!product.isActive) {
        throw new Error('Product is not available')
      }

      const originalPrice = product.price
      const discountAmount = (originalPrice * discountPercent) / 100
      const finalPrice = originalPrice - discountAmount

      const addOnOrder = await prisma.subscriptionAddOn.create({
        data: {
          subscriptionId,
          productId,
          quantity,
          originalPrice,
          discountPercent,
          finalPrice: finalPrice * quantity
        },
        include: {
          product: true,
          subscription: {
            include: { plan: true, user: true }
          }
        }
      })

      // Create payment order for the add-on
      const vivaOrder = await vivaWalletService.createSubscriptionOrder({
        amount: addOnOrder.finalPrice,
        currency: 'SEK',
        customerEmail: addOnOrder.subscription.user.email,
        customerName: `${addOnOrder.subscription.user.firstName} ${addOnOrder.subscription.user.lastName}`,
        customerPhone: addOnOrder.subscription.user.phone || undefined,
        description: `Add-on: ${product.name} (${discountPercent}% subscriber discount)`,
        allowRecurring: false
      })

      logger.info('Subscription add-on product created', {
        subscriptionId,
        productId,
        quantity,
        originalPrice,
        finalPrice: addOnOrder.finalPrice,
        discountPercent,
        orderCode: vivaOrder.orderCode
      })

      return {
        addOnOrder,
        paymentUrl: vivaWalletService.getPaymentUrl(vivaOrder.orderCode)
      }
    } catch (error: any) {
      logger.error('Failed to add subscription product', {
        subscriptionId,
        productId,
        error: error.message
      })
      throw new Error(`Failed to add product: ${error.message}`)
    }
  }

  /**
   * Get subscription add-on orders
   */
  async getSubscriptionAddOns(subscriptionId: string) {
    try {
      const addOns = await prisma.subscriptionAddOn.findMany({
        where: { subscriptionId },
        include: { product: true },
        orderBy: { orderedAt: 'desc' }
      })

      return addOns
    } catch (error: any) {
      logger.error('Failed to get subscription add-ons', {
        subscriptionId,
        error: error.message
      })
      throw new Error(`Failed to get add-ons: ${error.message}`)
    }
  }

  /**
   * Get effective billing interval for subscription (considering custom frequency)
   */
  private getEffectiveInterval(subscription: any): { interval: string; intervalCount: number } {
    return {
      interval: subscription.customInterval || subscription.plan.interval,
      intervalCount: subscription.customIntervalCount || subscription.plan.intervalCount
    }
  }

  /**
   * Check if subscription should be automatically resumed from pause
   */
  async checkAndResumeExpiredPauses() {
    try {
      const now = new Date()
      const expiredPauses = await prisma.subscription.findMany({
        where: {
          status: SubscriptionStatus.PAUSED,
          pausedUntil: {
            lte: now
          }
        },
        include: { plan: true }
      })

      for (const subscription of expiredPauses) {
        await this.resumeSubscription(subscription.id)
        logger.info('Auto-resumed subscription from expired pause', {
          subscriptionId: subscription.id
        })
      }

      return expiredPauses.length
    } catch (error: any) {
      logger.error('Failed to check expired pauses', { error: error.message })
      return 0
    }
  }
}

export const subscriptionService = new SubscriptionService() 