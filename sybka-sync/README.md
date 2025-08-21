# Sybka Sync Service

En enkel Laravel-app för att synka ordrar och refunds mellan Fortnox och Sybka.

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

2. **Skapa Laravel-projekt**
```bash
composer create-project laravel/laravel sybka-sync
cd sybka-sync
```

3. **Kopiera filer från detta repo**
```bash
# Kopiera SybkaController.php till app/Http/Controllers/
# Kopiera routes/web.php
```

### Alternativ 2: Docker (rekommenderat)

```bash
# Starta med Docker Compose
docker-compose up -d

# Installera dependencies
docker-compose exec app composer install

# Generera app key
docker-compose exec app php artisan key:generate
```

## Konfiguration

1. **Kopiera .env.example till .env**
```bash
cp .env.example .env
```

2. **Sätt Sybka API-uppgifter i .env**
```
SYNKA_ACCESS_TOKEN=your_sybka_access_token
SYNKA_API_URL=https://api.sybka.com/v1/
SYNKA_TEAM_ID=your_team_id
```

## API Endpoints

### GET /api/sybka/products
Hämta produkter från Sybka
- Query parameter: `sku` (optional)

### POST /api/sybka/orders
Skapa order i Sybka från Fortnox invoice-data
- Body: Fortnox invoice JSON

### POST /api/sybka/refunds  
Skapa refund i Sybka från Fortnox credit note
- Body: Fortnox credit note JSON

### GET /api/sybka/test
Testa API-anslutning till Sybka

### GET /health
Health check endpoint

## Användning

### Från Fortnox webhook:
```bash
# När en faktura skapas i Fortnox
curl -X POST http://localhost:8000/api/sybka/orders \
  -H "Content-Type: application/json" \
  -d @fortnox_invoice.json

# När en kreditnota skapas i Fortnox  
curl -X POST http://localhost:8000/api/sybka/refunds \
  -H "Content-Type: application/json" \
  -d @fortnox_credit_note.json
```

### Integrering i befintlig backend:
```javascript
// Från din Node.js backend
const response = await fetch('http://localhost:8000/api/sybka/orders', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(fortnoxInvoiceData)
});
```

## Deployment

### Railway/Heroku
1. Lägg till PHP buildpack
2. Sätt environment variables
3. Deploy från Git

### VPS
1. Installera PHP 8.1+, Nginx, MySQL
2. Klona repo och kör `composer install --no-dev`
3. Konfigurera Nginx att peka på `public/` mappen

## Loggning

Alla API-anrop loggas. Kontrollera:
```bash
tail -f storage/logs/laravel.log
``` 