'use client'

import { useEffect, useState } from 'react'
import { Star, StarHalf, Check } from 'lucide-react'
import { motion } from 'framer-motion'

interface ProductReviewsProps {
  productId: string
  productSlug: string
}

interface Review {
  id: number
  rating: number
  title: string
  body: string
  author: string
  createdAt: string
  status: string
}

export default function ProductReviews({ productId, productSlug }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [displayCount, setDisplayCount] = useState(3)

  useEffect(() => {
    fetchReviews()
    fetchStats()
  }, [productSlug])

  const fetchReviews = async () => {
    try {
      const response = await fetch(`/api/reviews/product/${productSlug}`)
      if (!response.ok) throw new Error('Failed to fetch reviews')
      const data = await response.json()
      
      // Handle the API response format: { success: true, data: { reviews, stats } }
      if (data.success && data.data) {
        setReviews(data.data.reviews || [])
        // Also set stats if included in the same response
        if (data.data.stats) {
          setStats(data.data.stats)
        }
      } else {
        setReviews([])
      }
    } catch (error) {
      console.error('Error fetching reviews:', error)
      setReviews([])
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch(`/api/reviews/product/${productSlug}/stats`)
      if (!response.ok) throw new Error('Failed to fetch stats')
      const data = await response.json()
      
      // Handle the API response format: { success: true, data: stats }
      if (data.success && data.data) {
        setStats(data.data)
      } else {
        setStats(null)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
      setStats(null)
    }
  }

  const renderStars = (rating: number, size: 'sm' | 'md' = 'sm') => {
    const sizes = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className={`${sizes} fill-[#4A3428] text-[#4A3428]`} />)
    }
    if (hasHalfStar) {
      stars.push(<StarHalf key="half" className={`${sizes} fill-[#4A3428] text-[#4A3428]`} />)
    }
    const emptyStars = 5 - Math.ceil(rating)
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className={`${sizes} text-gray-200`} />)
    }
    return <div className="flex gap-0.5">{stars}</div>
  }

  if (loading) {
    return <div className="py-8 text-center">Laddar recensioner...</div>
  }

  if (!reviews.length) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-500 mb-4">Inga recensioner än. Bli den första att recensera denna produkt!</p>
        <button className="px-6 py-2 bg-[#4A3428] text-white rounded-full hover:bg-[#6B5D54] transition-colors">
          Skriv en recension
        </button>
      </div>
    )
  }

  return (
    <div className="py-8">
      {/* Stats Summary */}
      {stats && (
        <div className="mb-8 pb-8 border-b border-gray-200">
          <div className="flex items-center gap-6 flex-wrap">
            <div className="flex items-center gap-3">
              <span className="text-4xl font-light text-[#4A3428]">{stats.averageRating.toFixed(1)}</span>
              {renderStars(stats.averageRating, 'md')}
              <span className="text-gray-600">({stats.totalReviews} recensioner)</span>
            </div>
            
            {/* Rating Distribution */}
            <div className="flex-1 min-w-[200px] max-w-md">
              {[5, 4, 3, 2, 1].map((rating) => (
                <div key={rating} className="flex items-center gap-2 mb-1">
                  <span className="text-sm w-2">{rating}</span>
                  <Star className="w-3 h-3 fill-[#4A3428] text-[#4A3428]" />
                  <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(stats.ratingDistribution[rating] / stats.totalReviews) * 100}%` }}
                      transition={{ duration: 0.5, delay: rating * 0.1 }}
                      className="h-full bg-[#4A3428]"
                    />
                  </div>
                  <span className="text-sm text-gray-500 w-8 text-right">
                    {stats.ratingDistribution[rating]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.slice(0, displayCount).map((review, index) => (
          <motion.div
            key={review.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="pb-6 border-b border-gray-100 last:border-0"
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                {renderStars(review.rating)}
                <h4 className="text-base font-medium text-[#4A3428] mt-2 mb-1">
                  {review.title}
                </h4>
              </div>
              <span className="text-sm text-gray-500">
                {new Date(review.createdAt).toLocaleDateString('sv-SE')}
              </span>
            </div>
            
            <p className="text-gray-600 mb-3">{review.body}</p>
            
            <div className="flex items-center gap-4 text-sm">
              <span className="text-gray-500">{review.author}</span>
              {review.status === 'APPROVED' && (
                <div className="flex items-center gap-1 text-green-600">
                  <Check className="w-3 h-3" />
                  <span>Verifierad köpare</span>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Load More */}
      {reviews.length > displayCount && (
        <div className="text-center mt-8">
          <button
            onClick={() => setDisplayCount(prev => prev + 3)}
            className="px-6 py-2 border border-[#4A3428] text-[#4A3428] rounded-full hover:bg-[#4A3428] hover:text-white transition-colors"
          >
            Visa fler recensioner
          </button>
        </div>
      )}
    </div>
  )
} 