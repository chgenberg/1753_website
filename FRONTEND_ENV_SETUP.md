# Frontend Environment Variables Setup

## Railway Frontend Service Environment Variables

Lägg till följande miljövariabler i Railway för **frontend service**:

```bash
# API Configuration
NEXT_PUBLIC_API_URL=https://1753websitebackend-production.up.railway.app

# Viva Wallet Smart Checkout Configuration
NEXT_PUBLIC_VIVA_PUBLIC_KEY=[HÄMTA_FRÅN_VIVA_PORTAL]
NEXT_PUBLIC_VIVA_SOURCE_CODE=1753_Default
NEXT_PUBLIC_VIVA_BASE_URL=https://api.vivapayments.com
NEXT_PUBLIC_VIVA_CLIENT_ID=yoar0x9br2cr9n6y37xaqpq44r3o3waixyb6mx70tpas9.apps.vivapayments.com

# Currency Configuration
NEXT_PUBLIC_DEFAULT_CURRENCY=SEK
```

## Var hittar du Public Key?

1. **Logga in på Viva Wallet Portal**
2. **Gå till Settings → API Access**
3. **Under "Smart Checkout" sektionen**
4. **Kopiera "Public Key"** (börjar med `pk_live_` eller `pk_test_`)

## Nästa steg:

1. ✅ Backend OAuth fungerar
2. ✅ Order-skapande fungerar  
3. 🔄 Lägg till Public Key i Railway Frontend
4. 🔄 Testa Smart Checkout på frontend
5. 🔄 Testa hela checkout-flödet

## Test URL:

När allt är konfigurerat, testa på:
https://1753website-production.up.railway.app/sv/checkout 