import mongoose from 'mongoose'
import { Product } from '../models/Product'
import connectDB from '../config/database'
import { logger } from '../utils/logger'
import { ProductScraper, ProductData } from './productScraper'
import fs from 'fs'
import path from 'path'

// Curated product data based on web research
const CURATED_PRODUCTS = [
  {
    name: "DUO-kit+ TA-DA Serum",
    slug: "duo-ta-da",
    price: 1498,
    originalPrice: 1798,
    shortDescription: "Våra bästsäljare – Nu som komplett rutinpaket för 1498 kr",
    description: `Vill du ge din hud ett verkligt lyft – utan att kompromissa med ingredienser, filosofi eller resultat? Då är det här paketet för dig.

Vi har samlat våra tre mest älskade produkter i en komplett hudvårdsrutin för dig som vill optimera hudens hälsa – inifrån och ut. Paketet kostar 1498 kr (värde: 1798 kr) och innehåller allt du behöver för att:

• Stärka hudens egen balans och motståndskraft
• Minska inflammation och känslighet
• Återfukta på djupet
• Få tillbaka hudens naturliga lyster och spänst

Det här ingår i paketet:
• The ONE Facial Oil – En skyddande, daglig olja som stärker och återfuktar huden.
• I LOVE Facial Oil – En lugnande nattolja som hjälper huden att återhämta sig i sömnen.
• TA-DA Serum – Ett unikt CBG-berikat serum som maximerar oljornas effekt och förser huden med extra näring.

Tillsammans bildar dessa tre produkter en helhetsrutin som stödjer hudens endocannabinoidsystem och mikrobiella mångfald – två av de viktigaste faktorerna för långsiktig hudhälsa.`,
    ingredients: [
      "CBD (Cannabidiol)",
      "CBG (Cannabigerol)", 
      "Hemp Seed Oil",
      "Jojoba Oil",
      "Vitamin E",
      "Squalane",
      "Essential Fatty Acids"
    ],
    usage: `Morgon:
1. Skölj ansiktet med ljummet vatten.
2. Applicera 3–4 droppar The ONE Facial Oil.
3. Följ upp med 1–2 pump TA-DA Serum.

Kväll:
1. Rengör huden (gärna med en naturlig makeup remover).
2. Applicera 3–4 droppar I LOVE Facial Oil.
3. Avsluta med 1–2 pump TA-DA Serum.

Tips! Vårt serum är formulerat för att appliceras efter oljan – inte före – vilket skiljer sig från klassisk hudvård.`,
    benefits: [
      "Stärker hudens egen balans och motståndskraft",
      "Minskar inflammation och känslighet", 
      "Återfuktar på djupet",
      "Återställer hudens naturliga lyster och spänst",
      "Stödjer endocannabinoidsystemet",
      "Förbättrar mikrobiell mångfald"
    ],
    skinTypes: ["Alla hudtyper", "Känslig hud", "Torr hud", "Inflammerad hud"],
    category: "Hudvårdskit",
    tags: ["CBD", "CBG", "Naturlig", "Kit", "Ansiktsolja", "Serum", "Bästsäljare"],
    images: [
      "/images/products/duo-kit-ta-da-serum-main.jpg",
      "/images/products/duo-kit-ta-da-serum-contents.jpg"
    ],
    inStock: true,
    featured: true,
    seo: {
      title: "DUO-kit+ TA-DA Serum - Komplett hudvårdsrutin med CBD & CBG - 1753 Skincare",
      description: "Våra bästsäljande produkter i ett komplett kit. The ONE, I LOVE Facial Oil + TA-DA Serum för optimal hudhälsa. Nu 1498 kr (ord. 1798 kr)",
      keywords: ["CBD hudvård", "CBG serum", "ansiktsolja kit", "naturlig hudvård", "svenska hudvårdsprodukter"]
    },
    reviews: {
      count: 125,
      rating: 4.8
    }
  },
  {
    name: "TA-DA Serum",
    slug: "ta-da-serum", 
    price: 699,
    shortDescription: "Ett unikt CBG-berikat serum som maximerar hudens potential",
    description: `TA-DA Serum är ett revolutionerande serum berikat med CBG (Cannabigerol) som tar din hudvård till nästa nivå. Detta kraftfulla serum är designat för att appliceras efter ansiktsolja, vilket förstärker effekten och ger huden extra näring.

Formulerat för att stödja hudens endocannabinoidsystem och mikrobiella mångfald – två avgörande faktorer för långsiktig hudhälsa. Serumet hjälper till att återställa balans, minska inflammation och främja hudens naturliga läkningsprocesser.

Perfekt som komplement till The ONE eller I LOVE Facial Oil, men fungerar även utmärkt på egen hand för dig som föredrar en minimalistisk rutin.`,
    ingredients: [
      "CBG (Cannabigerol)",
      "Hemp Seed Oil", 
      "Hyaluronic Acid",
      "Peptides",
      "Vitamin E",
      "Niacinamide",
      "Botanical Extracts"
    ],
    usage: "Applicera 1-2 pumpar efter rengöring och eventuell ansiktsolja. Massera försiktigt in i huden. Använd morgon och kväll.",
    benefits: [
      "Maximerar ansiktsoljans effekt",
      "Stödjer endocannabinoidsystemet",
      "Minskar inflammation",
      "Förbättrar hudens struktur",
      "Ger intensiv näringsboost",
      "Främjar hudens naturliga läkning"
    ],
    skinTypes: ["Alla hudtyper", "Problemhud", "Känslig hud", "Mogen hud"],
    category: "Serum",
    tags: ["CBG", "Serum", "Naturlig", "Anti-inflammatory", "Healing"],
    images: [
      "/images/products/ta-da-serum-main.jpg",
      "/images/products/ta-da-serum-texture.jpg"
    ],
    inStock: true,
    featured: true,
    seo: {
      title: "TA-DA Serum med CBG - Revolutionerande hudvårdsserum - 1753 Skincare",
      description: "CBG-berikat serum som stödjer hudens endocannabinoidsystem. Appliceras efter ansiktsolja för maximal effekt. 699 kr.",
      keywords: ["CBG serum", "cannabigerol hudvård", "naturligt serum", "svensk hudvård"]
    }
  },
  {
    name: "The ONE Facial Oil", 
    slug: "facialoil",
    price: 649,
    shortDescription: "En skyddande, daglig ansiktsolja som stärker och återfuktar huden",
    description: `The ONE Facial Oil är din dagliga skyddande ansiktsolja som stärker hudens naturliga barriär och återfuktar på djupet. Denna mångsidiga olja är perfekt för morgonbruk och förbereder huden för dagen som kommer.

Berikat med CBD och närande växtoljor som arbetar tillsammans för att stödja hudens endocannabinoidsystem. Oljan absorberas snabbt utan att lämna en fet känsla, vilket gör den perfekt under makeup eller som en fristående behandling.

Formulerad för att stärka hudens motståndskraft mot miljöpåfrestningar och främja en hälsosam, strålande hy.`,
    ingredients: [
      "CBD (Cannabidiol)",
      "Hemp Seed Oil",
      "Jojoba Oil", 
      "Argan Oil",
      "Vitamin E",
      "Rosehip Oil",
      "Evening Primrose Oil"
    ],
    usage: "Applicera 3-4 droppar på ren hud, morgon och/eller kväll. Massera försiktigt in. Följ gärna upp med TA-DA Serum för optimal effekt.",
    benefits: [
      "Stärker hudens barriär",
      "Återfuktar på djupet", 
      "Skyddar mot miljöpåfrestningar",
      "Främjar strålande hy",
      "Snabbabsorberande formula",
      "Perfekt under makeup"
    ],
    skinTypes: ["Alla hudtyper", "Torr hud", "Normal hud", "Kombinerad hud"],
    category: "Ansiktsolja",
    tags: ["CBD", "Ansiktsolja", "Daglig", "Skyddande", "Naturlig"],
    images: [
      "/images/products/the-one-facial-oil-main.jpg",
      "/images/products/the-one-facial-oil-dropper.jpg"
    ],
    inStock: true,
    featured: true,
    seo: {
      title: "The ONE Facial Oil med CBD - Daglig ansiktsolja - 1753 Skincare", 
      description: "Skyddande daglig ansiktsolja med CBD. Stärker hudens barriär och återfuktar på djupet. Perfekt under makeup. 649 kr.",
      keywords: ["CBD ansiktsolja", "daglig ansiktsolja", "naturlig hudvård", "hemp oil"]
    }
  },
  {
    name: "I LOVE Facial Oil",
    slug: "i-love-facial-oil", 
    price: 649,
    shortDescription: "En lugnande nattolja som hjälper huden att återhämta sig i sömnen",
    description: `I LOVE Facial Oil är den perfekta nattoljan för djup återhämtning och reparation. Medan du sover arbetar denna näringsrika olja för att återställa, lugna och förnya din hud.

Formulerad med en kraftfull blandning av CBD och regenererande växtoljor som stödjer hudens naturliga läkningsprocesser. Den rika texturen sjunker djupt in i huden och arbetar under natten för att ge dig en mjuk, utvilad och strålande hy på morgonen.

Perfekt för dig som vill maximera hudens återhämtning under natten och vakna upp med en synligt förbättrad hudkvalitet.`,
    ingredients: [
      "CBD (Cannabidiol)",
      "Hemp Seed Oil",
      "Rosehip Oil",
      "Sea Buckthorn Oil", 
      "Vitamin E",
      "Omega Fatty Acids",
      "Squalane"
    ],
    usage: "Applicera 3-4 droppar på ren hud på kvällen. Massera varsamt in och låt absorberas. Följ gärna upp med TA-DA Serum.",
    benefits: [
      "Djup nattlig återhämtning",
      "Stödjer hudens reparationsprocesser",
      "Lugnar och mjukgör",
      "Rik på antioxidanter", 
      "Återställer hudens lyster",
      "Intensiv näring under natten"
    ],
    skinTypes: ["Alla hudtyper", "Torr hud", "Mogen hud", "Känslig hud"],
    category: "Ansiktsolja",
    tags: ["CBD", "Nattolja", "Regenererande", "Lugnande", "Naturlig"],
    images: [
      "/images/products/i-love-facial-oil-main.jpg",
      "/images/products/i-love-facial-oil-night.jpg"
    ],
    inStock: true,
    seo: {
      title: "I LOVE Facial Oil med CBD - Regenererande nattolja - 1753 Skincare",
      description: "Lugnande nattolja med CBD för djup återhämtning. Reparerar och förnyar huden under natten. 649 kr.",
      keywords: ["CBD nattolja", "regenererande ansiktsolja", "natt hudvård", "naturlig olja"]
    }
  },
  {
    name: "Au Naturel Makeup Remover",
    slug: "makeup-remover-au-naturel",
    price: 199,
    originalPrice: 399,
    shortDescription: "Skonsam och effektiv makeup remover med naturliga ingredienser",
    description: `Au Naturel Makeup Remover är en skonsam men effektiv makeup remover som tar bort även vattenfast mascara och långvarigt makeup utan att irritera huden.

Formulerad med naturliga oljor och växtextrakt som både rengör och vårdar huden samtidigt. Denna makeup remover lämnar inte huden torr eller spänd utan ger istället en mjuk och näringsrik känsla.

Perfekt för känslig hud och ögonområdet. Innehåller inga aggressiva kemikalier eller sulfater som kan skada hudens naturliga barriär.`,
    ingredients: [
      "Jojoba Oil",
      "Sweet Almond Oil",
      "Vitamin E",
      "Chamomile Extract",
      "Cucumber Extract",
      "Aloe Vera"
    ],
    usage: "Applicera på torr hud och massera försiktigt. Fukta händerna och fortsätt massera tills makeup löses upp. Skölj av med ljummet vatten.",
    benefits: [
      "Tar bort all makeup effektivt",
      "Skonsam för känslig hud",
      "Vårdar medan den rengör",
      "Irriterar inte ögonen",
      "Naturliga ingredienser",
      "Lämnar huden mjuk och vårdad"
    ],
    skinTypes: ["Alla hudtyper", "Känslig hud"],
    category: "Rengöring",
    tags: ["Makeup remover", "Naturlig", "Skonsam", "REA"],
    images: [
      "/images/products/au-naturel-makeup-remover-main.jpg"
    ],
    inStock: true,
    sale: true,
    seo: {
      title: "Au Naturel Makeup Remover - Skonsam naturlig rengöring - 1753 Skincare",
      description: "Effektiv makeup remover med naturliga ingredienser. Skonsam för känslig hud. REA: 199 kr (ord. 399 kr).",
      keywords: ["naturlig makeup remover", "skonsam rengöring", "ögonmakeup remover"]
    }
  },
  {
    name: "Fungtastic Extract",
    slug: "fungtastic-extract", 
    price: 899,
    shortDescription: "Kraftfullt svampextrakt för optimal hudhälsa",
    description: `Fungtastic Extract är ett revolutionerande hudvårdsserum baserat på kraftfulla svampextrakt som stödjer hudens naturliga funktioner och främjar optimal hudhälsa.

Detta avancerade serum innehåller en unik blandning av adaptogena svampar som hjälper huden att anpassa sig till stress och miljöpåfrestningar. Svampextrakten är rika på antioxidanter, beta-glukaner och andra bioaktiva föreningar som stödjer hudens immunförsvar och regeneration.

Perfekt för dig som vill ta din hudvård till nästa nivå med naturens mest kraftfulla ingredienser.`,
    ingredients: [
      "Reishi Extract",
      "Chaga Extract", 
      "Cordyceps Extract",
      "Shiitake Extract",
      "Beta-Glucans",
      "Polysaccharides",
      "Antioxidants"
    ],
    usage: "Applicera 2-3 droppar på ren hud, morgon och/eller kväll. Massera försiktigt in. Kan kombineras med andra produkter.",
    benefits: [
      "Stärker hudens immunförsvar",
      "Kraftfulla antioxidanter",
      "Stödjer naturlig regeneration",
      "Adaptogen för stress-motstånd",
      "Förbättrar hudens vitalitet",
      "Unik svampteknologi"
    ],
    skinTypes: ["Alla hudtyper", "Stressad hud", "Mogen hud"],
    category: "Serum",
    tags: ["Svampextrakt", "Adaptogen", "Antioxidant", "Premium", "Innovation"],
    images: [
      "/images/products/fungtastic-extract-main.jpg"
    ],
    inStock: true,
    premium: true,
    seo: {
      title: "Fungtastic Extract - Premium svampserum - 1753 Skincare",
      description: "Revolutionerande serum med kraftfulla svampextrakt. Stärker hudens immunförsvar och regeneration. 899 kr.",
      keywords: ["svampextrakt hudvård", "adaptogen serum", "reishi skincare", "premium hudvård"]
    }
  }
]

