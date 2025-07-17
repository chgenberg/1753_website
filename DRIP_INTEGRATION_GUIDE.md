# Drip.com Integration Guide för 1753 Skincare

## Översikt

Detta dokument beskriver den kompletta Drip.com-integrationen för 1753 Skincare-webbplatsen. Integrationen möjliggör avancerad email marketing med automatiserade workflows, personaliserade kampanjer och detaljerad spårning av användarinteraktioner.

## 🎯 Funktioner

### Backend-funktioner
- ✅ **Newsletter-prenumeration** - Komplett API för att hantera prenumerationer
- ✅ **Användarspårning** - Spåra användaraktioner och trigga workflows
- ✅ **Automatiska workflows** - Quiz-slutförande, köp, kontaktformulär
- ✅ **Segmentering** - Baserat på hudtyp, intressen och beteende
- ✅ **Taggning** - Automatisk taggning baserat på användaraktivitet

### Frontend-funktioner
- ✅ **NewsletterSection-komponent** - Modern newsletter signup med personalisering
- ✅ **Integration i befintliga formulär** - Checkout, quiz, kontakt, blogg
- ✅ **Automatisk spårning** - Quiz-slutförande, köp, kontaktformulär
- ✅ **Responsive design** - Fungerar på alla enheter

## 📋 Konfiguration

### 1. Miljövariabler (Backend)

Lägg till följande i din `.env`-fil:

```bash
# Drip.com API-konfiguration
DRIP_API_TOKEN=your_drip_api_token
DRIP_ACCOUNT_ID=your_drip_account_id

# Workflow ID:n (skapas i Drip dashboard)
DRIP_REVIEW_REQUEST_WORKFLOW_ID=workflow_id
DRIP_REVIEW_SUBMITTED_WORKFLOW_ID=workflow_id
DRIP_REVIEW_APPROVED_WORKFLOW_ID=workflow_id
DRIP_QUIZ_COMPLETED_WORKFLOW_ID=workflow_id
DRIP_PRODUCT_VIEWED_WORKFLOW_ID=workflow_id
DRIP_CART_ABANDONED_WORKFLOW_ID=workflow_id
DRIP_BLOG_ENGAGED_WORKFLOW_ID=workflow_id
```

### 2. Frontend-konfiguration

Lägg till i din `.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:5002
```

## 🔧 API-endpoints

### Newsletter-prenumeration
```bash
POST /api/newsletter/subscribe
```

**Request body:**
```json
{
  "email": "user@example.com",
  "firstName": "Anna",
  "lastName": "Andersson",
  "skinType": "dry",
  "skinConcerns": ["aging", "dryness"],
  "interests": ["skincare_tips", "product_launches"],
  "source": "website"
}
```

### Användarspårning
```bash
POST /api/newsletter/track
```

**Request body:**
```json
{
  "email": "user@example.com",
  "action": "quiz_completed",
  "data": {
    "answers": {...},
    "results": {...}
  }
}
```

### Avregistrering
```bash
POST /api/newsletter/unsubscribe
```

### Uppdatera preferenser
```bash
PUT /api/newsletter/preferences
```

## 🎨 Frontend-komponenter

### NewsletterSection

Modern, anpassningsbar newsletter-komponent med tre varianter:

```tsx
// Standardvariant (full)
<NewsletterSection />

// Minimal variant (för sidebars/footer)
<NewsletterSection variant="minimal" />

// Bloggvariant
<NewsletterSection variant="blog" />
```

#### Funktioner:
- **Personalisering** - Hudtyp och intressen
- **Progressiv förbättring** - Grundfunktion utan JavaScript
- **Responsiv design** - Fungerar på alla skärmstorlekar
- **Tillgänglig** - WCAG-kompatibel
- **Animationer** - Smooth micro-interactions

### Integration i befintliga formulär

Automatisk Drip-integration har lagts till i:

1. **Quiz-sidan** - Spårar quiz-slutförande
2. **Checkout-sidan** - Newsletter opt-in och köpspårning
3. **Kontakt-sidan** - Spårar kontaktformulär-inlämningar
4. **Blogg-sidan** - Newsletter signup

## 📊 Drip Workflows

### Obligatoriska Workflows (behöver skapas i Drip)

1. **Välkomstsekvens**
   - Trigger: Ny prenumerant
   - Innehåll: Välkomstmail + 20% rabattkod

2. **Quiz-slutförande**
   - Trigger: `quiz_completed` action
   - Innehåll: Personaliserade produktrekommendationer

3. **Övergivna varukorgar**
   - Trigger: `cart_abandoned` action
   - Innehåll: Påminnelse + specialerbjudande

4. **Köp-uppföljning**
   - Trigger: `purchase_completed` action
   - Innehåll: Leveransinfo + nästa köp-rekommendationer

