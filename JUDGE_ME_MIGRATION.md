# Judge.me Review Migration Guide

Detta dokument beskriver hur du exporterar alla recensioner från Judge.me och importerar dem till vårt eget recensionssystem.

## Översikt

Vårt migreringsscript stöder två metoder för att importera recensioner från Judge.me:

1. **CSV Export** - Exportera data från Judge.me dashboard (rekommenderat för de flesta)
2. **API Import** - Direktimport via Judge.me's API (kräver API-tillgång)

## Metod 1: CSV Export (Rekommenderat)

### Steg 1: Exportera recensioner från Judge.me

1. Logga in på ditt Judge.me dashboard
2. Gå till **Manage Reviews** → **Reviews Dashboard**
3. Klicka på **Export** knappen (vanligtvis längst upp till höger)
4. Välj **All Reviews** för att exportera alla recensioner
5. Välj CSV format
6. Vänta på att exporten blir klar och ladda ner filen

**Alternativ:** Om export-funktionen inte finns kan du kontakta Judge.me support och be om en CSV-export av alla dina recensioner.

### Steg 2: Förbered CSV-filen

Kontrollera att din CSV-fil innehåller följande kolumner:
- `body` (krävs) - Recensionstexten
- `rating` (krävs) - Betyg 1-5
- `title` - Recensionstitel
- `reviewer_name` - Kundens namn
- `reviewer_email` - Kundens e-post
- `product_url` eller `product_id` - Produktidentifiering
- `review_date` - Datum för recensionen
- `picture_urls` - Kommaseparerade foto-URLs
- `reply` - Eventuellt svar från er
- `reply_date` - Datum för svaret

**Skincare-specifika fält** (om ni använde custom fields):
- `CF_Skin Type` - Hudtyp
- `CF_Age Range` - Åldersgrupp  
- `CF_Usage Duration` - Hur länge produkten använts
- `CF_Skin Concerns` - Hudproblem (kommaseparerade)
- `CF_Would Recommend` - Skulle rekommendera (yes/no)

### Steg 3: Kör migreringen

```bash
# Installera dependencies
cd backend
npm install

# Kör CSV-migreringen
npm run migrate:judgeme csv path/to/your/reviews.csv

# Exempel:
npm run migrate:judgeme csv ~/Downloads/judgeme_reviews_export.csv
```

## Metod 2: API Import

### Steg 1: Skaffa API-tillgång

1. Kontakta Judge.me support för att få tillgång till deras API
2. Be om din API token och bekräfta din shop domain

### Steg 2: Konfigurera miljövariabler

```bash
# I backend/.env
JUDGEME_API_TOKEN=your_api_token_here
JUDGEME_SHOP_DOMAIN=yourstore.myshopify.com
```

### Steg 3: Kör API-migreringen

```bash
npm run migrate:judgeme api
```

## Produktmatchning

Migreringsscriptet försöker matcha recensioner med produkter i vår databas genom:

1. **Product Handle** - Från product URL (t.ex. `/products/cbd-oil` → `cbd-oil`)
2. **Shopify Product ID** - Om det finns i exporten
3. **External Product ID** - Om ni har mappning mellan Judge.me och era produkter

**Viktigt:** Se till att era produkter redan finns i databasen innan migreringen. Recensioner för produkter som inte hittas kommer att hoppas över.

## Vad som importeras

### Grundläggande recensionsdata:
- ⭐ Betyg (1-5 stjärnor)
- 📝 Titel och innehåll
- 👤 Recensentens namn och e-post
- 📅 Datum för recensionen
- 🖼️ Foton (om de finns)
- 💬 Eventuella svar från er

### Skincare-specifik metadata:
- 🧴 Hudtyp (torr, oljig, kombinerad, känslig)
- 👥 Åldersgrupp
- ⏱️ Användningstid av produkten
- 🎯 Hudproblem (akne, rosacea, åldrande, etc.)
- 👍 Rekommendation (ja/nej)

### Status och verifiering:
- ✅ Godkännandestatus (befintliga Judge.me recensioner markeras som godkända)
- 🔍 Verifieringsstatus (API-import behåller verification, CSV-import markeras som overifierade)
- 📍 Källa markeras som 'judge.me_csv' eller 'judge.me_api'

## Migreringsrapport

Efter migreringen genereras en detaljerad rapport:

```bash
# Visa migreringsstatistik
npm run migrate:judgeme report
```

Rapporten visar:
- 📊 Totalt antal recensioner
- 📈 Antal migrerade recensioner
- ⭐ Genomsnittligt betyg
- 📸 Antal recensioner med foton
- ✅ Antal verifierade recensioner

## Felsökning

### Vanliga problem:

**"Product not found for review"**
- Kontrollera att produkterna finns i din databas
- Verifiera att product handles matchar mellan Judge.me och ditt system
- Kör `npm run import-products` för att importera produkter först

**"Invalid rating"**
- Kontrollera att rating-kolumnen innehåller siffror 1-5
- Vissa CSV-exports kan ha felaktiga värden

**"Error parsing date"**
- Judge.me använder DD/MM/YYYY format
- Kontrollera att datum är i rätt format

**"Photo URLs not accessible"**
- Vissa foto-URLs från Judge.me kan ha utlöpt
- Bilderna importeras ändå men kan behöva laddas upp på nytt

### Debug-läge:

```bash
# Kör med debug-logging
DEBUG=* npm run migrate:judgeme csv your-file.csv
```

## Efter migreringen

1. **Verifiera data** - Kontrollera att recensionerna visas korrekt på er webbplats
2. **Uppdatera produktstatistik** - Kör eventuella scripts för att uppdatera genomsnittsbetyg
3. **Testa funktionalitet** - Verifiera att alla recensionsfunktioner fungerar
4. **Backup** - Ta backup av den migrerade datan

## Datastruktur

Så här mappas Judge.me-data till vårt system:

```typescript
Judge.me → Vårt system
├── title → title
├── body → body  
├── rating → rating
├── reviewer_name → reviewerName
├── reviewer_email → reviewerEmail
├── review_date → createdAt
├── picture_urls → photos[]
├── reply → reply.body
├── CF_Skin Type → metadata.skinType
├── CF_Age Range → metadata.ageRange
├── CF_Usage Duration → metadata.usageDuration
├── CF_Skin Concerns → metadata.skinConcerns[]
└── CF_Would Recommend → metadata.wouldRecommend
```

## Support

Om du stöter på problem under migreringen:

1. Kontrollera loggarna för detaljerade felmeddelanden
2. Se till att alla dependencies är installerade
3. Verifiera att databasen är ansluten
4. Kontakta support med specifika felmeddelanden

## Backup-strategi

**Innan migreringen:**
```bash
# Backup av befintliga recensioner (om några finns)
mongodump --db your_database --collection reviews
```

**Efter migreringen:**
```bash
# Backup av alla recensioner inklusive migrerade
mongodump --db your_database --collection reviews
```

Detta säkerställer att ni kan återställa datan om något går fel under migreringen.

---

**Lycka till med migreringen! 🚀**

Kontakta oss om ni behöver hjälp eller har frågor om processen. 