import { Request, Response } from 'express'
import { prisma } from '../lib/prisma'
import { logger } from '../utils/logger'
import { vivaWalletService } from '../services/vivaWalletService'
import { Prisma } from '@prisma/client'

interface AdminRequest extends Request {
  userId?: string
  user?: any
}

// Get all orders with pagination and filters
export const getAllOrders = async (req: AdminRequest, res: Response) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      paymentStatus,
      fulfillmentStatus,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query

    const skip = (Number(page) - 1) * Number(limit)
    const take = Number(limit)

    // Build where clause
    const where: Prisma.OrderWhereInput = {}

    if (status) {
      where.status = status as any
    }

    if (paymentStatus) {
      where.paymentStatus = paymentStatus as any
    }

    if (fulfillmentStatus) {
      where.fulfillmentStatus = fulfillmentStatus as any
    }

    if (search) {
      where.OR = [
        { orderNumber: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } },
        { customerName: { contains: search as string, mode: 'insensitive' } },
        { phone: { contains: search as string, mode: 'insensitive' } }
      ]
    }

    // Get orders with related data
    const [orders, totalCount] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take,
        orderBy: { [sortBy as string]: sortOrder },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          },
          items: {
            include: {
              product: {
                select: {
                  name: true,
                  slug: true,
                  images: true,
                  price: true
                }
              }
            }
          },
          discounts: {
            include: {
              discount: {
                select: {
                  code: true,
                  type: true
                }
              }
            }
          }
        }
      }),
      prisma.order.count({ where })
    ])

    const totalPages = Math.ceil(totalCount / take)

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          currentPage: Number(page),
          totalPages,
          totalCount,
          hasNextPage: Number(page) < totalPages,
          hasPrevPage: Number(page) > 1
        }
      }
    })

  } catch (error) {
    logger.error('Get all orders error:', error)
    res.status(500).json({
      success: false,
      message: 'Ett fel uppstod vid hämtning av orders'
    })
  }
}

// Get single order by ID
export const getOrderById = async (req: AdminRequest, res: Response) => {
  try {
    const { orderId } = req.params

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        },
        items: {
          include: {
            product: {
              select: {
                name: true,
                slug: true,
                images: true,
                price: true,
                sku: true
              }
            }
          }
        },
        discounts: {
          include: {
            discount: {
              select: {
                code: true,
                type: true,
                value: true
              }
            }
          }
        }
      }
    })

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order hittades inte'
      })
    }

    res.json({
      success: true,
      data: order
    })

  } catch (error) {
    logger.error('Get order by ID error:', error)
    res.status(500).json({
      success: false,
      message: 'Ett fel uppstod vid hämtning av order'
    })
  }
}

// Update order status
export const updateOrderStatus = async (req: AdminRequest, res: Response) => {
  try {
    const { orderId } = req.params
    const { status, paymentStatus, fulfillmentStatus, internalNotes, trackingNumber, trackingCompany } = req.body

    const updateData: Prisma.OrderUpdateInput = {}

    if (status) updateData.status = status
    if (paymentStatus) updateData.paymentStatus = paymentStatus
    if (fulfillmentStatus) updateData.fulfillmentStatus = fulfillmentStatus
    if (internalNotes !== undefined) updateData.internalNotes = internalNotes
    if (trackingNumber !== undefined) updateData.trackingNumber = trackingNumber
    if (trackingCompany !== undefined) updateData.trackingCompany = trackingCompany

    // Set shipped date if status is SHIPPED
    if (status === 'SHIPPED' && !trackingNumber) {
      updateData.shippedAt = new Date()
    }

    // Set delivered date if status is DELIVERED
    if (status === 'DELIVERED') {
      updateData.deliveredAt = new Date()
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: updateData,
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        },
        items: {
          include: {
            product: {
              select: {
                name: true
              }
            }
          }
        }
      }
    })

    logger.info(`Order ${orderId} updated by admin ${req.user?.email}`, {
      orderId,
      changes: updateData,
      adminId: req.userId
    })

    // Trigga webhook för statusändring om status eller paymentStatus ändrades
    if (status || paymentStatus) {
      try {
        const axios = require('axios')
        await axios.post(`${process.env.API_BASE_URL || 'http://localhost:5002'}/api/webhooks/order-status-change`, {
          orderId,
          status: status || updatedOrder.status,
          paymentStatus: paymentStatus || updatedOrder.paymentStatus
        }, {
          timeout: 5000,
          headers: {
            'Content-Type': 'application/json'
          }
        })

        logger.info('Order status change webhook triggered', {
          orderId,
          status: status || updatedOrder.status,
          paymentStatus: paymentStatus || updatedOrder.paymentStatus
        })
      } catch (webhookError) {
        logger.error('Failed to trigger order status change webhook:', {
          orderId,
          error: webhookError instanceof Error ? webhookError.message : 'Unknown error'
        })
        // Fortsätt trots webhook-fel
      }
    }

    res.json({
      success: true,
      message: 'Order uppdaterad',
      data: updatedOrder
    })

  } catch (error) {
    logger.error('Update order status error:', error)
    res.status(500).json({
      success: false,
      message: 'Ett fel uppstod vid uppdatering av order'
    })
  }
}

