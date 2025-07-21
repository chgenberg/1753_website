'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Product } from '@/types'

interface RelatedProductsProps {
  currentProductSlug: string
  locale: string
}

export default function RelatedProducts({ currentProductSlug, locale }: RelatedProductsProps) {
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      try {
        const response = await fetch(`/api/products/${currentProductSlug}/related?limit=4`)
        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            setRelatedProducts(data.data)
          }
        }
      } catch (error) {
        console.error('Error fetching related products:', error)
      } finally {
        setLoading(false)
      }
    }

    if (currentProductSlug) {
      fetchRelatedProducts()
    }
  }, [currentProductSlug])

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-8 text-brown-800">
            Du kanske också gillar
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-4 animate-pulse">
                <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
                <div className="bg-gray-200 h-4 rounded mb-2"></div>
                <div className="bg-gray-200 h-3 rounded mb-2"></div>
                <div className="bg-gray-200 h-4 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (relatedProducts.length === 0) {
    return null
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('sv-SE', {
      style: 'currency',
      currency: 'SEK',
      minimumFractionDigits: 0
    }).format(price)
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <motion.h2 
          className="text-3xl font-bold text-center mb-12 text-brown-800"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Du kanske också gillar
        </motion.h2>
        
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {relatedProducts.map((product) => (
            <motion.div
              key={product.id}
              variants={itemVariants}
              className="group"
            >
              <Link href={`/${locale}/products/${product.slug}`}>
                <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform group-hover:scale-105 overflow-hidden">
                  {/* Product Image */}
                  <div className="relative h-48 bg-gradient-to-br from-amber-50 to-brown-50 flex items-center justify-center">
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={product.images[0]?.url || '/images/products/placeholder.jpg'}
                        alt={product.name}
                        className="max-h-full max-w-full object-contain p-4"
                      />
                    ) : (
                      <div className="text-brown-400 text-center p-4">
                        <div className="w-16 h-16 mx-auto mb-2 bg-brown-200 rounded-full flex items-center justify-center">
                          🧴
                        </div>
                        <p className="text-sm">{product.name}</p>
                      </div>
                    )}
                    
                    {/* Featured badge */}
                    {product.isFeatured && (
                      <div className="absolute top-2 right-2 bg-amber-400 text-brown-800 text-xs px-2 py-1 rounded-full font-semibold">
                        Populär
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <h3 className="font-semibold text-brown-800 mb-2 line-clamp-2 group-hover:text-brown-600 transition-colors">
                      {product.name}
                    </h3>
                    
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {product.description || product.shortDescription}
                    </p>

                    {/* Tags */}
                    {product.tags && product.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {product.tags.slice(0, 2).map((tag, index) => (
                          <span
                            key={index}
                            className="bg-brown-100 text-brown-700 text-xs px-2 py-1 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Price and Rating */}
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-brown-800">
                        {formatPrice(product.price)}
                      </div>
                      
                      {product.rating && product.rating.count > 0 && (
                        <div className="flex items-center text-sm text-gray-600">
                          <span className="text-amber-400 mr-1">★</span>
                          <span>{product.rating.average}</span>
                          <span className="ml-1">({product.rating.count})</span>
                        </div>
                      )}
                    </div>

                    {/* Call to action */}
                    <div className="mt-3 text-center">
                      <span className="inline-block bg-brown-600 text-white px-4 py-2 rounded-full text-sm font-medium group-hover:bg-brown-700 transition-colors">
                        Visa produkt
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Learn more about recommendations */}
        <motion.div 
          className="text-center mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <p className="text-gray-600 text-sm">
            Rekommendationer baserade på hudtyp, ingredienser och produktkategori
          </p>
        </motion.div>
      </div>
    </section>
  )
} 