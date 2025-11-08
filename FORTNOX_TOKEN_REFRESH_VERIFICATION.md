# Fortnox OAuth Token Refresh - Verifikationsguide

**Datum**: 2025-10-29

## 🎯 Oversikt

Din backend har en **automatisk token-refresh mekanisme** som:
1. ✅ Detekterar när OAuth-token är på väg att upphöra
2. ✅ Använder refresh-token för att få en ny access-token
3. ✅ Uppdaterar Railway-miljövariabler automatiskt
4. ✅ Uppdaterar in-memory token för omedelbar användning

---

## 📊 Hur Token Refresh Fungerar

```
┌─────────────────────────────────────────────────────────┐
│  FORTNOX OAuth ACCESS-TOKEN (1 timme giltigt)          │
│  JWT format: eyJhbGc...eyJ...sig...                    │
└─────────────────┬───────────────────────────────────────┘
                  │
        [PROACTIVE CHECK VARJE 10 MIN]
        ↓ Om <5 minuter kvar...
                  │
┌─────────────────────────────────────────────────────────┐
│  REFRESH REQUEST TILL FORTNOX                           │
│  URL: https://apps.fortnox.se/oauth-v1/token          │
│  Med: grant_type=refresh_token                          │
│       refresh_token=xxxx                                │
└─────────────────┬───────────────────────────────────────┘
                  │
┌─────────────────────────────────────────────────────────┐
│  NYA TOKENS MOTTAGNA                                    │
│  - access_token (ny, 1 tim giltigt)                     │
│  - refresh_token (ny, kan roteras)                      │
└─────────────────┬───────────────────────────────────────┘
                  │
    ┌─────────────┴────────────────┐
    │                              │
    ▼                              ▼
IN-MEMORY UPDATE           RAILWAY ENV UPDATE
(omedelbar)                (background, best-effort)
```

---

## 🔍 Verifiering Step 1: Se Token-Expiry Info

**Endpoint för att se aktuell token-status:**

```bash
curl -X GET "https://yourdomain.com/api/webhooks/debug-fortnox"
```

**Förväntat svar:**

```json
{
  "success": true,
  "environment": {
    "FORTNOX_API_TOKEN": true,
    "FORTNOX_CLIENT_SECRET": true,
    "FORTNOX_BASE_URL": true,
    "AUTH_MODE": "oauth_bearer"
  },
  "token": {
    "isOAuth": true,
    "expMs": 1729852800000,           // Millisekunder (Unix timestamp)
    "expISO": "2025-10-25T10:00:00Z", // Läsbar format
    "nowISO": "2025-10-25T09:30:00Z"  // Nu
  },
  "response": {
    "status": 200,
    "data": { "CompanyName": "1753 Skincare AB" }
  }
}
```

**Vad detta visar:**
- ✅ `token.expISO` - När token upphör
- ✅ `token.nowISO` - Aktuell tid
- ✅ Beräkna: `expISO - nowISO` = tid kvar

---

## 🔍 Verifiering Step 2: Se Refresh-logik I Action

### Option A: Vänta på automatisk refresh (10 min checkinterval)

1. **Notera aktuell token-expiry:**
   ```bash
   curl -s "https://yourdomain.com/api/webhooks/debug-fortnox" | jq '.token.expISO'
   ```
   Sparad: `2025-10-25T10:00:00Z`

2. **Vänta minst 5 minuter innan token upphör**

3. **Se loggen för refresh-meddelande:**
   ```bash
   tail -f logs/combined.log | grep -i "fortnox.*refresh"
   ```

   Förväntad logg-utdata:
   ```
   [Fortnox] Proactive refresh: token close to expiry, refreshing...
   Fortnox access token refreshed successfully (in-memory).
   Updated FORTNOX_API_TOKEN in Railway (best effort).
   ```

### Option B: Tvinga Refresh (Debug-endpoint)

**Força omedelbar refresh:**

```bash
curl -X POST "https://yourdomain.com/api/webhooks/debug-fortnox/refresh" \
  -H "Content-Type: application/json"
```

**Förväntat svar:**

```json
{
  "success": true,
  "result": {
    "refreshed": true,
    "rotated": true  // true = ny refresh-token fick, false = samma som innan
  }
}
```

