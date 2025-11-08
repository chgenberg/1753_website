# Viva Wallet → Fortnox Betalningsflöde - Verifikationsguide

## 🎯 Överblick

När en kund gör en köp via hemsidan och betalar med **Viva Wallet**, ska följande automatiskt ske:

```
1. Kund betalar via Viva Wallet Smart Checkout
   ↓
2. Viva Wallet skickar webhook till backend (PaymentConfirmed)
   ↓
3. Backend uppdaterar order-status (PAID/CONFIRMED)
   ↓
4. Fortnox-integration triggas automatiskt
   ├─ Skapar/hämtar kund
   ├─ Skapar order i Fortnox
   └─ Lagrar Fortnox-referens
   ↓
5. Ongoing WMS får ordern för lagerplockning
```

---

## 📋 Del 1: Verifiera Viva Wallet-webhookkonfiguration

### 1.1 Kontrollera Webhook-URL i Viva Wallet Dashboard

**Gå till Viva Wallet Admin Panel:**
1. Logga in på https://www.vivapayments.com/
2. Navigera till **Settings → API & Integration → Webhooks**
3. Verifiera att webhook-URL är registrerad:
   ```
   https://yourdomain.com/api/webhooks/payment/viva
   ```

**Aktiverade Event-typer ska inkludera:**
- ✅ `EventTypeId 1796` - Payment Created
- ✅ `EventTypeId 1797` - Transaction Payment Created

### 1.2 Testa Webhook-mottagning (lokal/test)

**GET-anrop för verifiering:**
```bash
curl -X GET "http://localhost:3001/api/webhooks/payment/viva?VivaWalletWebhookVerificationCode=TEST123"
```

**Förväntat svar:** Din skal returnera verifieringskoden som plain text:
```
TEST123
```

---

## 📋 Del 2: Verifiera Order-statusflöde

### 2.1 Manuell Webhook-simulering

**Endpoint för att testa webhook-hantering utan faktisk Viva Wallet-betalning:**

```bash
curl -X POST "http://localhost:3001/api/webhooks/test-webhook?orderNumber=1753-YourOrderNumber" \
  -H "Content-Type: application/json"
```

**Denna endpoint:**
1. Hämtar ordern från databasen
2. Uppdaterar status till `CONFIRMED` + `PAID`
3. Triggar Fortnox-synken
4. Returnerar resultat

**Förväntat svar:**
```json
{
  "success": true,
  "message": "Webhook test completed",
  "orderNumber": "1753-YourOrderNumber",
  "orderId": "order-uuid"
}
```

### 2.2 Debug Integrations-status

**Endpoint för att kontrollera miljökonfiguration:**

```bash
curl -X GET "http://localhost:3001/api/webhooks/debug-integrations"
```

**Denna endpoint returnerar:**
- ✅/❌ Fortnox-koppling status
- ✅/❌ Ongoing-koppling status
- ✅/❌ Miljövariabler konfigurerade
- 📋 Lista över senaste ordrar och deras sync-status

**Förväntat svar-exempel:**
```json
{
  "success": true,
  "debug_info": {
    "environment": {
      "FORTNOX_API_TOKEN": true,
      "FORTNOX_CLIENT_SECRET": true,
      "FORTNOX_BASE_URL": true,
      "ONGOING_USERNAME": true,
      "ONGOING_PASSWORD": true,
      "NODE_ENV": "production"
    },
    "fortnox_connection": true,
    "ongoing_connection": true,
    "recent_orders": [
      {
        "id": "order-1",
        "orderNumber": "1753-xxx",
        "status": "CONFIRMED",
        "paymentStatus": "PAID",
        "totalAmount": 499,
        "createdAt": "2025-10-29T10:00:00Z",
        "shouldSync": true
      }
    ]
  }
}
```

### 2.3 Verifiera senaste ordrar

**Endpoint för att se de senaste betalningarna:**

```bash
curl -X GET "http://localhost:3001/api/webhooks/debug/recent-orders?secret=1753"
```

Denna returnerar de 10 senaste ordrarna med information om:
- Order-status
- Betalningsstatus
- Belopp
- Om orderna är redo för sync till Fortnox

