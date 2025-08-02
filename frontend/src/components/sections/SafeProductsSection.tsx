'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ShoppingBag, Star, Package } from 'lucide-react'

interface Product {
  id: string
  name: string
  slug: string
  description?: string
  price: number
  compareAtPrice?: number
  images?: Array<{ url?: string; src?: string }>
  averageRating?: number
  reviewCount?: number
}

// Fallback products if API fails - exactly 4 products in the desired order
const fallbackProducts: Product[] = [
  {
    id: '1',
    name: 'DUO-KIT TA-DA SERUM',
    slug: 'duo-kit-ta-da-serum',
    description: 'Ett komplett kit för optimal hudvård',
    price: 1099,
    compareAtPrice: 1399,
    images: [{ url: '/images/products/DUO_TA-DA.png' }],
    averageRating: 4.8,
    reviewCount: 124
  },
  {
    id: '2',
    name: 'DUO-KIT',
    slug: 'duo-kit-the-one-i-love',
    description: 'Vårt populära DUO-kit med THE ONE och I LOVE ansiktsoljor',
    price: 1199,
    compareAtPrice: 1498,
    images: [{ url: '/images/products/DUO.png' }],
    averageRating: 4.8,
    reviewCount: 187
  },
  {
    id: '3',
    name: 'AU NATUREL MAKEUP REMOVER',
    slug: 'au-naturel-makeup-remover',
    description: 'Upptäck hemligheten till ren och frisk hud',
    price: 399,
    images: [{ url: '/images/products/Naturel.png' }],
    averageRating: 4.7,
    reviewCount: 156
  },
  {
    id: '4',
    name: 'FUNGTASTIC MUSHROOM EXTRACT',
    slug: 'fungtastic-mushroom-extract',
    description: 'Upplev naturens kraft med Fungtastic Mushroom Extract',
    price: 399,
    images: [{ url: '/images/products/Fungtastic.png' }],
    averageRating: 4.9,
    reviewCount: 89
  }
]

export function SafeProductsSection() {
  const [products, setProducts] = useState<Product[]>(fallbackProducts)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products?featured=true&limit=10')
      
      if (response.ok) {
        const data = await response.json()
        if (data.success && Array.isArray(data.data)) {
          // Define the exact products we want in order
          const desiredProductSlugs = [
            'duo-kit-ta-da-serum',
            'duo-kit-the-one-i-love',
            'au-naturel-makeup-remover',
            'fungtastic-mushroom-extract'
          ]
          
          // Filter out store reviews and get all valid products
          const allValidProducts = data.data.filter((p: any) => {
            if (!p || !p.name || !p.slug || p.name.toLowerCase().includes('store review')) {
              return false
            }
            return true
          })
          
          // Sort products according to our desired order
          const sortedProducts = desiredProductSlugs
            .map(slug => allValidProducts.find((p: any) => p.slug === slug))
            .filter(p => p !== undefined)
          
          if (sortedProducts.length === 4) {
            setProducts(sortedProducts)
          } else {
            // If we can't find all 4 products, use what we found
            console.warn('Could not find all desired products, found:', sortedProducts.length)
            setProducts(sortedProducts.length > 0 ? sortedProducts : fallbackProducts.slice(0, 4))
          }
        }
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const getImageUrl = (product: Product): string => {
    if (product.images && product.images.length > 0) {
      const firstImage = product.images[0]
      const imageUrl = firstImage.url || firstImage.src
      if (imageUrl) return imageUrl
    }
    // Try to match product name to image
    const productNameLower = product.name.toLowerCase()
    if (productNameLower.includes('fungtastic')) return '/images/products/Fungtastic.png'
    if (productNameLower.includes('naturel')) return '/images/products/Naturel.png'
    if (productNameLower.includes('the one')) return '/images/products/TheONE.png'
    if (productNameLower.includes('i love')) return '/images/products/ILOVE.png'
    if (productNameLower.includes('ta-da')) return '/images/products/TA-DA.png'
    if (productNameLower.includes('duo')) return '/images/products/DUO.png'
    // Always return a valid fallback image
    return '/images/products/DUO.png'
  }

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold mb-6"
          >
            Våra <span className="text-[#8B6B47]">produkter</span>
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-600 max-w-2xl mx-auto"
          >
            Naturlig hudvård baserad på CBD och funktionella svampar
          </motion.p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 rounded-2xl h-80 mb-4"></div>
                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : (
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
                  <Link href={`/products/${product.slug}`}>
                    <div className="relative aspect-square overflow-hidden bg-gray-100">
                      <Image
                        src={getImageUrl(product)}
                        alt={product.name}
                        width={400}
                        height={400}
                        className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700"
                        onError={(e) => {
                          console.warn(`Failed to load product image: ${getImageUrl(product)} for ${product.name}`)
                          // Set a fallback image if the current one fails
                          const target = e.target as HTMLImageElement
                          if (target.src !== '/images/products/DUO.png') {
                            target.src = '/images/products/DUO.png'
                          }
                        }}
                      />
                      
                      {product.compareAtPrice && product.compareAtPrice > product.price && (
                        <div className="absolute top-4 left-4 bg-[#8B4513] text-white px-3 py-1 rounded-full text-sm font-semibold">
                          -{Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)}%
                        </div>
                      )}
                    </div>
                  </Link>

                  <div className="p-6 flex-1 flex flex-col">
                    <Link href={`/products/${product.slug}`}>
                      <h3 className="font-bold text-lg mb-2 group-hover:text-[#8B6B47] transition-colors">
                        {product.name}
                      </h3>
                    </Link>

                    {product.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {product.description}
                      </p>
                    )}

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

                    <div className="mt-auto">
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-2xl font-bold text-[#4A3428]">
                          {product.price} kr
                        </span>
                        {product.compareAtPrice && product.compareAtPrice > product.price && (
                          <span className="text-sm text-gray-500 line-through">
                            {product.compareAtPrice} kr
                          </span>
                        )}
                      </div>
                      
                      <Link
                        href={`/products/${product.slug}`}
                        className="block w-full text-center bg-[#4A3428] hover:bg-[#3A2A1E] text-white px-4 py-3 rounded-full font-semibold transition-all transform hover:scale-105"
                      >
                        Se produkt
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-[#4A3428] hover:bg-[#3A2A1E] text-white px-8 py-4 rounded-full font-semibold text-lg transition-all transform hover:scale-105 shadow-xl"
          >
            <ShoppingBag className="w-5 h-5" />
            Se alla produkter
          </Link>
        </motion.div>
      </div>
    </section>
  )
} 