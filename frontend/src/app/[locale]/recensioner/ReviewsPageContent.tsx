'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, StarHalf, Check, ChevronDown, ShoppingBag, Heart } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { Review } from '@/types'

function capitalize(str: string): string {
  if (!str) return ''
  // Endast första bokstaven stor i hela strängen
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
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
  const [sortBy, setSortBy] = useState<'createdAt' | 'rating'>('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [products, setProducts] = useState<{id: string, name: string}[]>([])

  useEffect(() => {
    fetchReviews()
    fetchStats()
    fetchProducts()
  }, [])

  useEffect(() => {
    setPage(1)
    setReviews([])
    fetchReviews(1)
  }, [selectedRating, selectedProduct, sortBy, sortOrder])

  const fetchReviews = async (currentPage = page) => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: ITEMS_PER_PAGE.toString(),
        ...(selectedRating && { rating: selectedRating.toString() }),
        ...(selectedProduct && { productId: selectedProduct }),
        sortBy,
        sortOrder,
        includePending: 'true'
      })

      const response = await fetch(`/api/reviews?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch reviews')
      }
      
      const data = await response.json()
      
      if (currentPage === 1) {
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
      const response = await fetch('/api/reviews/stats?includePending=true')
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
    setSortBy('createdAt')
    setSortOrder('desc')
  }

  const handleSortChange = (value: string) => {
    if (value === 'newest') {
      setSortBy('createdAt')
      setSortOrder('desc')
    } else if (value === 'oldest') {
      setSortBy('createdAt')
      setSortOrder('asc')
    } else if (value === 'highest') {
      setSortBy('rating')
      setSortOrder('desc')
    } else if (value === 'lowest') {
      setSortBy('rating')
      setSortOrder('asc')
    }
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
        <Star key={i} className={`${sizes[size]} fill-[#FCB237] text-[#FCB237]`} />
      )
    }

    if (hasHalfStar) {
      stars.push(
        <StarHalf key="half" className={`${sizes[size]} fill-[#FCB237] text-[#FCB237]`} />
      )
    }

    const emptyStars = 5 - Math.ceil(rating)
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Star key={`empty-${i}`} className={`${sizes[size]} text-gray-200`} />
      )
    }

    return <div className="flex gap-0.5">{stars}</div>
  }

  const getProductImage = (product: any) => {
    if (product?.images && Array.isArray(product.images) && product.images.length > 0) {
      const firstImage = product.images[0]
      if (typeof firstImage === 'string') {
        return firstImage
      } else if (firstImage && typeof firstImage === 'object' && firstImage.url) {
        return firstImage.url
      }
    }
    return '/images/products/placeholder.png'
  }

  if (loading && page === 1) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF8F5]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FCB237]"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-[#F5F0E8] to-[#FAF8F5] py-16">
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl font-light text-[#FCB237] mb-4">
              {t('title')}
            </h1>
            <p className="text-lg text-[#6B5D54] mb-8">
              {t('subtitle')}
            </p>
            
            {/* Stats Overview */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white/80 backdrop-blur rounded-2xl p-6 shadow-sm"
                >
                  <div className="text-3xl font-light text-[#FCB237] mb-2">
                    {stats.totalReviews}+
                  </div>
                  <div className="text-sm text-[#6B5D54]">{t('totalReviews')}</div>
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white/80 backdrop-blur rounded-2xl p-6 shadow-sm"
                >
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="text-3xl font-light text-[#FCB237]">
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
                  className="bg-white/80 backdrop-blur rounded-2xl p-6 shadow-sm"
                >
                  <div className="text-3xl font-light text-[#FCB237] mb-2">
                    {Math.round((stats.ratingDistribution[5] / stats.totalReviews) * 100)}%
                  </div>
                  <div className="text-sm text-[#6B5D54]">{t('fiveStarPercentage')}</div>
                </motion.div>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Filters Section - körs här också... */}
      <section className="container mx-auto px-4 py-6">
        <div className="bg-white/80 backdrop-blur rounded-2xl p-4 shadow-sm">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedRating(null)}
                className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                  selectedRating === null 
                    ? 'bg-[#FCB237] text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {t('allRatings')}
              </button>
              {[5, 4, 3, 2, 1].map((rating) => (
                <button
                  key={rating}
                  onClick={() => setSelectedRating(rating)}
                  className={`px-3 py-1.5 rounded-full text-sm transition-all flex items-center gap-1 ${
                    selectedRating === rating
                      ? 'bg-[#FCB237] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {rating} <Star className="w-3 h-3 fill-current" />
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <select
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#FCB237] focus:ring-opacity-20"
              >
                <option value="">{t('allProducts')}</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>

              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => handleSortChange(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#FCB237] focus:ring-opacity-20"
              >
                <option value="createdAt-desc">{t('sortNewest')}</option>
                <option value="createdAt-asc">{t('sortOldest')}</option>
                <option value="rating-desc">{t('sortHighest')}</option>
                <option value="rating-asc">{t('sortLowest')}</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Grid */}
      <section className="container mx-auto px-4 pb-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${selectedRating}-${selectedProduct}-${sortBy}-${sortOrder}`}
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
                className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group"
              >
                {/* Product Header with Image */}
                {review.product && (
                  <Link href={`/sv/products/${review.product.slug}`} className="block">
                    <div className="relative h-48 bg-gradient-to-br from-[#F5F0E8] to-[#FAF8F5] overflow-hidden">
                      <Image
                        src={getProductImage(review.product)}
                        alt={review.product.name}
                        fill
                        className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur rounded-full px-3 py-1 text-sm font-medium text-[#FCB237]">
                        {review.product.price} kr
                      </div>
                    </div>
                  </Link>
                )}

                <div className="p-5">
                  {/* Rating and Date */}
                  <div className="flex items-center justify-between mb-3">
                    {renderStars(review.rating)}
                    <span className="text-xs text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString('sv-SE')}
                    </span>
                  </div>

                  {/* Title - mindre och normal kapitalisering */}
                  {review.title && (
                    <h3 className="text-base font-medium text-[#FCB237] mb-2 line-clamp-1">
                      {capitalize(review.title)}
                    </h3>
                  )}

                  {/* Review Body */}
                  <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                    {review.body}
                  </p>

                  {/* Author */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <p className="text-sm text-gray-500">
                      {review.author}
                    </p>
                    {review.status === 'APPROVED' && (
                      <div className="flex items-center gap-1">
                        <Check className="w-3 h-3 text-green-600" />
                        <span className="text-xs text-green-600">Verifierad</span>
                      </div>
                    )}
                  </div>

                  {/* Product Link */}
                  {review.product && (
                    <Link 
                      href={`/sv/products/${review.product.slug}`}
                      className="mt-3 flex items-center justify-between w-full px-3 py-2 bg-[#F5F0E8] rounded-lg hover:bg-[#E5DDD5] transition-colors group/link"
                    >
                      <span className="text-sm font-medium text-[#FCB237]">
                        {review.product.name}
                      </span>
                      <ShoppingBag className="w-4 h-4 text-[#FCB237] group-hover/link:translate-x-1 transition-transform" />
                    </Link>
                  )}
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
              onClick={() => {
                setPage(prev => prev + 1)
                fetchReviews(page + 1)
              }}
              disabled={loading}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#FCB237] text-white rounded-full hover:bg-[#6B5D54] transition-colors disabled:opacity-50"
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
          </motion.div>
        )}
      </section>
    </div>
  )
} 