**Se loggen för verifikation:**

```bash
tail -f logs/combined.log | grep -E "(Fortnox|refresh)" | head -20
```

Förväntade loggar:
```
Fortnox access token has expired. Attempting to refresh...
Fortnox access token refreshed successfully (in-memory).
Updated FORTNOX_API_TOKEN in Railway (best effort).
🎉 Refresh token updated automatically in Railway! No manual action needed.
```

---

## 🔍 Verifiering Step 3: Verifiera Token Faktiskt Uppdaterades

### Kontrollera In-Memory Token (omedelbar)

Efter att ha kört refresh, kan du se att token är uppdaterad:

```bash
# Köra debug-endpoint två gånger
curl -s "https://yourdomain.com/api/webhooks/debug-fortnox" | jq '.token'

# Vänta
sleep 5

# Köra igen - token borde vara annorlunda
curl -s "https://yourdomain.com/api/webhooks/debug-fortnox" | jq '.token'
```

**Om token uppdaterades:**
- `expISO` kommer att **vara senare** än tidigare
- Fler minuter/timmar kvar

### Kontrollera Railway-miljövariabler (försening ~5-10 sekunder)

**Efter refresh, verifiera att Railway uppdaterades:**

1. **Logga in på Railway Dashboard**
   - https://railway.app

2. **Navigera till projekt → Service → Variables**

3. **Verifiera `FORTNOX_API_TOKEN`:**
   - Kopiera värdet
   - Den borde **börja med `eyJ`** (JWT format)
   - Den borde **vara annorlunda än innan**

4. **Verifiera `FORTNOX_REFRESH_TOKEN`:**
   - Om roterad (spinning), borde den **vara annorlunda**
   - Se loggen för meddelande: `Refresh token updated automatically`

---

## ✅ Verifikationschecklista

### Token Refresh Status

- [ ] `/debug-fortnox` returnerar `"AUTH_MODE": "oauth_bearer"`
- [ ] `token.isOAuth` = `true`
- [ ] `token.expISO` är en framtida tid
- [ ] `token.nowISO` är före `token.expISO`

### Automatisk Refresh

- [ ] `/debug-fortnox/refresh` returnerar `success: true`
- [ ] Loggen visar: `"Fortnox access token refreshed successfully"`
- [ ] Loggen visar: `"Updated FORTNOX_API_TOKEN in Railway"` (eller GraphQL fallback)

### Railway Integration

- [ ] `FORTNOX_API_TOKEN` är uppdaterad i Railway
- [ ] `FORTNOX_REFRESH_TOKEN` är uppdaterad i Railway (eller samma om inte roterad)
- [ ] Inget kräver manuell uppdatering (auto-update lyckades)

### End-to-End Test

- [ ] Skapa testorder: `/api/webhooks/create-test-order`
- [ ] Förtnox-synk lyckas även om token är nära utgång
- [ ] Inga 401-fel i loggen

---

## ⚠️ Troubleshooting

### Problem: "Failed to refresh Fortnox access token"

**Möjliga orsaker:**

1. **Refresh-token är utgånget/invalid**
   ```
   error: "invalid_grant"
   ```
   **Lösning:** Kör OAuth-flödet igen för att få ny refresh-token

2. **Credentials saknas**
   ```
   clientId, clientSecret, or refreshToken
   ```
   **Lösning:** Verifiera env-variabler:
   ```bash
   echo $FORTNOX_CLIENT_ID
   echo $FORTNOX_CLIENT_SECRET
   echo $FORTNOX_REFRESH_TOKEN
   ```

3. **Railway-uppdatering misslyckades men in-memory är OK**
   ```
   Railway CLI update failed
   ```
   **Lösning:** Systemet faller tillbaka till GraphQL API
   - In-memory token fungerar (omedelbar)
   - Efter omstart behövs manuell Railway-uppdatering

### Problem: Token Roteras Inte (Refresh-token är samma)

**Detta är normalt!** Fortnox roterar inte alltid refresh-token. Det spelar ingen roll om:
- `result.rotated` = `false` (refresh-token är samma som innan)
- Access-token är nytt (det viktiga)

### Problem: Railway-uppdatering Misslyckades

