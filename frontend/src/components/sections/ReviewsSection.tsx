'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, Quote, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'

interface Review {
  id: string
  reviewer: string
  rating: number
  comment: string
  product: string
  createdAt: string
  verified: boolean
}

export function ReviewsSection() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [overallStats, setOverallStats] = useState({
    totalReviews: 823,
    averageRating: 4.62
  })
  const [loading, setLoading] = useState(true)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const t = useTranslations('Reviews')
  const tReviews = useTranslations()

  useEffect(() => {
    fetchReviews()
    fetchStats()
    
    // Set loading to false after both calls complete
    setTimeout(() => setLoading(false), 1000)
  }, [])

  // Auto-rotate carousel
  useEffect(() => {
    if (reviews.length > 0) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % reviews.length)
      }, 5000) // Change slide every 5 seconds

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
        }
      }
    }
  }, [reviews.length])

  const fetchReviews = async () => {
    try {
      // Fetch more reviews for carousel
      const response = await fetch('/api/reviews?page=1&limit=10')
      if (response.ok) {
        const data = await response.json()
        if (data.reviews && data.reviews.length > 0) {
          setReviews(data.reviews)
        } else {
          // Use fallback reviews
          setReviews(getDefaultReviews())
        }
      }
    } catch (error) {
      console.error('Error fetching reviews:', error)
      setReviews(getDefaultReviews())
    }
  }

  const getDefaultReviews = () => [
    {
      id: '1',
      reviewer: tReviews('reviews.homeDefaults.1.author'),
      rating: 5,
      comment: tReviews('reviews.homeDefaults.1.content'),
      product: tReviews('reviews.homeDefaults.1.product'),
      createdAt: new Date().toISOString(),
      verified: true
    },
    {
      id: '2',
      reviewer: tReviews('reviews.homeDefaults.2.author'),
      rating: 5,
      comment: tReviews('reviews.homeDefaults.2.content'),
      product: tReviews('reviews.homeDefaults.2.product'),
      createdAt: new Date().toISOString(),
      verified: true
    },
    {
      id: '3',
      reviewer: tReviews('reviews.homeDefaults.3.author'),
      rating: 5,
      comment: tReviews('reviews.homeDefaults.3.content'),
      product: 'TA-DA Serum',
      createdAt: new Date().toISOString(),
      verified: true
    },
    {
      id: '4',
      reviewer: tReviews('reviews.homeDefaults.4.author'),
      rating: 4,
      comment: tReviews('reviews.homeDefaults.4.content'),
      product: tReviews('reviews.homeDefaults.4.product'),
      createdAt: new Date().toISOString(),
      verified: true
    },
    {
      id: '5',
      reviewer: tReviews('reviews.homeDefaults.5.author'),
      rating: 5,
      comment: tReviews('reviews.homeDefaults.5.content'),
      product: tReviews('reviews.homeDefaults.5.product'),
      createdAt: new Date().toISOString(),
      verified: true
    }
  ]

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/reviews/stats')
      if (response.ok) {
        const data = await response.json()
        if (data.totalReviews > 0) {
          setOverallStats({
            totalReviews: data.totalReviews,
            averageRating: data.averageRating || 4.62
          })
        }
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + reviews.length) % reviews.length)
    // Reset interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % reviews.length)
      }, 5000)
    }
  }

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % reviews.length)
    // Reset interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % reviews.length)
      }, 5000)
    }
  }

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
    // Reset interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % reviews.length)
      }, 5000)
    }
  }

  // Calculate visible reviews (3 on desktop, 1 on mobile)
  const getVisibleReviews = () => {
    const visibleCount = 3 // Will be handled by CSS for mobile
    const result = []
    for (let i = 0; i < visibleCount; i++) {
      const index = (currentIndex + i) % reviews.length
      result.push(reviews[index])
    }
    return result
  }

  if (loading || reviews.length === 0) {
    return (
      <section className="py-20 px-4 md:px-8 bg-[var(--color-background-alt)]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-[var(--color-primary-dark)] mb-4">
              VAD VÅRA KUNDER SÄGER
            </h2>
            <p className="text-lg text-[var(--color-gray-600)]">
              Äkta berättelser från människor som upptäckt kraften i naturlig hudvård
            </p>
          </div>
          <div className="flex justify-center items-center min-h-[300px]">
            <div className="animate-pulse text-gray-400">Laddar recensioner...</div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-20 px-4 md:px-8 bg-[var(--color-background-alt)] overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-[var(--color-primary-dark)] mb-4">
            VAD VÅRA KUNDER SÄGER
          </h2>
          <p className="text-lg text-[var(--color-gray-600)]">
            Äkta berättelser från människor som upptäckt kraften i naturlig hudvård
          </p>
        </motion.div>

        {/* Carousel Container */}
        <div className="relative">
          {/* Navigation Buttons */}
          <button
            onClick={goToPrevious}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-3 hover:shadow-xl transition-shadow hidden md:block"
            aria-label="Föregående recension"
          >
            <ChevronLeft className="w-6 h-6 text-[var(--color-primary-dark)]" />
          </button>
          
          <button
            onClick={goToNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-3 hover:shadow-xl transition-shadow hidden md:block"
            aria-label="Nästa recension"
          >
            <ChevronRight className="w-6 h-6 text-[var(--color-primary-dark)]" />
          </button>

          {/* Reviews Carousel */}
          <div className="overflow-hidden mx-auto max-w-6xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.5 }}
                className="grid md:grid-cols-3 gap-8"
              >
                {getVisibleReviews().map((review, index) => (
                  <div
                    key={`${review.id}-${currentIndex}-${index}`}
                    className={`bg-white rounded-2xl shadow-lg overflow-hidden ${
                      index > 0 ? 'hidden md:block' : ''
                    }`}
                  >
                    {/* Quote Icon */}
                    <div className="relative p-8">
                      <Quote className="absolute top-6 right-6 w-8 h-8 text-[var(--color-accent-light)]/30" />
                      
                      {/* Rating */}
                      <div className="flex gap-1 mb-4">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-5 h-5 ${
                              i < review.rating 
                                ? 'fill-[var(--color-accent)] text-[var(--color-accent)]' 
                                : 'fill-gray-200 text-gray-200'
                            }`}
                          />
                        ))}
                      </div>

                      {/* Comment */}
                      <p className="text-[var(--color-gray-700)] leading-relaxed mb-4 italic min-h-[4rem]">
                        "{review.comment}"
                      </p>

                      {/* Product */}
                      <p className="text-sm text-[var(--color-accent)] font-medium mb-6">
                        {review.product}
                      </p>

                      {/* Customer Info - No Image */}
                      <div className="border-t pt-4">
                        <p className="font-medium text-[var(--color-primary-dark)] mb-1">
                          {review.reviewer}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-[var(--color-gray-500)]">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span>Verifierad köpare</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 mt-6">
            {reviews.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex 
                    ? 'w-8 bg-[var(--color-accent)]' 
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Gå till recension ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Trust Badge - Updated without images */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-12"
        >
          <div className="inline-flex items-center gap-6 bg-white rounded-full px-8 py-4 shadow-lg">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 fill-[var(--color-accent)] text-[var(--color-accent)]" />
              <Star className="w-5 h-5 fill-[var(--color-accent)] text-[var(--color-accent)]" />
              <Star className="w-5 h-5 fill-[var(--color-accent)] text-[var(--color-accent)]" />
              <Star className="w-5 h-5 fill-[var(--color-accent)] text-[var(--color-accent)]" />
              <Star className="w-5 h-5 fill-[var(--color-accent)] text-[var(--color-accent)]" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-[var(--color-primary-dark)]">
                Över {overallStats.totalReviews}+ nöjda kunder
              </p>
              <p className="text-sm text-[var(--color-gray-600)]">
                {overallStats.averageRating.toFixed(1)} av 5 i genomsnittligt betyg
              </p>
            </div>
          </div>
          
          {/* Read All Reviews Button */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-6"
          >
            <Link
              href="/recensioner"
              className="inline-flex items-center px-6 py-3 bg-[#FCB237] text-white rounded-full text-sm font-medium hover:bg-[#6B5D54] transition-colors"
            >
              LÄS ALLA RECENSIONER
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
} 