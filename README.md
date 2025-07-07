# 1753 Skincare - E-commerce Platform

En komplett e-handelsplattform byggd med React och Node.js för 1753 Skincare.

## Projektstruktur

```
1753_website/
├── frontend/          # React-applikation
├── backend/           # Node.js/Express API
├── shared/           # Delade typer och utilities
└── docs/             # Dokumentation
```

## Funktioner

### Kärn E-handel
- ✅ Produktkatalog med kategorier
- ✅ Kundkonton med hudresa-spårning
- ✅ Säker checkout med Viva Wallet
- ✅ Orderhantering och historik
- ✅ Inventory management via 3PL integration

### Kundupplevelse
- ✅ Flerspråkig support (Svenska, Engelska, Spanska)
- ✅ Recensionssystem (Judge.me integration)
- ✅ Personlig hudresa-tracker
- ✅ Innehållshantering (blogg, guider)
- ✅ Responsiv design

### Integrationer
- **3PL Lager**: Automatisk lagerhantering
- **Viva Wallet**: Säkra betalningar
- **Judge.me**: Produktrecensioner
- **E-post**: Transaktionsmail och nyhetsbrev

## Snabbstart

1. **Förutsättningar**
   - Node.js 18+
   - MongoDB 6.0+
   - Git

2. **Installation**
   ```bash
   # Klona projektet
   git clone <repository-url>
   cd 1753_website
   
   # Installera dependencies
   npm run install:all
   ```

3. **Konfiguration**
   ```bash
   # Skapa miljövariabler
   cd backend
   cp .env.example .env
   # Fyll i dina API-nycklar och databas-URL
   
   cd ../frontend
   echo "NEXT_PUBLIC_API_URL=http://localhost:5000/api" > .env.local
   ```

4. **Starta utveckling**
   ```bash
   # Starta MongoDB
   brew services start mongodb-community@7.0  # macOS
   # eller
   sudo systemctl start mongod  # Linux
   
   # Starta applikationen
   npm run dev
   ```

5. **Verifiera**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000/health

📖 **Detaljerade instruktioner finns i [DEVELOPMENT.md](./DEVELOPMENT.md)**

## Teknologier

### Frontend
- React 18 med TypeScript
- Next.js för SSR/SSG
- Tailwind CSS för styling
- Zustand för state management
- React Query för API-hantering

### Backend
- Node.js med Express
- TypeScript
- MongoDB databas
- Mongoose ODM
- JWT autentisering
- Redis för caching (valfritt)

## Utvecklingsmiljö

- Node.js 18+
- MongoDB 6.0+
- Redis (valfritt för caching) 