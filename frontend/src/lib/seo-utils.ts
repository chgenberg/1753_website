export interface SEOMetadata {
  title: string
  description: string
  keywords: string[]
  slug: string
  openGraph: {
    title: string
    description: string
    type: 'website' | 'article'
    url: string
    siteName: string
  }
  twitter: {
    card: 'summary_large_image'
    title: string
    description: string
  }
}

export function generatePageSEO(pageType: string, customData?: Partial<SEOMetadata>): SEOMetadata {
  const baseUrl = 'https://1753skincare.com'
  const siteName = '1753 Skincare'
  
  const seoData: Record<string, Partial<SEOMetadata>> = {
    home: {
      title: '1753 Skincare - Naturlig Hudvård med CBD & Medicinska Svampar',
      description: 'Upptäck framtidens hudvård med 1753 Skincare. Naturliga produkter med CBD, CBG och medicinska svampar för optimal hudhälsa. Vetenskapligt baserad hudvård som fungerar.',
      keywords: ['hudvård', 'cbd hudvård', 'naturlig hudvård', 'medicinska svampar', 'cbg', 'endocannabinoidsystem', 'ekologisk hudvård', 'svenska hudvårdsprodukter'],
      slug: ''
    },
    about: {
      title: 'Om Oss - 1753 Skincare | Familj & Rörelse för Naturlig Hudvård',
      description: 'Lär känna familjen bakom 1753 Skincare. Christopher och Ebba Genberg revolutionerar hudvårdsindustrin med naturliga ingredienser och vetenskaplig forskning.',
      keywords: ['om oss', 'christopher genberg', 'ebba genberg', '1753 skincare', 'hudvårdsexperter', 'naturlig hudvård', 'familjeföretag'],
      slug: 'om-oss'
    },
    ingredients: {
      title: 'Våra Ingredienser - Naturliga Växter & Medicinska Svampar',
      description: 'Upptäck kraftfulla ingredienser som CBD, CBG, Chaga, Reishi och Lion\'s Mane. Vetenskapligt beprövade växter för optimal hudhälsa och välbefinnande.',
      keywords: ['ingredienser', 'cbd', 'cbg', 'chaga', 'reishi', 'lions mane', 'cordyceps', 'medicinska svampar', 'naturliga ingredienser'],
      slug: 'om-oss/ingredienser'
    },
    'ingredients-cbd': {
      title: 'CBD för Hudvård - Naturlig Balans & Antiinflammatorisk Effekt',
      description: 'Lär dig allt om CBD:s fördelar för huden. Antiinflammatorisk, balanserande och regenererande effekter för alla hudtyper. Vetenskapligt beprövat.',
      keywords: ['cbd', 'cbd hudvård', 'cannabidiol', 'antiinflammatorisk', 'endocannabinoidsystem', 'naturlig hudvård', 'balanserad hud'],
      slug: 'om-oss/ingredienser/cbd'
    },
    'ingredients-cbg': {
      title: 'CBG - Moder till Alla Cannabinoider | Antibakteriell Hudvård',
      description: 'CBG kallas "moder till alla cannabinoider" med kraftfulla antibakteriella och antioxidativa egenskaper. Perfekt för problematisk hud.',
      keywords: ['cbg', 'cannabigerol', 'antibakteriell', 'antioxidant', 'problematisk hud', 'akne', 'naturlig hudvård'],
      slug: 'om-oss/ingredienser/cbg'
    },
    'ingredients-mct': {
      title: 'MCT Kokosolja - Perfekt Bärarolja för Hudvård',
      description: 'MCT kokosolja med antimikrobiella egenskaper och djup fuktgivande effekt. Idealisk bärarolja för CBD och andra aktiva ingredienser.',
      keywords: ['mct olja', 'kokosolja', 'bärarolja', 'fuktgivande', 'antimikrobiell', 'laurinsyra', 'naturlig hudvård'],
      slug: 'om-oss/ingredienser/mct-kokosolja'
    },
    'ingredients-jojoba': {
      title: 'Jojoba Olja - Naturens Perfekta Hudvård | Flytande Vaxester',
      description: 'Jojoba olja är tekniskt sett en flytande vaxester som efterliknar hudens naturliga sebum. Perfekt för alla hudtyper utan att täppa till porer.',
      keywords: ['jojoba olja', 'vaxester', 'sebum', 'naturlig hudvård', 'alla hudtyper', 'icke-komedogen', 'fuktgivande'],
      slug: 'om-oss/ingredienser/jojoba-olja'
    },
    'ingredients-chaga': {
      title: 'Chaga Svamp - Skogens Diamant | Antioxidantrik Hudvård',
      description: 'Chaga svamp, känd som "skogens diamant", innehåller kraftfulla antioxidanter som SOD för anti-aging och hudskydd.',
      keywords: ['chaga', 'chaga svamp', 'antioxidant', 'sod', 'anti-aging', 'medicinska svampar', 'naturlig hudvård'],
      slug: 'om-oss/ingredienser/chaga'
    },
    'ingredients-reishi': {
      title: 'Reishi Svamp - Odödlighetens Svamp | Adaptogen för Huden',
      description: 'Reishi svamp, känd som "odödlighetens svamp", är en kraftfull adaptogen som hjälper huden att hantera stress och främjar återhämtning.',
      keywords: ['reishi', 'reishi svamp', 'adaptogen', 'stress', 'återhämtning', 'medicinska svampar', 'anti-stress'],
      slug: 'om-oss/ingredienser/reishi'
    },
    'ingredients-lions-mane': {
      title: 'Lion\'s Mane Svamp - Den Smarta Svampen | Neurotropisk Hudvård',
      description: 'Lion\'s Mane svamp stödjer både hjärna och hud genom neurotropiska egenskaper och förbättrad hjärn-hud-koppling.',
      keywords: ['lions mane', 'neurotropisk', 'hjärn-hud-koppling', 'kognitiv hälsa', 'medicinska svampar', 'smart svamp'],
      slug: 'om-oss/ingredienser/lions-mane'
    },
    'ingredients-cordyceps': {
      title: 'Cordyceps Svamp - Energigivande Svamp | Förbättrad Cirkulation',
      description: 'Cordyceps svamp ökar energi och syreupptagning, vilket förbättrar blodcirkulationen och ger huden en naturlig lyster.',
      keywords: ['cordyceps', 'energi', 'syreupptagning', 'cirkulation', 'lyster', 'medicinska svampar', 'naturlig energi'],
      slug: 'om-oss/ingredienser/cordyceps'
    },
    'ingredients-sources': {
      title: 'Vetenskapliga Källor - Forskning Bakom Våra Ingredienser',
      description: 'Utforska den vetenskapliga forskningen bakom våra ingredienser. Över 40 peer-reviewed studier som stödjer våra påståenden.',
      keywords: ['vetenskapliga källor', 'forskning', 'studier', 'peer-reviewed', 'evidensbaserad', 'hudvårdsforskning'],
      slug: 'om-oss/ingredienser/kallor'
    },
    faq: {
      title: 'Vanliga Frågor - FAQ | 1753 Skincare',
      description: 'Få svar på vanliga frågor om våra produkter, ingredienser och hudvård. Expertråd för optimal användning av naturlig hudvård.',
      keywords: ['faq', 'vanliga frågor', 'hudvårdsråd', 'produktinformation', 'expertråd', 'naturlig hudvård'],
      slug: 'om-oss/faq'
    },
    retailers: {
      title: 'Återförsäljare - Hitta 1753 Skincare Produkter',
      description: 'Hitta våra produkter hos auktoriserade återförsäljare. Kvalitetsgaranti och expertkunskap för bästa hudvårdsupplevelse.',
      keywords: ['återförsäljare', 'köp produkter', 'auktoriserade återförsäljare', 'kvalitetsgaranti', 'hudvårdsprodukter'],
      slug: 'om-oss/aterforsaljare'
    },
    products: {
      title: 'Produkter - Naturlig Hudvård med CBD & Medicinska Svampar',
      description: 'Upptäck vårt sortiment av naturliga hudvårdsprodukter med CBD, CBG och medicinska svampar. Vetenskapligt formulerade för optimal hudhälsa.',
      keywords: ['produkter', 'hudvårdsprodukter', 'cbd produkter', 'naturlig hudvård', 'medicinska svampar', 'hudvårdsserie'],
      slug: 'products'
    },
    blog: {
      title: 'Blogg - Expertkunskap inom Hudvård & Naturliga Ingredienser',
      description: 'Läs våra expertartiklar om hudvård, naturliga ingredienser och hälsa. Vetenskapligt baserad information för bättre hudhälsa.',
      keywords: ['blogg', 'hudvårdsartiklar', 'expertkunskap', 'naturlig hudvård', 'hudvårdstips', 'vetenskaplig information'],
      slug: 'blogg'
    },
    contact: {
      title: 'Kontakta Oss - 1753 Skincare | Experthjälp & Support',
      description: 'Kontakta våra hudvårdsexperter för personlig rådgivning och support. Vi hjälper dig att hitta rätt hudvård för dina behov.',
      keywords: ['kontakt', 'kundservice', 'hudvårdsexperter', 'personlig rådgivning', 'support', 'hjälp'],
      slug: 'kontakt'
    }
  }
  
  const defaultData = seoData[pageType] || seoData.home
  const finalData = { ...defaultData, ...customData }
  
  return {
    title: finalData.title || '',
    description: finalData.description || '',
    keywords: finalData.keywords || [],
    slug: finalData.slug || '',
    openGraph: {
      title: finalData.title || '',
      description: finalData.description || '',
      type: pageType === 'blog' ? 'article' : 'website',
      url: `${baseUrl}/${finalData.slug}`,
      siteName
    },
    twitter: {
      card: 'summary_large_image',
      title: finalData.title || '',
      description: finalData.description || ''
    }
  }
}