// Process refund
export const processRefund = async (req: AdminRequest, res: Response) => {
  try {
    const { orderId } = req.params
    const { amount, reason, refundShipping = false } = req.body

    // Get order details
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        },
        items: {
          include: {
            product: {
              select: {
                name: true
              }
            }
          }
        }
      }
    })

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order hittades inte'
      })
    }

    if (order.paymentStatus !== 'PAID') {
      return res.status(400).json({
        success: false,
        message: 'Kan endast återbetala betalda orders'
      })
    }

    if (!order.transactionId) {
      return res.status(400).json({
        success: false,
        message: 'Inget transaktions-ID hittades för denna order'
      })
    }

    // Calculate refund amount
    let refundAmount = amount ? Number(amount) : order.totalAmount
    
    if (refundShipping) {
      refundAmount += order.shippingAmount
    }

    // Process refund with Viva Wallet
    const refundSuccess = await vivaWalletService.refundPayment(
      order.transactionId,
      refundAmount
    )

    if (!refundSuccess) {
      return res.status(500).json({
        success: false,
        message: 'Återbetalning misslyckades hos betalningsleverantören'
      })
    }

    // Update order status
    const isFullRefund = refundAmount >= order.totalAmount
    const newPaymentStatus = isFullRefund ? 'REFUNDED' : 'PARTIALLY_REFUNDED'
    const newOrderStatus = isFullRefund ? 'REFUNDED' : order.status

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: newPaymentStatus,
        status: newOrderStatus,
        internalNotes: order.internalNotes 
          ? `${order.internalNotes}\n\nÅterbetalning: ${refundAmount} SEK - ${reason || 'Ingen anledning angiven'} (Admin: ${req.user?.email})`
          : `Återbetalning: ${refundAmount} SEK - ${reason || 'Ingen anledning angiven'} (Admin: ${req.user?.email})`
      }
    })

    logger.info(`Refund processed for order ${orderId}`, {
      orderId,
      refundAmount,
      reason,
      adminId: req.userId,
      adminEmail: req.user?.email,
      customerEmail: order.email
    })

    res.json({
      success: true,
      message: `Återbetalning på ${refundAmount} SEK genomförd`,
      data: {
        order: updatedOrder,
        refundAmount,
        isFullRefund
      }
    })

  } catch (error) {
    logger.error('Process refund error:', error)
    res.status(500).json({
      success: false,
      message: 'Ett fel uppstod vid återbetalning'
    })
  }
}

// Get order statistics
export const getOrderStatistics = async (req: AdminRequest, res: Response) => {
  try {
    const { period = '30' } = req.query
    const daysBack = Number(period)
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - daysBack)

    const [
      totalOrders,
      totalRevenue,
      pendingOrders,
      shippedOrders,
      refundedOrders,
      recentOrders
    ] = await Promise.all([
      // Total orders in period
      prisma.order.count({
        where: {
          createdAt: { gte: startDate }
        }
      }),
      
      // Total revenue in period
      prisma.order.aggregate({
        where: {
          createdAt: { gte: startDate },
          paymentStatus: 'PAID'
        },
        _sum: { totalAmount: true }
      }),
      
      // Pending orders
      prisma.order.count({
        where: {
          status: 'PENDING',
          createdAt: { gte: startDate }
        }
      }),
      
      // Shipped orders
      prisma.order.count({
        where: {
          status: 'SHIPPED',
          createdAt: { gte: startDate }
        }
      }),
      
      // Refunded orders
      prisma.order.count({
        where: {
          paymentStatus: { in: ['REFUNDED', 'PARTIALLY_REFUNDED'] },
          createdAt: { gte: startDate }
        }
      }),
      
      // Recent orders
      prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          orderNumber: true,
          email: true,
          totalAmount: true,
          status: true,
          paymentStatus: true,
          createdAt: true
        }
      })
    ])

    res.json({
      success: true,
      data: {
        period: daysBack,
        statistics: {
          totalOrders,
          totalRevenue: totalRevenue._sum.totalAmount || 0,
          pendingOrders,
          shippedOrders,
          refundedOrders
        },
        recentOrders
      }
    })

  } catch (error) {
    logger.error('Get order statistics error:', error)
    res.status(500).json({
      success: false,
      message: 'Ett fel uppstod vid hämtning av statistik'
    })
  }
} 