import express from 'express'
import { body, validationResult } from 'express-validator'
import { sendEmail } from '../services/emailService'
import { dripService } from '../services/dripService'
import { logger } from '../utils/logger'

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

export default router 