'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, StarHalf, Check, ChevronDown } from 'lucide-react'
import Image from 'next/image'

interface Review {
  id: string
  productId: string
  rating: number
  title: string
  body: string
  reviewerName: string
  isVerified: boolean
  createdAt: string
  product?: {
    name: string
    slug: string
    images: string[]
  }
}

interface ReviewStats {
  totalReviews: number
  averageRating: number
  ratingDistribution: {
    1: number
    2: number
    3: number
    4: number
    5: number
  }
}

const ITEMS_PER_PAGE = 12 

export default function ReviewsPageContent() {
  const t = useTranslations('Reviews')
  const [reviews, setReviews] = useState<Review[]>([])
  const [stats, setStats] = useState<ReviewStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedRating, setSelectedRating] = useState<number | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<string>('')
  const [sortBy, setSortBy] = useState<'newest' | 'highest' | 'lowest'>('newest')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [products, setProducts] = useState<{id: string, name: string}[]>([])

  // Fetch reviews and stats
  useEffect(() => {
    fetchReviews()
    fetchStats()
    fetchProducts()
  }, [selectedRating, selectedProduct, sortBy, page])

  useEffect(() => {
    setPage(1)
    setReviews([])
  }, [selectedRating, selectedProduct, sortBy])

  const fetchReviews = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: ITEMS_PER_PAGE.toString(),
        ...(selectedRating && { rating: selectedRating.toString() }),
        ...(selectedProduct && { productId: selectedProduct }),
        sort: sortBy
      })

      const response = await fetch(`/api/reviews?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch reviews')
      }
      
      const data = await response.json()
      
      if (page === 1) {
        setReviews(data.reviews || [])
      } else {
        setReviews(prev => [...(prev || []), ...(data.reviews || [])])
      }
      
      setHasMore(data.hasMore || false)
    } catch (error) {
      console.error('Error fetching reviews:', error)
      setReviews([])
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/reviews/stats')
      if (!response.ok) {
        throw new Error('Failed to fetch stats')
      }
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Error fetching stats:', error)
      setStats(null)
    }
  }

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products')
      if (!response.ok) {
        throw new Error('Failed to fetch products')
      }
      const data = await response.json()
      setProducts(data.products?.map((p: any) => ({ id: p.id, name: p.name })) || [])
    } catch (error) {
      console.error('Error fetching products:', error)
      setProducts([])
    }
  }

  const resetFilters = () => {
    setSelectedRating(null)
    setSelectedProduct('')
    setSortBy('newest')
    setPage(1)
  }

  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizes = {
      sm: 'w-3 h-3',
      md: 'w-4 h-4',
      lg: 'w-5 h-5'
    }
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={i} className={`${sizes[size]} fill-amber-400 text-amber-400`} />
      )
    }

    if (hasHalfStar) {
      stars.push(
        <StarHalf key="half" className={`${sizes[size]} fill-amber-400 text-amber-400`} />
      )
    }

    const emptyStars = 5 - Math.ceil(rating)
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Star key={`empty-${i}`} className={`${sizes[size]} text-gray-300`} />
      )
    }

    return <div className="flex gap-0.5">{stars}</div>
  }

  if (loading && page === 1) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4A3428]"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-[#F5F0E8] to-[#FAF8F5] py-20">
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl font-light text-[#4A3428] mb-4">
              {t('title')}
            </h1>
            <p className="text-lg text-[#6B5D54] mb-8">
              {t('subtitle')}
            </p>
            
            {/* Stats Overview */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white rounded-2xl p-6 shadow-sm"
                >
                  <div className="text-3xl font-light text-[#4A3428] mb-2">
                    {stats.totalReviews}+
                  </div>
                  <div className="text-sm text-[#6B5D54]">{t('totalReviews')}</div>
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white rounded-2xl p-6 shadow-sm"
                >
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="text-3xl font-light text-[#4A3428]">
                      {stats.averageRating.toFixed(1)}
                    </span>
                    {renderStars(stats.averageRating, 'lg')}
                  </div>
                  <div className="text-sm text-[#6B5D54]">{t('averageRating')}</div>
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white rounded-2xl p-6 shadow-sm"
                >
                  <div className="text-3xl font-light text-[#4A3428] mb-2">
                    {Math.round((stats.ratingDistribution[5] / stats.totalReviews) * 100)}%
                  </div>
                  <div className="text-sm text-[#6B5D54]">{t('fiveStarPercentage')}</div>
                </motion.div>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            {/* Rating Filter */}
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedRating(null)}
                className={`px-4 py-2 rounded-full text-sm transition-all ${
                  selectedRating === null 
                    ? 'bg-[#4A3428] text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {t('allRatings')}
              </button>
              {[5, 4, 3, 2, 1].map((rating) => (
                <button
                  key={rating}
                  onClick={() => setSelectedRating(rating)}
                  className={`px-4 py-2 rounded-full text-sm transition-all flex items-center gap-1 ${
                    selectedRating === rating
                      ? 'bg-[#4A3428] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {rating} <Star className="w-3 h-3 fill-current" />
                </button>
              ))}
            </div>

            {/* Product Filter */}
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#4A3428] focus:ring-opacity-20"
            >
              <option value="">{t('allProducts')}</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>

            {/* Sort Options */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#4A3428] focus:ring-opacity-20"
            >
              <option value="newest">{t('sortNewest')}</option>
              <option value="highest">{t('sortHighest')}</option>
              <option value="lowest">{t('sortLowest')}</option>
            </select>

            {/* Reset Button */}
            {(selectedRating || selectedProduct || sortBy !== 'newest') && (
              <button
                onClick={resetFilters}
                className="px-4 py-2 text-sm text-[#4A3428] hover:text-[#6B5D54] transition-colors"
              >
                {t('resetFilters')}
              </button>
            )}
          </div>

          {/* Rating Distribution */}
          {stats && (
            <div className="mt-6 pt-6 border-t border-gray-100">
              <div className="max-w-md">
                {[5, 4, 3, 2, 1].map((rating) => (
                  <div key={rating} className="flex items-center gap-3 mb-2">
                    <button
                      onClick={() => setSelectedRating(rating)}
                      className="flex items-center gap-1 text-sm text-gray-600 hover:text-[#4A3428] transition-colors"
                    >
                      {rating} <Star className="w-3 h-3 fill-current" />
                    </button>
                    <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(stats.ratingDistribution[rating as keyof typeof stats.ratingDistribution] / stats.totalReviews) * 100}%` }}
                        transition={{ duration: 0.5, delay: rating * 0.1 }}
                        className="h-full bg-amber-400"
                      />
                    </div>
                    <span className="text-sm text-gray-500 w-12 text-right">
                      {stats.ratingDistribution[rating as keyof typeof stats.ratingDistribution]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Reviews Grid */}
      <section className="container mx-auto px-4 pb-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${selectedRating}-${selectedProduct}-${sortBy}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {Array.isArray(reviews) && reviews.map((review, index) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Rating and Date */}
                <div className="flex items-center justify-between mb-4">
                  {renderStars(review.rating)}
                  <span className="text-sm text-gray-500">
                    {new Date(review.createdAt).toLocaleDateString('sv-SE')}
                  </span>
                </div>

                {/* Title */}
                {review.title && (
                  <h3 className="font-medium text-[#4A3428] mb-2">
                    {review.title}
                  </h3>
                )}

                {/* Review Body */}
                <p className="text-gray-700 text-sm mb-4 line-clamp-4">
                  {review.body}
                </p>

                {/* Product Info */}
                {review.product && (
                  <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
                    {review.product.images?.[0] && (
                      <Image
                        src={review.product.images[0]}
                        alt={review.product.name}
                        width={50}
                        height={50}
                        className="rounded-lg object-cover"
                      />
                    )}
                    <div>
                      <p className="text-sm font-medium text-[#4A3428]">
                        {review.product.name}
                      </p>
                    </div>
                  </div>
                )}

                {/* Reviewer Info */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {review.reviewerName}
                    </p>
                    {review.isVerified && (
                      <div className="flex items-center gap-1 mt-1">
                        <Check className="w-3 h-3 text-green-600" />
                        <span className="text-xs text-green-600">
                          {t('verifiedPurchase')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Load More Button */}
        {hasMore && Array.isArray(reviews) && reviews.length > 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center mt-12"
          >
            <button
              onClick={() => setPage(prev => prev + 1)}
              disabled={loading}
              className="inline-flex items-center gap-2 px-8 py-3 bg-[#4A3428] text-white rounded-full hover:bg-[#6B5D54] transition-colors disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  {t('loading')}
                </>
              ) : (
                <>
                  {t('loadMore')}
                  <ChevronDown className="w-4 h-4" />
                </>
              )}
            </button>
          </motion.div>
        )}

        {/* No Reviews Message */}
        {(!Array.isArray(reviews) || reviews.length === 0) && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <p className="text-gray-500">{t('noReviews')}</p>
            {!Array.isArray(reviews) && (
              <p className="text-red-500 text-sm mt-2">Kunde inte ladda recensioner. Kontrollera API-anslutningen.</p>
            )}
          </motion.div>
        )}
      </section>
    </div>
  )
} 