'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, StarHalf, ChevronLeft, ChevronRight, Calendar, CheckCircle, Image as ImageIcon } from 'lucide-react'
import { judgeMeAPI, JudgeMeReview, JudgeMeStats, formatDate, formatRating } from '@/lib/judge-me-api'
import Image from 'next/image'

interface ReviewsListProps {
  productId?: string
  showAll?: boolean
  maxReviews?: number
  showStats?: boolean
}

export const ReviewsList: React.FC<ReviewsListProps> = ({
  productId,
  showAll = false,
  maxReviews = 10,
  showStats = true
}) => {
  const [reviews, setReviews] = useState<JudgeMeReview[]>([])
  const [stats, setStats] = useState<JudgeMeStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedRating, setSelectedRating] = useState<number | null>(null)
  const [expandedReview, setExpandedReview] = useState<number | null>(null)

  useEffect(() => {
    fetchReviews()
    if (showStats) {
      fetchStats()
    }
  }, [productId, currentPage, selectedRating])

  const fetchReviews = async () => {
    setLoading(true)
    try {
      let fetchedReviews: JudgeMeReview[] = []
      
      if (productId) {
        fetchedReviews = await judgeMeAPI.getProductReviews(productId, currentPage, maxReviews)
      } else {
        fetchedReviews = await judgeMeAPI.getShopReviews(currentPage, maxReviews)
      }

      // Filter by rating if selected
      if (selectedRating) {
        fetchedReviews = fetchedReviews.filter(review => review.rating === selectedRating)
      }

      setReviews(fetchedReviews)
    } catch (error) {
      console.error('Error fetching reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      let fetchedStats: JudgeMeStats | null = null
      
      if (productId) {
        fetchedStats = await judgeMeAPI.getProductStats(productId)
      } else {
        fetchedStats = await judgeMeAPI.getShopStats()
      }

      setStats(fetchedStats)
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClasses = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6'
    }

    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClasses[size]} ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    )
  }

  const renderRatingDistribution = () => {
    if (!stats || !showStats) return null

    const total = stats.total_reviews
    if (total === 0) return null

    return (
      <div className="bg-gray-50 rounded-lg p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">
              {stats.average_rating.toFixed(1)}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              {renderStars(stats.average_rating)}
              <span className="text-sm text-gray-600">
                ({total} {total === 1 ? 'recension' : 'recensioner'})
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((rating) => {
            const count = stats.rating_distribution[rating as keyof typeof stats.rating_distribution] || 0
            const percentage = total > 0 ? (count / total) * 100 : 0

            return (
              <button
                key={rating}
                onClick={() => setSelectedRating(selectedRating === rating ? null : rating)}
                className={`w-full flex items-center gap-3 p-2 rounded hover:bg-gray-100 transition-colors ${
                  selectedRating === rating ? 'bg-green-50 border border-green-200' : ''
                }`}
              >
                <span className="text-sm font-medium w-8">{rating}</span>
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600 w-8">{count}</span>
              </button>
            )
          })}
        </div>

        {selectedRating && (
          <button
            onClick={() => setSelectedRating(null)}
            className="mt-4 text-sm text-green-600 hover:text-green-700 font-medium"
          >
            Visa alla recensioner
          </button>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 h-6 w-32 rounded mb-2"></div>
            <div className="bg-gray-200 h-4 w-full rounded mb-2"></div>
            <div className="bg-gray-200 h-4 w-3/4 rounded"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {renderRatingDistribution()}

      {reviews.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Star className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Inga recensioner än
          </h3>
          <p className="text-gray-600">
            Bli den första att recensera {productId ? 'denna produkt' : 'våra produkter'}!
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <AnimatePresence mode="wait">
            {reviews.map((review, index) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 font-semibold">
                        {review.reviewer.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {review.reviewer.name}
                      </h4>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="w-4 h-4" />
                        {formatDate(review.created_at)}
                        {review.verified && (
                          <div className="flex items-center gap-1 text-green-600">
                            <CheckCircle className="w-4 h-4" />
                            <span>Verifierat köp</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  {renderStars(review.rating)}
                </div>

                {review.title && (
                  <h5 className="font-semibold text-gray-900 mb-2">
                    {review.title}
                  </h5>
                )}

                <div className="text-gray-700 mb-4">
                  {expandedReview === review.id || review.body.length <= 200 ? (
                    <p className="whitespace-pre-wrap">{review.body}</p>
                  ) : (
                    <div>
                      <p className="whitespace-pre-wrap">
                        {review.body.substring(0, 200)}...
                      </p>
                      <button
                        onClick={() => setExpandedReview(review.id)}
                        className="text-green-600 hover:text-green-700 font-medium mt-2"
                      >
                        Läs mer
                      </button>
                    </div>
                  )}
                  
                  {expandedReview === review.id && review.body.length > 200 && (
                    <button
                      onClick={() => setExpandedReview(null)}
                      className="text-green-600 hover:text-green-700 font-medium mt-2"
                    >
                      Visa mindre
                    </button>
                  )}
                </div>

                {review.pictures && review.pictures.length > 0 && (
                  <div className="flex gap-2 mb-4">
                    {review.pictures.map((picture, picIndex) => (
                      <div
                        key={picIndex}
                        className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:opacity-75 transition-opacity"
                      >
                        <Image
                          src={picture.urls.compact}
                          alt={`Review image ${picIndex + 1}`}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {review.product_title && !productId && (
                  <div className="text-sm text-gray-500 border-t pt-3">
                    Recension för: <span className="font-medium">{review.product_title}</span>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {showAll && reviews.length >= maxReviews && (
            <div className="flex justify-center gap-4 mt-8">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
                Föregående
              </button>
              <span className="flex items-center px-4 py-2 text-sm text-gray-600">
                Sida {currentPage}
              </span>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={reviews.length < maxReviews}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Nästa
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
} 