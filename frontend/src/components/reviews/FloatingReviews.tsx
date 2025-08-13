'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, ChevronLeft, ChevronRight } from 'lucide-react'

interface Review {
  id: string
  author: string
  rating: number
  text: string
  verified: boolean
}

interface FloatingReviewsProps {
  productSlug: string
  productName: string
}

export default function FloatingReviews({ productSlug, productName }: FloatingReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)

  // Mock reviews - in production these would come from the API
  const mockReviews: Review[] = [
    {
      id: '1',
      author: 'Gunilla',
      rating: 5,
      text: 'Jag är nu inne på min andra flaska TA-DA serum och min mycket känsliga hy älskar detta serum. Kommer att fortsätta använda serumet morgon...',
      verified: true
    },
    {
      id: '2',
      author: 'Lisen J',
      rating: 5,
      text: 'Efter att ha provat MÄNGDER av hudvårdsprodukter under flera år så har jag äntligen hittat rätt!! Detta är fantastiskt!',
      verified: true
    },
    {
      id: '3',
      author: 'Cecilia Götherström',
      rating: 5,
      text: 'Efter två veckor var min hud redan så mycket mer flexibel, efter tre veckor var den som om jag fått bindvävsmassage varje morgon!',
      verified: true
    },
    {
      id: '4',
      author: 'Maria L',
      rating: 5,
      text: 'Fantastiska produkter! Min hud har aldrig känt sig så mjuk och återfuktad. Rekommenderar starkt!',
      verified: true
    },
    {
      id: '5',
      author: 'Anna K',
      rating: 5,
      text: 'Äntligen en produkt som håller vad den lovar! Min hud strålar och känns så mycket friskare.',
      verified: true
    }
  ]

  useEffect(() => {
    // In production, fetch reviews from API
    setReviews(mockReviews)
  }, [productSlug])

  useEffect(() => {
    if (!isHovered && reviews.length > 0) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % reviews.length)
      }, 4000) // Change review every 4 seconds

      return () => clearInterval(interval)
    }
  }, [isHovered, reviews.length])

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length)
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % reviews.length)
  }

  if (reviews.length === 0) return null

  const currentReview = reviews[currentIndex]

  return (
    <div 
      className="bg-gradient-to-r from-[#F5F3F0] to-[#E5DDD5] rounded-xl p-4 relative overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-2xl" />

      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`w-4 h-4 ${
                    i < currentReview.rating 
                      ? 'fill-yellow-400 text-yellow-400' 
                      : 'fill-gray-300 text-gray-300'
                  }`} 
                />
              ))}
            </div>
            <span className="text-sm font-medium text-[#FCB237]">
              {currentReview.rating}.0
            </span>
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-1 opacity-0 hover:opacity-100 transition-opacity">
            <button
              onClick={goToPrevious}
              className="p-1 hover:bg-white/20 rounded-full transition-colors"
              aria-label="Föregående recension"
            >
              <ChevronLeft className="w-4 h-4 text-[#FCB237]" />
            </button>
            <button
              onClick={goToNext}
              className="p-1 hover:bg-white/20 rounded-full transition-colors"
              aria-label="Nästa recension"
            >
              <ChevronRight className="w-4 h-4 text-[#FCB237]" />
            </button>
          </div>
        </div>

        {/* Review Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentReview.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <p className="text-sm text-[#FCB237] leading-relaxed mb-2 line-clamp-2">
              "{currentReview.text}"
            </p>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#6B5D54]">
                — {currentReview.author}
              </span>
              {currentReview.verified && (
                <span className="text-xs text-[#6B5D54] flex items-center gap-1">
                  <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Verifierat köp
                </span>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-1 mt-3">
          {reviews.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-1.5 h-1.5 rounded-full transition-all ${
                index === currentIndex 
                  ? 'bg-[#FCB237] w-4' 
                  : 'bg-[#FCB237]/30 hover:bg-[#FCB237]/50'
              }`}
              aria-label={`Gå till recension ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
} 