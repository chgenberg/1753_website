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
          body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; background: #f7f7f7; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .header { background: #E79C1A; padding: 40px 30px; text-align: center; color: white; }
          .header h1 { margin: 0; font-size: 32px; letter-spacing: 0.1em; font-weight: 300; text-transform: uppercase; }
          .header p { margin: 10px 0 0; font-size: 18px; opacity: 0.9; }
          .content { padding: 40px 30px; }
          .greeting { font-size: 20px; margin-bottom: 20px; }
          .order-details { background: #FFF9F3; padding: 25px; border-radius: 12px; margin: 25px 0; }
          .order-header { display: flex; justify-content: space-between; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 2px solid #E79C1A; }
          .order-item { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #f0f0f0; }
          .order-item:last-child { border-bottom: none; }
          .order-total { font-weight: bold; font-size: 20px; color: #E79C1A; margin-top: 15px; padding-top: 15px; border-top: 2px solid #E79C1A; }
          .delivery-info { background: #f8f8f8; padding: 20px; border-radius: 12px; margin: 25px 0; }
          .timeline { margin: 30px 0; }
          .timeline-item { display: flex; align-items: center; margin: 15px 0; }
          .timeline-icon { width: 40px; height: 40px; background: #E79C1A; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; margin-right: 15px; }
          .button { display: inline-block; padding: 14px 30px; background: #E79C1A; color: white; text-decoration: none; border-radius: 25px; margin: 20px 0; font-weight: 500; }
          .footer { padding: 30px; text-align: center; color: #666; font-size: 14px; background: #f8f8f8; }
          .social-links { margin: 20px 0; }
          .social-links a { margin: 0 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>1753 Skincare</h1>
            <p>Tack för din beställning!</p>
          </div>
          <div class="content">
            <div class="greeting">
              <strong>Hej ${data.firstName}! 💛</strong>
            </div>
            <p>Vi är så glada att få vara en del av din hudvårdsresa! Din beställning har tagits emot och behandlas nu med omsorg.</p>
            
            <div class="order-details">
              <div class="order-header">
                <div>
                  <strong>Ordernummer:</strong><br>
                  ${data.orderNumber}
                </div>
                <div style="text-align: right;">
                  <strong>Datum:</strong><br>
                  ${data.orderDate}
                </div>
              </div>
              
              <div style="margin: 20px 0;">
                ${data.items.map((item: any) => `
                  <div class="order-item">
                    <span>${item.name} x ${item.quantity}</span>
                    <span style="font-weight: 500;">${item.total} ${data.currency}</span>
                  </div>
                `).join('')}
              </div>
              
              <div class="order-item order-total">
                <span>Totalt att betala</span>
                <span>${data.total} ${data.currency}</span>
              </div>
            </div>
            
            <div class="delivery-info">
              <h3 style="margin-top: 0;">📦 Leveransadress</h3>
              <p style="margin-bottom: 0;">
                ${data.shippingAddress.firstName} ${data.shippingAddress.lastName}<br>
                ${data.shippingAddress.address}<br>
                ${data.shippingAddress.postalCode} ${data.shippingAddress.city}<br>
                ${data.shippingAddress.country || 'Sverige'}
              </p>
            </div>
            
            <div class="timeline">
              <h3>Din orders resa:</h3>
              <div class="timeline-item">
                <div class="timeline-icon">✓</div>
                <div>
                  <strong>Order mottagen</strong><br>
                  <span style="color: #666; font-size: 14px;">Vi har tagit emot din beställning</span>
                </div>
              </div>
              <div class="timeline-item">
                <div class="timeline-icon" style="background: #f0f0f0; color: #999;">2</div>
                <div>
                  <strong>Packas med kärlek</strong><br>
                  <span style="color: #666; font-size: 14px;">Inom 1-2 arbetsdagar</span>
                </div>
              </div>
              <div class="timeline-item">
                <div class="timeline-icon" style="background: #f0f0f0; color: #999;">3</div>
                <div>
                  <strong>På väg till dig</strong><br>
                  <span style="color: #666; font-size: 14px;">Spårningsnummer skickas via e-post</span>
                </div>
              </div>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://1753skincare.com/sv/min-sida" class="button">Se din order</a>
            </div>
          </div>
          <div class="footer">
            <p style="margin-bottom: 20px;">
              <strong>Har du frågor?</strong><br>
              Vi finns här för dig! Kontakta oss på <a href="mailto:hej@1753skincare.com" style="color: #E79C1A; text-decoration: none;">hej@1753skincare.com</a><br>
              eller ring <a href="tel:0732305521" style="color: #E79C1A; text-decoration: none;">073-230 55 21</a>
            </p>
            
            <div class="social-links">
              <a href="https://instagram.com/1753skincare" style="color: #E79C1A;">Instagram</a>
              <a href="https://facebook.com/1753skincare" style="color: #E79C1A;">Facebook</a>
            </div>
            
            <p style="margin-top: 20px; font-size: 12px; color: #999;">
              © 2025 1753 Skincare | Hållbar hudvård sedan 1753
            </p>
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
  }),
  reviewRequest: (data) => ({
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Hur var din upplevelse?</title>
        <style>
          body { font-family: 'Inter', -apple-system, sans-serif; line-height: 1.8; color: #1a1a1a; background: #fafafa; margin: 0; padding: 0; }
          .container { max-width: 480px; margin: 40px auto; background: white; overflow: hidden; }
          .header { padding: 60px 40px 40px; text-align: center; border-bottom: 1px solid #f0f0f0; }
          .logo { font-size: 24px; letter-spacing: 0.2em; font-weight: 300; color: #E79C1A; margin: 0; }
          .content { padding: 60px 40px; }
          .greeting { font-size: 16px; color: #666; margin-bottom: 30px; letter-spacing: 0.02em; }
          .order-info { text-align: center; margin: 40px 0; padding: 30px; background: #fafafa; }
          .order-number { font-size: 14px; color: #999; letter-spacing: 0.1em; text-transform: uppercase; }
          .product-name { font-size: 18px; color: #1a1a1a; margin: 10px 0; font-weight: 500; }
          .stars { text-align: center; margin: 40px 0; }
          .stars svg { width: 32px; height: 32px; margin: 0 4px; fill: none; stroke: #E79C1A; stroke-width: 1.5; cursor: pointer; transition: all 0.2s; }
          .stars svg:hover { fill: #E79C1A; transform: scale(1.1); }
          .review-button { display: block; width: 200px; margin: 40px auto; padding: 14px 28px; background: #1a1a1a; color: white; text-decoration: none; text-align: center; font-size: 14px; letter-spacing: 0.1em; text-transform: uppercase; border: none; transition: all 0.3s; }
          .review-button:hover { background: #E79C1A; transform: translateY(-2px); }
          .incentive { text-align: center; margin: 30px 0; padding: 20px; border: 1px solid #E79C1A; }
          .incentive-title { font-size: 12px; letter-spacing: 0.1em; text-transform: uppercase; color: #E79C1A; margin: 0; }
          .incentive-value { font-size: 24px; font-weight: 300; margin: 5px 0; }
          .footer { padding: 40px; text-align: center; color: #999; font-size: 12px; border-top: 1px solid #f0f0f0; }
          .footer a { color: #666; text-decoration: none; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 class="logo">1753</h1>
          </div>
          
          <div class="content">
            <div class="greeting">
              Hej ${data.firstName},
            </div>
            
            <p style="text-align: center; color: #333; font-size: 18px; margin-bottom: 40px;">
              Hur var din upplevelse<br>med ${data.productName || 'dina produkter'}?
            </p>
            
            <div class="order-info">
              <div class="order-number">Order ${data.orderNumber}</div>
              <div class="product-name">${data.productName || 'Din beställning'}</div>
            </div>
            
            <div class="stars">
              <svg viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              <svg viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              <svg viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              <svg viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              <svg viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            </div>
            
            <a href="${data.reviewUrl}" class="review-button">Lämna recension</a>
            
            <div class="incentive">
              <p class="incentive-title">Din bonus</p>
              <p class="incentive-value">10% rabatt</p>
              <p style="margin: 0; font-size: 14px; color: #666;">på nästa köp</p>
            </div>
          </div>
          
          <div class="footer">
            <p>
              <a href="mailto:hej@1753skincare.com">hej@1753skincare.com</a> • 
              <a href="tel:0732305521">073-230 55 21</a>
            </p>
            <p style="margin-top: 20px;">
              <a href="${data.unsubscribeUrl}" style="color: #ccc;">Avsluta påminnelser</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Hej ${data.firstName}!
      
      Det har nu gått några veckor sedan du fick din beställning från oss (#${data.orderNumber}).
      Vi hoppas att du är nöjd med dina produkter!
      
      Vad tyckte du om din upplevelse?
      
      Din recension hjälper andra kunder att hitta rätt produkter och hjälper oss att förbättra våra produkter.
      
      Som tack för din recension får du 10% rabatt på nästa beställning.
      
      Skriv din recension här: ${data.reviewUrl}
      
      Tack för att du valde 1753 Skincare!
      
      ---
      Har du frågor? Kontakta oss på hej@1753skincare.com
      
      Avsluta påminnelser: ${data.unsubscribeUrl}
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