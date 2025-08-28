'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ShoppingBag, Star, Plus, Check, Package } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface SafeProduct {
  id: string
  name: string
  slug: string
  description: string
  price: number
  compareAtPrice?: number
  imageUrl?: string
  averageRating?: number
  reviewCount?: number
}

export function ProductsSectionSafe() {
  const [products, setProducts] = useState<SafeProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [addedToCart, setAddedToCart] = useState<string[]>([])
  const t = useTranslations('sections.products')

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products?featured=true&limit=8')
      
      if (!response.ok) {
        throw new Error('Failed to fetch products')
      }
      
      const data = await response.json()
      
      if (data.success && Array.isArray(data.data)) {
        // Safely transform products to prevent any rendering issues
        const safeProducts: SafeProduct[] = data.data
          .filter((product: any) => 
            product && 
            typeof product.name === 'string' && 
            typeof product.slug === 'string' &&
            !product.name.toLowerCase().includes('store review')
          )
          .map((product: any) => ({
            id: String(product.id || ''),
            name: String(product.name || 'Unnamed Product'),
            slug: String(product.slug || ''),
            description: String(product.description || product.shortDescription || ''),
            price: Number(product.price) || 0,
            compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : undefined,
            imageUrl: getProductImageUrl(product),
            averageRating: product.averageRating ? Number(product.averageRating) : undefined,
            reviewCount: product.reviewCount ? Number(product.reviewCount) : undefined
          }))
          .slice(0, 8)
        
        setProducts(safeProducts)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
      // Set fallback products to prevent empty state
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const getProductImageUrl = (product: any): string | undefined => {
    try {
      if (!product.images || product.images.length === 0) return undefined
      
      const firstImage = product.images[0]
      if (typeof firstImage === 'string') return firstImage
      if (typeof firstImage === 'object' && firstImage) {
        return firstImage.src || firstImage.url || undefined
      }
      return undefined
    } catch {
      return undefined
    }
  }

  const handleAddToCart = (productId: string) => {
    setAddedToCart([...addedToCart, productId])
    setTimeout(() => {
      setAddedToCart(prev => prev.filter(id => id !== productId))
    }, 2000)
  }

  if (loading) {
    return (
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Våra <span className="text-[#8B6B47]">produkter</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 rounded-2xl h-80 mb-4"></div>
                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 bg-[#FCB237]/10 px-4 py-2 rounded-full mb-4"
          >
            <Package className="w-4 h-4 text-[#FCB237]" />
            <span className="text-sm font-medium text-[#FCB237]">{t('badge')}</span>
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold mb-6"
          >
            {t('titlePrefix')} <span className="text-[#8B6B47]">{t('titleEmphasis')}</span>
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-600 max-w-2xl mx-auto"
          >
            {t('subtitle')}
          </motion.p>
        </div>

        {/* Products Grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group"
              >
                <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 h-full flex flex-col">
                  {/* Product Image */}
                  <Link href={`/products/${product.slug}`}>
                    <div className="relative aspect-square overflow-hidden bg-gray-100">
                      {product.imageUrl ? (
                        <Image
                          src={product.imageUrl}
                          alt={product.name}
                          width={400}
                          height={400}
                          className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700"
                          onError={(e) => {
                            // Hide broken images
                            const target = e.target as HTMLImageElement
                            target.style.display = 'none'
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Package className="w-16 h-16" />
                        </div>
                      )}
                      
                      {/* Discount Badge */}
                      {product.compareAtPrice && product.compareAtPrice > product.price && (
                        <div className="absolute top-4 left-4 bg-[#FCB237] text-white px-3 py-1 rounded-full text-sm font-semibold">
                          -{Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)}%
                        </div>
                      )}
                    </div>
                  </Link>

                  {/* Product Info */}
                  <div className="p-6 flex-1 flex flex-col">
                    <Link href={`/products/${product.slug}`}>
                      <h3 className="font-bold text-lg mb-2 group-hover:text-[#8B6B47] transition-colors">
                        {product.name}
                      </h3>
                    </Link>

                    {/* Rating */}
                    {product.averageRating && (
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < Math.floor(product.averageRating || 0)
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'fill-gray-200 text-gray-200'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-600">
                          ({product.reviewCount || 0})
                        </span>
                      </div>
                    )}

                    {/* Price and Add to Cart */}
                    <div className="flex items-center justify-between mt-auto">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold text-[#FCB237]">
                            {product.price} kr
                          </span>
                          {product.compareAtPrice && product.compareAtPrice > product.price && (
                            <span className="text-sm text-gray-500 line-through">
                              {product.compareAtPrice} kr
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <button
                        onClick={() => handleAddToCart(product.id)}
                        className={`p-3 rounded-full transition-all duration-300 ${
                          addedToCart.includes(product.id)
                            ? 'bg-green-500 text-white'
                            : 'bg-[#FCB237] text-white hover:bg-[#3A2A1E]'
                        }`}
                      >
                        {addedToCart.includes(product.id) ? (
                          <Check className="w-5 h-5" />
                        ) : (
                          <Plus className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center">
            <p className="text-gray-600 mb-8">Laddar produkter...</p>
          </div>
        )}

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-[#FCB237] hover:bg-[#3A2A1E] text-white px-8 py-4 rounded-full font-semibold text-lg transition-all transform hover:scale-105 shadow-xl"
          >
            <ShoppingBag className="w-5 h-5" />
            {t('ctaAllProducts')}
          </Link>
        </motion.div>
      </div>
    </section>
  )
} 