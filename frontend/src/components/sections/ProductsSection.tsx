'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ShoppingBag, Star, Plus, Check, Package } from 'lucide-react'
import { useCurrency } from '@/contexts/CurrencyContext'
// Temporarily remove FloatingReviews to fix React error
// import FloatingReviews from '@/components/reviews/FloatingReviews'

interface Product {
  id: string
  name: string
  slug: string
  description: string
  shortDescription?: string
  price: number
  compareAtPrice?: number
  images: Array<{ src?: string; url?: string; alt?: string }> | string[]
  tags: string[]
  isActive: boolean
  isFeatured: boolean
  averageRating?: number
  reviewCount?: number
}

export function ProductsSection() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [addedToCart, setAddedToCart] = useState<string[]>([])
  const { formatMoney } = useCurrency()

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const locale = (typeof window !== 'undefined' ? window.location.pathname.split('/')[1] : 'sv') || 'sv'
      const response = await fetch(`/api/products?featured=true&limit=8&locale=${encodeURIComponent(locale)}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch products')
      }
      
      const data = await response.json()
      
      if (data.success && Array.isArray(data.data)) {
        // Filter out store reviews
        const filteredProducts = data.data.filter((product: any) => 
          product && 
          product.name && 
          !product.name.toLowerCase().includes('store review') &&
          !product.name.toLowerCase().includes('1753 skincare store')
        )
        
        // Custom order for homepage products
        const customOrder = [
          'duo-kit-ta-da-serum',
          'duo-kit-the-one-i-love', 
          'ta-da-serum',
          'au-naturel-makeup-remover',
          'fungtastic-mushroom-extract',
          'i-love-facial-oil',
          'the-one-facial-oil'
        ]
        
        // Sort products according to custom order
        const sortedProducts = filteredProducts.sort((a: Product, b: Product) => {
          const aIndex = customOrder.indexOf(a.slug)
          const bIndex = customOrder.indexOf(b.slug)
          
          if (aIndex !== -1 && bIndex !== -1) {
            return aIndex - bIndex
          }
          if (aIndex !== -1 && bIndex === -1) return -1
          if (aIndex === -1 && bIndex !== -1) return 1
          
          return 0
        })
        
        setProducts(sortedProducts)
      } else {
        console.error('Invalid API response structure:', data)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = (productId: string) => {
    setAddedToCart([...addedToCart, productId])
    // Reset after animation
    setTimeout(() => {
      setAddedToCart(prev => prev.filter(id => id !== productId))
    }, 2000)
  }

  const getImageSrc = (product: Product) => {
    if (!product.images || product.images.length === 0) return null;
    
    const firstImage = product.images[0];
    if (typeof firstImage === 'string') return firstImage;
    if (typeof firstImage === 'object') {
      return firstImage.src || firstImage.url || null;
    }
    return null;
  }

  if (loading) {
    return (
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
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
            <span className="text-sm font-medium text-[#FCB237]">Handplockat för dig</span>
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold mb-6"
          >
            Våra <span className="text-[#8B6B47]">produkter</span>
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-600 max-w-2xl mx-auto"
          >
            Naturlig hudvård baserad på CBD och funktionella svampar
          </motion.p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product, index) => {
            const imageSrc = getImageSrc(product);
            
            return (
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
                      {imageSrc ? (
                        <Image
                          src={imageSrc}
                          alt={product.name}
                          width={400}
                          height={400}
                          className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700"
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

                      {/* Quick View on Hover */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                        <div className="text-white">
                          <p className="text-sm mb-2 line-clamp-2">{product.shortDescription || product.description}</p>
                          <span className="text-xs">Läs mer →</span>
                        </div>
                      </div>
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
                            {formatMoney(product.price)}
                          </span>
                          {product.compareAtPrice && product.compareAtPrice > product.price && (
                            <span className="text-sm text-gray-500 line-through">
                              {formatMoney(product.compareAtPrice)}
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

                    {/* Temporarily removed FloatingReviews to fix React error */}
                    {/* {product.reviewCount && product.reviewCount > 0 && (
                      <div className="mt-4">
                        <FloatingReviews 
                          productSlug={product.slug} 
                          productName={product.name}
                        />
                      </div>
                    )} */}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

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
            Se alla produkter
          </Link>
        </motion.div>
      </div>
    </section>
  )
} 