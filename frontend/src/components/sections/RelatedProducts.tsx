'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Product } from '@/types'
import { useCart } from '@/contexts/CartContext'
import { ShoppingBag, Star, Sparkles, ChevronRight, Heart, Package } from 'lucide-react'
import Image from 'next/image'

interface RelatedProductsProps {
  currentProductSlug: string
  locale: string
}

export default function RelatedProducts({ currentProductSlug, locale }: RelatedProductsProps) {
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const { addToCart } = useCart()
  const [addedToCart, setAddedToCart] = useState<string[]>([])
  const [favorites, setFavorites] = useState<string[]>([])

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

  const handleAddToCart = (product: Product) => {
    addToCart(product, 1)
    
    setAddedToCart([...addedToCart, product.id])
    setTimeout(() => {
      setAddedToCart(prev => prev.filter(id => id !== product.id))
    }, 2000)
  }

  const toggleFavorite = (productId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setFavorites(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    )
  }

  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-b from-white to-[#F5F3F0]">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-3 mb-12">
            <Sparkles className="w-6 h-6 text-[#4A3428]" />
            <h2 className="text-3xl md:text-4xl font-bold text-[#4A3428]">
              Du kanske också gillar
            </h2>
            <Sparkles className="w-6 h-6 text-[#4A3428]" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-gray-200 aspect-square rounded-2xl mb-4"></div>
                <div className="bg-gray-200 h-4 rounded mb-2"></div>
                <div className="bg-gray-200 h-3 rounded mb-2 w-3/4"></div>
                <div className="bg-gray-200 h-6 rounded w-1/2"></div>
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

  return (
    <section className="py-20 bg-gradient-to-b from-white to-[#F5F3F0]">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-6 h-6 text-[#4A3428]" />
            <h2 className="text-3xl md:text-4xl font-bold text-[#4A3428]">
              Du kanske också gillar
            </h2>
            <Sparkles className="w-6 h-6 text-[#4A3428]" />
          </div>
          <p className="text-gray-600">Handplockade rekommendationer för din hudvårdsrutin</p>
        </motion.div>
        
        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {relatedProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group relative"
            >
              <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden">
                {/* Favorite Button */}
                <button
                  onClick={(e) => toggleFavorite(product.id, e)}
                  className="absolute top-4 right-4 z-10 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-all duration-200"
                >
                  <Heart 
                    className={`w-5 h-5 transition-all ${
                      favorites.includes(product.id) 
                        ? 'fill-red-500 text-red-500' 
                        : 'text-gray-600 hover:text-red-500'
                    }`}
                  />
                </button>

                {/* Product Image */}
                <Link href={`/${locale}/products/${product.slug}`}>
                  <div className="relative aspect-square bg-gradient-to-br from-[#F5F3F0] to-[#E8E5E0] p-4">
                    {product.images && product.images.length > 0 ? (
                      <Image
                        src={product.images[0]?.url || '/images/products/placeholder.jpg'}
                        alt={product.name}
                        width={300}
                        height={300}
                        className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-16 h-16 text-gray-400" />
                      </div>
                    )}
                    
                    {/* Discount Badge */}
                    {product.compareAtPrice && product.compareAtPrice > product.price && (
                      <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                        -{Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)}%
                      </div>
                    )}

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <span className="text-white font-medium flex items-center gap-2">
                        Se mer <ChevronRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </Link>

                {/* Product Info */}
                <div className="p-4">
                  <Link href={`/${locale}/products/${product.slug}`}>
                    <h3 className="font-semibold text-[#4A3428] mb-1 line-clamp-1 group-hover:text-[#6B5745] transition-colors">
                      {product.name}
                    </h3>
                  </Link>
                  
                  {/* Rating */}
                  {product.rating && product.rating.count > 0 && (
                    <div className="flex items-center gap-1 mb-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < Math.floor(product.rating.average)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'fill-gray-200 text-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-gray-600">
                        ({product.rating.count})
                      </span>
                    </div>
                  )}

                  {/* Price */}
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className="text-lg font-bold text-[#4A3428]">
                        {product.price} kr
                      </span>
                      {product.compareAtPrice && product.compareAtPrice > product.price && (
                        <span className="text-sm text-gray-500 line-through ml-2">
                          {product.compareAtPrice} kr
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    onClick={() => handleAddToCart(product)}
                    className={`w-full py-2 px-4 rounded-full font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                      addedToCart.includes(product.id)
                        ? 'bg-green-500 text-white'
                        : 'bg-[#4A3428] text-white hover:bg-[#3A2418]'
                    }`}
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span className="text-sm">
                      {addedToCart.includes(product.id) ? 'Tillagd!' : 'Lägg till'}
                    </span>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* View All Products CTA */}
        <motion.div 
          className="text-center mt-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <Link
            href={`/${locale}/products`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[#4A3428] rounded-full shadow-md hover:shadow-lg transition-all duration-300 font-medium"
          >
            Se alla produkter
            <ChevronRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </div>
    </section>
  )
} 