# 🚚 Ongoing WMS Integration Setup

## Översikt

Ongoing WMS (Warehouse Management System) hanterar lagerhållning och orderhantering för 1753 Skincare. Systemet är integrerat via både REST och SOAP API:er.

## 📋 Credentials från Ongoing

Du har fått följande credentials:

- **Username**: `WSI-FLO-Synka`
- **Password**: [Klicka här för att välja lösenord](länk från Ongoing)
- **GoodsOwnerId**: `135`
- **GoodsOwnerCode**: `Floranie`

## 🔧 API Endpoints

### REST API (Rekommenderat)
- **Base URL**: `https://api.ongoingsystems.se/Logit/api/v1/`
- **Dokumentation**: [REST API Docs](https://api.ongoingsystems.se/Logit/api/v1/)

### SOAP API (Legacy)
- **URL**: `https://api.ongoingsystems.se/Logit/service.asmx`
- **Service Description**: [SOAP Service](https://api.ongoingsystems.se/Logit/service.asmx?wsdl)

## ⚙️ Konfiguration

### 1. Environment Variables

Lägg till följande i Railway environment variables:

```bash
# Ongoing WMS Configuration
ONGOING_USERNAME=WSI-FLO-Synka
ONGOING_PASSWORD=ditt_valda_lösenord
ONGOING_GOODS_OWNER_ID=135
ONGOING_BASE_URL=https://api.ongoingsystems.se/Logit
```

### 2. Testa Konfigurationen

Kör följande script för att testa anslutningen:

```bash
cd backend
npx ts-node -e "
import { ongoingService } from './src/services/ongoingService';
ongoingService.testConnection().then(result => {
  console.log('Ongoing WMS Connection:', result ? '✅ Success' : '❌ Failed');
  process.exit(0);
}).catch(err => {
  console.error('❌ Connection failed:', err.message);
  process.exit(1);
});
"
```

## 🔄 Nuvarande Integration

### Orderflöde

1. **Kund lägger beställning** → Frontend
2. **Betalning processas** → Viva Wallet
3. **Order skapas** → Backend Database
4. **Order skickas till WMS** → Ongoing (via Sybka+)
5. **Lager uppdateras** → Ongoing
6. **Leverans skapas** → Ongoing
7. **Spårningsnummer** → Tillbaka till kund

### Befintliga Funktioner

```typescript
// Huvudfunktioner i OngoingService
class OngoingService {
  // Autentisering
  async getAuthToken(): Promise<string>
  
  // Kunder
  async createCustomer(customer: OngoingCustomer): Promise<string>
  async getCustomer(customerNumber: string): Promise<OngoingCustomer>
  
  // Ordrar
  async processOrder(orderDetails): Promise<{customerNumber, orderNumber}>
  async getOrderStatus(orderNumber: string): Promise<OrderStatus>
  
  // Produkter & Lager
  async getInventoryLevels(): Promise<InventoryLevel[]>
  async updateInventory(updates: InventoryUpdate[]): Promise<void>
  
  // Test
  async testConnection(): Promise<boolean>
}
```

## 🛠️ Implementering

### Aktuell Status

Systemet använder för närvarande **Sybka+** som mellanhand mellan 1753 Skincare och Ongoing:

```
1753 Skincare → Sybka+ → Fortnox → Ongoing WMS
```

### Direkt Integration (Alternativ)

Med dina nya credentials kan vi implementera direkt integration:

```
1753 Skincare → Ongoing WMS (direkt)
```

### Fördelar med Direkt Integration

- **Snabbare orderhantering** - Inga mellansteg
- **Bättre felhantering** - Direkt feedback från WMS
- **Realtidsuppdateringar** - Omedelbar lagerstatus
- **Enklare felsökning** - Färre system involverade

## 📝 Implementation Steps

### 1. Uppdatera Environment Variables

```bash
# I Railway Dashboard → Environment Variables
ONGOING_USERNAME=WSI-FLO-Synka
ONGOING_PASSWORD=[ditt_lösenord]
ONGOING_GOODS_OWNER_ID=135
ONGOING_BASE_URL=https://api.ongoingsystems.se/Logit
```

### 2. Testa Anslutning

```bash
# Kör test-scriptet
npm run test:ongoing
```

### 3. Aktivera Integration

I `orderService.ts`, ändra från Sybka+ till direkt Ongoing:

```typescript
// Nuvarande (via Sybka+)
const result = await this.processSybkaOrder(orderData, transactionId)

// Ny direkt integration
const result = await this.processOngoingOrder(orderData)
```

## 🔍 Felsökning

### Vanliga Problem

1. **Authentication Failed**
   - Kontrollera username/password
   - Verifiera GoodsOwnerId (135)

2. **API Timeout**
   - Kontrollera nätverksanslutning
   - Verifiera Base URL

3. **Invalid Product**
   - Produkter måste finnas i Ongoing först
   - Kontrollera SKU-mappning

### Debug-kommandon

```bash
# Testa autentisering
curl -X POST https://api.ongoingsystems.se/Logit/api/v1/authenticate \
  -H "Content-Type: application/json" \
  -d '{
    "UserName": "WSI-FLO-Synka",
    "Password": "ditt_lösenord",
    "GoodsOwnerId": 135
  }'

# Hämta lagerstatus
curl -X GET https://api.ongoingsystems.se/Logit/api/v1/inventory \
  -H "Authorization: Bearer [token]"
```

## 📊 Monitoring

### Viktiga Metriker

- **Order Success Rate** - % lyckade orderöverföringar
- **Inventory Sync** - Hur ofta lagret uppdateras
- **Response Times** - API-svarstider
- **Error Rates** - Felfrekvens per endpoint

### Logging

Alla Ongoing-anrop loggas i:
- **Info**: Lyckade operationer
- **Warn**: Retry-försök
- **Error**: Misslyckade operationer

## 🚀 Nästa Steg

1. **Sätt lösenord** för WSI-FLO-Synka kontot
2. **Konfigurera environment variables** i Railway
3. **Testa anslutning** med test-scriptet
4. **Aktivera direkt integration** (valfritt)
5. **Övervaka prestanda** och felloggar

## 📞 Support

- **Ongoing Support**: [support@ongoingsystems.se]
- **API Dokumentation**: [https://api.ongoingsystems.se/Logit/api/v1/]
- **Status Page**: [status.ongoingsystems.se] 