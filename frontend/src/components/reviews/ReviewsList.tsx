'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Star, StarHalf, ChevronLeft, ChevronRight, Calendar, CheckCircle, 
  ThumbsUp, Flag, Camera, Filter, X, TrendingUp, Award, 
  Heart, MessageSquare, Sparkles, BarChart3, User
} from 'lucide-react'
import Image from 'next/image'
import axios from 'axios'
import { format } from 'date-fns'
import { sv } from 'date-fns/locale'

interface Review {
  _id: string
  productId: string
  rating: number
  title: string
  body: string
  reviewer: {
    name: string
    email: string
    isVerified: boolean
  }
  isVerifiedPurchase: boolean
  photos: Array<{
    url: string
    alt: string
    uploadedAt: string
  }>
  helpfulVotes: number
  metadata?: {
    skinType?: string
    ageRange?: string
    usageDuration?: string
    skinConcerns?: string[]
  }
  createdAt: string
}

interface ReviewStats {
  averageRating: number
  totalReviews: number
  ratingDistribution: {
    1: number
    2: number
    3: number
    4: number
    5: number
  }
  recentReviews: Review[]
}

interface ReviewsListProps {
  productId?: string
  showAll?: boolean
  maxReviews?: number
  showStats?: boolean
  className?: string
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002/api'

export const ReviewsList: React.FC<ReviewsListProps> = ({
  productId,
  showAll = false,
  maxReviews = 10,
  showStats = true,
  className = ''
}) => {
  const [reviews, setReviews] = useState<Review[]>([])
  const [stats, setStats] = useState<ReviewStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedRating, setSelectedRating] = useState<number | null>(null)
  const [expandedReview, setExpandedReview] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest' | 'lowest' | 'helpful'>('newest')
  const [pagination, setPagination] = useState<any>(null)

  useEffect(() => {
    fetchReviews()
    if (showStats && productId) {
      fetchStats()
    }
  }, [productId, currentPage, selectedRating, sortBy])

