'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { Star, Quote } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'

const reviews = [
  {
    id: 1,
    name: 'Emma Svensson',
    rating: 5,
    comment: 'Fantastiska produkter! Min hud har aldrig känt sig så mjuk och balanserad.',
          product: 'The ONE Facial Oil',
    image: '/Porträtt_hemsidan/kapitel-16.png'
  },
  {
    id: 2,
    name: 'Marcus Andersson',
    rating: 5,
    comment: 'CBD-oljan har verkligen hjälpt min känsliga hud. Rekommenderar starkt!',
          product: 'Au Naturel Makeup Remover',
    image: '/Porträtt_hemsidan/kapitel-18.png'
  },
  {
    id: 3,
    name: 'Sofia Lindberg',
    rating: 5,
    comment: 'Älskar konsistensen och doften. Ser redan resultat efter två veckor!',
          product: 'TA-DA Serum',
    image: '/Porträtt_hemsidan/kapitel-22.png'
  }
]

export function ReviewsSection() {
  const [overallStats, setOverallStats] = useState({
    totalReviews: 823,
    averageRating: 4.62
  })

  const t = useTranslations('Reviews')

  useEffect(() => {
    // You could fetch overall stats from API here if needed
    // For now using the calculated values from our analysis
  }, [])

  return (
    <section className="py-24 bg-[var(--color-bg-accent)]">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-[var(--color-primary-dark)] mb-4 tracking-tight">
            VAD VÅRA KUNDER SÄGER
          </h2>
          <p className="text-lg text-[var(--color-gray-600)] max-w-2xl mx-auto font-light">
            Äkta berättelser från människor som upptäckt kraften i naturlig hudvård
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {reviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white rounded-2xl shadow-lg overflow-hidden"
            >
              {/* Quote Icon */}
              <div className="relative p-8 pb-0">
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
                <p className="text-[var(--color-gray-700)] leading-relaxed mb-4 italic">
                  "{review.comment}"
                </p>

                {/* Product */}
                <p className="text-sm text-[var(--color-accent)] font-medium mb-6">
                  {review.product}
                </p>
              </div>

              {/* Customer Info */}
              <div className="flex items-center gap-4 p-6 bg-[var(--color-bg-primary)]">
                <div className="relative w-12 h-12 rounded-full overflow-hidden">
                  <Image
                    src={review.image}
                    alt={review.name}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="font-medium text-[var(--color-primary-dark)]">
                    {review.name}
                  </p>
                  <p className="text-sm text-[var(--color-gray-500)]">
                    Verifierad köpare
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trust Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-12"
        >
          <div className="inline-flex items-center gap-4 bg-white rounded-full px-8 py-4 shadow-lg">
            <div className="flex -space-x-2">
              {[
                '/Porträtt_hemsidan/kapitel-24.png',
                '/Porträtt_hemsidan/kapitel-23.png',
                '/Porträtt_hemsidan/kapitel-22.png'
              ].map((img, i) => (
                img && (
                  <div key={i} className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-white">
                    <Image
                      src={img}
                      alt="Customer"
                      fill
                      sizes="40px"
                      className="object-cover"
                    />
                  </div>
                )
              ))}
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
              className="inline-flex items-center px-6 py-3 bg-[#4A3428] text-white rounded-full text-sm font-medium hover:bg-[#6B5D54] transition-colors"
            >
              {t('readAllReviews')}
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
} 