# 🎨 AI Image Generation för Funktionella Råvaror

Detta script genererar professionella bilder för alla funktionella råvaror med hjälp av OpenAI DALL-E 3.

## 💰 Kostnad

- **DALL-E 3 Standard**: $0.04 per bild (1024x1024)
- **DALL-E 3 HD**: $0.08 per bild (1024x1024, högre kvalitet)
- **Uppskattad totalkostnad**: $2-4 för ~50 råvaror

## 🚀 Användning

### 1. Sätt upp OpenAI API-nyckel

```bash
# Lägg till i .env filen
OPENAI_API_KEY=sk-proj-your-api-key-here
```

### 2. Generera alla bilder

```bash
cd backend
npm run generate:images
```

Detta kommer att:
- Hämta alla aktiva råvaror från databasen
- Visa uppskattad kostnad
- Ge dig 5 sekunder att avbryta (Ctrl+C)
- Generera bilder för alla råvaror som saknar bilder
- Spara bilderna i `frontend/public/images/raw-materials/`
- Uppdatera databasen med bildpaths

### 3. Generera en specifik bild (för testning)

```bash
npm run generate:image blueberry
npm run generate:image havtorn
npm run generate:image kefir
```

## 📁 Filstruktur

```
frontend/public/images/raw-materials/
├── blueberry.jpg
├── lingonberry.jpg
├── sea-buckthorn.jpg
├── green-tea.jpg
├── turmeric.jpg
├── flaxseed.jpg
├── kefir.jpg
└── ...
```

## 🎯 Bildkvalitet och Stil

Scriptet genererar bilder med:
- **Stil**: Professionell matfotografering
- **Bakgrund**: Ren vit bakgrund
- **Belysning**: Naturlig belysning
- **Kvalitet**: Kommersiell kvalitet
- **Storlek**: 1024x1024 pixlar

### Kategori-specifika prompter:

- **Bär**: Färska bär, naturligt arrangerade, några hela och några halverade
- **Örter**: Färska gröna blad, botanisk stil
- **Grönsaker**: Livfulla färger, naturlig arrangering
- **Fermenterat**: I glasskål, krämig textur
- **Kryddor**: Pulver och hela former, varma färger
- **Frön**: Naturlig textur, makrofotografering
- **Te**: Torkade blad, eleganta arrangemang

## 🔧 Tekniska detaljer

### Rate Limits
- 2 sekunders fördröjning mellan requests
- Automatisk felhantering
- Hoppar över befintliga bilder

### Felhantering
- Loggar framgång/misslyckanden
- Fortsätter vid fel
- Visar slutstatistik

### Databas-uppdatering
- Uppdaterar `thumbnail` fältet automatiskt
- Path: `/images/raw-materials/{slug}.jpg`

## 📊 Exempel på output

```
🚀 Starting AI image generation for raw materials...
💰 Estimated cost: ~$0.04 per image (DALL-E 3 standard quality)
📊 Found 47 raw materials to process
💵 Total estimated cost: $1.88

⚠️  This will make API calls to OpenAI DALL-E 3
Press Ctrl+C to cancel, or wait 5 seconds to continue...

[1/47] Processing Blåbär...
🎨 Generating image for Blåbär...
📝 Prompt: Fresh blueberry berries, vibrant colors, scattered naturally...
✅ Generated and saved image for Blåbär

[2/47] Processing Lingon...
⏭️  Skipping Lingon - image already exists

...

🎉 Image generation complete!
✅ Successfully generated: 45 images
❌ Failed: 2 images
💰 Actual cost: ~$1.80
📁 Images saved to: /path/to/frontend/public/images/raw-materials
```

## 🎨 Frontend Integration

Bilderna visas automatiskt på funktionella råvaror-sidan:
- Små thumbnails (64x64px) i listan
- Fallback till gradient-placeholders om bild saknas
- Automatisk felhantering

## 🔄 Uppdatera befintliga bilder

För att regenerera en specifik bild:

```bash
# Ta bort befintlig bild
rm frontend/public/images/raw-materials/blueberry.jpg

# Generera ny bild
npm run generate:image blueberry
```

## 🚨 Viktiga noteringar

1. **API-kostnad**: Varje körning kostar pengar - testa först med enstaka bilder
2. **Rate limits**: Scriptet respekterar OpenAI:s rate limits automatiskt
3. **Bildkvalitet**: Standard-kvalitet är oftast tillräcklig för web
4. **Backup**: Bilderna sparas lokalt och committas till git
5. **Fallbacks**: Frontend har automatiska fallbacks om bilder saknas

## 🎯 Nästa steg

Efter att ha genererat bilderna:
1. Committa och pusha ändringarna
2. Kontrollera att bilderna visas korrekt på live-sidan
3. Optimera bildstorlekar om nödvändigt
4. Överväg att lägga till hover-effekter eller större bilder i expanded view 