export function generateBlogPostSEO(blogPost: {
  title: string
  metaDescription?: string
  keywords?: string[]
  slug: string
  author?: string
  date?: string
}): SEOMetadata {
  const baseUrl = 'https://1753skincare.com'
  const siteName = '1753 Skincare'
  
  return {
    title: `${blogPost.title} | 1753 Skincare Blogg`,
    description: blogPost.metaDescription || `Läs mer om ${blogPost.title} på 1753 Skincare. Expertkunskap inom hudvård och naturliga ingredienser.`,
    keywords: blogPost.keywords || ['hudvård', 'naturlig hudvård', 'cbd', 'medicinska svampar'],
    slug: `blogg/${blogPost.slug}`,
    openGraph: {
      title: blogPost.title,
      description: blogPost.metaDescription || `Läs mer om ${blogPost.title} på 1753 Skincare.`,
      type: 'article',
      url: `${baseUrl}/blogg/${blogPost.slug}`,
      siteName
    },
    twitter: {
      card: 'summary_large_image',
      title: blogPost.title,
      description: blogPost.metaDescription || `Läs mer om ${blogPost.title} på 1753 Skincare.`
    }
  }
}

export function generateSlugFromTitle(title: string): string {
  return title
    .toLowerCase()
    .trim()
    // Replace Swedish characters
    .replace(/[åä]/g, 'a')
    .replace(/ö/g, 'o')
    .replace(/é/g, 'e')
    .replace(/ü/g, 'u')
    // Replace spaces and special characters with hyphens
    .replace(/[^a-z0-9]+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, '')
    // Limit length to 60 characters for SEO
    .substring(0, 60)
    .replace(/-+$/, '') // Remove trailing hyphen if substring cut in middle of word
} 