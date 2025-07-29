import { MetadataRoute } from 'next'

interface SitemapEntry {
  url: string
  lastModified?: string | Date
  changeFrequency?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
  priority?: number
}

const BASE_URL = 'https://1753skincare.com'

// Static pages with their priorities and update frequencies
const STATIC_PAGES = [
  { path: '', priority: 1.0, changeFrequency: 'weekly' as const },
  { path: '/products', priority: 0.9, changeFrequency: 'daily' as const },
  { path: '/blogg', priority: 0.8, changeFrequency: 'daily' as const },
  { path: '/quiz', priority: 0.8, changeFrequency: 'monthly' as const },
  { path: '/kunskap/e-bok', priority: 0.7, changeFrequency: 'monthly' as const },
  { path: '/kunskap/funktionella-ravaror', priority: 0.7, changeFrequency: 'monthly' as const },
  { path: '/om-oss', priority: 0.6, changeFrequency: 'monthly' as const },
  { path: '/om-oss/faq', priority: 0.5, changeFrequency: 'monthly' as const },
  { path: '/om-oss/ingredienser', priority: 0.6, changeFrequency: 'monthly' as const },
  { path: '/kontakt', priority: 0.5, changeFrequency: 'yearly' as const },
  { path: '/leverans-retur', priority: 0.4, changeFrequency: 'yearly' as const },
  { path: '/integritetspolicy', priority: 0.3, changeFrequency: 'yearly' as const },
  { path: '/villkor', priority: 0.3, changeFrequency: 'yearly' as const }
]

async function fetchProducts(): Promise<SitemapEntry[]> {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002'
    const response = await fetch(`${API_URL}/api/products`, {
      next: { revalidate: 3600 } // Cache for 1 hour
    })
    
    if (!response.ok) {
      console.warn('Failed to fetch products for sitemap')
      return []
    }
    
    const products = await response.json()
    const productsArray = Array.isArray(products) ? products : (products.products || [])
    
    return productsArray.map((product: any) => ({
      url: `${BASE_URL}/products/${product.slug}`,
      lastModified: product.updatedAt || new Date(),
      changeFrequency: 'weekly' as const,
      priority: product.featured ? 0.8 : 0.7
    }))
  } catch (error) {
    console.error('Error fetching products for sitemap:', error)
    return []
  }
}

async function fetchBlogPosts(): Promise<SitemapEntry[]> {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002'
    const response = await fetch(`${API_URL}/api/blog`, {
      next: { revalidate: 3600 } // Cache for 1 hour
    })
    
    if (!response.ok) {
      console.warn('Failed to fetch blog posts for sitemap')
      return []
    }
    
    const posts = await response.json()
    const postsArray = Array.isArray(posts) ? posts : (posts.posts || [])
    
    return postsArray
      .filter((post: any) => post.published)
      .map((post: any) => ({
        url: `${BASE_URL}/blogg/${post.slug}`,
        lastModified: post.updatedAt || post.publishedAt || new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.6
      }))
  } catch (error) {
    console.error('Error fetching blog posts for sitemap:', error)
    return []
  }
}

async function fetchRawMaterials(): Promise<SitemapEntry[]> {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002'
    const response = await fetch(`${API_URL}/api/raw-materials`, {
      next: { revalidate: 86400 } // Cache for 24 hours
    })
    
    if (!response.ok) {
      console.warn('Failed to fetch raw materials for sitemap')
      return []
    }
    
    const materials = await response.json()
    const materialsArray = Array.isArray(materials) ? materials : (materials.materials || [])
    
    return materialsArray.map((material: any) => ({
      url: `${BASE_URL}/kunskap/funktionella-ravaror/${material.slug}`,
      lastModified: material.updatedAt || new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5
    }))
  } catch (error) {
    console.error('Error fetching raw materials for sitemap:', error)
    return []
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const currentDate = new Date()
  
  // Static pages
  const staticPages: SitemapEntry[] = STATIC_PAGES.map(page => ({
    url: `${BASE_URL}${page.path}`,
    lastModified: currentDate,
    changeFrequency: page.changeFrequency,
    priority: page.priority
  }))
  
  // Dynamic content
  const [products, blogPosts, rawMaterials] = await Promise.all([
    fetchProducts(),
    fetchBlogPosts(),
    fetchRawMaterials()
  ])
  
  // Ingredient pages (static but numerous)
  const ingredientPages: SitemapEntry[] = [
    'cbd', 'cbg', 'chaga', 'cordyceps', 'lions-mane', 'reishi', 
    'jojoba-olja', 'mct-kokosolja'
  ].map(ingredient => ({
    url: `${BASE_URL}/om-oss/ingredienser/${ingredient}`,
    lastModified: currentDate,
    changeFrequency: 'monthly' as const,
    priority: 0.5
  }))
  
  // Combine all entries
  const allEntries = [
    ...staticPages,
    ...products,
    ...blogPosts,
    ...rawMaterials,
    ...ingredientPages
  ]
  
  // Sort by priority (highest first), then by URL
  allEntries.sort((a, b) => {
    if (a.priority !== b.priority) {
      return (b.priority || 0) - (a.priority || 0)
    }
    return a.url.localeCompare(b.url)
  })
  
  console.log(`Generated sitemap with ${allEntries.length} entries`)
  
  return allEntries
}

// Also generate robots.txt
export async function generateRobotsTxt(): Promise<string> {
  const robotsTxt = `User-agent: *
Allow: /

# Important pages
Allow: /products
Allow: /blogg
Allow: /quiz
Allow: /kunskap

# Block admin/private areas
Disallow: /api/
Disallow: /admin/
Disallow: /_next/
Disallow: /auth/

# Sitemaps
Sitemap: ${BASE_URL}/sitemap.xml

# Crawl delay for politeness
Crawl-delay: 1`

  return robotsTxt
} 