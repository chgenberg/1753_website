'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ArrowRight, Star, Heart } from 'lucide-react'

interface Product {
  id: string
  name: string
  slug: string
  description: string
  price: number
  compareAtPrice?: number
  images: Array<{ url: string; alt: string }>
  category: { name: string }
  bestseller: boolean
  newProduct: boolean
  rating?: {
    average: number
    count: number
  }
}

export function ProductsSection() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      // Always use Next.js API routes to avoid CORS issues
      const response = await fetch(`/api/products?limit=4&featured=true`)
      const result = await response.json()
      
      if (result.success && result.data) {
        // Transform data to match expected structure
        const transformedProducts = result.data
          // Remove store-review type entries
          .filter((p: any) => p.category?.toLowerCase() !== 'store')
          .map((product: any) => {
            // Ensure images array is in the expected object format
            let images = product.images
            if (Array.isArray(images) && images.length > 0) {
              // If backend returns an array of strings, convert to objects
              if (typeof images[0] === 'string') {
                images = images.map((url: string) => ({ url, alt: product.name }))
              }
            } else {
              images = [{ url: `/images/products/${product.slug}.png`, alt: product.name }]
            }

            return {
              id: product.id,
              name: product.name,
              slug: product.slug,
              description: product.description,
              price: product.price,
              compareAtPrice: product.compareAtPrice,
              images,
              category: { name: product.category },
              bestseller: product.isBestseller || false,
              newProduct: product.isNew || false,
              rating: product.rating || { average: 0, count: 0 }
            }
          })
        setProducts(transformedProducts)
      } else {
        setProducts(mockProducts)
      }
      setLoading(false)
    } catch (error) {
      console.error('Error fetching products:', error)
      // Fallback to mock data when API is not available
      setProducts(mockProducts)
      setLoading(false)
    }
  }

  // Mock products as fallback
  const mockProducts: Product[] = [
    {
      id: '1',
      name: 'The ONE Facial Oil',
      slug: 'the-one-facial-oil',
      description: 'Vår mest populära ansiktsolja med CBD och CBG för alla hudtyper',
      price: 649,
      images: [{ url: '/images/products/TheONE.png', alt: 'The ONE Facial Oil' }],
      category: { name: 'Ansiktsoljor' },
      bestseller: true,
      newProduct: false
    },
    {
      id: '2',
      name: 'Au Naturel Makeup Remover',
      slug: 'au-naturel-makeup-remover',
      description: 'Mild makeupborttagare för känslig hud med naturliga ingredienser',
      price: 399,
      images: [{ url: '/images/products/Naturel.png', alt: 'Au Naturel Makeup Remover' }],
      category: { name: 'Rengöring' },
      bestseller: false,
      newProduct: false
    },
    {
      id: '3',
      name: 'TA-DA Serum',
      slug: 'ta-da-serum',
      description: 'Kraftfullt serum för problematisk hud med CBG och antiinflammatoriska ingredienser',
      price: 699,
      images: [{ url: '/images/products/TA-DA.png', alt: 'TA-DA Serum' }],
      category: { name: 'Serum' },
      bestseller: false,
      newProduct: true
    },
    {
      id: '4',
      name: 'Fungtastic Mushroom Extract',
      slug: 'fungtastic-mushroom-extract',
      description: 'Kraftfulla medicinska svampar för hud och hälsa',
      price: 399,
      images: [{ url: '/images/products/Fungtastic.png', alt: 'Fungtastic Mushroom Extract' }],
      category: { name: 'Kosttillskott' },
      bestseller: false,
      newProduct: false
    }
  ]

  if (loading) {
    return (
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#4A3428] mx-auto"></div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-24 bg-[var(--color-bg-secondary)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-[var(--color-primary-dark)] mb-4 tracking-tight">
            UTVALDA PRODUKTER
          </h2>
          <p className="text-lg text-[var(--color-gray-600)] max-w-2xl mx-auto font-light">
            Upptäck våra mest älskade produkter för en balanserad och strålande hud
          </p>
        </motion.div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group h-full"
            >
              <Link href={`/products/${product.slug}`} className="block h-full">
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl h-full flex flex-col">
                  {/* Image Container - Fixed aspect ratio */}
                  <div className="relative aspect-square overflow-hidden bg-gray-100">
                    {product.images[0]?.url && (
                      <Image
                        src={product.images[0].url}
                        alt={product.images[0].alt || product.name}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    )}
                    
                    {/* Badges */}
                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                      {product.bestseller && (
                        <span className="bg-red-500 text-white text-xs px-3 py-1 rounded-full">
                          Bästsäljare
                        </span>
                      )}
                      {product.newProduct && (
                        <span className="bg-blue-500 text-white text-xs px-3 py-1 rounded-full">
                          Nyhet
                        </span>
                      )}
                    </div>

                    {/* Quick Actions */}
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button className="bg-white p-2 rounded-full shadow-md hover:shadow-lg transition-shadow">
                        <Heart className="w-5 h-5 text-gray-600 hover:text-red-500 transition-colors" />
                      </button>
                    </div>
                  </div>

                  {/* Product Info - Flex grow to fill remaining space */}
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="mb-2">
                      <span className="text-xs text-gray-500 uppercase tracking-wider">
                        {product.category.name}
                      </span>
                    </div>
                    
                    <h3 className="font-semibold text-lg mb-2">
                      {product.name}
                    </h3>
                    
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-grow">
                      {product.description}
                    </p>

                    {/* Rating */}
                    {product.rating && product.rating.count > 0 && (
                      <div className="flex items-center mb-4">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-4 h-4 ${
                              i < Math.round(product.rating!.average)
                                ? 'fill-[#4A3428] text-[#4A3428]'
                                : 'text-gray-300'
                            }`} 
                          />
                        ))}
                        <span className="text-sm text-gray-600 ml-2">
                          ({product.rating.average.toFixed(1)}) · {product.rating.count} recensioner
                        </span>
                      </div>
                    )}

                    {/* Price - Always at bottom */}
                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-gray-900">
                          {product.price} kr
                        </span>
                        {product.compareAtPrice && (
                          <span className="text-sm text-gray-400 line-through">
                            {product.compareAtPrice} kr
                          </span>
                        )}
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-[#4A3428] text-white p-2 rounded-full"
                      >
                        <ArrowRight className="w-5 h-5" />
                      </motion.button>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-black text-white px-8 py-4 rounded-full font-medium hover:bg-gray-800 transition-colors"
          >
            <span>Se alla produkter</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </div>
    </section>
  )
} 