---

## 📋 Del 3: Test av Fortnox-integreringen

### 3.1 Verifiera Fortnox-koppling

**Endpoint för att testa Fortnox API-anslutning:**

```bash
curl -X GET "http://localhost:3001/api/webhooks/debug-fortnox"
```

**Förväntat svar vid framgång:**
```json
{
  "success": true,
  "environment": {
    "FORTNOX_API_TOKEN": true,
    "FORTNOX_CLIENT_SECRET": true,
    "FORTNOX_BASE_URL": true,
    "AUTH_MODE": "oauth_bearer"  // eller "legacy_headers"
  },
  "token": {
    "expiresIn": 3600,
    "expiresAt": "2025-10-29T11:30:00Z"
  },
  "response": {
    "status": 200,
    "data": { "CompanyName": "1753 Skincare AB", ... }
  }
}
```

### 3.2 Manuell Fortnox-test vid failed OAuth

Om du får token-fel:

```bash
curl -X POST "http://localhost:3001/api/webhooks/debug-fortnox/refresh"
```

Om det fortfarande inte fungerar, kan du manuellt uppdatera JWT-token:

```bash
curl -X POST "http://localhost:3001/api/webhooks/debug-fortnox/persist-env" \
  -H "Content-Type: application/json"
```

---

## 🧪 Del 4: Full End-to-End Test

### Scenario A: Skapa testorder och simulera betalning

**Steg 1: Skapa testorder**
```bash
curl -X GET "http://localhost:3001/api/webhooks/create-test-order"
```

**Förväntat svar:**
```json
{
  "success": true,
  "message": "Test order created and processed",
  "orderNumber": "1753-TEST-1729770000000",
  "orderId": "order-uuid-123"
}
```

**Steg 2: Verifiera att ordern synkades till Fortnox**
- Logga in på Fortnox
- Gå till **Orders** eller **Customers**
- Sök efter orderNumret `1753-TEST-XXXXX`
- Verifiera att kund- och orderdata är korrekt

**Steg 3: Verifiera internalNotes**
```bash
curl -X GET "http://localhost:3001/api/webhooks/debug/recent-orders?secret=1753"
```

Kontrollera att `internalNotes` innehåller:
```
Fortnox order: [FortnoxOrderNumber]
Ongoing order: [OngoingOrderNumber]
```

---

### Scenario B: Verklig Viva Wallet-betalning

**Testningssteg:**

1. **I testmiljö (demo.vivapayments.com):**
   - Använd testkortet: `4111 1111 1111 1111`
   - Vilken framtida datum som helst
   - Vilken CVC-kod som helst

2. **Gå igenom checkout:**
   - Fyll i produkter
   - Gå till betalning
   - Välj "Viva Wallet"
   - Betala med testkort

3. **Verifiera webhook-mottagning:**
   - Kontrollera backend-logs: `tail -f logs/combined.log`
   - Sök efter: `"Payment completed for order"`
   - Sök efter: `"Fortnox order created"`

4. **Kontrollera databas:**
   ```bash
   # Din e-handelsdatabas
   SELECT * FROM orders WHERE paymentStatus = 'PAID' ORDER BY createdAt DESC LIMIT 1;
   ```
   
   Verifiera:
   - `status` = `CONFIRMED`
   - `paymentStatus` = `PAID`
   - `internalNotes` innehåller Fortnox-referens

5. **Verifiera i Fortnox:**
   - Logga in på Fortnox
   - Gå till **Orders → Recent Orders**
   - Hitta ordningen med matchande orderNumber från e-handeln

---

## ⚠️ Del 5: Troubleshooting

### Problem: Webhook mottas inte

**Lösning:**
1. Verifiera webhook-URL i Viva Dashboard är korrekt
2. Kontrollera att backend är uppe och nåbar från internet
3. Verifiera firewall/proxy tillåter webhook-trafik
4. Aktivera debug-loggning:
   ```bash
   curl -X GET "http://localhost:3001/api/webhooks/viva-debug"
   ```

### Problem: Order hittas inte vid webhook

