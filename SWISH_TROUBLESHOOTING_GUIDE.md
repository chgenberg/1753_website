# Swish Integration Troubleshooting Guide

## Problem: Swish visas inte i Viva Wallet popup

### Lösning: Flera steg krävs för att aktivera Swish

## ✅ Steg 1: Backend-konfiguration (KLART)

Följande ändringar har gjorts i koden:

### `backend/src/services/orderService.ts`
```typescript
const paymentOrder = {
  amount: orderData.total, // Amount in major units (SEK), not cents
  currency: 'SEK',
  // ... andra parametrar
  enableSwish: true // ✅ TILLAGT: Enable Swish payments
}
```

### `backend/src/services/vivaWalletService.ts`
```typescript
const vivaOrderData = {
  amount: Math.round(orderData.amount * 100), // Convert to cents for Viva API
  // ... andra parametrar
  enableSwish: orderData.enableSwish || true, // ✅ TILLAGT: Enable Swish by default
  disableCash: orderData.disableCash || false,
  disableWallet: orderData.disableWallet || false,
  // ... andra parametrar
}
```

### Miljövariabler tillagda i `.env`:
```bash
VIVA_CLIENT_ID=yoar0x9br2cr9n6y37xaqpq44r3o3waixyb6mx70tpas9.apps.vivapayments.com
VIVA_SOURCE_CODE_SEK=1753_SKINCARE
VIVA_SOURCE_CODE_EUR=1753_SKINCARE
VIVA_SOURCE_CODE_SUBSCRIPTION=1753_SKINCARE
```

## 🔄 Steg 2: Viva Wallet Portal-konfiguration (BEHÖVER GÖRAS)

### A. Kontrollera Payment Source-konfiguration

1. **Logga in på Viva Wallet Portal**
   - Gå till: https://vivawallet.com
   - Logga in med dina uppgifter

2. **Gå till Settings → Payment Sources**
   - Hitta din Payment Source: `1753_SKINCARE`
   - Klicka på "Edit" eller "Configure"

3. **Kontrollera att Swish är aktiverat**
   - Under "Payment Methods" eller "Enabled Methods"
   - Se till att **Swish** är markerat/aktiverat
   - Om inte, aktivera det och spara

### B. Kontrollera Merchant-konfiguration

1. **Gå till Settings → Account Settings**
2. **Under "Payment Methods" eller "Supported Methods"**
3. **Kontrollera att Swish är aktiverat för ditt merchant-konto**

### C. Kontrollera geografiska begränsningar

1. **Gå till Settings → Geographic Settings**
2. **Se till att Sverige (SE) är aktiverat**
3. **Kontrollera att Swish är tillgängligt för svenska kunder**

## 🔄 Steg 3: Testa implementationen

### A. Starta om backend-servern
```bash
cd backend
npm run dev
```

### B. Testa en betalning
1. Gå till checkout-sidan
2. Skapa en order
3. Kontrollera att Swish-alternativet visas i popup:en

### C. Kontrollera loggar
Backend kommer nu logga detaljerad information:
```bash
# Kolla backend-loggar för:
"Viva Wallet order created" {
  "enableSwish": true,
  "sourceCode": "1753_SKINCARE",
  "requestData": {
    "enableSwish": true,
    "disableCash": false,
    "disableWallet": false
  }
}
```

## 🔍 Felsökning

### Om Swish fortfarande inte visas:

#### 1. Kontrollera API-svar
Kolla backend-loggarna för Viva Wallet API-svar:
```bash
# Leta efter fel som:
"Failed to create Viva Wallet order"
```

#### 2. Kontrollera Viva Wallet-status
- Logga in på Viva Wallet Portal
- Gå till "Dashboard" → "Account Status"
- Se till att kontot är fullt aktiverat

#### 3. Kontrollera Swish-avtal
- Swish kräver ett separat avtal med Viva Wallet
- Kontakta Viva Wallet support om Swish inte är tillgängligt

#### 4. Testa med olika belopp
- Vissa betalningsmetoder har min/max-begränsningar
- Testa med belopp mellan 1-5000 SEK

#### 5. Kontrollera användarens land
- Swish är endast tillgängligt för svenska användare
- Se till att `countryCode: 'SE'` skickas korrekt

## 📞 Support

### Viva Wallet Support
- **Email:** support@vivapayments.com
- **Telefon:** +30 210 0001000
- **Portal:** https://vivawallet.com/support

### Vanliga frågor att ställa till Viva Wallet:
1. "Är Swish aktiverat för mitt merchant-konto?"
2. "Vilka payment sources stöder Swish?"
3. "Finns det geografiska begränsningar för Swish?"
4. "Behöver jag ett separat avtal för Swish?"

## 🧪 Test-data

### Test-belopp för Swish:
- **Framgångsrik betalning:** 100 SEK
- **Misslyckad betalning:** 900 SEK
- **Timeout:** 800 SEK

### Test-telefonnummer för Swish:
- **Framgångsrik:** +46701234567
- **Misslyckad:** +46709876543

---

**Uppdaterad:** 2025-01-30
**Status:** Backend-konfiguration klar, Viva Wallet Portal behöver kontrolleras 