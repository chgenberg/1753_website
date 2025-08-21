# Sybka+ Sync Service

En Laravel/PHP-app för att integrera med Sybka+ warehouse management system.

## Vad är Sybka+?

Sybka+ är ett warehouse management system (WMS) som:
- **Synkar produkter från Fortnox automatiskt** (därför är product endpoint tom initialt)
- **Tar emot ordrar från e-handel** och skickar till lagret för plockning/packning
- **Hanterar lagerhantering och fulfillment**

## Fungerande API Endpoints

Baserat på API-utforskning har vi identifierat följande endpoints:

### ✅ Tillgängliga:
- `GET /api/product` - Hämta produkter (synkas från Fortnox)
- `GET /api/order` - Hämta ordrar 
- `POST /api/order` - Skapa ny order (från e-handel till lager)

### ❌ Inte tillgängliga:
- `/products`, `/orders` (pluralform fungerar inte)
- Warehouse-specifika endpoints 
- Customer/company endpoints

## Installation

### Alternativ 1: Lokal installation

1. **Installera PHP och Composer**
```bash
# macOS
brew install php composer

# Verifiera
php --version
composer --version
```

2. **Starta servern**
```bash
cd sybka-sync
php -S localhost:8000 simple-server.php
```

### Alternativ 2: Docker

```bash
cd sybka-sync
docker-compose up -d
```

## Konfiguration

API-uppgifter är redan konfigurerade:
- **API URL:** `https://mitt.synkaplus.se/api/`
- **Team ID:** `844`
- **Token:** `QgFCIjnAOZrZlD2J4pxyJq8VmPZNH7sl5jG5U3gSQbBb25eO6r2yEQoYm1eV`

## Användning

### Testa anslutning:
```bash
curl http://localhost:8000/api/sybka/test
```

### Hämta produkter (från Fortnox):
```bash
curl http://localhost:8000/api/sybka/products
```

### Skapa order (från e-handel till lager):
```bash
curl -X POST http://localhost:8000/api/sybka/orders \
  -H "Content-Type: application/json" \
  -d @order_data.json
```

## Integration Flow

```
Fortnox ERP → Sybka+ → Warehouse
     ↓           ↑
E-commerce → Order API
```

1. **Produkter:** Fortnox → Sybka+ (automatisk synk)
2. **Ordrar:** E-commerce → Sybka+ → Warehouse fulfillment
3. **Inventory:** Sybka+ hanterar lagersaldon

## Från din Node.js backend:

```javascript
// Skicka order till Sybka+ för fulfillment
const orderResponse = await fetch('http://localhost:8000/api/sybka/orders', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    // Order data från din e-handel
    shop_order_id: orderId,
    customer_info: customerData,
    order_items: items,
    shipping_address: shippingAddress
  })
});
```

## Nästa steg:

1. **Synka produkter från Fortnox** - kontrollera Sybka+ inställningar för att aktivera produktsynk
2. **Testa orderflödet** - skicka testorder från din e-handel
3. **Verifiera warehouse-integration** - kontrollera att ordrar kommer fram till lagret

## Loggning

Alla API-anrop loggas. Kontrollera:
```bash
# För lokal server
tail -f storage/logs/laravel.log

# För Docker
docker-compose logs app
``` 