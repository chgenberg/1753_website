# SMTP Setup Guide för 1753 Skincare

## Populära SMTP-leverantörer

### 1. Gmail (Google Workspace)
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password  # Inte ditt vanliga lösenord!
FROM_EMAIL=your-email@gmail.com
FROM_NAME=1753 Skincare
```

**Så här aktiverar du App Password för Gmail:**
1. Gå till Google Account Settings
2. Security → 2-Step Verification (måste vara på)
3. App passwords → Generate new
4. Välj "Mail" och "Other"
5. Använd det genererade lösenordet som SMTP_PASS

### 2. Outlook/Hotmail
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
FROM_EMAIL=your-email@outlook.com
FROM_NAME=1753 Skincare
```

### 3. SendGrid (Rekommenderat för företag)
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
FROM_EMAIL=noreply@1753skincare.com
FROM_NAME=1753 Skincare
```

**Fördelar med SendGrid:**
- Hög leveransgrad
- Detaljerad statistik
- 100 emails/dag gratis
- Professionellt för transaktionella emails

### 4. Mailgun
```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=postmaster@mg.yourdomain.com
SMTP_PASS=your-mailgun-password
FROM_EMAIL=noreply@1753skincare.com
FROM_NAME=1753 Skincare
```

### 5. Amazon SES
```env
SMTP_HOST=email-smtp.eu-west-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=your-ses-smtp-username
SMTP_PASS=your-ses-smtp-password
FROM_EMAIL=noreply@1753skincare.com
FROM_NAME=1753 Skincare
```

## Hitta dina nuvarande SMTP-inställningar

### Om du använder cPanel/Webmail:
1. Logga in på din webbhotell-kontrollpanel
2. Sök efter "Email Accounts" eller "Mail"
3. Klicka på "Configure Mail Client" för ditt email-konto
4. Kopiera SMTP-inställningarna

### Om du använder Outlook:
1. File → Account Settings → Account Settings
2. Välj ditt konto → Change
3. More Settings → Outgoing Server
4. Kopiera server och port-inställningar

### Om du använder Apple Mail:
1. Mail → Preferences → Accounts
2. Välj ditt konto → Server Settings
3. Kopiera Outgoing Mail Server-inställningar

## Vanliga SMTP-portar:
- **587** - TLS/STARTTLS (rekommenderat)
- **465** - SSL (äldre standard)
- **25** - Oskyddad (använd ej)

## Testa dina SMTP-inställningar

Kör detta script för att testa:
```bash
cd backend
npm run test:email
```

Eller skapa en test-fil:
```javascript
// test-smtp.js
const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransporter({
  host: 'your-smtp-host',
  port: 587,
  secure: false,
  auth: {
    user: 'your-smtp-user',
    pass: 'your-smtp-pass'
  }
})

transporter.sendMail({
  from: 'your-email@domain.com',
  to: 'test@example.com',
  subject: 'SMTP Test',
  text: 'If you receive this, SMTP works!'
}).then(info => {
  console.log('✅ Email sent:', info.messageId)
}).catch(error => {
  console.error('❌ Error:', error)
})
```

## Railway Environment Variables

Lägg till dessa i Railway Dashboard → Settings → Environment:

```
SMTP_HOST=your-smtp-host
SMTP_PORT=587
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-password
FROM_EMAIL=noreply@1753skincare.com
FROM_NAME=1753 Skincare
```

## Felsökning

### "Authentication failed"
- Kontrollera användarnamn och lösenord
- För Gmail: använd App Password, inte vanligt lösenord
- Kontrollera att 2FA är aktiverat (Gmail)

### "Connection timeout"
- Kontrollera SMTP_HOST och SMTP_PORT
- Vissa nätverk blockerar port 587, prova 465

### "Mail not delivered"
- Kontrollera FROM_EMAIL är giltig
- Undvik "noreply@gmail.com" - använd din egen domän
- Kontrollera spam-filter

### "SSL/TLS errors"
- För port 587: secure: false (använder STARTTLS)
- För port 465: secure: true (använder SSL)

## Rekommendation för 1753 Skincare

**För utveckling:** Använd Gmail med App Password
**För produktion:** Använd SendGrid eller Mailgun för bästa leveransgrad

SendGrid setup:
1. Skapa konto på sendgrid.com
2. Verifiera din domän (1753skincare.com)
3. Skapa API key
4. Använd inställningarna ovan 