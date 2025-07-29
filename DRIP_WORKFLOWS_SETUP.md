# Drip.com Workflows Setup Guide

## Översikt
Denna guide beskriver hur man ställer in Drip.com workflows för 1753 Skincare:

1. **Nyhetsbrev** - För alla newsletter-registreringar, quiz-användare och e-bok nedladdningar
2. **Övergiven varukorg** - Efter 1 timme utan köp

## Steg 1: Skapa Workflows i Drip

### 1.1 Nyhetsbrev Workflow (HUVUDWORKFLOW)
1. Gå till **Workflows** i Drip dashboard
2. Klicka **Create Workflow**
3. Namnge: "Nyhetsbrev"
4. Välj trigger: **Subscriber is added to workflow**
5. Lägg till:
   - Välkomstmail
   - Produktrekommendationer
   - Hudvårdstips
   - Personaliserat innehåll baserat på källa (quiz, e-bok, newsletter)
6. Notera **Workflow ID** (finns i URL:en)

**OBS:** Denna workflow används för:
- Newsletter-registreringar
- Quiz-avslutningar  
- E-bok nedladdningar

### 1.2 Övergiven Varukorg Workflow
1. Skapa ny workflow: "Övergiven varukorg"
2. Trigger: **Subscriber is added to workflow**
3. Lägg till sekvens:
   - **15 minuter**: Påminnelse om glömd varukorg
   - **2 timmar**: Begränsad rabatt (10%)
   - **24 timmar**: Gratis frakt erbjudande
   - **3 dagar**: Sista chansen mail
4. Använd custom fields:
   - `cart_total`
   - `cart_items_count`
   - `cart_recovery_url`

## Steg 2: Konfigurera Environment Variables

### Railway Environment Variables
Lägg till följande i Railway dashboard:

```env
DRIP_ACCOUNT_ID=8548704
DRIP_API_TOKEN=din_drip_api_token
DRIP_NEWSLETTER_WORKFLOW_ID=687757484
DRIP_ABANDONED_CART_WORKFLOW_ID=ditt_övergiven_varukorg_workflow_id
NEXT_PUBLIC_BASE_URL=https://1753website-production.up.railway.app
```

**Du behöver ENDAST dessa två workflows!**

## Steg 3: Audience Management & Taggning

### Automatisk Taggning per Källa
Systemet taggar automatiskt subscribers baserat på var de kommer ifrån:

**Newsletter signup:**
- Tags: `newsletter`, `website-signup`, `nyhetsbrev`
- Source: `newsletter-section`

**Quiz completion:**
- Tags: `quiz-användare`, `nyhetsbrev`  
- Source: `quiz-results`
- Custom fields: quiz score, skin concerns

**E-bok download:**
- Tags: `ebook-download`, `nyhetsbrev`
- Source: `ebook-page`

**Övergiven varukorg:**
- Tags: `övergiven-varukorg`, `cart-abandoner`
- Custom fields: cart data, recovery URL

### Personalisering i Nyhetsbrev Workflow
Du kan skapa olika email-grenar i samma workflow baserat på tags:

```
IF subscriber has tag "quiz-användare"
  → Skicka personliga hudvårdstips
  
IF subscriber has tag "ebook-download"  
  → Skicka relaterat CBD-innehåll
  
IF subscriber has tag "newsletter"
  → Skicka allmänt välkomstmail
```

## Steg 4: Testing

### Testa Newsletter (alla källor)
```bash
# Newsletter signup
curl -X POST https://1753website-production.up.railway.app/api/newsletter \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","workflow":"nyhetsbrev","source":"newsletter-section"}'

# Quiz completion  
curl -X POST https://1753website-production.up.railway.app/api/newsletter \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","workflow":"quiz-resultat","source":"quiz-results"}'

# E-bok download
curl -X POST https://1753website-production.up.railway.app/api/newsletter \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","workflow":"ebook-download","source":"ebook-page"}'
```

### Testa Övergiven Varukorg
1. Lägg produkter i varukorgen
2. Registrera email via quiz eller newsletter
3. Vänta 1 timme (eller ändra timer för test)
4. Kontrollera Drip för triggered workflow

## Fördelar med denna Setup

✅ **Enklare hantering** - Bara 2 workflows att underhålla
✅ **Centraliserad nyhetsbrevs-resa** - Alla leads i samma funnel  
✅ **Personalisering** - Olika innehåll baserat på källa/tags
✅ **Mindre komplexitet** - Färre workflows att konfigurera
✅ **Bättre översikt** - All email-kommunikation i en huvudresa

## Integration Points

### Frontend Components
- `NewsletterSection.tsx` → Newsletter workflow
- `QuizResults.tsx` → Newsletter workflow (med quiz-tags)
- `e-bok/page.tsx` → Newsletter workflow (med e-bok tags)
- `CartContext.tsx` → Abandoned cart workflow

### API Endpoints
- `/api/newsletter` → Subscribe + trigger newsletter workflow
- `/api/abandoned-cart` → Abandoned cart workflow 