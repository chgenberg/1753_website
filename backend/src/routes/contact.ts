import express from 'express'
import { body, validationResult } from 'express-validator'
import { sendEmail } from '../services/emailService'
import { dripService } from '../services/dripService'
import { logger } from '../utils/logger'
import { prisma } from '../lib/prisma'

const router = express.Router()

/**
 * Send contact form email
 * POST /api/contact/send
 */
router.post(
  '/send',
  [
    body('name').trim().isLength({ min: 1, max: 100 }).withMessage('Namn krävs (1-100 tecken)'),
    body('email').isEmail().normalizeEmail().withMessage('Giltig e-postadress krävs'),
    body('subject').trim().isLength({ min: 1, max: 200 }).withMessage('Ämne krävs (1-200 tecken)'),
    body('message').trim().isLength({ min: 1, max: 2000 }).withMessage('Meddelande krävs (1-2000 tecken)')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        })
      }

      const { name, email, subject, message } = req.body

      // Auto-categorize based on subject/message content
      const categorizeMessage = (subject: string, message: string): string => {
        const content = `${subject} ${message}`.toLowerCase()
        
        if (content.includes('produkt') || content.includes('ingredient') || content.includes('hudvård')) {
          return 'product_question'
        }
        if (content.includes('beställning') || content.includes('order') || content.includes('leverans')) {
          return 'order_issue'
        }
        if (content.includes('återförsäljare') || content.includes('partner') || content.includes('grossist')) {
          return 'business_inquiry'
        }
        if (content.includes('press') || content.includes('media') || content.includes('journalist')) {
          return 'press_media'
        }
        return 'general'
      }

      // Extract additional metadata
      const userAgent = req.get('User-Agent') || null
      const ipAddress = req.ip || req.connection.remoteAddress || null
      const referrer = req.get('Referer') || null
      const category = categorizeMessage(subject, message)

      // Save to database for analysis
      let contactSubmission = null
      try {
        contactSubmission = await prisma.contactSubmission.create({
          data: {
            name,
            email,
            subject,
            message,
            userAgent,
            ipAddress,
            referrer,
            category,
            tags: [category, 'website_contact'],
            sessionData: {
              timestamp: new Date().toISOString(),
              source: 'contact_form'
            }
          }
        })

        logger.info(`Contact submission saved to database with ID: ${contactSubmission.id}`)
      } catch (dbError) {
        logger.error('Failed to save contact submission to database:', dbError)
        // Continue even if DB save fails
      }

      // Send email to Christopher
      try {
        await sendEmail({
          to: 'christopher@1753skincare.com',
          subject: `Kontaktformulär: ${subject}`,
          template: 'contactForm',
          data: {
            name,
            email,
            subject,
            message,
            timestamp: new Date().toLocaleString('sv-SE')
          }
        })

        logger.info(`Contact form email sent from ${email}`)
      } catch (emailError) {
        logger.error('Failed to send contact form email:', emailError)
        // Continue with Drip tracking even if email fails
      }

      // Track in Drip for marketing automation
      try {
        await dripService.subscribeUser({
          email,
          first_name: name.split(' ')[0] || name,
          last_name: name.split(' ').slice(1).join(' ') || '',
          custom_fields: {
            source: 'contact_form',
            contact_subject: subject,
            last_contact: new Date().toISOString()
          },
          tags: ['Contact Form Submission', `Subject: ${subject}`]
        })
      } catch (dripError) {
        logger.error('Failed to track contact form in Drip:', dripError)
        // Don't fail the request if Drip tracking fails
      }

      res.json({
        success: true,
        message: 'Tack för ditt meddelande! Vi svarar så snart som möjligt.'
      })

    } catch (error: any) {
      logger.error('Contact form error:', error)
      res.status(500).json({
        success: false,
        message: 'Ett fel uppstod när meddelandet skulle skickas. Försök igen senare.'
      })
    }
  }
)

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