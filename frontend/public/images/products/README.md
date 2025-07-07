# Produktbilder - 1753 Skincare

## Bildstruktur

Lägg alla produktbilder i denna mapp enligt följande struktur:

```
public/images/products/
├── duo-kit-ta-da-serum/
│   ├── main.jpg              # Huvudbild (används som primary)
│   ├── lifestyle-1.jpg       # Lifestyle-bilder
│   ├── lifestyle-2.jpg
│   ├── ingredients.jpg       # Ingrediensbild
│   └── before-after.jpg      # Före/efter-bild
├── ta-da-serum/
│   ├── main.jpg
│   ├── texture.jpg
│   ├── application.jpg
│   └── ingredients.jpg
├── the-one-facial-oil/
│   ├── main.jpg
│   ├── bottle-detail.jpg
│   ├── application.jpg
│   └── ingredients.jpg
└── i-love-facial-oil/
    ├── main.jpg
    ├── bottle-detail.jpg
    ├── application.jpg
    └── ingredients.jpg
```

## Bildkrav

### Format & Storlek
- **Format**: JPG eller WebP (föredras WebP för prestanda)
- **Huvudbilder**: 800x800px (kvadratiska)
- **Lifestyle**: 1200x800px eller 800x1200px
- **Kvalitet**: Hög upplösning men optimerad för webben
- **Filstorlek**: Max 500KB per bild

### Namnkonvention
- Använd kebab-case: `the-one-facial-oil`
- Inga mellanslag eller specialtecken
- Beskrivande namn: `main.jpg`, `lifestyle-1.jpg`, `ingredients.jpg`

## Automatisk bildoptimering

Next.js optimerar automatiskt alla bilder i `/public/images/` mappen:
- Konverterar till WebP när det stöds
- Genererar olika storlekar för responsiv design
- Lazy loading för bättre prestanda

## Exempel på användning i kod

```tsx
import Image from 'next/image'

<Image
  src="/images/products/duo-kit-ta-da-serum/main.jpg"
  alt="DUO-kit+ TA-DA Serum"
  width={800}
  height={800}
  priority // För above-the-fold bilder
/>
```

## Tips för bästa resultat

1. **Konsekvent bakgrund**: Använd vit eller transparent bakgrund för produktbilder
2. **Bra belysning**: Jämn, mjuk belysning utan hårda skuggor
3. **Flera vinklar**: Visa produkten från olika vinklar
4. **Lifestyle**: Inkludera bilder på produkten i användning
5. **Detaljer**: Visa textur, konsistens och förpackningsdetaljer

## Skapa placeholder-bilder

Kör detta script för att skapa placeholder-bilder under utveckling:

```bash
cd frontend/public/images/products
mkdir -p duo-kit-ta-da-serum ta-da-serum the-one-facial-oil i-love-facial-oil
# Lägg sedan till dina riktiga produktbilder
``` 