# 🚀 E-handelsintegrationer Setup Guide

Den här guiden beskriver hur du sätter upp integrationer med **Viva Wallet**, **Fortnox** och **Ongoing** för automatisk orderhantering.

## 📋 Översikt

När en kund genomför en beställning händer följande automatiskt:

1. **Kund betalar** → Viva Wallet hanterar betalningen
2. **Betalning godkänns** → Webhook triggas
3. **Order skickas till Ongoing** → 3PL lagret börjar plocka/packa
4. **Order registreras i Fortnox** → Automatisk bokföring
5. **Kund får orderbekräftelse** → Via Drip email automation

## 🔑 API-nycklar som behövs

### Viva Wallet
```bash
VIVA_CLIENT_ID=your_client_id
VIVA_CLIENT_SECRET=your_client_secret
VIVA_MERCHANT_ID=your_merchant_id
VIVA_API_KEY=your_api_key
VIVA_SOURCE_CODE=your_source_code
VIVA_BASE_URL=https://api.vivapayments.com  # Production: https://api.vivapayments.com
```

### Fortnox
```bash
FORTNOX_API_TOKEN=your_api_token
FORTNOX_CLIENT_SECRET=your_client_secret
FORTNOX_BASE_URL=https://api.fortnox.se/3
```

### Ongoing WMS
```bash
ONGOING_USERNAME=your_username
ONGOING_PASSWORD=your_password
ONGOING_GOODS_OWNER_ID=your_goods_owner_id
ONGOING_BASE_URL=https://api.ongoingsystems.se
```

### E-postnotifieringar (befintlig Drip integration)
```bash
DRIP_API_TOKEN=your_drip_token
DRIP_ACCOUNT_ID=your_account_id
```

## 🛠️ Setup Instruktioner

### 1. Viva Wallet Setup

