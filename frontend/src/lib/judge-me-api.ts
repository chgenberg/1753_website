// Judge.me API Integration
export interface JudgeMeReview {
  id: number
  title: string
  body: string
  rating: number
  reviewer: {
    name: string
    email: string
  }
  created_at: string
  verified: boolean
  product_external_id: string
  product_title: string
  pictures: Array<{
    urls: {
      original: string
      small: string
      compact: string
    }
  }>
}

export interface JudgeMeProduct {
  id: number
  name: string
  sku: string
  external_id: string
  average_rating: number
  reviews_count: number
}

export interface JudgeMeStats {
  average_rating: number
  total_reviews: number
  rating_distribution: {
    1: number
    2: number
    3: number
    4: number
    5: number
  }
}

// Mock data for development
const mockReviews: JudgeMeReview[] = [
  {
    id: 1,
    title: "Fantastisk produkt!",
    body: "Jag har använt THE ONE i 3 månader nu och min hud har aldrig mått bättre. CBD-oljan känns lyxig och ger verkligen resultat. Mina inflammationer har minskat markant och huden känns mjuk och återfuktad.",
    rating: 5,
    reviewer: {
      name: "Anna S.",
      email: "anna@example.com"
    },
    created_at: "2024-01-15T10:30:00Z",
    verified: true,
    product_external_id: "the-one",
    product_title: "THE ONE",
    pictures: []
  },
  {
    id: 2,
    title: "Bästa köpet jag gjort",
    body: "Som någon med känslig hud var jag skeptisk till att prova CBD-hudvård. Men NATUREL har verkligen överträffat mina förväntningar. Ingen irritation alls och huden ser friskare ut.",
    rating: 5,
    reviewer: {
      name: "Erik M.",
      email: "erik@example.com"
    },
    created_at: "2024-01-10T14:20:00Z",
    verified: true,
    product_external_id: "naturel",
    product_title: "NATUREL",
    pictures: []
  },
  {
    id: 3,
    title: "Märkbar skillnad",
    body: "Använt TA-DA i 6 veckor för mina akne-problem. Verkligen märkbar förbättring! Färre utbrott och huden läker snabbare. Kommer definitivt beställa igen.",
    rating: 4,
    reviewer: {
      name: "Sofia L.",
      email: "sofia@example.com"
    },
    created_at: "2024-01-08T09:15:00Z",
    verified: true,
    product_external_id: "ta-da",
    product_title: "TA-DA",
    pictures: []
  },
  {
    id: 4,
    title: "Rekommenderas varmt",
    body: "FUNGTASTIC med svampextrakt är helt underbar. Huden känns fastare och mer elastisk. Doften är också mycket behaglig. 1753 Skincare levererar verkligen kvalitet.",
    rating: 5,
    reviewer: {
      name: "Maria K.",
      email: "maria@example.com"
    },
    created_at: "2024-01-05T16:45:00Z",
    verified: true,
    product_external_id: "fungtastic",
    product_title: "FUNGTASTIC",
    pictures: []
  },
  {
    id: 5,
    title: "Perfekt för min hudtyp",
    body: "I LOVE-serien är precis vad min kombinationshud behövde. Balanserar perfekt utan att göra huden för torr eller för fet. Mycket nöjd!",
    rating: 5,
    reviewer: {
      name: "Lisa H.",
      email: "lisa@example.com"
    },
    created_at: "2024-01-03T11:30:00Z",
    verified: true,
    product_external_id: "i-love",
    product_title: "I LOVE",
    pictures: []
  },
  {
    id: 6,
    title: "Bra start för nybörjare",
    body: "DUO-paketet var perfekt för mig som var ny till CBD-hudvård. Båda produkterna kompletterar varandra bra och resultatet syns redan efter några veckor.",
    rating: 4,
    reviewer: {
      name: "Johan R.",
      email: "johan@example.com"
    },
    created_at: "2024-01-01T13:20:00Z",
    verified: true,
    product_external_id: "duo",
    product_title: "DUO",
    pictures: []
  }
]

const mockStats: JudgeMeStats = {
  average_rating: 4.7,
  total_reviews: 127,
  rating_distribution: {
    1: 2,
    2: 3,
    3: 8,
    4: 32,
    5: 82
  }
}

class JudgeMeAPI {
  private baseUrl = 'https://judge.me/api/v1'
  private shopDomain: string
  private publicToken: string
  private privateToken: string
  private isDevelopment: boolean

  constructor() {
    this.shopDomain = process.env.NEXT_PUBLIC_JUDGE_ME_SHOP_DOMAIN || '1753skincare.myshopify.com'
    this.publicToken = process.env.NEXT_PUBLIC_JUDGE_ME_PUBLIC_TOKEN || 'BEnXoguHo7hItl0TiV92JC65Rmk'
    this.privateToken = process.env.JUDGE_ME_PRIVATE_TOKEN || '3WoipsmPeFi0aRvUOyqwsw5P21c'
    this.isDevelopment = process.env.NODE_ENV === 'development' || 
                        (typeof window !== 'undefined' && window.location.hostname === 'localhost')
  }