5. **Recensionsförfrågningar**
   - Trigger: 3 dagar efter leverans
   - Innehåll: Begäran om produktrecension

### Custom Fields i Drip

Följande custom fields används för segmentering:

```
- skin_type: string (dry, oily, combination, sensitive, normal, acne, mature)
- skin_concerns: array (aging, acne, dryness, sensitivity, pigmentation)
- source: string (website, checkout, quiz, blog)
- interests: string (comma-separated)
- quiz_completed: boolean
- purchase_count: number
- total_spent: number
```

## 🏷️ Taggning-strategi

### Automatiska taggar

- `Newsletter Signup` - Alla nya prenumeranter
- `Source: [source]` - Var de registrerade sig
- `Quiz Completed` - Slutförde hudvårdsquiz
- `[X]-Star Review` - Baserat på recensionsbetyg
- `Purchaser` - Har köpt minst en produkt
- `VIP Customer` - Har köpt för över 2000kr

### Beteendebaserade taggar

- `Action: quiz_completed`
- `Action: contact_form_submitted`
- `Action: purchase_completed`
- `Triggered: YYYY-MM-DD`

## 🚀 Implementeringsexempel

### Grundläggande newsletter signup

```tsx
import NewsletterSection from '@/components/sections/NewsletterSection'

export default function HomePage() {
  return (
    <div>
      {/* Andra komponenter */}
      <NewsletterSection />
    </div>
  )
}
```

### Spåra anpassade händelser

```tsx
const trackUserAction = async (email: string, action: string, data: any) => {
  try {
    await fetch('/api/newsletter/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, action, data })
    });
  } catch (error) {
    console.error('Tracking error:', error);
  }
};

// Användning
trackUserAction(userEmail, 'product_viewed', {
  productId: 'duo-kit',
  productName: 'DUO-kit (The ONE + I LOVE Facial Oil)',
  price: 1099
});
```

## 📈 Analytics och rapportering

### KPI:er att spåra i Drip

1. **Newsletter-tillväxt**
   - Nya prenumeranter per månad
   - Källa-uppdelning
   - Avregistreringsfrekvens

2. **Quiz-engagement**
   - Slutförandefrekvens
   - Konvertering från quiz till köp
   - Vanligaste hudtyper

3. **Email-prestanda**
   - Öppningsfrekvens per segment
   - Klickfrekvens
   - Konverteringsfrekvens

4. **Segmentprestanda**
   - Hudtyp-segment engagement
   - Intresse-baserad prestanda
   - Köpbeteende per segment

## 🔧 Teknisk implementation

### Backend-struktur

```
backend/src/
├── routes/newsletter.ts          # API endpoints
├── services/dripService.ts       # Drip API integration
├── models/Review.ts              # Extended with Drip data
└── config/env.ts                 # Environment validation
```

### Frontend-struktur

```
frontend/src/
├── components/sections/NewsletterSection.tsx  # Main component
├── app/[locale]/page.tsx                      # Homepage integration
├── app/[locale]/quiz/page.tsx                 # Quiz tracking
├── app/[locale]/checkout/page.tsx             # Checkout integration
└── app/[locale]/kontakt/page.tsx              # Contact tracking
```

## 🛠️ Felsökning

### Vanliga problem

1. **API-anrop misslyckas**
   - Kontrollera `DRIP_API_TOKEN` och `DRIP_ACCOUNT_ID`
   - Verifiera att Drip-kontot är aktivt

2. **Workflows triggas inte**
   - Kontrollera workflow ID:n i miljövariabler
   - Se till att workflows är aktiverade i Drip

3. **Custom fields sparas inte**
   - Kontrollera att custom fields existerar i Drip
   - Verifiera datatyper och format

### Debug-tips

```typescript
// Aktivera debug-loggning
const dripService = new DripService();
const testResult = await dripService.testConnection();
console.log('Drip connection test:', testResult);
```

## 📝 Nästa steg

### Förbättringar att implementera

1. **A/B-testa newsletter-komponenter**
2. **Implementera advanced segmentering**
3. **Lägg till SMS-integration**
4. **Skapa dashboard för email-metrics**
5. **Implementera triggered emails baserat på beteende**

### Avancerade funktioner

1. **Predictive analytics** - ML för att förutsäga köpbeteende
2. **Dynamic content** - Personaliserade email-bilder
3. **Real-time personalization** - Hemsidans innehåll baserat på Drip-data
4. **Advanced automation** - Multi-channel kampanjer

## 📞 Support

För teknisk support eller frågor om implementationen:

- Backend-issues: Kolla logs i `backend/logs/`
- Frontend-issues: Kolla browser console
- Drip-relaterade problem: Verifiera API-credentials

Detta system ger er full kontroll över email marketing med avancerad segmentering och personalisering som kommer att öka kundengagemang och försäljning betydligt. 