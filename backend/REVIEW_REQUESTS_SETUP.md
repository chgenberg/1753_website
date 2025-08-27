# Automatiska Recensionspåminnelser

Detta system skickar automatiska email-påminnelser till kunder 3 veckor efter deras beställning för att be om recensioner.

## Hur det fungerar

1. **Email Template**: `reviewRequest` i `emailService.ts`
2. **Script**: `scripts/sendReviewRequests.ts`
3. **Databas**: Nytt fält `reviewRequestSent` i Order-tabellen
4. **Schemaläggning**: Cron job som körs dagligen

## Manuell körning

```bash
# Kör review request scriptet manuellt
npm run send:review-requests
```

## Automatisk schemaläggning

### Option 1: Crontab (Linux/Mac)
```bash
# Öppna crontab
crontab -e

# Lägg till denna rad för att köra dagligen kl 09:00
0 9 * * * cd /path/to/1753_website/backend && npm run send:review-requests >> /var/log/review-requests.log 2>&1
```

### Option 2: Railway Cron Jobs
Om ni använder Railway, lägg till i `railway.toml`:

```toml
[[services]]
name = "review-requests"
source = "backend"

[services.cron]
schedule = "0 9 * * *"  # Dagligen kl 09:00
command = "npm run send:review-requests"
```

### Option 3: GitHub Actions (Gratis)
Skapa `.github/workflows/review-requests.yml`:

```yaml
name: Send Review Requests
on:
  schedule:
    - cron: '0 9 * * *'  # Dagligen kl 09:00 UTC
  workflow_dispatch:  # Manuell körning

jobs:
  send-reviews:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: cd backend && npm install
      - run: cd backend && npm run send:review-requests
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          SMTP_HOST: ${{ secrets.SMTP_HOST }}
          SMTP_USER: ${{ secrets.SMTP_USER }}
          SMTP_PASS: ${{ secrets.SMTP_PASS }}
```

## Email innehåll

Emailet innehåller:
- ⭐ Personlig hälsning med kundens namn
- 📦 Påminnelse om ordernummer och leveransdatum  
- 🎁 Erbjudande om 10% rabatt för recension
- 🔗 Direktlänk till recensionssidan
- 📞 Kontaktinformation för support
- 🚫 Länk för att avsluta recensionspåminnelser

## Miljövariabler som krävs

```env
# Email konfiguration
SMTP_HOST=your-smtp-host
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-password
FROM_NAME=1753 Skincare
FROM_EMAIL=hej@1753skincare.com

# Databas
DATABASE_URL=your-database-url
```

## Loggar och övervakning

Scriptet loggar:
- ✅ Antal skickade emails
- ❌ Antal misslyckade emails  
- 📊 Total statistik
- 🔍 Detaljerade fel i logger

## Säkerhet

- Emails skickas endast till betalda orders
- Endast en påminnelse per order (flagga `reviewRequestSent`)
- 1 sekunds fördröjning mellan emails för att inte överbelasta SMTP
- Felhantering som inte stoppar hela processen

## Anpassningar

Du kan enkelt ändra:
- **Timing**: Ändra från 21 dagar till annat i scriptet
- **Email design**: Redigera `reviewRequest` template
- **Rabatterbjudande**: Ändra procentsats eller ta bort
- **Länkar**: Uppdatera review-URL och unsubscribe-URL 