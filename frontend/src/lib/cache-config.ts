// Cache configuration for Next.js fetch requests
export const CACHE_CONFIG = {
  // Static content that rarely changes
  STATIC: {
    revalidate: 86400, // 24 hours
    tags: ['static']
  },
  
  // Product data - changes occasionally
  PRODUCTS: {
    revalidate: 3600, // 1 hour
    tags: ['products']
  },
  
  // Blog content - changes regularly
  BLOG: {
    revalidate: 1800, // 30 minutes
    tags: ['blog']
  },
  
  // Knowledge content - changes occasionally
  KNOWLEDGE: {
    revalidate: 7200, // 2 hours
    tags: ['knowledge']
  },
  
  // Reviews - changes frequently
  REVIEWS: {
    revalidate: 300, // 5 minutes
    tags: ['reviews']
  },
  
  // User-specific data - no cache
  USER: {
    revalidate: 0,
    tags: ['user']
  },
  
  // Real-time data - no cache
  REALTIME: {
    cache: 'no-store' as const
  }
} as const

// Helper function to create fetch options with caching
export const createFetchOptions = (
  cacheType: keyof typeof CACHE_CONFIG,
  additionalOptions: RequestInit = {}
): RequestInit => {
  const config = CACHE_CONFIG[cacheType]
  
  if ('cache' in config) {
    return {
      ...additionalOptions,
      cache: config.cache
    }
  }
  
  return {
    ...additionalOptions,
    next: {
      revalidate: config.revalidate,
      tags: [...config.tags],
      ...additionalOptions.next
    }
  }
}

// API fetch wrapper with automatic caching
export const cachedFetch = async (
  url: string,
  cacheType: keyof typeof CACHE_CONFIG,
  options: RequestInit = {}
): Promise<Response> => {
  const fetchOptions = createFetchOptions(cacheType, options)
  
  try {
    const response = await fetch(url, fetchOptions)
    
    if (!response.ok) {
      // Don't cache error responses
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    return response
  } catch (error) {
    console.error(`Fetch error for ${url}:`, error)
    throw error
  }
}

// Specific API helpers
export const fetchProducts = (params?: Record<string, string>) => {
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL || 'http://localhost:5002'
  const searchParams = params ? `?${new URLSearchParams(params).toString()}` : ''
  
  return cachedFetch(`${baseUrl}/api/products${searchParams}`, 'PRODUCTS')
}

export const fetchProduct = (slug: string) => {
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL || 'http://localhost:5002'
  
  return cachedFetch(`${baseUrl}/api/products/${slug}`, 'PRODUCTS')
}

export const fetchBlogPosts = (params?: Record<string, string>) => {
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL || 'http://localhost:5002'
  const searchParams = params ? `?${new URLSearchParams(params).toString()}` : ''
  
  return cachedFetch(`${baseUrl}/api/blog${searchParams}`, 'BLOG')
}

export const fetchBlogPost = (slug: string) => {
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL || 'http://localhost:5002'
  
  return cachedFetch(`${baseUrl}/api/blog/${slug}`, 'BLOG')
}

export const fetchKnowledgeContent = (params?: Record<string, string>) => {
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL || 'http://localhost:5002'
  const searchParams = params ? `?${new URLSearchParams(params).toString()}` : ''
  
  return cachedFetch(`${baseUrl}/api/knowledge/content${searchParams}`, 'KNOWLEDGE')
}

export const fetchReviews = (productId?: string) => {
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL || 'http://localhost:5002'
  const path = productId ? `/product/${productId}` : ''
  
  return cachedFetch(`${baseUrl}/api/reviews${path}`, 'REVIEWS')
}

// Cache invalidation helpers (for use with revalidateTag)
export const CACHE_TAGS = {
  PRODUCTS: 'products',
  BLOG: 'blog',
  KNOWLEDGE: 'knowledge',
  REVIEWS: 'reviews',
  STATIC: 'static',
  USER: 'user'
} as const

// Development cache debugging
export const logCacheInfo = (url: string, cacheType: keyof typeof CACHE_CONFIG) => {
  if (process.env.NODE_ENV === 'development') {
    const config = CACHE_CONFIG[cacheType]
    console.log(`🗄️ Cache: ${url}`, {
      type: cacheType,
      config
    })
  }
} 