import nodemailer from 'nodemailer'
import { logger } from '../utils/logger'

interface EmailOptions {
  to: string
  subject: string
  template: string
  data: Record<string, any>
}

interface EmailTemplate {
  html: string
  text: string
}

// Email templates
const templates: Record<string, (data: Record<string, any>) => EmailTemplate> = {
  contactForm: (data) => ({
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Nytt meddelande från kontaktformulär</title>
                 <style>
           body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
           .container { max-width: 600px; margin: 0 auto; padding: 20px; }
           .header { background: linear-gradient(135deg, #8B6B47 0%, #6B5337 100%); padding: 30px; text-align: center; color: white; }
           .content { padding: 30px; background: #f9f9f9; }
           .footer { padding: 20px; text-align: center; color: #666; font-size: 14px; }
         </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Nytt meddelande från kontaktformulär</h1>
          </div>
          <div class="content">
            <h2>Kontaktinformation:</h2>
            <p><strong>Namn:</strong> ${data.name}</p>
            <p><strong>E-post:</strong> ${data.email}</p>
            <p><strong>Ämne:</strong> ${data.subject}</p>
            <p><strong>Datum:</strong> ${data.timestamp}</p>
            
            <h2>Meddelande:</h2>
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; white-space: pre-wrap;">${data.message}</p>
            </div>
            
            <p style="margin-top: 30px;"><strong>Svara genom att använda:</strong> ${data.email}</p>
          </div>
          <div class="footer">
            <p>Detta meddelande skickades via kontaktformuläret på 1753skincare.com</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Nytt meddelande från kontaktformulär - 1753 Skincare
      
      Kontaktinformation:
      Namn: ${data.name}
      E-post: ${data.email}
      Ämne: ${data.subject}
      Datum: ${data.timestamp}
      
      Meddelande:
      ${data.message}
      
      ---
      Detta meddelande skickades via kontaktformuläret på 1753skincare.com
      Svara genom att använda: ${data.email}
    `
  }),
  emailVerification: (data) => ({
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Verifiera din e-postadress</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #fcb237 0%, #f8d04f 100%); padding: 30px; text-align: center; color: white; }
          .content { padding: 30px; background: #f9f9f9; }
          .button { display: inline-block; padding: 12px 30px; background: #fcb237; color: white; text-decoration: none; border-radius: 25px; margin: 20px 0; }
          .footer { padding: 20px; text-align: center; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>1753 Skincare</h1>
            <p>Välkommen till vår hudvårdsfamilj!</p>
          </div>
          <div class="content">
            <h2>Hej ${data.firstName}!</h2>
            <p>Tack för att du registrerade dig hos 1753 Skincare. För att slutföra din registrering behöver du verifiera din e-postadress.</p>
            <p>Klicka på knappen nedan för att verifiera ditt konto:</p>
            <a href="${data.verificationUrl}" class="button">Verifiera e-postadress</a>
            <p>Om knappen inte fungerar kan du kopiera och klistra in denna länk i din webbläsare:</p>
            <p style="word-break: break-all;">${data.verificationUrl}</p>
            <p>Denna länk är giltig i 24 timmar.</p>
          </div>
          <div class="footer">
            <p>Med vänliga hälsningar,<br>Team 1753 Skincare</p>
            <p>Har du frågor? Kontakta oss på hej@1753skincare.com</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Hej ${data.firstName}!
      
      Tack för att du registrerade dig hos 1753 Skincare. För att slutföra din registrering behöver du verifiera din e-postadress.
      
      Besök denna länk för att verifiera ditt konto:
      ${data.verificationUrl}
      
      Denna länk är giltig i 24 timmar.
      
      Med vänliga hälsningar,
      Team 1753 Skincare
      
      Har du frågor? Kontakta oss på hej@1753skincare.com
    `
  }),

  passwordReset: (data) => ({
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Återställ ditt lösenord</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #fcb237 0%, #f8d04f 100%); padding: 30px; text-align: center; color: white; }
          .content { padding: 30px; background: #f9f9f9; }
          .button { display: inline-block; padding: 12px 30px; background: #fcb237; color: white; text-decoration: none; border-radius: 25px; margin: 20px 0; }
          .footer { padding: 20px; text-align: center; color: #666; font-size: 14px; }
          .warning { padding: 15px; background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 4px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>1753 Skincare</h1>
            <p>Återställ ditt lösenord</p>
          </div>
          <div class="content">
            <h2>Hej ${data.firstName}!</h2>
            <p>Vi har mottagit en begäran om att återställa lösenordet för ditt konto.</p>
            <p>Klicka på knappen nedan för att skapa ett nytt lösenord:</p>
            <a href="${data.resetUrl}" class="button">Återställ lösenord</a>
            <p>Om knappen inte fungerar kan du kopiera och klistra in denna länk i din webbläsare:</p>
            <p style="word-break: break-all;">${data.resetUrl}</p>
            <div class="warning">
              <strong>Viktigt:</strong> Denna länk är endast giltig i 10 minuter av säkerhetsskäl.
            </div>
            <p>Om du inte begärde denna återställning kan du ignorera detta meddelande.</p>
          </div>
          <div class="footer">
            <p>Med vänliga hälsningar,<br>Team 1753 Skincare</p>
            <p>Har du frågor? Kontakta oss på hej@1753skincare.com</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Hej ${data.firstName}!
      
      Vi har mottagit en begäran om att återställa lösenordet för ditt konto.
      
      Besök denna länk för att skapa ett nytt lösenord:
      ${data.resetUrl}
      
      Denna länk är endast giltig i 10 minuter av säkerhetsskäl.
      
      Om du inte begärde denna återställning kan du ignorera detta meddelande.
      
      Med vänliga hälsningar,
      Team 1753 Skincare
      
      Har du frågor? Kontakta oss på hej@1753skincare.com
    `
  }),

  orderConfirmation: (data) => ({
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Orderbekräftelse</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #fcb237 0%, #f8d04f 100%); padding: 30px; text-align: center; color: white; }
          .content { padding: 30px; background: #f9f9f9; }
          .order-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .order-item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
          .order-total { font-weight: bold; font-size: 18px; }
          .footer { padding: 20px; text-align: center; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>1753 Skincare</h1>
            <p>Tack för din beställning!</p>
          </div>
          <div class="content">
            <h2>Hej ${data.firstName}!</h2>
            <p>Vi har mottagit din beställning och den bearbetas nu. Du kommer att få en bekräftelse när den skickas.</p>
            
            <div class="order-details">
              <h3>Orderdetaljer</h3>
              <p><strong>Ordernummer:</strong> ${data.orderNumber}</p>
              <p><strong>Orderdatum:</strong> ${data.orderDate}</p>
              
              <h4>Beställda produkter:</h4>
              ${data.items.map((item: any) => `
                <div class="order-item">
                  <span>${item.name} x ${item.quantity}</span>
                  <span>${item.total} ${data.currency}</span>
                </div>
              `).join('')}
              
              <div class="order-item order-total">
                <span>Totalt</span>
                <span>${data.total} ${data.currency}</span>
              </div>
            </div>
            
            <p>Din beställning kommer att skickas till:</p>
            <p>
              ${data.shippingAddress.firstName} ${data.shippingAddress.lastName}<br>
              ${data.shippingAddress.address1}<br>
              ${data.shippingAddress.postalCode} ${data.shippingAddress.city}
            </p>
          </div>
          <div class="footer">
            <p>Med vänliga hälsningar,<br>Team 1753 Skincare</p>
            <p>Har du frågor? Kontakta oss på hej@1753skincare.com</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Hej ${data.firstName}!
      
      Vi har mottagit din beställning och den bearbetas nu.
      
      Orderdetaljer:
      Ordernummer: ${data.orderNumber}
      Orderdatum: ${data.orderDate}
      
      Beställda produkter:
      ${data.items.map((item: any) => `${item.name} x ${item.quantity} - ${item.total} ${data.currency}`).join('\n')}
      
      Totalt: ${data.total} ${data.currency}
      
      Med vänliga hälsningar,
      Team 1753 Skincare
    `
  })
}

// Create reusable transporter
let transporter: nodemailer.Transporter | null = null

const createTransport = (): nodemailer.Transporter => {
  if (!process.env.SMTP_HOST) {
    throw new Error('SMTP configuration is missing')
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
}

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  try {
    // Create transporter if not exists
    if (!transporter) {
      transporter = createTransport()
    }

    // Get template
    const templateFn = templates[options.template]
    if (!templateFn) {
      throw new Error(`Email template '${options.template}' not found`)
    }

    const template = templateFn(options.data)

    // Send email
    const info = await transporter.sendMail({
      from: `${process.env.FROM_NAME || '1753 Skincare'} <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
      to: options.to,
      subject: options.subject,
      text: template.text,
      html: template.html,
    })

    logger.info(`Email sent successfully to ${options.to}`, { messageId: info.messageId })
  } catch (error) {
    logger.error('Failed to send email:', error)
    throw error
  }
}

// Test email configuration
export const testEmailConfig = async (): Promise<boolean> => {
  try {
    if (!process.env.SMTP_HOST) {
      return false
    }

    const testTransporter = createTransport()
    await testTransporter.verify()
    return true
  } catch (error) {
    logger.error('Email configuration test failed:', error)
    return false
  }
} 