class ProductSeeder {
  private scrapedData: ProductData[] = []

  async loadScrapedData(): Promise<void> {
    try {
      const dataPath = path.join(__dirname, '../../data/scraped-products.json')
      if (fs.existsSync(dataPath)) {
        const data = fs.readFileSync(dataPath, 'utf-8')
        this.scrapedData = JSON.parse(data)
        logger.info(`Loaded ${this.scrapedData.length} scraped products`)
      }
    } catch (error) {
      logger.warn('No scraped data found, using curated data only')
    }
  }

  mergeProductData(curated: any, scraped?: ProductData): any {
    if (!scraped) return curated

    // Merge scraped data with curated data, prioritizing curated for important fields
    return {
      ...curated,
      // Use scraped data for these fields if available and better
      description: scraped.description && scraped.description.length > curated.description?.length 
        ? scraped.description 
        : curated.description,
      ingredients: scraped.ingredients?.length > 0 ? scraped.ingredients : curated.ingredients,
      images: scraped.images?.length > 0 ? scraped.images : curated.images,
      seo: {
        ...curated.seo,
        ...scraped.seo
      },
      reviews: scraped.reviews || curated.reviews
    }
  }

  async seedProducts(): Promise<void> {
    try {
      logger.info('🌱 Starting product seeding...')

      // Clear existing products
      await Product.deleteMany({})
      logger.info('Cleared existing products')

      // Load scraped data
      await this.loadScrapedData()

      const productsToSeed = []

      // Process each curated product
      for (const curatedProduct of CURATED_PRODUCTS) {
        // Find matching scraped data
        const scrapedProduct = this.scrapedData.find(
          scraped => scraped.slug === curatedProduct.slug || 
                    scraped.name.toLowerCase().includes(curatedProduct.name.toLowerCase())
        )

        // Merge data
        const finalProduct = this.mergeProductData(curatedProduct, scrapedProduct)
        productsToSeed.push(finalProduct)

        logger.info(`Prepared product: ${finalProduct.name}`)
      }

      // Add any additional scraped products not in curated list
      for (const scrapedProduct of this.scrapedData) {
        const exists = productsToSeed.some(
          p => p.slug === scrapedProduct.slug || 
               p.name.toLowerCase().includes(scrapedProduct.name.toLowerCase())
        )

        if (!exists && scrapedProduct.name && scrapedProduct.price > 0) {
          productsToSeed.push({
            ...scrapedProduct,
            category: scrapedProduct.category || 'Hudvård',
            featured: false,
            seo: scrapedProduct.seo || {
              title: scrapedProduct.name,
              description: scrapedProduct.shortDescription || scrapedProduct.description,
              keywords: scrapedProduct.tags || []
            }
          })
          logger.info(`Added additional scraped product: ${scrapedProduct.name}`)
        }
      }

      // Insert products into database
      const insertedProducts = await Product.insertMany(productsToSeed)
      
      logger.info(`🎉 Successfully seeded ${insertedProducts.length} products!`)
      
      // Log summary
      insertedProducts.forEach(product => {
        logger.info(`✅ ${product.name} - ${product.price} kr${product.originalPrice ? ` (was ${product.originalPrice} kr)` : ''}`)
      })

      // Log statistics
      const categories = [...new Set(insertedProducts.map(p => p.category))]
      const totalValue = insertedProducts.reduce((sum, p) => sum + p.price, 0)
      const averagePrice = Math.round(totalValue / insertedProducts.length)

      logger.info('\n📊 PRODUCT STATISTICS:')
      logger.info(`Total products: ${insertedProducts.length}`)
      logger.info(`Categories: ${categories.join(', ')}`)
      logger.info(`Price range: ${Math.min(...insertedProducts.map(p => p.price))} - ${Math.max(...insertedProducts.map(p => p.price))} kr`)
      logger.info(`Average price: ${averagePrice} kr`)
      logger.info(`Featured products: ${insertedProducts.filter(p => p.featured).length}`)
      logger.info(`Products on sale: ${insertedProducts.filter(p => p.originalPrice).length}`)

    } catch (error) {
      logger.error('❌ Error seeding products:', error)
      throw error
    }
  }
}

export { ProductSeeder }

// Main execution function
async function main() {
  try {
    logger.info('🚀 Starting 1753 Skincare product seeding...')
    
    // Connect to database
    await connectDB()
    
    // Create seeder and run
    const seeder = new ProductSeeder()
    await seeder.seedProducts()
    
    logger.info('✅ Product seeding completed successfully!')
    
  } catch (error) {
    logger.error('❌ Product seeding failed:', error)
    process.exit(1)
  } finally {
    // Close database connection
    await mongoose.connection.close()
    logger.info('Database connection closed')
  }
}

// Run if called directly
if (require.main === module) {
  main()
} 