**Lösning:**
1. Verifiera att `paymentOrderCode` sparas när ordern skapas
2. Webhook-hanteraren söker på:
   - `paymentOrderCode`
   - `paymentReference`
   - `orderNumber` (via MerchantTrns)

3. Se debug-logs för order-matchning:
   ```
   "Order not found for Viva Wallet webhook"
   ```

### Problem: Fortnox-synken misslyckas

**Debug-steg:**
```bash
curl -X GET "http://localhost:3001/api/webhooks/debug-fortnox"
```

Vanliga problem:
1. **JWT-token utgånget** → Kör `/debug-fortnox/refresh`
2. **OAuth-credentials felaktig** → Kör OAuth-flödet igen
3. **API-gränser** → Vänta några sekunder och försök igen
4. **Ogiltiga data** → Verifiera att kunddata är korrekt

### Problem: Order uppdaterad men Fortnox-synk misslyckades

**Åtgärd - Synka manuellt senare:**
```bash
curl -X POST "http://localhost:3001/api/webhooks/manual-sybka-sync" \
  -H "Content-Type: application/json" \
  -d '{"orderId": "order-uuid"}'
```

**Eller synka alla pending orders:**
```bash
curl -X POST "http://localhost:3001/api/webhooks/sync-all-orders" \
  -H "Content-Type: application/json"
```

---

## 📊 Loggningsguide

### Se relevanta logs:

**Alla Viva Wallet-events:**
```bash
grep -i "viva" logs/combined.log | tail -50
```

**Alla Fortnox-events:**
```bash
grep -i "fortnox" logs/combined.log | tail -50
```

**Alla Ongoing-events:**
```bash
grep -i "ongoing" logs/combined.log | tail -50
```

**Webhook-mottagning:**
```bash
grep -i "VIVA WEBHOOK RECEIVED" logs/combined.log | tail -20
```

**Order-statusändringar:**
```bash
grep -i "order status change" logs/combined.log | tail -30
```

---

## ✅ Verifikationschecklista

- [ ] Webhook-URL registrerad i Viva Dashboard
- [ ] Event-typerna 1796 och 1797 aktiverade i Viva
- [ ] Fortnox API-token konfigurerad (eller OAuth)
- [ ] Fortnox-test returnerar OK status
- [ ] Testorder kan skapas och synkas
- [ ] Webhook-debug visar korrekta payload
- [ ] Order-status uppdateras till PAID/CONFIRMED
- [ ] Fortnox-order skapas automatiskt
- [ ] Fortnox-referens lagras i internalNotes
- [ ] End-to-end test genomfört med verklig betalning

---

## 🔧 Miljövariabler som krävs

```bash
# Viva Wallet
VIVA_MERCHANT_ID=your_merchant_id
VIVA_API_KEY=your_api_key
VIVA_CLIENT_ID=your_client_id
VIVA_CLIENT_SECRET=your_client_secret
VIVA_SOURCE_CODE=your_source_code
VIVA_BASE_URL=https://api.vivapayments.com

# Fortnox (legacy)
FORTNOX_API_TOKEN=your_token
FORTNOX_CLIENT_SECRET=your_secret
FORTNOX_BASE_URL=https://api.fortnox.se/3

# Fortnox (OAuth - modern)
FORTNOX_USE_OAUTH=true
FORTNOX_CLIENT_ID=your_client_id
FORTNOX_REFRESH_TOKEN=your_refresh_token
FORTNOX_API_TOKEN=your_oauth_access_token  # Uppdateras automatiskt

# Ongoing
ONGOING_USERNAME=your_username
ONGOING_PASSWORD=your_password
ONGOING_GOODS_OWNER_ID=your_goods_owner_id
ONGOING_BASE_URL=https://api.ongoingsystems.se
```

---

## 📞 Kontakt & Support

Använd dessa endpoints för ytterligare debugging:
- `/api/webhooks/test-integration?orderId=...` - Testa integration för specifik order
- `/api/webhooks/order-statuses` - Se tillgängliga order-statusar
- `/api/webhooks/test-webhook?orderNumber=...` - Simulera webhook för order
