# 🎯 Nya Prenumerationsfunktioner

## Översikt

Vi har implementerat tre nya funktioner för prenumerationshantering:

1. **Pausa prenumeration** (1-3 månader)
2. **Ändra leveransfrekvens** 
3. **Lägg till extra produkter** med prenumerantrabatt

## 🔄 1. Pausa Prenumeration

### Funktionalitet
- Kunder kan pausa sin prenumeration i 1-3 månader
- Under pausen: ingen betalning, ingen leverans
- Prenumerationen återupptas automatiskt efter pausperioden
- Nuvarande period förlängs med pauslängden

### API Endpoints

**Pausa prenumeration:**
```http
POST /api/subscriptions/:subscriptionId/pause
Authorization: Bearer <token>
Content-Type: application/json

{
  "pauseMonths": 2,
  "reason": "Semester/resor"
}
```

**Återuppta prenumeration:**
```http
POST /api/subscriptions/:subscriptionId/resume
Authorization: Bearer <token>
```

**Automatisk återupptagning (cron job):**
```http
POST /api/subscriptions/maintenance/resume-expired
```

### Databasschema
```sql
-- Nya fält i subscriptions-tabellen
pausedAt              DateTime?
pausedUntil           DateTime?
pauseReason           String?

-- Ny status
PAUSED                -- i SubscriptionStatus enum
```

## 📅 2. Ändra Leveransfrekvens

### Funktionalitet
- Kunder kan ändra från månadsvis till kvartalsvis eller årsvis (och vice versa)
- Nya frekvensen gäller från nästa faktureringsperiod
- Priset justeras enligt den nya planen

### API Endpoint

```http
POST /api/subscriptions/:subscriptionId/frequency
Authorization: Bearer <token>
Content-Type: application/json

{
  "interval": "quarterly",     // monthly, quarterly, yearly
  "intervalCount": 1
}
```

### Databasschema
```sql
-- Nya fält för anpassad frekvens
customInterval        String?   -- Override plan interval
customIntervalCount   Int?      -- Override plan interval count
```

## 🛒 3. Lägg till Extra Produkter

### Funktionalitet
- Prenumeranter får 15% rabatt på extra produkter
- Engångsköp som levereras med nästa prenumerationsbox
- Separat betalning via Viva Wallet

### API Endpoints

**Lägg till produkt:**
```http
POST /api/subscriptions/:subscriptionId/add-product
Authorization: Bearer <token>
Content-Type: application/json

{
  "productId": "product_123",
  "quantity": 1,
  "discountPercent": 15
}
```

**Hämta tilläggsprodukter:**
```http
GET /api/subscriptions/:subscriptionId/add-ons
Authorization: Bearer <token>
```

### Databasschema
```sql
-- Ny tabell för tilläggsprodukter
CREATE TABLE subscription_addons (
  id                String PRIMARY KEY,
  subscriptionId    String,
  productId         String,
  quantity          Int DEFAULT 1,
  originalPrice     Float,
  discountPercent   Float,
  finalPrice        Float,
  status            AddOnOrderStatus DEFAULT 'PENDING',
  orderedAt         DateTime DEFAULT now(),
  shippedAt         DateTime?,
  deliveredAt       DateTime?
);

-- Ny enum för tilläggsstatus
enum AddOnOrderStatus {
  PENDING
  CONFIRMED
  SHIPPED
  DELIVERED
  CANCELED
}
```

## 🚀 Användning

### 1. Sätt upp prenumerationsplaner
```bash
cd backend
npx ts-node scripts/setupSubscriptionPlans.ts
```

### 2. Testa funktionerna

**Pausa prenumeration:**
```javascript
const response = await fetch('/api/subscriptions/sub_123/pause', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    pauseMonths: 2,
    reason: 'Semester'
  })
})
```

**Ändra frekvens:**
```javascript
const response = await fetch('/api/subscriptions/sub_123/frequency', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    interval: 'quarterly',
    intervalCount: 1
  })
})
```

**Lägg till produkt:**
```javascript
const response = await fetch('/api/subscriptions/sub_123/add-product', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    productId: 'prod_123',
    quantity: 1,
    discountPercent: 15
  })
})

// Response innehåller betalningslänk
const { paymentUrl } = await response.json()
window.location.href = paymentUrl
```

## 📊 Prenumerationsplaner

Vi har skapat 4 prenumerationsplaner:

1. **Månadsbox - Upptäck** (399 kr/månad)
   - 1-2 produkter per månad
   - 14 dagars gratis provperiod

2. **Månadsbox - Komplett** (649 kr/månad)
   - 2-3 produkter per månad
   - Fullständig hudvårdsrutin

3. **Kvartalsbox - Premium** (1499 kr/kvartal)
   - 4-6 produkter per leverans
   - Personlig hudkonsultation

4. **Årsbox - VIP** (4999 kr/år)
   - 12-15 produkter per år
   - VIP-förmåner och 25% rabatt

## 🔧 Teknisk Implementation

### Service Layer
- `SubscriptionService` utökad med nya metoder
- Integrerat med Viva Wallet för betalningar
- Automatisk hantering av pausade prenumerationer

### Database
- Nya fält i `subscriptions`-tabellen
- Ny `subscription_addons`-tabell
- Nya enums för status

### API Routes
- 5 nya endpoints för prenumerationshantering
- Autentisering och auktorisering
- Felhantering och logging

## 🎯 Nästa Steg

1. **Frontend-integration** - Skapa UI för de nya funktionerna
2. **Cron jobs** - Sätt upp automatisk hantering av pausade prenumerationer
3. **Notifikationer** - E-post när prenumeration pausas/återupptas
4. **Analytics** - Spåra användning av nya funktioner
5. **Testing** - Enhetstester för alla nya funktioner

## 📝 Exempel på Kundresor

### Pausa Prenumeration
1. Kund loggar in på sitt konto
2. Går till "Mina Prenumerationer"
3. Klickar "Pausa prenumeration"
4. Väljer längd (1-3 månader) och anledning
5. Bekräftar - prenumerationen pausas omedelbart

### Ändra Frekvens
1. Kund vill ändra från månadsvis till kvartalsvis
2. Går till prenumerationsinställningar
3. Väljer ny frekvens
4. Nästa fakturering sker enligt ny frekvens

### Lägg till Produkt
1. Kund browsar produkter
2. Ser "15% prenumerantrabatt" på produkter
3. Klickar "Lägg till i prenumeration"
4. Betalar rabatterat pris
5. Produkten levereras med nästa box 