  // Get reviews for a specific product
  async getProductReviews(productId: string, page: number = 1, perPage: number = 10): Promise<JudgeMeReview[]> {
    if (this.isDevelopment) {
      // Return mock data for development
      const filtered = mockReviews.filter(review => 
        review.product_external_id === productId
      )
      const start = (page - 1) * perPage
      const end = start + perPage
      return filtered.slice(start, end)
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/reviews?` + new URLSearchParams({
          api_token: this.publicToken,
          shop_domain: this.shopDomain,
          product_external_id: productId,
          page: page.toString(),
          per_page: perPage.toString()
        })
      )

      if (!response.ok) {
        throw new Error(`Judge.me API error: ${response.status}`)
      }

      const data = await response.json()
      return data.reviews || []
    } catch (error) {
      console.error('Error fetching product reviews:', error)
      return []
    }
  }

  // Get product statistics
  async getProductStats(productId: string): Promise<JudgeMeStats | null> {
    if (this.isDevelopment) {
      // Return mock stats for development
      const productReviews = mockReviews.filter(review => 
        review.product_external_id === productId
      )
      
      if (productReviews.length === 0) return null

      const avgRating = productReviews.reduce((sum, review) => sum + review.rating, 0) / productReviews.length
      const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      
      productReviews.forEach(review => {
        distribution[review.rating as keyof typeof distribution]++
      })

      return {
        average_rating: avgRating,
        total_reviews: productReviews.length,
        rating_distribution: distribution
      }
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/products?` + new URLSearchParams({
          api_token: this.publicToken,
          shop_domain: this.shopDomain,
          external_id: productId
        })
      )

      if (!response.ok) {
        throw new Error(`Judge.me API error: ${response.status}`)
      }

      const data = await response.json()
      const product = data.product

      if (!product) return null

      return {
        average_rating: product.average_rating,
        total_reviews: product.reviews_count,
        rating_distribution: product.rating_distribution || {
          1: 0, 2: 0, 3: 0, 4: 0, 5: 0
        }
      }
    } catch (error) {
      console.error('Error fetching product stats:', error)
      return null
    }
  }

  // Get all reviews for the shop (for homepage carousel)
  async getShopReviews(page: number = 1, perPage: number = 20): Promise<JudgeMeReview[]> {
    if (this.isDevelopment) {
      // Return mock data for development
      const start = (page - 1) * perPage
      const end = start + perPage
      return mockReviews.slice(start, end)
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/reviews?` + new URLSearchParams({
          api_token: this.publicToken,
          shop_domain: this.shopDomain,
          page: page.toString(),
          per_page: perPage.toString(),
          published: 'true'
        })
      )

      if (!response.ok) {
        throw new Error(`Judge.me API error: ${response.status}`)
      }

      const data = await response.json()
      return data.reviews || []
    } catch (error) {
      console.error('Error fetching shop reviews:', error)
      return []
    }
  }

  // Get shop statistics
  async getShopStats(): Promise<JudgeMeStats | null> {
    if (this.isDevelopment) {
      // Return mock stats for development
      return mockStats
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/reviews?` + new URLSearchParams({
          api_token: this.publicToken,
          shop_domain: this.shopDomain,
          per_page: '1' // We just need the stats
        })
      )

      if (!response.ok) {
        throw new Error(`Judge.me API error: ${response.status}`)
      }

      const data = await response.json()
      
      return {
        average_rating: data.average_rating || 0,
        total_reviews: data.total_reviews || 0,
        rating_distribution: data.rating_distribution || {
          1: 0, 2: 0, 3: 0, 4: 0, 5: 0
        }
      }
    } catch (error) {
      console.error('Error fetching shop stats:', error)
      return null
    }
  }

  // Create a new review (requires private token)
  async createReview(reviewData: {
    product_external_id: string
    reviewer_name: string
    reviewer_email: string
    rating: number
    title: string
    body: string
  }): Promise<boolean> {
    if (this.isDevelopment) {
      // Simulate successful review creation in development
      console.log('Mock review created:', reviewData)
      return true
    }

    try {
      const response = await fetch(`${this.baseUrl}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          api_token: this.privateToken,
          shop_domain: this.shopDomain,
          ...reviewData
        })
      })

      return response.ok
    } catch (error) {
      console.error('Error creating review:', error)
      return false
    }
  }

  // Generate widget URL for embedding
  getWidgetUrl(productId: string, widgetType: 'reviews' | 'preview-badge' | 'reviews-carousel' | 'all-reviews-counter'): string {
    const params = new URLSearchParams({
      shop_domain: this.shopDomain,
      product_external_id: productId,
      widget_type: widgetType
    })

    return `https://judge.me/widgets/${widgetType}?${params}`
  }
}

export const judgeMeAPI = new JudgeMeAPI()

// Utility functions
export function formatRating(rating: number): string {
  return '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating))
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('sv-SE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export function getReviewSummary(stats: JudgeMeStats): string {
  if (stats.total_reviews === 0) return 'Inga recensioner än'
  
  const avgRating = stats.average_rating.toFixed(1)
  const reviewText = stats.total_reviews === 1 ? 'recension' : 'recensioner'
  
  return `${avgRating} av 5 stjärnor (${stats.total_reviews} ${reviewText})`
} 