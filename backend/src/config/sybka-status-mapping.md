# Sybka Plus - Orderstatusmappning för Team ID 844

## Översikt

Detta dokument beskriver hur orderstatusar i 1753 Skincare-systemet mappar mot Sybka Plus och Fortnox för automatisk fakturering och fulfillment.

## Team-ID Konfiguration

- **Team ID**: 844
- **Fortnox-integration**: Aktiverad
- **Order prefix**: "1753-"

## Statusmappning

### Orderstatusar som triggar fakturaskapande i Fortnox

När en order får följande kombinationer av status skapas automatiskt en faktura i Fortnox:

```typescript
// Status som triggar fakturaskapande
invoice_triggers: ['CONFIRMED', 'PROCESSING']

// Villkor: paymentStatus måste vara 'PAID'
```

**Exempel:**
- Order med status `CONFIRMED` + paymentStatus `PAID` → Skapa Fortnox-faktura
- Order med status `PROCESSING` + paymentStatus `PAID` → Skapa Fortnox-faktura

### Orderstatusar som triggar Sybka-order för fulfillment

När en order får följande betalningsstatus skickas den till Sybka Plus för fulfillment:

```typescript
// Status som triggar Sybka-order
order_triggers: ['PAID']
```

**Exempel:**
- Order med paymentStatus `PAID` → Skicka till Sybka Plus

## Flöde

### 1. Betalning bekräftas (Viva Wallet webhook)
```
Order: PENDING + PENDING
↓ (Viva Wallet webhook)
Order: CONFIRMED + PAID
↓ (Automatiskt)
- Skapa Fortnox-faktura (pga CONFIRMED + PAID)
- Skicka till Sybka Plus (pga PAID)
```

### 2. Admin uppdaterar orderstatus manuellt
```
Order: CONFIRMED + PAID + Fortnox-faktura skapad + Skickad till Sybka
↓ (Admin ändrar till PROCESSING)
Order: PROCESSING + PAID
↓ (Automatiskt)
- Fortnox-faktura redan skapad (ingen dubbel)
- Sybka-order redan skickad (ingen dubbel)
```

## Webhook-endpoints

### Interna webhooks
- `POST /api/webhooks/order-status-change` - Triggas när orderstatusar ändras
- `POST /api/webhooks/test-status-change` - Test-endpoint för manuell triggning

### Externa webhooks
- `POST /api/webhooks/payment/viva` - Viva Wallet betalningsbekräftelser
- `POST /api/webhooks/fortnox` - Fortnox events (framtida användning)

## Konfigurationsvariabler

```env
# Sybka Plus
SYNKA_ACCESS_TOKEN=QgFCIjnAOZrZlD2J4pxyJq8VmPZNH7sl5jG5U3gSQbBb25eO6r2yEQoYm1eV
SYNKA_TEAM_ID=844
SYNKA_API_URL=https://mitt.synkaplus.se/api/
SYBKA_SYNC_URL=http://localhost:8000

# Fortnox
FORTNOX_CLIENT_ID=lWspWpJ1EjTS
FORTNOX_CLIENT_SECRET=vyzsHYsaNu
FORTNOX_ORDER_PREFIX=1753-
```

## Testning

För att testa statusmappningen manuellt:

```bash
curl -X POST http://localhost:5002/api/webhooks/test-status-change \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "order_123",
    "status": "CONFIRMED", 
    "paymentStatus": "PAID"
  }'
```

## Loggning

Alla statusändringar och integrationer loggas med följande information:
- Team ID (844)
- Order ID
- Gamla och nya statusar
- Fortnox-resultat
- Sybka Plus-resultat
- Eventuella fel

## Synka Plus Rekommendationer

Baserat på Synka Plus meddelande:
- `create_order_on_status: 'completed'` - Vi använder 'PAID' istället
- `create_invoice_on_status: 'shipped'` - Vi använder 'CONFIRMED'/'PROCESSING' istället
- `fortnox_as_master: true` - Fortnox är master-system
- `sync_interval: '15_minutes'` - Synkronisering var 15:e minut 