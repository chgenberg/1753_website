'use client'

import { motion } from 'framer-motion'
import { ReviewsList } from '@/components/reviews/ReviewsList'
import { Star } from 'lucide-react'

export const ReviewsSection = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-green-50 to-emerald-50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Vad våra kunder säger
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Över tusentals nöjda kunder har redan upptäckt kraften i våra CBD & CBG produkter
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-6xl mx-auto"
        >
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <ReviewsList
              showAll={false}
              maxReviews={6}
              showStats={true}
            />
          </div>
        </motion.div>
      </div>
    </section>
  )
} 