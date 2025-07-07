# 🚀 Snabb Installation - 1753 Skincare Platform

## Kom igång på 5 minuter

### 1. Förutsättningar
Kontrollera att du har:
```bash
node --version  # Bör vara v18 eller senare
mongod --version  # MongoDB installerat
```

### 2. Installera MongoDB (om det saknas)
```bash
# macOS med Homebrew
brew tap mongodb/brew
brew install mongodb-community@7.0
brew services start mongodb-community@7.0

# Ubuntu/Debian
sudo apt-get install mongodb
sudo systemctl start mongod
```

### 3. Klona och installera
```bash
git clone <repository-url> 1753_website
cd 1753_website
npm run install:all
```

### 4. Konfigurera miljövariabler
```bash
# Backend miljövariabler
cd backend
cp .env.example .env

# Redigera .env och lägg till:
MONGODB_URI="mongodb://localhost:27017/1753_skincare"
JWT_SECRET="din-hemliga-nyckel-minst-32-tecken"
REFRESH_TOKEN_SECRET="din-refresh-token-nyckel-minst-32-tecken"

# Drip.com (valfritt för nyhetsbrev)
DRIP_API_TOKEN="ditt-drip-api-token"
DRIP_ACCOUNT_ID="ditt-drip-account-id"

# Frontend miljövariabler
cd ../frontend
echo "NEXT_PUBLIC_API_URL=http://localhost:5000/api" > .env.local
```

### 5. Populera databasen
```bash
cd backend
npm run seed
```

### 6. Starta applikationen
```bash
# Från root-katalogen
npm run dev
```

### 7. Öppna i webbläsare
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/health

## Testinloggning
```
E-post: test@1753skincare.com
Lösenord: Test123!
```

## Vanliga problem

### MongoDB anslutningsfel
```bash
# Kontrollera att MongoDB körs
brew services list | grep mongodb
sudo systemctl status mongod
```

### Port redan används
```bash
lsof -ti:3000 | xargs kill -9  # Frontend
lsof -ti:5000 | xargs kill -9  # Backend
```

### TypeScript-fel
```bash
# Rensa och installera om
rm -rf node_modules package-lock.json
rm -rf frontend/node_modules frontend/package-lock.json
rm -rf backend/node_modules backend/package-lock.json
npm run install:all
```

## Nästa steg
1. Konfigurera betalnings-API (Viva Wallet)
2. Lägg till riktiga produktbilder
3. Konfigurera e-postinställningar för transaktionsmail
4. Anpassa design och innehåll efter era behov

Se [DEVELOPMENT.md](./DEVELOPMENT.md) för detaljerad dokumentation. 