#### Skapa utvecklarkonto:
1. Gå till [Viva Wallet Developer Portal](https://www.vivapayments.com/developers)
2. Registrera ditt företag
3. Skapa en ny applikation
4. Hämta API-nycklar från Dashboard

#### Konfigurera webhooks:
1. I Viva Wallet Dashboard → Settings → Webhooks
2. Lägg till webhook URL: `https://yourdomain.com/api/orders/webhook/viva-wallet`
3. Välj events: `Payment Created`, `Payment Completed`, `Payment Failed`
4. Aktivera webhook

#### Testmiljö:
- Använd demo.vivapayments.com för testning
- Testkort: 4111 1111 1111 1111 (Visa)
- CVV: vilken 3-siffrig kod som helst
- Datum: vilket framtida datum som helst

### 2. Fortnox Setup

#### API-åtkomst:
1. Logga in på Fortnox
2. Gå till Inställningar → Integrationer → API
3. Aktivera API-åtkomst
4. Generera Access Token
5. Hämta Client Secret

#### Kontoinställningar:
- Se till att artikelkonton är konfigurerade (3001 för försäljning)
- Konfigurera momssatser (25% standard i Sverige)
- Sätt upp kundtyper

#### Testning:
```bash
curl -X GET "https://api.fortnox.se/3/companyinformation" \
  -H "Access-Token: YOUR_API_TOKEN" \
  -H "Client-Secret: YOUR_CLIENT_SECRET"
```

### 3. Ongoing WMS Setup

#### Konto och åtkomst:
1. Kontakta Ongoing för API-åtkomst
2. Få GoodsOwner ID från er kontoansvarige
3. Skapa API-användare med rätt behörigheter

#### Artikelkonfiguration:
- Säkerställ att alla produkter finns i Ongoing
- Konfigurera vikter och mått för fraktkostnader
- Sätt upp lagerlokationer

#### Testning:
```bash
# Test authentication
curl -X POST "https://api.ongoingsystems.se/api/v1/authenticate" \
  -H "Content-Type: application/json" \
  -d '{
    "UserName": "your_username",
    "Password": "your_password", 
    "GoodsOwnerId": your_goods_owner_id
  }'
```

## 🔧 Installation & Konfiguration

### 1. Backend Dependencies
```bash
cd backend
npm install axios crypto
```

### 2. Environment Variables
Kopiera `.env.example` till `.env` och fyll i alla API-nycklar:

```bash
cp .env.example .env
```

### 3. Starta servrar
```bash
# Backend (port 5002)
cd backend && npm run dev

# Frontend (port 3000) 
cd frontend && npm run dev
```

### 4. Testa integrationer
```bash
# Testa alla integrationer
curl http://localhost:5002/api/orders/test/integrations

# Förväntat svar:
{
  "success": true,
  "integrations": {
    "vivaWallet": true,
    "fortnox": true,
    "ongoing": true
  },
  "message": "All integrations working"
}
```

## 🔄 Orderflöde i detalj

### 1. Checkout Process
```typescript
// Frontend skickar orderdata till backend
POST /api/orders/payment
{
  "customer": { ... },
  "items": [ ... ],
  "total": 299,
  "paymentMethod": "card"
}

// Backend skapar betalning i Viva Wallet
// Returnerar redirect URL till Viva Wallet
```

### 2. Payment & Webhook
```typescript
// Kund betalar på Viva Wallet
// Viva Wallet skickar webhook till:
POST /api/orders/webhook/viva-wallet
{
  "OrderCode": 123456,
  "StateId": 1, // 1 = Paid
  "Amount": 29900, // In cents
  "TransactionId": "abc123"
}
```

### 3. Automatisk processsering
```typescript
// Backend koordinerar:
Promise.all([
  fortnox.createOrder(orderData),    // Bokföring
  ongoing.createOrder(orderData),    // Lagerorder
  drip.sendConfirmation(orderData)   // Email
])
```

## 📊 Monitoring & Logging

### Loggar att övervaka:
```bash
# Backend logs
tail -f backend/logs/app.log | grep -E "(Payment|Order|Webhook)"

# Viktiga events:
# "Payment created for order: ORDER_ID"
# "Webhook processed successfully"  
# "Fortnox order created: ORDER_NUM"
# "Ongoing order created: ORDER_NUM"
```

### Health Checks:
```bash
# Kontrollera systemhälsa
curl http://localhost:5002/api/orders/health

# Testa specifika integrationer
curl http://localhost:5002/api/orders/test/integrations
```

### Error Handling:
- **Betalning misslyckas** → Kund redirectas med felmeddelande
- **Fortnox fails** → Order skapas ändå, varning loggas för manuell hantering  
- **Ongoing fails** → Order skapas ändå, varning loggas för manuell hantering
- **Webhook timeout** → Viva Wallet försöker igen automatiskt

## 🔐 Säkerhet

### Webhook Säkerhet:
- Signaturverifiering för alla webhooks
- Rate limiting på API endpoints
- HTTPS required för production

### API Säkerhet:
- API-nycklar lagras säkert i environment variables
- Aldrig logga känslig data (API keys, card numbers)
- Regelbunden rotation av API-nycklar

### Data Protection:
- Kunddata behandlas enligt GDPR
- Kortdata hanteras aldrig av vår applikation
- PCI-compliance genom Viva Wallet

## 🚨 Troubleshooting

### Vanliga problem:

#### Viva Wallet webhook kommer inte fram:
```bash
# Kontrollera webhook URL är korrekt
# Verifiera SSL-certifikat är giltigt
# Kolla Viva Wallet logs för delivery attempts
```

#### Fortnox API errors:
```bash
# Rate limiting - max 4 requests/sekund
# Kontrollera API token är giltigt
# Verifiera korrekt Content-Type headers
```

#### Ongoing connection issues:
```bash
# Kontrollera GoodsOwner ID är korrekt
# Verifiera användarnamn/lösenord
# Säkerställ IP är whitelistad hos Ongoing
```

### Debug Mode:
```bash
# Aktivera verbose logging
export DEBUG=true
export LOG_LEVEL=debug

# Starta backend med debug mode
npm run dev
```

## 📞 Support & Kontakt

### Teknisk Support:
- **Viva Wallet**: support@vivapayments.com
- **Fortnox**: support@fortnox.se  
- **Ongoing**: support@ongoingsystems.se

### Implementering Support:
- Kontakta utvecklingsteamet för custom integration hjälp
- API dokumentation finns på respektive leverantörs utvecklarsidor

## 📈 Nästa Steg

### Utökningar att överväga:
1. **Inventory sync** mellan Ongoing och webbshop
2. **Shipping tracking** integration för kundnotifieringar
3. **Returns handling** automatisering
4. **Analytics dashboard** för orderstatistik
5. **Multi-currency** support för internationell expansion

### Performance Optimering:
1. **Caching** av API responses
2. **Queue system** för webhook processing
3. **Database optimization** för order storage
4. **CDN** för static assets 