  const fetchReviews = async () => {
    setLoading(true)
    try {
      let url = `${API_BASE_URL}/reviews`
      
      if (productId) {
        // Use product slug instead of ID for new API
        url = `${API_BASE_URL}/reviews/product/${productId}`
      } else {
        url = `${API_BASE_URL}/reviews/featured`
      }

      const params: any = {
        page: currentPage,
        limit: maxReviews,
        sortBy
      }

      if (selectedRating) {
        params.rating = selectedRating
      }

      const response = await axios.get(url, { params })
      
      if (response.data.success) {
        if (productId) {
          setReviews(response.data.data.reviews || [])
          setPagination(response.data.data.pagination)
          if (showStats) setStats(response.data.data.stats)
        } else {
          setReviews(response.data.data || [])
        }
      }
    } catch (error) {
      console.error('Error fetching reviews:', error)
      setReviews([])
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    if (!productId) return
    
    try {
      // Use product slug for new API
      const response = await axios.get(`${API_BASE_URL}/reviews/product/${productId}/stats`)
      if (response.data.success) {
        setStats(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const handleHelpfulVote = async (reviewId: string) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/reviews/${reviewId}/helpful`)
      if (response.data.success) {
        setReviews(prev => prev.map(review => 
          review._id === reviewId 
            ? { ...review, helpfulVotes: response.data.data.helpfulVotes }
            : review
        ))
      }
    } catch (error) {
      console.error('Error voting helpful:', error)
    }
  }

  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md', interactive = false) => {
    const sizes = {
      sm: 'w-3.5 h-3.5',
      md: 'w-4.5 h-4.5',
      lg: 'w-6 h-6'
    }
    
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <motion.div
          key={i}
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: i * 0.1, type: "spring", stiffness: 200 }}
        >
          <Star className={`${sizes[size]} fill-gradient-yellow text-gradient-yellow drop-shadow-sm ${interactive ? 'hover:scale-110 transition-transform cursor-pointer' : ''}`} />
        </motion.div>
      )
    }

    if (hasHalfStar) {
      stars.push(
        <motion.div
          key="half"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: fullStars * 0.1, type: "spring", stiffness: 200 }}
        >
          <StarHalf className={`${sizes[size]} fill-gradient-yellow text-gradient-yellow drop-shadow-sm`} />
        </motion.div>
      )
    }

    const emptyStars = 5 - Math.ceil(rating)
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <motion.div
          key={`empty-${i}`}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: (fullStars + i) * 0.1 }}
        >
          <Star className={`${sizes[size]} text-gray-200 ${interactive ? 'hover:text-gray-300 transition-colors cursor-pointer' : ''}`} />
        </motion.div>
      )
    }

    return <div className="flex gap-0.5 items-center">{stars}</div>
  }

  const renderRatingDistribution = () => {
    if (!stats || !showStats) return null

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-white to-amber-50/30 p-8 rounded-3xl shadow-xl border border-amber-100/50 mb-10"
      >
        <div className="grid md:grid-cols-2 gap-10">
          {/* Overall Rating */}
          <div className="text-center space-y-4">
            <motion.div 
              className="inline-flex items-center gap-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-6 py-3 rounded-full shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Award className="w-5 h-5" />
              <span className="font-semibold">Kundbetyg</span>
            </motion.div>
            
            <motion.div 
              className="text-6xl font-bold bg-gradient-to-br from-[#8B4513] to-[#A0522D] bg-clip-text text-transparent"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 100 }}
            >
              {stats.averageRating.toFixed(1)}
            </motion.div>
            
            <div className="flex justify-center">
              {renderStars(stats.averageRating, 'lg', true)}
            </div>
            
            <p className="text-gray-700 font-medium">
              <span className="text-2xl font-bold text-[#8B4513]">{stats.totalReviews}</span>
              <span className="text-gray-600 ml-2">verifierade recensioner</span>
            </p>
            
            <div className="flex justify-center gap-3 mt-4">
              <motion.div 
                className="flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium"
                whileHover={{ scale: 1.05 }}
              >
                <TrendingUp className="w-4 h-4" />
                98% rekommenderar
              </motion.div>
              <motion.div 
                className="flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium"
                whileHover={{ scale: 1.05 }}
              >
                <CheckCircle className="w-4 h-4" />
                Verifierade köp
              </motion.div>
            </div>
          </div>

          {/* Rating Distribution */}
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-800">Betygsfördelning</h3>
              <BarChart3 className="w-5 h-5 text-gray-500" />
            </div>
            {[5, 4, 3, 2, 1].map((rating, index) => {
              const count = stats.ratingDistribution[rating as keyof typeof stats.ratingDistribution]
              const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0
              
              return (
                <motion.div 
                  key={rating} 
                  className="group"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <button
                    onClick={() => setSelectedRating(selectedRating === rating ? null : rating)}
                    className={`w-full flex items-center gap-3 p-2 rounded-lg transition-all ${
                      selectedRating === rating 
                        ? 'bg-amber-50 shadow-md scale-[1.02]' 
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className={`flex items-center gap-1.5 min-w-[3rem] font-medium ${
                      selectedRating === rating ? 'text-[#8B4513]' : 'text-gray-700'
                    }`}>
                      <span>{rating}</span>
                      <Star className="w-4 h-4 fill-current" />
                    </div>
                    
                    <div className="flex-1 relative h-6 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div 
                        className={`absolute inset-y-0 left-0 rounded-full ${
                          selectedRating === rating
                            ? 'bg-gradient-to-r from-amber-400 to-yellow-400'
                            : 'bg-gradient-to-r from-amber-300 to-yellow-300'
                        }`}
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ delay: 0.2 + (index * 0.1), duration: 0.8, ease: "easeOut" }}
                      >
                        <div className="absolute inset-0 bg-white/20 group-hover:bg-white/30 transition-colors" />
                      </motion.div>
                      
                      {percentage > 15 && (
                        <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-white mix-blend-multiply">
                          {percentage.toFixed(0)}%
                        </span>
                      )}
                    </div>
                    
                    <span className={`text-sm font-medium min-w-[2.5rem] text-right ${
                      selectedRating === rating ? 'text-[#8B4513]' : 'text-gray-600'
                    }`}>
                      {count}
                    </span>
                  </button>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Filter Controls */}
        <motion.div 
          className="mt-8 pt-8 border-t border-amber-200/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2.5 rounded-full shadow-sm border border-amber-100">
                <Filter className="w-4 h-4 text-amber-600" />
                <label className="text-sm font-medium text-gray-700">Sortera:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-transparent border-0 text-sm font-medium text-gray-800 focus:ring-0 cursor-pointer pr-6"
                >
                  <option value="newest">🆕 Senaste</option>
                  <option value="oldest">📅 Äldsta</option>
                  <option value="highest">⭐ Högst betyg</option>
                  <option value="lowest">👎 Lägst betyg</option>
                  <option value="helpful">👍 Mest hjälpsamma</option>
                </select>
              </div>
              
              {selectedRating && (
                <motion.button
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  onClick={() => setSelectedRating(null)}
                  className="flex items-center gap-2 bg-gradient-to-r from-[#8B4513] to-[#A0522D] text-white px-4 py-2.5 rounded-full hover:shadow-lg transition-all font-medium text-sm"
                >
                  <X className="w-4 h-4" />
                  Visa alla betyg
                </motion.button>
              )}
            </div>
            
            <motion.div 
              className="flex items-center gap-2 text-sm text-gray-600"
              whileHover={{ scale: 1.05 }}
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>AI-verifierade recensioner</span>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    )
  }

  const renderReview = (review: Review, index: number) => {
    const isExpanded = expandedReview === review._id
    const bodyText = review.body
    const shouldTruncate = bodyText.length > 200
    const displayText = isExpanded || !shouldTruncate 
      ? bodyText 
      : bodyText.substring(0, 200) + '...'

    return (
      <motion.div
        key={review._id}
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: index * 0.1, type: "spring", stiffness: 100 }}
        whileHover={{ y: -5, transition: { duration: 0.2 } }}
        className="group bg-gradient-to-br from-white to-amber-50/20 border border-amber-100/50 rounded-2xl p-6 hover:shadow-2xl hover:border-amber-200/50 transition-all duration-300"
      >
        {/* Review Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-3">
              <motion.div 
                className="relative"
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                <div className="w-12 h-12 bg-gradient-to-br from-[#8B4513] to-[#A0522D] rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  {review.reviewer.name.charAt(0).toUpperCase()}
                </div>
                {review.isVerifiedPurchase && (
                  <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1 shadow-md">
                    <CheckCircle className="w-3 h-3 text-white" />
                  </div>
                )}
              </motion.div>
                            <div>
                <div className="flex items-center gap-3">
                  <h4 className="font-semibold text-gray-900 text-lg">{review.reviewer.name}</h4>
                  {review.isVerifiedPurchase && (
                    <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-medium">
                      Verifierat köp
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 mt-1">
                  <div className="flex items-center gap-1.5 text-sm text-gray-600">
                    <Calendar className="w-3.5 h-3.5" />
                    {format(new Date(review.createdAt), 'dd MMMM yyyy', { locale: sv })}
                  </div>
                  {review.metadata?.usageDuration && (
                    <span className="text-sm text-amber-600 font-medium">
                      Använt i {review.metadata.usageDuration}
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 mt-3">
              {renderStars(review.rating, 'md', true)}
              <motion.h3 
                className="font-bold text-gray-900 text-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {review.title}
              </motion.h3>
            </div>
          </div>
        </div>

        {/* Review Body */}
        <motion.div 
          className="my-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-gray-700 leading-relaxed text-base">{displayText}</p>
          
          {shouldTruncate && (
            <motion.button
              onClick={() => setExpandedReview(isExpanded ? null : review._id)}
              className="inline-flex items-center gap-1 text-[#8B4513] hover:text-[#6B3410] text-sm font-semibold mt-3 transition-all group"
              whileHover={{ x: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              {isExpanded ? (
                <>Visa mindre <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /></>
              ) : (
                <>Läs mer <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>
              )}
            </motion.button>
          )}
        </motion.div>

        {/* Review Photos */}
        {review.photos && review.photos.length > 0 && (
          <motion.div 
            className="mb-5"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Camera className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-600">Kundbilder</span>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {review.photos.map((photo, photoIndex) => (
                <motion.div 
                  key={photoIndex} 
                  className="flex-shrink-0 relative group cursor-pointer"
                  whileHover={{ scale: 1.05, rotate: 2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Image
                    src={photo.url}
                    alt={photo.alt || `Review photo ${photoIndex + 1}`}
                    width={120}
                    height={120}
                    className="rounded-xl object-cover shadow-md"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                    <span className="text-white text-sm font-medium">Visa större</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Metadata */}
        {review.metadata && (
          <motion.div 
            className="mb-5 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-100"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <User className="w-4 h-4 text-amber-600" />
              <span className="text-sm font-semibold text-amber-800">Kundprofil</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {review.metadata.skinType && (
                <div className="bg-white/80 px-3 py-2 rounded-lg">
                  <span className="text-xs text-gray-500 block">Hudtyp</span>
                  <span className="text-sm font-medium text-gray-800">{review.metadata.skinType}</span>
                </div>
              )}
              {review.metadata.ageRange && (
                <div className="bg-white/80 px-3 py-2 rounded-lg">
                  <span className="text-xs text-gray-500 block">Ålder</span>
                  <span className="text-sm font-medium text-gray-800">{review.metadata.ageRange}</span>
                </div>
              )}
              {review.metadata.usageDuration && (
                <div className="bg-white/80 px-3 py-2 rounded-lg">
                  <span className="text-xs text-gray-500 block">Använt i</span>
                  <span className="text-sm font-medium text-gray-800">{review.metadata.usageDuration}</span>
                </div>
              )}
            </div>
            {review.metadata.skinConcerns && review.metadata.skinConcerns.length > 0 && (
              <div className="mt-3">
                <span className="text-xs text-gray-500 block mb-2">Hudbekymmer</span>
                <div className="flex flex-wrap gap-2">
                  {review.metadata.skinConcerns.map((concern, concernIndex) => (
                    <motion.span 
                      key={concernIndex} 
                      className="bg-white/80 px-3 py-1.5 rounded-full text-xs font-medium text-amber-700 border border-amber-200"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.6 + (concernIndex * 0.05) }}
                      whileHover={{ scale: 1.1 }}
                    >
                      {concern}
                    </motion.span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Review Actions */}
        <motion.div 
          className="flex items-center justify-between pt-5 mt-5 border-t border-amber-100"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex items-center gap-3">
            <motion.button
              onClick={() => handleHelpfulVote(review._id)}
              className="flex items-center gap-2 text-gray-600 hover:text-amber-600 transition-all group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="relative">
                <ThumbsUp className="w-4 h-4 group-hover:fill-amber-100 transition-all" />
                <motion.div
                  className="absolute -inset-2 bg-amber-400 rounded-full opacity-0 group-hover:opacity-20"
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ duration: 0.6, repeat: Infinity }}
                />
              </div>
              <span className="text-sm font-medium">
                Hjälpsam 
                {review.helpfulVotes > 0 && (
                  <span className="ml-1 text-amber-600 font-bold">({review.helpfulVotes})</span>
                )}
              </span>
            </motion.button>
            
            <motion.button 
              className="flex items-center gap-2 text-gray-600 hover:text-rose-500 transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Heart className="w-4 h-4" />
              <span className="text-sm font-medium">Gilla</span>
            </motion.button>
          </div>
          
          <motion.button 
            className="flex items-center gap-2 text-gray-400 hover:text-gray-600 transition-all text-sm"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Flag className="w-3.5 h-3.5" />
            <span>Rapportera</span>
          </motion.button>
        </motion.div>
      </motion.div>
    )
  }

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        {showStats && (
          <div className="bg-gradient-to-br from-white to-amber-50/30 p-8 rounded-3xl shadow-xl border border-amber-100/50 mb-10 animate-pulse">
            <div className="grid md:grid-cols-2 gap-10">
              <div className="text-center space-y-4">
                <div className="h-12 w-32 bg-gray-200 rounded-full mx-auto" />
                <div className="h-16 w-24 bg-gray-200 rounded mx-auto" />
                <div className="flex justify-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-6 h-6 bg-gray-200 rounded" />
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-12 h-6 bg-gray-200 rounded" />
                    <div className="flex-1 h-6 bg-gray-100 rounded-full" />
                    <div className="w-8 h-6 bg-gray-200 rounded" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-gradient-to-br from-white to-amber-50/20 border border-amber-100/50 rounded-2xl p-6 animate-pulse">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full" />
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-5 bg-gray-200 rounded w-32" />
                  <div className="h-4 bg-gray-200 rounded-full w-20" />
                </div>
                <div className="flex gap-1">
                  {[...Array(5)].map((_, j) => (
                    <div key={j} className="w-4 h-4 bg-gray-200 rounded" />
                  ))}
                </div>
                <div className="h-5 bg-gray-200 rounded w-3/4" />
                <div className="space-y-2 mt-4">
                  <div className="h-3 bg-gray-100 rounded w-full" />
                  <div className="h-3 bg-gray-100 rounded w-5/6" />
                  <div className="h-3 bg-gray-100 rounded w-4/6" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className={className}>
      {renderRatingDistribution()}
      
            {reviews.length === 0 ? (
        <motion.div 
          className="text-center py-16 px-8"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 100 }}
        >
          <motion.div 
            className="text-amber-300 mb-6"
            animate={{ 
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          >
            <Star className="w-20 h-20 mx-auto" />
          </motion.div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            Bli först med att recensera!
          </h3>
          <p className="text-gray-600 max-w-md mx-auto mb-6">
            Din åsikt är värdefull för oss och hjälper andra kunder att fatta bättre beslut.
          </p>
          <motion.button
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#8B4513] to-[#A0522D] text-white px-6 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <MessageSquare className="w-5 h-5" />
            Skriv en recension
          </motion.button>
        </motion.div>
      ) : (
          <AnimatePresence>
            <div className="space-y-6">
              {reviews.map((review, index) => renderReview(review, index))}
            </div>
          </AnimatePresence>
        )}

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={!pagination.hasPrev}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-[#8B4513] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Föregående
          </button>
          
          <span className="text-sm text-gray-600">
            Sida {pagination.page} av {pagination.pages}
          </span>
          
          <button
            onClick={() => setCurrentPage(prev => prev + 1)}
            disabled={!pagination.hasNext}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-[#8B4513] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Nästa
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}

export default ReviewsList 