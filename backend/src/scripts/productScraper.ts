import puppeteer from 'puppeteer'
import * as cheerio from 'cheerio'
import fs from 'fs'
import path from 'path'

interface ProductData {
  name: string
  slug: string
  price: number
  originalPrice?: number
  description: string
  shortDescription: string
  ingredients: string[]
  usage: string
  benefits: string[]
  skinTypes: string[]
  category: string
  tags: string[]
  images: string[]
  inStock: boolean
  seo: {
    title: string
    description: string
    keywords: string[]
  }
  reviews?: {
    count: number
    rating: number
  }
}

const PRODUCT_URLS = [
  'https://www.1753skincare.com/products/duo-ta-da',
  'https://www.1753skincare.com/products/ta-da-serum',
  'https://www.1753skincare.com/products/duo-kit-the-one-i-love-facial-oil',
  'https://www.1753skincare.com/products/i-love-facial-oil',
  'https://www.1753skincare.com/products/facialoil',
  'https://www.1753skincare.com/products/makeup-remover-au-naturel',
  'https://www.1753skincare.com/products/fungtastic-extract'
]

class ProductScraper {
  private browser: any
  private scrapedData: ProductData[] = []

  async initialize() {
    console.log('🚀 Initializing browser...')
    this.browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })
  }

  async scrapeProduct(url: string): Promise<ProductData | null> {
    console.log(`📊 Scraping: ${url}`)
    
    try {
      const page = await this.browser.newPage()
      await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36')
      
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 })
      
      // Wait for content to load
      await page.waitForTimeout(3000)
      
      const content = await page.content()
      const $ = cheerio.load(content)
      
      // Extract basic product info
      const name = this.extractProductName($)
      const slug = this.extractSlug(url)
      const { price, originalPrice } = this.extractPrice($)
      const description = this.extractDescription($)
      const shortDescription = this.extractShortDescription($)
      const ingredients = this.extractIngredients($)
      const usage = this.extractUsage($)
      const benefits = this.extractBenefits($)
      const skinTypes = this.extractSkinTypes($)
      const category = this.extractCategory($)
      const tags = this.extractTags($)
      const images = this.extractImages($)
      const inStock = this.extractStock($)
      const seo = this.extractSEO($)
      const reviews = this.extractReviews($)

      await page.close()

      const productData: ProductData = {
        name,
        slug,
        price,
        originalPrice,
        description,
        shortDescription,
        ingredients,
        usage,
        benefits,
        skinTypes,
        category,
        tags,
        images,
        inStock,
        seo,
        reviews
      }

      console.log(`✅ Successfully scraped: ${name}`)
      return productData

    } catch (error) {
      console.error(`❌ Error scraping ${url}:`, error)
      return null
    }
  }

  private extractProductName($: cheerio.CheerioAPI): string {
    const selectors = [
      'h1',
      '.product-title',
      '.product__title',
      '.product-name',
      'h1.product-title',
      '[data-testid="product-title"]'
    ]
    
    for (const selector of selectors) {
      const element = $(selector).first()
      if (element.length && element.text().trim()) {
        return element.text().trim()
      }
    }
    
    return 'Unknown Product'
  }

  private extractSlug(url: string): string {
    const parts = url.split('/')
    return parts[parts.length - 1] || 'unknown-product'
  }

  private extractPrice($: cheerio.CheerioAPI): { price: number; originalPrice?: number } {
    let price = 0
    let originalPrice: number | undefined

    // Try multiple price selectors
    const priceSelectors = [
      '.price',
      '.product-price',
      '.current-price',
      '[data-testid="price"]',
      '.price-current',
      '.money'
    ]

    const originalPriceSelectors = [
      '.original-price',
      '.was-price',
      '.compare-at-price',
      '.line-through'
    ]

    // Extract current price
    for (const selector of priceSelectors) {
      const priceText = $(selector).first().text().trim()
      const match = priceText.match(/(\d+(?:\s?\d+)*)\s*kr/)
      if (match) {
        price = parseInt(match[1].replace(/\s/g, ''))
        break
      }
    }

    // Extract original price if exists
    for (const selector of originalPriceSelectors) {
      const originalPriceText = $(selector).first().text().trim()
      const match = originalPriceText.match(/(\d+(?:\s?\d+)*)\s*kr/)
      if (match) {
        originalPrice = parseInt(match[1].replace(/\s/g, ''))
        break
      }
    }

    return { price, originalPrice }
  }

  private extractDescription($: cheerio.CheerioAPI): string {
    const selectors = [
      '.product-description',
      '.product__description',
      '.rte',
      '.product-single__description',
      '.product-content'
    ]
    
    for (const selector of selectors) {
      const element = $(selector).first()
      if (element.length) {
        return element.text().trim()
      }
    }
    
    return ''
  }

  private extractShortDescription($: cheerio.CheerioAPI): string {
    const selectors = [
      '.product-short-description',
      '.product__short-description',
      '.product-summary',
      'meta[name="description"]'
    ]
    
    for (const selector of selectors) {
      const element = $(selector).first()
      if (element.length) {
        if (selector.includes('meta')) {
          return element.attr('content') || ''
        }
        return element.text().trim()
      }
    }
    
    return ''
  }

  private extractIngredients($: cheerio.CheerioAPI): string[] {
    const ingredients: string[] = []
    
    // Look for ingredients sections
    const sections = $('*').filter((_, el) => {
      const text = $(el).text().toLowerCase()
      return text.includes('ingrediens') || text.includes('ingredients') || text.includes('innehåll')
    })
    
    sections.each((_, el) => {
      const parent = $(el).parent()
      const text = parent.text()
      
      // Extract ingredient lists
      const matches = text.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/g)
      if (matches) {
        matches.forEach(match => {
          if (match.length > 3 && !ingredients.includes(match)) {
            ingredients.push(match.trim())
          }
        })
      }
    })
    
    return ingredients
  }

  private extractUsage($: cheerio.CheerioAPI): string {
    const selectors = [
      '*:contains("Användning")',
      '*:contains("How to use")',
      '*:contains("Så använder du")',
      '*:contains("Applicera")'
    ]
    
    for (const selector of selectors) {
      const element = $(selector)
      if (element.length) {
        const parent = element.parent()
        const siblings = parent.nextAll()
        const text = siblings.text().trim()
        if (text) return text
      }
    }
    
    return ''
  }

  private extractBenefits($: cheerio.CheerioAPI): string[] {
    const benefits: string[] = []
    
    // Look for benefit lists
    const benefitSelectors = [
      'ul li',
      '.benefits li',
      '.product-benefits li'
    ]
    
    for (const selector of benefitSelectors) {
      $(selector).each((_, el) => {
        const text = $(el).text().trim()
        if (text && text.length > 10 && text.length < 200) {
          benefits.push(text)
        }
      })
    }
    
    return [...new Set(benefits)] // Remove duplicates
  }

  private extractSkinTypes($: cheerio.CheerioAPI): string[] {
    const skinTypes: string[] = []
    const text = $('body').text().toLowerCase()
    
    const types = [
      'torr hud', 'dry skin',
      'fet hud', 'oily skin',
      'känslig hud', 'sensitive skin',
      'normal hud', 'normal skin',
      'kombinerad hud', 'combination skin',
      'mogen hud', 'mature skin'
    ]
    
    types.forEach(type => {
      if (text.includes(type)) {
        skinTypes.push(type)
      }
    })
    
    return [...new Set(skinTypes)]
  }

  private extractCategory($: cheerio.CheerioAPI): string {
    const breadcrumbs = $('.breadcrumb a, .breadcrumbs a')
    if (breadcrumbs.length > 1) {
      return $(breadcrumbs[breadcrumbs.length - 2]).text().trim()
    }
    
    return 'Hudvård'
  }

  private extractTags($: cheerio.CheerioAPI): string[] {
    const tags: string[] = []
    const text = $('body').text().toLowerCase()
    
    const commonTags = [
      'cbd', 'cbg', 'naturlig', 'ekologisk', 'ansiktsolja', 'serum',
      'återfuktande', 'anti-aging', 'lugnande', 'närande'
    ]
    
    commonTags.forEach(tag => {
      if (text.includes(tag)) {
        tags.push(tag)
      }
    })
    
    return tags
  }

  private extractImages($: cheerio.CheerioAPI): string[] {
    const images: string[] = []
    
    const imgElements = $('img')
    imgElements.each((_, el) => {
      const src = $(el).attr('src')
      const alt = $(el).attr('alt')
      
      if (src && (alt?.toLowerCase().includes('product') || src.includes('product'))) {
        images.push(src)
      }
    })
    
    return [...new Set(images)]
  }

  private extractStock($: cheerio.CheerioAPI): boolean {
    const text = $('body').text().toLowerCase()
    return !text.includes('slut i lager') && !text.includes('out of stock')
  }

  private extractSEO($: cheerio.CheerioAPI): { title: string; description: string; keywords: string[] } {
    const title = $('title').text() || $('meta[property="og:title"]').attr('content') || ''
    const description = $('meta[name="description"]').attr('content') || 
                       $('meta[property="og:description"]').attr('content') || ''
    const keywords = $('meta[name="keywords"]').attr('content')?.split(',').map(k => k.trim()) || []
    
    return { title, description, keywords }
  }

  private extractReviews($: cheerio.CheerioAPI): { count: number; rating: number } | undefined {
    const reviewText = $('.reviews, .review-summary, .product-reviews').text()
    
    const countMatch = reviewText.match(/(\d+)\s*(review|recension)/i)
    const ratingMatch = reviewText.match(/(\d+(?:\.\d+)?)\s*(?:\/5|star|stjärn)/i)
    
    if (countMatch || ratingMatch) {
      return {
        count: countMatch ? parseInt(countMatch[1]) : 0,
        rating: ratingMatch ? parseFloat(ratingMatch[1]) : 0
      }
    }
    
    return undefined
  }

  async scrapeAllProducts(): Promise<ProductData[]> {
    console.log('🎯 Starting product scraping...')
    
    for (const url of PRODUCT_URLS) {
      const productData = await this.scrapeProduct(url)
      if (productData) {
        this.scrapedData.push(productData)
      }
      
      // Add delay between requests
      await new Promise(resolve => setTimeout(resolve, 2000))
    }
    
    return this.scrapedData
  }

  async saveData(): Promise<void> {
    const dataDir = path.join(__dirname, '../../data')
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
    }
    
    const filePath = path.join(dataDir, 'scraped-products.json')
    fs.writeFileSync(filePath, JSON.stringify(this.scrapedData, null, 2))
    
    console.log(`💾 Data saved to: ${filePath}`)
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close()
    }
  }
}

// Main execution
async function main() {
  const scraper = new ProductScraper()
  
  try {
    await scraper.initialize()
    const products = await scraper.scrapeAllProducts()
    await scraper.saveData()
    
    console.log(`🎉 Successfully scraped ${products.length} products!`)
    console.log('\nProducts found:')
    products.forEach(product => {
      console.log(`- ${product.name} (${product.price} kr)`)
    })
    
  } catch (error) {
    console.error('❌ Scraping failed:', error)
  } finally {
    await scraper.close()
  }
}

// Export for use in other scripts
export { ProductScraper, ProductData }

// Run if called directly
if (require.main === module) {
  main()
} 