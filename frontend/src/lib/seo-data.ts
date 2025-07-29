import type { Metadata } from 'next'

export interface SEOPage {
  title: string
  description: string
  keywords: string[]
  ogImage?: string
  canonical?: string
  noindex?: boolean
}

export const SEO_CONFIG = {
  defaultTitle: '1753 Skincare - Naturlig Hudvård med CBD & CBG',
  defaultDescription: 'Revolutionerande hudvård med CBD, CBG och medicinska svampar. Naturliga produkter som stärker hudens endocannabinoidsystem för frisk och strålande hud.',
  defaultKeywords: ['CBD hudvård', 'CBG', 'naturlig hudvård', 'endocannabinoidsystem', 'medicinska svampar', 'ansiktsolja', 'serum'],
  siteName: '1753 Skincare',
  siteUrl: 'https://1753skincare.com',
  defaultOgImage: '/images/og-image-default.jpg',
  twitterHandle: '@1753skincare',
  locale: 'sv_SE',
  alternateLocales: ['en_US']
}

export const PAGE_SEO: Record<string, SEOPage> = {
  // Main pages
  home: {
    title: '1753 Skincare - Naturlig Hudvård med CBD & CBG | Revolutionerande Hudvård',
    description: 'Upptäck framtidens hudvård med 1753 Skincare. CBD- och CBG-baserade produkter som arbetar med hudens naturliga endocannabinoidsystem. Fri frakt över 500kr.',
    keywords: ['CBD hudvård', 'CBG skincare', 'naturlig hudvård', 'endocannabinoidsystem', 'ansiktsolja', 'serum', 'Sverige'],
    ogImage: '/images/og-home.jpg'
  },
  
  products: {
    title: 'Våra Produkter - CBD & CBG Hudvård | 1753 Skincare',
    description: 'Utforska vår kollektion av naturliga hudvårdsprodukter med CBD, CBG och medicinska svampar. Ansiktsoljor, serum och kosttillskott för alla hudtyper.',
    keywords: ['CBD produkter', 'CBG serum', 'ansiktsolja', 'naturlig hudvård', 'medicinska svampar', 'fungtastic', 'ta-da serum'],
    ogImage: '/images/og-products.jpg'
  },

  // Individual products
  'ta-da-serum': {
    title: 'TA-DA Serum med CBD & CBG - Intensiv Hudvård | 1753 Skincare',
    description: 'Vårt kraftfulla TA-DA Serum med CBD och CBG för intensiv hudförnyelse. Perfekt för alla hudtyper som behöver extra näring och återhämtning.',
    keywords: ['ta-da serum', 'CBD serum', 'CBG serum', 'hudförnyelse', 'anti-aging', 'naturlig hudvård'],
    ogImage: '/images/products/ta-da-serum-og.jpg'
  },

  'the-one-facial-oil': {
    title: 'The ONE Facial Oil - Lyxig Ansiktsolja med CBD | 1753 Skincare', 
    description: 'The ONE Facial Oil - vår premiummix av CBD, jojobaolja och MCT-olja. Ger djup näring och balanserar hudens naturliga oljor.',
    keywords: ['the one facial oil', 'CBD ansiktsolja', 'jojoba', 'MCT olja', 'torr hud', 'naturlig hudvård'],
    ogImage: '/images/products/the-one-og.jpg'
  },

  'i-love-facial-oil': {
    title: 'I LOVE Facial Oil - Närande Ansiktsolja | 1753 Skincare',
    description: 'I LOVE Facial Oil med CBD och närande botaniska oljor. Idealisk för känslig hud som behöver mild men effektiv vård.',
    keywords: ['i love facial oil', 'CBD', 'känslig hud', 'ansiktsolja', 'naturlig', 'botanisk'],
    ogImage: '/images/products/i-love-og.jpg'
  },

  'fungtastic-mushroom-extract': {
    title: 'Fungtastic - Medicinska Svampar för Huden | 1753 Skincare',
    description: 'Fungtastic kosttillskott med Chaga, Lions Mane, Reishi och Cordyceps. Stärker huden inifrån med kraftfulla adaptogener.',
    keywords: ['fungtastic', 'medicinska svampar', 'chaga', 'lions mane', 'reishi', 'cordyceps', 'kosttillskott', 'adaptogener'],
    ogImage: '/images/products/fungtastic-og.jpg'
  },

  'au-naturel-makeup-remover': {
    title: 'Au Naturel Makeup Remover - Naturlig Sminkborttagning | 1753 Skincare',
    description: 'Au Naturel Makeup Remover tar skonsamt bort smink och smuts utan att torka ut huden. Med naturliga oljor för alla hudtyper.',
    keywords: ['au naturel', 'makeup remover', 'sminkborttagning', 'naturlig rengöring', 'mild hudvård'],
    ogImage: '/images/products/au-naturel-og.jpg'
  },

  // Content pages  
  blog: {
    title: 'Blogg - Hudvårdsexpertis & CBD-kunskap | 1753 Skincare',
    description: 'Läs våra expertartiklar om CBD-hudvård, endocannabinoidsystemet, medicinska svampar och naturlig hudvård. Evidensbaserad information.',
    keywords: ['hudvård blogg', 'CBD kunskap', 'endocannabinoidsystem', 'medicinska svampar', 'hudvårdsexpert', 'naturlig hudvård'],
    ogImage: '/images/og-blog.jpg'
  },

  ebook: {
    title: 'Gratis E-bok: Weed Your Skin - Komplett CBD-hudvårdsguide | 1753 Skincare',
    description: 'Ladda ner vår kostnadsfria e-bok "Weed Your Skin" - 300+ sidor om CBD-hudvård, endocannabinoidsystemet och naturlig hudvård.',
    keywords: ['CBD e-bok', 'weed your skin', 'hudvårdsguide', 'endocannabinoidsystem', 'gratis bok', 'CBD kunskap'],
    ogImage: '/images/ebook-og.jpg'
  },

  quiz: {
    title: 'Kostnadsfri Hudanalys - AI-driven Personlig Hudvårdsplan | 1753 Skincare',
    description: 'Gör vår kostnadsfria AI-drivna hudanalys på 2 minuter. Få personliga produktrekommendationer och en skräddarsydd hudvårdsrutin.',
    keywords: ['hudanalys', 'hudtest', 'personlig hudvård', 'AI hudanalys', 'hudvårdsrutin', 'gratis test'],
    ogImage: '/images/quiz-og.jpg'
  },

  'raw-materials': {
    title: 'Funktionella Råvaror - CBD, CBG & Medicinska Svampar | 1753 Skincare',
    description: 'Lär dig om våra funktionella råvaror: CBD, CBG, Chaga, Lions Mane, Reishi, Cordyceps, Jojoba och MCT-olja. Evidensbaserad information.',
    keywords: ['funktionella råvaror', 'CBD', 'CBG', 'chaga', 'lions mane', 'reishi', 'cordyceps', 'jojoba', 'MCT'],
    ogImage: '/images/og-ingredients.jpg'
  },

  // Info pages
  about: {
    title: 'Om Oss - 1753 Skincare | Naturlig Hudvård med CBD & CBG',
    description: 'Lär känna 1753 Skincare - pionjärer inom CBD-hudvård i Sverige. Vår mission är att revolutionera hudvård genom naturens kraft.',
    keywords: ['om 1753 skincare', 'CBD hudvård sverige', 'naturlig hudvård', 'företag', 'mission'],
    ogImage: '/images/og-about.jpg'
  },

  contact: {
    title: 'Kontakt - Kundservice & Support | 1753 Skincare',
    description: 'Kontakta 1753 Skincare för frågor om produkter, beställningar eller hudvård. Vi hjälper dig att hitta rätt produkter för din hud.',
    keywords: ['kontakt', 'kundservice', 'support', '1753 skincare', 'hjälp'],
    ogImage: '/images/og-contact.jpg'
  },

  faq: {
    title: 'Q&A - Vanliga Frågor om CBD-hudvård | 1753 Skincare',
    description: 'Svar på vanliga frågor om CBD-hudvård, våra produkter, leverans och returer. Allt du behöver veta om 1753 Skincare.',
    keywords: ['vanliga frågor', 'FAQ', 'CBD frågor', 'hudvård hjälp', 'produktinformation'],
    ogImage: '/images/og-faq.jpg'
  },

  // Legal pages
  'privacy-policy': {
    title: 'Integritetspolicy - GDPR & Datasäkerhet | 1753 Skincare',
    description: 'Läs vår integritetspolicy för att förstå hur vi hanterar dina personuppgifter enligt GDPR. Transparent och säker datahantering.',
    keywords: ['integritetspolicy', 'GDPR', 'personuppgifter', 'datasäkerhet'],
    noindex: true
  },

  terms: {
    title: 'Användarvillkor - Köpvillkor & Leverans | 1753 Skincare',
    description: 'Våra användarvillkor och köpvillkor för 1753 Skincare. Information om leverans, returer och reklamationer.',
    keywords: ['användarvillkor', 'köpvillkor', 'leverans', 'returer'],
    noindex: true
  }
}

