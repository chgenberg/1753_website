import 'dotenv/config'
import connectDB from '../config/database'
import { User } from '../models/User'
import { Product } from '../models/Product'
import { logger } from '../utils/logger'

const seedProducts = [
  {
    name: 'DUO-kit+ TA-DA Serum',
    slug: 'duo-kit-ta-da-serum',
    description: 'Komplett hudvårdspaket med våra mest populära produkter plus vårt kraftfulla serum.',
    longDescription: 'Detta är vårt mest kompletta hudvårdspaket som innehåller The ONE Facial Oil, I LOVE Facial Oil och vårt revolutionerande TA-DA Serum. Perfekt för dig som vill ge din hud allt den behöver för optimal hälsa och lyster. Paketet är speciellt framtaget för att stödja hudens naturliga läkningsprocess genom våra unika CBD- och CBG-formuleringar.',
    price: 1498,
    compareAtPrice: 1798,
    images: [
      {
        url: '/images/products/duo-kit-ta-da-serum/main.jpg',
        alt: 'DUO-kit+ TA-DA Serum produktbild',
        position: 1
      },
      {
        url: '/images/products/duo-kit-ta-da-serum/lifestyle-1.jpg',
        alt: 'DUO-kit+ TA-DA Serum lifestyle',
        position: 2
      }
    ],
    variants: [
      {
        name: 'Standard kit',
        price: 1498,
        compareAtPrice: 1798,
        sku: 'DUO-TADA-001',
        inventory: {
          quantity: 50,
          trackQuantity: true
        },
        options: {}
      }
    ],
    category: {
      id: 'kits',
      name: 'Kit & Paket',
      slug: 'kits'
    },
    tags: ['bestseller', 'kit', 'cbd', 'cbg', 'serum'],
    ingredients: [
      {
        name: 'CBD (Cannabidiol)',
        description: 'Kraftfull cannabinoid känd för sina anti-inflammatoriska egenskaper',
        benefits: ['Lugnar irriterad hud', 'Minskar inflammation', 'Stödjer hudens återhämtning'],
        concentration: '500mg'
      },
      {
        name: 'CBG (Cannabigerol)',
        description: 'Den "moder cannabinoid" som stödjer hudens naturliga funktioner',
        benefits: ['Antibakteriella egenskaper', 'Stödjer kollagenproduktion', 'Ger näring till huden'],
        concentration: '200mg'
      }
    ],
    skinTypes: ['dry', 'sensitive', 'normal', 'mature'],
    benefits: [
      'Djup återfuktning',
      'Minskar synliga tecken på åldrande',
      'Lugnar känslig hud',
      'Förbättrar hudens elasticitet',
      'Ger naturlig lyster'
    ],
    howToUse: 'Applicera The ONE Facial Oil på morgonen efter rengöring. Använd I LOVE Facial Oil på kvällen. Applicera TA-DA Serum som sista steg både morgon och kväll för bästa resultat.',
    featured: true,
    bestseller: true,
    newProduct: false,
    saleProduct: true,
    inventory: {
      quantity: 50,
      sku: 'DUO-TADA-001',
      trackQuantity: true
    },
    seo: {
      title: 'DUO-kit+ TA-DA Serum - Komplett hudvårdspaket med CBD och CBG',
      description: 'Vårt mest populära hudvårdskit med The ONE, I LOVE och TA-DA Serum. Naturlig hudvård med CBD och CBG för alla hudtyper.',
      keywords: ['cbd hudvård', 'cbg', 'hudvårdskit', 'serum', 'naturlig hudvård', '1753 skincare']
    },
    status: 'active',
    publishedAt: new Date()
  },
  {
    name: 'TA-DA Serum',
    slug: 'ta-da-serum',
    description: 'Vårt kraftfulla serum med hög koncentration av CBD och CBG för intensiv hudvård.',
    longDescription: 'TA-DA Serum är vårt mest koncentrerade serum, speciellt framtaget för dig som behöver extra stöd för din hud. Med en unik kombination av CBD, CBG och naturliga ingredienser ger detta serum djup återfuktning och stödjer hudens naturliga läkningsprocess. Perfekt för torr, känslig eller mogen hud som behöver extra omvårdnad.',
    price: 699,
    images: [
      {
        url: '/images/products/ta-da-serum/main.jpg',
        alt: 'TA-DA Serum produktbild',
        position: 1
      },
      {
        url: '/images/products/ta-da-serum/texture.jpg',
        alt: 'TA-DA Serum textur',
        position: 2
      }
    ],
    variants: [
      {
        name: '30ml',
        price: 699,
        sku: 'TADA-SERUM-30ML',
        inventory: {
          quantity: 75,
          trackQuantity: true
        },
        options: {
          size: '30ml'
        }
      }
    ],
    category: {
      id: 'serums',
      name: 'Serum',
      slug: 'serums'
    },
    tags: ['serum', 'cbd', 'cbg', 'återfuktning'],
    ingredients: [
      {
        name: 'CBD (Cannabidiol)',
        description: 'Kraftfull cannabinoid känd för sina anti-inflammatoriska egenskaper',
        benefits: ['Lugnar irriterad hud', 'Minskar inflammation', 'Stödjer hudens återhämtning'],
        concentration: '800mg'
      },
      {
        name: 'Hyaluronsyra',
        description: 'Naturlig fuktighetsbindare som kan hålla upp till 1000 gånger sin vikt i vatten',
        benefits: ['Intensiv återfuktning', 'Fyller ut fina linjer', 'Ger huden volym'],
        concentration: '1%'
      }
    ],
    skinTypes: ['dry', 'sensitive', 'mature'],
    benefits: [
      'Intensiv återfuktning',
      'Minskar fina linjer',
      'Lugnar irritationer',
      'Förbättrar hudens struktur'
    ],
    howToUse: 'Applicera 2-3 droppar på ren hud, morgon och kväll. Massera försiktigt in och låt absorberas innan du applicerar fuktkräm eller olja.',
    featured: true,
    bestseller: false,
    newProduct: false,
    saleProduct: false,
    inventory: {
      quantity: 75,
      sku: 'TADA-SERUM-30ML',
      trackQuantity: true
    },
    seo: {
      title: 'TA-DA Serum - Intensivt återfuktande serum med CBD och CBG',
      description: 'Kraftfullt serum med hög koncentration CBD och hyaluronsyra. Perfekt för torr och känslig hud.',
      keywords: ['cbd serum', 'hyaluronsyra', 'återfuktning', 'anti-aging', '1753 skincare']
    },
    status: 'active',
    publishedAt: new Date()
  },
  {
    name: 'The ONE Facial Oil',
    slug: 'the-one-facial-oil',
    description: 'Vår signaturprodukt - en lätt ansiktsolja med CBD för daglig användning.',
    longDescription: 'The ONE Facial Oil är vår signaturolja och den perfekta grundprodukten för alla hudtyper. Denna lätta, snabbabsorberande olja är berikad med CBD och naturliga växtolja som närmer och skyddar huden utan att kännas fet eller tung. Idealisk för morgonrutinen eller som bas under makeup.',
    price: 649,
    images: [
      {
        url: '/images/products/the-one-facial-oil/main.jpg',
        alt: 'The ONE Facial Oil produktbild',
        position: 1
      },
      {
        url: '/images/products/the-one-facial-oil/bottle-detail.jpg',
        alt: 'The ONE Facial Oil flaskdetalj',
        position: 2
      }
    ],
    variants: [
      {
        name: '30ml',
        price: 649,
        sku: 'ONE-OIL-30ML',
        inventory: {
          quantity: 100,
          trackQuantity: true
        },
        options: {
          size: '30ml'
        }
      }
    ],
    category: {
      id: 'oils',
      name: 'Ansiktsoljor',
      slug: 'oils'
    },
    tags: ['olja', 'cbd', 'daglig', 'signatur'],
    ingredients: [
      {
        name: 'CBD (Cannabidiol)',
        description: 'Kraftfull cannabinoid känd för sina anti-inflammatoriska egenskaper',
        benefits: ['Lugnar irriterad hud', 'Minskar inflammation', 'Stödjer hudens återhämtning'],
        concentration: '300mg'
      },
      {
        name: 'Jojobaolja',
        description: 'Naturlig vaxester som efterliknar hudens naturliga sebum',
        benefits: ['Balanserar oljeproduktion', 'Ger långvarig återfuktning', 'Absorberas lätt']
      }
    ],
    skinTypes: ['normal', 'combination', 'oily', 'dry'],
    benefits: [
      'Lätt och snabbabsorberande',
      'Balanserar hudens oljeproduktion',
      'Skyddar mot miljöfaktorer',
      'Ger naturlig lyster'
    ],
    howToUse: 'Applicera 3-5 droppar på ren hud på morgonen. Massera försiktigt in och låt absorberas. Kan användas under makeup.',
    featured: true,
    bestseller: true,
    newProduct: false,
    saleProduct: false,
    inventory: {
      quantity: 100,
      sku: 'ONE-OIL-30ML',
      trackQuantity: true
    },
    seo: {
      title: 'The ONE Facial Oil - Lätt ansiktsolja med CBD för daglig användning',
      description: 'Vår signaturprodukt - en lätt, snabbabsorberande ansiktsolja med CBD. Perfekt för alla hudtyper.',
      keywords: ['cbd olja', 'ansiktsolja', 'daglig hudvård', 'jojobaolja', '1753 skincare']
    },
    status: 'active',
    publishedAt: new Date()
  }
]

const seedUsers = [
  {
    firstName: 'Test',
    lastName: 'Användare',
    email: 'test@1753skincare.com',
    password: 'Test123!',
    preferences: {
      language: 'sv',
      newsletter: true,
      skinType: 'combination',
      skinConcerns: ['acne', 'anti-aging'],
      notifications: {
        email: true,
        sms: false,
        orderUpdates: true,
        skinJourneyReminders: true
      }
    },
    isEmailVerified: true
  }
]

const seedDatabase = async (): Promise<void> => {
  try {
    // Connect to database
    await connectDB()
    logger.info('Connected to database for seeding')

    // Clear existing data
    await User.deleteMany({})
    await Product.deleteMany({})
    logger.info('Cleared existing data')

    // Seed products
    const createdProducts = await Product.insertMany(seedProducts)
    logger.info(`Created ${createdProducts.length} products`)

    // Seed users
    const createdUsers = await User.insertMany(seedUsers)
    logger.info(`Created ${createdUsers.length} users`)

    logger.info('Database seeding completed successfully!')
    process.exit(0)
  } catch (error) {
    logger.error('Database seeding failed:', error)
    process.exit(1)
  }
}

// Run seeding
if (require.main === module) {
  seedDatabase()
}

export default seedDatabase 