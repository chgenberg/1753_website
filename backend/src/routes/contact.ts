import express from 'express'
import { body, validationResult } from 'express-validator'
import { sendEmail } from '../services/emailService'
import { dripService } from '../services/dripService'
import { logger } from '../utils/logger'
import { prisma } from '../lib/prisma'
import { Router } from 'express'
import { z } from 'zod'

const router = Router()

const ContactSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  subject: z.string().min(1),
  message: z.string().min(10),
})

/**
 * Send contact form email
 * POST /api/contact/send
 */
router.post('/send', async (req, res, next) => {
  try {
    const parse = ContactSchema.safeParse(req.body)
    if (!parse.success) {
      return res.status(400).json({ success: false, message: 'Invalid input', issues: parse.error.issues })
    }
    const { name, email, subject, message } = parse.data
    const submission = await prisma.contactSubmission.create({ data: { name, email, subject, message } })
    res.json({ success: true, submissionId: submission.id })
  } catch (err) {
    next(err)
  }
})

/**
 * Get contact submissions for analysis
 * GET /api/contact/submissions
 */
router.get('/submissions', async (req, res) => {
  try {
    const { page = 1, limit = 50, status, category, search } = req.query

    const skip = (Number(page) - 1) * Number(limit)
    const take = Number(limit)

    // Build where clause
    const where: any = {}
    
    if (status) {
      where.status = status as string
    }
    
    if (category) {
      where.category = category as string
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } },
        { subject: { contains: search as string, mode: 'insensitive' } },
        { message: { contains: search as string, mode: 'insensitive' } }
      ]
    }

    const [submissions, total] = await Promise.all([
      prisma.contactSubmission.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        select: {
          id: true,
          name: true,
          email: true,
          subject: true,
          message: true,
          category: true,
          status: true,
          priority: true,
          tags: true,
          createdAt: true,
          respondedAt: true,
          responseTime: true
        }
      }),
      prisma.contactSubmission.count({ where })
    ])

    res.json({
      success: true,
      data: {
        submissions,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    })

  } catch (error: any) {
    logger.error('Error fetching contact submissions:', error)
    res.status(500).json({
      success: false,
      message: 'Kunde inte hämta kontaktmeddelanden'
    })
  }
})

/**
 * Get contact submission analytics
 * GET /api/contact/analytics
 */
router.get('/analytics', async (req, res) => {
  try {
    const { startDate, endDate } = req.query

    // Build date filter
    const dateFilter: any = {}
    if (startDate) {
      dateFilter.gte = new Date(startDate as string)
    }
    if (endDate) {
      dateFilter.lte = new Date(endDate as string)
    }

    const where = Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {}

    // Get analytics data
    const [
      totalSubmissions,
      categoryStats,
      statusStats,
      avgResponseTime,
      commonKeywords,
      recentTrends
    ] = await Promise.all([
      // Total submissions
      prisma.contactSubmission.count({ where }),
      
      // Category breakdown
      prisma.contactSubmission.groupBy({
        by: ['category'],
        where,
        _count: { category: true },
        orderBy: { _count: { category: 'desc' } }
      }),
      
      // Status breakdown
      prisma.contactSubmission.groupBy({
        by: ['status'],
        where,
        _count: { status: true }
      }),
      
      // Average response time
      prisma.contactSubmission.aggregate({
        where: { ...where, responseTime: { not: null } },
        _avg: { responseTime: true }
      }),
      
      // Most common words in subjects/messages (simplified)
      prisma.contactSubmission.findMany({
        where,
        select: { subject: true, message: true },
        take: 100
      }),
      
      // Recent trend (last 30 days by day)
      prisma.$queryRaw`
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as count,
          category
        FROM contact_submissions 
        WHERE created_at >= NOW() - INTERVAL '30 days'
        GROUP BY DATE(created_at), category
        ORDER BY date DESC
      `
    ])

    // Process keywords from subjects and messages
    const keywordCounts: Record<string, number> = {}
    commonKeywords.forEach(submission => {
      const text = `${submission.subject} ${submission.message}`.toLowerCase()
      const words = text.match(/\b\w{4,}\b/g) || [] // Words 4+ characters
      words.forEach(word => {
        if (!['detta', 'vara', 'finns', 'kommer', 'skulle', 'kanske'].includes(word)) {
          keywordCounts[word] = (keywordCounts[word] || 0) + 1
        }
      })
    })

    const topKeywords = Object.entries(keywordCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 20)
      .map(([word, count]) => ({ word, count }))

    res.json({
      success: true,
      data: {
        overview: {
          totalSubmissions,
          avgResponseTimeMinutes: Math.round(avgResponseTime._avg.responseTime || 0)
        },
        breakdowns: {
          categories: categoryStats.map(stat => ({
            category: stat.category,
            count: stat._count.category
          })),
          statuses: statusStats.map(stat => ({
            status: stat.status,
            count: stat._count.status
          }))
        },
        insights: {
          topKeywords,
          recentTrends
        }
      }
    })

  } catch (error: any) {
    logger.error('Error fetching contact analytics:', error)
    res.status(500).json({
      success: false,
      message: 'Kunde inte hämta kontaktanalys'
    })
  }
})

/**
 * Update contact submission status
 * PATCH /api/contact/submissions/:id
 */
router.patch('/submissions/:id', [
  body('status').optional().isIn(['new', 'read', 'replied', 'resolved']),
  body('category').optional().isString(),
  body('priority').optional().isIn(['low', 'normal', 'high', 'urgent']),
  body('respondedBy').optional().isString(),
  body('tags').optional().isArray()
], async (req, res) => {
  try {
    const { id } = req.params
    const updates = req.body

    // Calculate response time if marking as replied
    if (updates.status === 'replied' && !updates.respondedAt) {
      const submission = await prisma.contactSubmission.findUnique({
        where: { id },
        select: { createdAt: true, respondedAt: true }
      })

      if (submission && !submission.respondedAt) {
        const responseTimeMinutes = Math.floor(
          (new Date().getTime() - submission.createdAt.getTime()) / (1000 * 60)
        )
        updates.respondedAt = new Date()
        updates.responseTime = responseTimeMinutes
      }
    }

    const updatedSubmission = await prisma.contactSubmission.update({
      where: { id },
      data: updates
    })

    logger.info(`Contact submission ${id} updated`)

    res.json({
      success: true,
      data: updatedSubmission
    })

  } catch (error: any) {
    logger.error('Error updating contact submission:', error)
    res.status(500).json({
      success: false,
      message: 'Kunde inte uppdatera kontaktmeddelande'
    })
  }
})

export default router 