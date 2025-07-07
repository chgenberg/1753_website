# Utvecklingsinstruktioner - 1753 Skincare Platform

## Översikt
Detta projekt är en komplett e-handelsplattform för 1753 Skincare, byggd med:
- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **Databas**: MongoDB + Mongoose
- **Caching**: Redis (valfritt)
- **Betalningar**: Viva Wallet integration
- **Recensioner**: Judge.me integration
- **Lager**: 3PL integration

## Förutsättningar

### Systemkrav
- Node.js 18+ 
- MongoDB 6.0+
- Redis 6.0+ (valfritt men rekommenderat)
- Git

### Installera MongoDB
```bash
# För macOS med Homebrew
brew tap mongodb/brew
brew install mongodb-community@7.0

# Starta MongoDB
brew services start mongodb-community@7.0

# För Ubuntu/Debian
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
```

### Installera Redis (valfritt)
```bash
# För macOS med Homebrew
brew install redis
brew services start redis

# För Ubuntu/Debian
sudo apt-get install redis-server
sudo systemctl start redis-server
```

## Projektinstallation

### 1. Klona projektet och installera dependencies
```bash
# Installera alla dependencies
npm run install:all

# Eller manuellt:
npm install
cd frontend && npm install
cd ../backend && npm install
```

### 2. Miljövariabler

#### Backend miljövariabler (.env)
Kopiera exempel och fyll i dina värden:
```bash
cd backend
cp .env.example .env
```

Fyll i följande kritiska variabler:
```env
# Databas
MONGODB_URI="mongodb://localhost:27017/1753_skincare"

# JWT
JWT_SECRET="din-super-hemliga-jwt-nyckel"
JWT_EXPIRES_IN="7d"

# Viva Wallet (för betalningar)
VIVA_WALLET_CLIENT_ID="ditt-viva-wallet-client-id"
VIVA_WALLET_CLIENT_SECRET="ditt-viva-wallet-client-secret"
VIVA_WALLET_ENVIRONMENT="demo"

# Judge.me (för recensioner)
JUDGEME_API_TOKEN="ditt-judgeme-api-token"
JUDGEME_SHOP_DOMAIN="din-shop-domain"

# 3PL (för lager)
THREPL_API_URL="https://api.ditt-3pl-system.com"
THREPL_API_KEY="ditt-3pl-api-key"

# E-post
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="ditt-gmail@gmail.com"
SMTP_PASS="ditt-app-lösenord"
```

#### Frontend miljövariabler (.env.local)
```bash
cd frontend
touch .env.local
```

Lägg till:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000
```

### 3. Kör utvecklingsservrar

#### Starta båda servrar samtidigt
```bash
# Från root-katalogen
npm run dev
```

#### Eller kör dem separat
```bash
# Backend (port 5000)
cd backend
npm run dev

# Frontend (port 3000) - i nytt terminalfönster
cd frontend
npm run dev
```

### 4. Verifiera installation

#### Kontrollera backend
```bash
curl http://localhost:5000/health
```
Förväntat svar:
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "uptime": 123.456,
  "environment": "development"
}
```

#### Kontrollera frontend
Öppna [http://localhost:3000](http://localhost:3000) i din webbläsare.

## Databashantering

### Skapa initial data (seed)
```bash
cd backend
npm run seed
```

### MongoDB Compass (GUI)
Installera MongoDB Compass för att enkelt hantera databasen:
```bash
# Ladda ner från: https://www.mongodb.com/products/compass
# Anslut till: mongodb://localhost:27017
```

## Utvecklingsverktyg

### TypeScript
```bash
# Kontrollera types (frontend)
cd frontend && npm run type-check

# Kontrollera types (backend)
cd backend && npm run type-check
```

### Linting
```bash
# Frontend
cd frontend && npm run lint

# Backend
cd backend && npm run lint
```

### Tester
```bash
# Backend
cd backend && npm test

# Kör tester i watch-läge
cd backend && npm run test:watch
```

## Integrationer

### Viva Wallet (Betalningar)
1. Skapa konto på [Viva Wallet Developer Portal](https://developer.vivawallet.com/)
2. Skapa en app och få Client ID & Secret
3. Konfigurera webhooks för betalningsuppdateringar
4. Uppdatera `.env` med dina credentials

### Judge.me (Recensioner)
1. Skapa konto på [Judge.me](https://judge.me/)
2. Få API-token från inställningar
3. Konfigurera webhook för nya recensioner
4. Uppdatera `.env` med dina credentials

### 3PL Integration
1. Kontakta din 3PL-leverantör för API-dokumentation
2. Få API-nyckel och endpoint
3. Implementera specifik 3PL-integration i `backend/src/services/3pl/`
4. Konfigurera webhooks för lageruppdateringar

## Felsökning

### Vanliga problem

#### MongoDB Connection Error
```bash
# Kontrollera om MongoDB körs
mongosh --eval "db.runCommand({connectionStatus: 1})"

# Starta MongoDB om det inte körs
brew services start mongodb-community@7.0  # macOS
sudo systemctl start mongod              # Linux
```

#### Port redan används
```bash
# Hitta process som använder port 3000/5000
lsof -ti:3000 | xargs kill -9
lsof -ti:5000 | xargs kill -9
```

#### TypeScript errors
```bash
# Rensa cache
rm -rf node_modules package-lock.json
rm -rf frontend/node_modules frontend/package-lock.json  
rm -rf backend/node_modules backend/package-lock.json
npm run install:all
```

### Loggar
```bash
# Backend loggar
cd backend && tail -f logs/app.log

# Frontend loggar finns i terminalen där du kör `npm run dev`
```

## Produktionsdeployment

### Frontend (Vercel rekommenderas)
```bash
cd frontend
npm run build
npm start
```

### Backend (Heroku/Railway/DigitalOcean)
```bash
cd backend
npm run build
npm start
```

### Miljövariabler för produktion
Se till att uppdatera alla miljövariabler för produktion:
- MONGODB_URI (MongoDB Atlas)
- JWT_SECRET (stark produktion-hemlig nyckel)
- VIVA_WALLET_ENVIRONMENT="production"
- Alla andra API-nycklar för produktion

## Ytterligare resurser

- [Next.js Documentation](https://nextjs.org/docs)
- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [Viva Wallet API](https://developer.vivawallet.com/)
- [Judge.me API](https://judge.me/api)

## Support

För frågor kontakta utvecklingsteamet eller skapa en issue i projektet. 