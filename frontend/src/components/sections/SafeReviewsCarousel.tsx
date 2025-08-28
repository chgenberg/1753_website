'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface Review {
  id: string
  author: string
  rating: number
  content: string
  product?: string
  verified: boolean
  createdAt: string
}

const buildDefaultReviews = (t: ReturnType<typeof useTranslations>): Review[] => ([
  {
    id: '1',
    author: t('reviews.homeDefaults.1.author'),
    rating: 5,
    content: t('reviews.homeDefaults.1.content'),
    product: t('reviews.homeDefaults.1.product'),
    verified: true,
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    author: t('reviews.homeDefaults.2.author'),
    rating: 5,
    content: t('reviews.homeDefaults.2.content'),
    product: t('reviews.homeDefaults.2.product'),
    verified: true,
    createdAt: new Date().toISOString()
  },
  {
    id: '3',
    author: t('reviews.homeDefaults.3.author'),
    rating: 5,
    content: t('reviews.homeDefaults.3.content'),
    verified: true,
    createdAt: new Date().toISOString()
  },
  {
    id: '4',
    author: t('reviews.homeDefaults.4.author'),
    rating: 5,
    content: t('reviews.homeDefaults.4.content'),
    product: t('reviews.homeDefaults.4.product'),
    verified: true,
    createdAt: new Date().toISOString()
  }
])

export function SafeReviewsCarousel() {
  const t = useTranslations()
  const [reviews, setReviews] = useState<Review[]>(buildDefaultReviews(t))
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [stats, setStats] = useState({
    totalReviews: 750,
    averageRating: 4.8
  })
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Try to fetch real reviews, but use defaults if it fails
    fetchReviews()
    fetchStats()
  }, [])

  useEffect(() => {
    if (isAutoPlaying && reviews.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % reviews.length)
      }, 5000)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isAutoPlaying, reviews.length])

  const fetchReviews = async () => {
    try {
      const response = await fetch('/api/reviews?limit=10')
      if (response.ok) {
        const data = await response.json()
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setReviews(data.data)
        }
      }
    } catch (error) {
      console.error('Error fetching reviews:', error)
      // Keep using default reviews
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/reviews/stats')
      if (response.ok) {
        const data = await response.json()
        if (data.totalReviews && data.averageRating) {
          setStats({
            totalReviews: data.totalReviews,
            averageRating: data.averageRating
          })
        }
      }
    } catch (error) {
      console.error('Error fetching review stats:', error)
      // Keep default stats
    }
  }

  const goToPrevious = () => {
    setIsAutoPlaying(false)
    setCurrentIndex((prevIndex) => (prevIndex - 1 + reviews.length) % reviews.length)
  }

  const goToNext = () => {
    setIsAutoPlaying(false)
    setCurrentIndex((prevIndex) => (prevIndex + 1) % reviews.length)
  }

  const goToSlide = (index: number) => {
    setIsAutoPlaying(false)
    setCurrentIndex(index)
  }

  if (reviews.length === 0) return null

  return (
    <section className="py-20 bg-[#FAF8F5]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-4xl md:text-5xl font-bold mb-6">
            {t('Reviews.title')}
          </motion.h2>
          
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="flex items-center justify-center gap-4 mb-1">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-6 h-6 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <span className="text-2xl font-semibold text-gray-900">{stats.averageRating.toFixed(1)}/5</span>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.15 }} className="text-gray-600 flex items-center justify-center gap-6">
            <span>{t('reviews.homeStats.averageLabel')}</span>
            <span>·</span>
            <span>{t('reviews.homeStats.total', { count: stats.totalReviews })}</span>
            <span>·</span>
            <span>{t('reviews.homeStats.wouldRecommend')}</span>
          </motion.div>
        </div>

        <div className="relative max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div key={currentIndex} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }} className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
              <Quote className="w-12 h-12 text-[#8B6B47] mb-6" />
              
              <p className="text-lg md:text-xl text-gray-700 mb-8 leading-relaxed">
                {reviews[currentIndex].content}
              </p>
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-5 h-5 ${i < reviews[currentIndex].rating ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'}`} />
                      ))}
                    </div>
                    {reviews[currentIndex].verified && (
                      <span className="text-sm text-green-600 font-medium">{t('Reviews.verifiedPurchase')}</span>
                    )}
                  </div>
                  
                  <h4 className="font-semibold text-gray-900">{reviews[currentIndex].author}</h4>
                  {reviews[currentIndex].product && (
                    <p className="text-sm text-gray-600">{reviews[currentIndex].product}</p>
                  )}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <button onClick={goToPrevious} className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all" aria-label={t('Reviews.prevAria')}>
            <ChevronLeft className="w-6 h-6 text-[#FCB237]" />
          </button>
          
          <button onClick={goToNext} className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all" aria-label={t('Reviews.nextAria')}>
            <ChevronRight className="w-6 h-6 text-[#FCB237]" />
          </button>

          {/* Dots */}
          <div className="flex items-center justify-center gap-2 mt-8">
            {reviews.map((_, index) => (
              <button key={index} onClick={() => goToSlide(index)} className={`w-2 h-2 rounded-full transition-all ${index === currentIndex ? 'w-8 bg-[#FCB237]' : 'bg-gray-300 hover:bg-gray-400'}`} aria-label={t('Reviews.gotoAria', { index: index + 1 })} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
} 