export function generateMetadata(pageKey: string, customData?: Partial<SEOPage>): Metadata {
  const pageData = PAGE_SEO[pageKey] || {}
  const data = { ...pageData, ...customData }
  
  const title = data.title || SEO_CONFIG.defaultTitle
  const description = data.description || SEO_CONFIG.defaultDescription
  const keywords = data.keywords || SEO_CONFIG.defaultKeywords
  const ogImage = data.ogImage || SEO_CONFIG.defaultOgImage

  return {
    title,
    description,
    keywords: keywords.join(', '),
    robots: data.noindex ? 'noindex,nofollow' : 'index,follow',
    
    openGraph: {
      title,
      description,
      siteName: SEO_CONFIG.siteName,
      locale: SEO_CONFIG.locale,
      type: 'website',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title
        }
      ]
    },
    
    twitter: {
      card: 'summary_large_image',
      site: SEO_CONFIG.twitterHandle,
      title,
      description,
      images: [ogImage]
    },

    alternates: {
      canonical: data.canonical ? `${SEO_CONFIG.siteUrl}${data.canonical}` : undefined,
      languages: {
        'sv': '/sv',
        'en': '/en'
      }
    },

    other: {
      'og:image:width': '1200',
      'og:image:height': '630'
    }
  }
}

// Helper for product pages
export function generateProductMetadata(product: any): Metadata {
  return generateMetadata('products', {
    title: `${product.name} - CBD Hudvård | 1753 Skincare`,
    description: `${product.description} Köp ${product.name} med CBD och naturliga ingredienser. Fri frakt över 500kr.`,
    keywords: [product.name.toLowerCase(), 'CBD', 'naturlig hudvård', ...product.tags || []],
    ogImage: product.image || SEO_CONFIG.defaultOgImage,
    canonical: `/products/${product.slug}`
  })
}

// Helper for blog posts
export function generateBlogMetadata(post: any): Metadata {
  return generateMetadata('blog', {
    title: `${post.title} | 1753 Skincare Blogg`,
    description: post.excerpt || post.content.substring(0, 160).replace(/<[^>]*>/g, ''),
    keywords: [post.category, ...post.tags || [], 'CBD', 'hudvård'],
    ogImage: post.featuredImage || SEO_CONFIG.defaultOgImage,
    canonical: `/blogg/${post.slug}`
  })
} 