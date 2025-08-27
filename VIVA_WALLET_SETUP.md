# Viva Wallet Setup och Konfiguration

## Miljövariabler

### Backend (.env)

```bash
# Viva Wallet Payment Configuration
VIVA_MERCHANT_ID=f7e523f3-327c-4d3a-88c7-ed5732dc34f0
VIVA_API_KEY=8drEG24sPbG3V9Vfpa9XR741cv1b3J
VIVA_CLIENT_ID=yoar0x9br2cr9n6y37xaqpq44r3o3waixyb6mx70tpas9.apps.vivapayments.com
VIVA_SOURCE_CODE=1753_Default                    # Skapa i Viva Wallet Portal under Payment Sources
VIVA_BASE_URL=https://api.vivapayments.com      # Använd demo-api.vivapayments.com för test

# Prenumerationer
VIVA_SUBSCRIPTION_SOURCE_CODE=1753_Subscription  # Separat source code för prenumerationer
```

### Frontend (.env.local)

```bash
# API
NEXT_PUBLIC_API_URL=https://1753websitebackend-production.up.railway.app

# Viva Wallet Smart Checkout
NEXT_PUBLIC_VIVA_PUBLIC_KEY=<hämtas från Viva Portal>
NEXT_PUBLIC_VIVA_SOURCE_CODE=1753_Default
NEXT_PUBLIC_VIVA_BASE_URL=https://api.vivapayments.com
NEXT_PUBLIC_VIVA_CLIENT_ID=yoar0x9br2cr9n6y37xaqpq44r3o3waixyb6mx70tpas9.apps.vivapayments.com
```

## Steg för Steg Setup i Viva Wallet Portal

### 1. Logga in på Viva Wallet
- Gå till: https://vivawallet.com
- Använd dina inloggningsuppgifter

### 2. Skapa Payment Sources
1. Gå till **Settings** → **Payment Sources**
2. Klicka på **"New Payment Source"**
3. Skapa två sources:
   
   **För vanliga köp:**
   - Name: `1753 Default`
   - Code: `1753_Default`
   - Type: E-commerce
   
   **För prenumerationer:**
   - Name: `1753 Subscription`
   - Code: `1753_Subscription`
   - Type: E-commerce
   - Enable: Recurring payments

### 3. Hämta Public Key för Smart Checkout
1. Gå till **Settings** → **API Access**
2. Under **"Smart Checkout"** sektionen
3. Kopiera **Public Key** värdet
4. Lägg till i frontend .env.local som `NEXT_PUBLIC_VIVA_PUBLIC_KEY`

### 4. Konfigurera Webhooks
1. Gå till **Settings** → **Webhooks**
2. Klicka **"Create Webhook"**
3. Fyll i:
   - URL: `https://1753websitebackend-production.up.railway.app/api/webhooks/viva-wallet`
   - Events: Välj alla payment-relaterade events
   - Active: Yes

### 5. Sätt upp domäner för Smart Checkout
1. Gå till **Settings** → **Smart Checkout** → **Allowed Domains**
2. Lägg till:
   - `https://1753website-production.up.railway.app`
   - `http://localhost:3000` (för utveckling)

## Multi-Currency Implementation

### Backend uppdateringar behövs:

1. **Lägg till currency detection baserat på locale**
2. **Uppdatera prisberäkning för olika valutor**
3. **Hantera valutakonvertering**

### Frontend uppdateringar:

1. **Visa priser i rätt valuta baserat på locale**
2. **Skicka valuta till backend vid checkout**

## Prenumerationsfunktioner

För att aktivera prenumerationer:

1. **I Viva Wallet Portal:**
   - Aktivera "Recurring Payments" för subscription source
   - Sätt upp subscription plans

2. **I koden:**
   - Använd `allowRecurring: true` när du skapar payment order
   - Implementera subscription management endpoints
   - Hantera recurring webhooks

## Testning

### Testkort (Demo miljö)
- Kort: `4111 1111 1111 1111`
- Utgång: Valfritt framtida datum
- CVV: Valfria 3 siffror

### Produktionschecklist
- [ ] Byt till production URL i alla miljövariabler
- [ ] Verifiera att alla source codes är skapade
- [ ] Testa med riktiga kort (små belopp)
- [ ] Kontrollera att webhooks fungerar
- [ ] Sätt upp monitoring för betalningar 