**Debug:**

```bash
# Kontrollera Railway-variabler är satta
echo "Token: $RAILWAY_API_TOKEN"
echo "Project: $RAILWAY_PROJECT_ID"
echo "Service: $RAILWAY_SERVICE_ID"
echo "Environment: $RAILWAY_ENVIRONMENT_ID"
```

**Fallback-mekanismer (automatisk):**
1. Railway CLI (försök först)
2. Railway GraphQL API (fallback)
3. Logg varning med nytt token (sista utvägen)

---

## 🔧 Manuell Token Refresh (Om Automatisk Fallerar)

### Scenario: Token utgånget och refresh misslyckades

**Steg 1: Hämta nytt token via OAuth-flöde:**

```bash
curl -X GET "https://yourdomain.com/api/webhooks/fortnox/oauth/start"
```

Detta omdirigerar dig till Fortnox login.

**Steg 2: Efter login, uppdateras token automatiskt:**

- `FORTNOX_API_TOKEN` uppdateras i Railway
- `FORTNOX_REFRESH_TOKEN` uppdateras i Railway
- Backend använder omedelbar

**Steg 3: Verifiera:**

```bash
curl -X GET "https://yourdomain.com/api/webhooks/debug-fortnox"
```

---

## 📊 Token Lifecycle

```
OAUTH FLOW
│
├─ Authorization: Kund loggar in på Fortnox
│  ↓
├─ Grant Token: Fortnox skickar tillbaka kod
│  ↓
├─ Exchange: Kod byts mot access_token + refresh_token
│  ↓
├─ Lagring: Tokens sparas i Railway env-variabler
│  ↓

NORMAL OPERATIONS
│
├─ Access-token är giltigt i ~1 timme
│  ↓
├─ Backend gör Fortnox API-anrop med Bearer token
│  ↓
├─ Svar 200 OK
│  ↓

TOKEN EXPIRES
│
├─ Proactive refresh detekterar <5 min kvar
│  ↓
├─ Refresh-request till Fortnox
│  ↓
├─ Nya tokens mottagna
│  ↓
├─ In-memory uppdaterad (omedelbar)
│  ↓
├─ Railway uppdaterad (background)
│  ↓

NÄSTA TIMME
│
└─ Upprepa cycle...
```

---

## 📋 Konfiguration Checklist för OAuth

Innan du kan använda automatisk refresh, behövs:

- [ ] `FORTNOX_USE_OAUTH` = `"true"`
- [ ] `FORTNOX_CLIENT_ID` = ditt Fortnox OAuth app-ID
- [ ] `FORTNOX_CLIENT_SECRET` = ditt Fortnox OAuth app-secret
- [ ] `FORTNOX_REFRESH_TOKEN` = från initial OAuth-flow
- [ ] `RAILWAY_API_TOKEN` = för att uppdatera variabler (optional men rekommenderat)
- [ ] `RAILWAY_PROJECT_ID` = ditt Railway-projekt
- [ ] `RAILWAY_SERVICE_ID` = din backend-service
- [ ] `RAILWAY_ENVIRONMENT_ID` = din miljö (production/staging)

**Hämta Railway-credentials:**

1. Logga in på Railway
2. Gå till projekt → Settings → Tokens
3. Skapa en token med scope `read`, `write` för variables
4. Sätt som env-variabler

---

## 🎯 Sammanfattning

**Token Refresh är fullt automatiserat:**

✅ Ingen manuell intervention behövs normalt  
✅ Refresh-token används för att få ny access-token  
✅ In-memory uppdateras omedelbar  
✅ Railway-variabler uppdateras automatiskt  
✅ Fallback-mekanismer för om Railway-uppdatering misslyckas  

**Du kan verifiera genom:**

1. Köra `/debug-fortnox` för att se token-expiry
2. Köra `/debug-fortnox/refresh` för att tvinga refresh
3. Se loggen för `"access token refreshed successfully"`
4. Verifiera i Railway Dashboard att tokens uppdaterades

**Om något inte fungerar:**
- Se troubleshooting-sektionen ovan
- Kolla loggen för specifikt felmeddelande
- Hämta nytt OAuth-token om refresh-token är utgånget

