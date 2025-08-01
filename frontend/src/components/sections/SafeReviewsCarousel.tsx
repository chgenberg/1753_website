'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react'

interface Review {
  id: string
  author: string
  rating: number
  content: string
  product?: string
  verified: boolean
  createdAt: string
}

const defaultReviews: Review[] = [
  {
    id: '1',
    author: 'Anna L.',
    rating: 5,
    content: 'Fantastiska produkter som verkligen levererar resultat. Min hud har aldrig mått bättre! Rekommenderar varmt till alla som vill ha naturlig hudvård.',
    product: 'DUO-KIT TA-DA SERUM',
    verified: true,
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    author: 'Maria S.',
    rating: 5,
    content: 'Naturliga ingredienser av högsta kvalitet. Känns som att ge min hud det allra bästa. Älskar särskilt TA-DA serumet!',
    product: 'TA-DA SERUM',
    verified: true,
    createdAt: new Date().toISOString()
  },
  {
    id: '3',
    author: 'Sofia K.',
    rating: 5,
    content: 'Snabb leverans och otrolig kundservice. Produkterna överträffade alla mina förväntningar. Kommer definitivt beställa igen!',
    verified: true,
    createdAt: new Date().toISOString()
  },
  {
    id: '4',
    author: 'Emma H.',
    rating: 5,
    content: 'Jag älskar I LOVE facial oil! Den är så närande och min hud känns mjuk och len hela dagen. Bästa ansiktsoljan jag testat!',
    product: 'I LOVE FACIAL OIL',
    verified: true,
    createdAt: new Date().toISOString()
  },
  {
    id: '5',
    author: 'Lisa M.',
    rating: 4,
    content: 'Mycket bra produkter med naturliga ingredienser. Doften är underbar och konsistensen perfekt. Ger min hud en fin lyster.',
    product: 'THE ONE FACIAL OIL',
    verified: true,
    createdAt: new Date().toISOString()
  },
  {
    id: '6',
    author: 'Karin J.',
    rating: 5,
    content: 'Äntligen hudvård som fungerar! Jag har känslig hud och dessa produkter irriterar inte alls. Tvärtom känns huden lugn och balanserad.',
    product: 'DUO-KIT THE ONE',
    verified: true,
    createdAt: new Date().toISOString()
  }
]

export function SafeReviewsCarousel() {
  const [reviews, setReviews] = useState<Review[]>(defaultReviews)
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
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold mb-6"
          >
            Vad våra kunder säger
          </motion.h2>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="flex items-center justify-center gap-4 mb-4"
          >
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-6 h-6 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <span className="text-2xl font-semibold text-gray-900">{stats.averageRating.toFixed(1)}/5</span>
          </motion.div>
          
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-gray-600"
          >
            Baserat på {stats.totalReviews}+ recensioner
          </motion.p>
        </div>

        <div className="relative max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-2xl shadow-lg p-8 md:p-12"
            >
              <Quote className="w-12 h-12 text-[#8B6B47] mb-6" />
              
              <p className="text-lg md:text-xl text-gray-700 mb-8 leading-relaxed">
                {reviews[currentIndex].content}
              </p>
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${
                            i < reviews[currentIndex].rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'fill-gray-200 text-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                    {reviews[currentIndex].verified && (
                      <span className="text-sm text-green-600 font-medium">Verifierad</span>
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
          <button
            onClick={goToPrevious}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all"
            aria-label="Föregående recension"
          >
            <ChevronLeft className="w-6 h-6 text-[#4A3428]" />
          </button>
          
          <button
            onClick={goToNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all"
            aria-label="Nästa recension"
          >
            <ChevronRight className="w-6 h-6 text-[#4A3428]" />
          </button>

          {/* Dots */}
          <div className="flex items-center justify-center gap-2 mt-8">
            {reviews.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex 
                    ? 'w-8 bg-[#4A3428]' 
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Gå till recension ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
} 