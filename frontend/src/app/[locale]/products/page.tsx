'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { useCart } from '@/contexts/CartContext'
import { Filter, ChevronDown, ShoppingBag, Star, Heart, Eye, Sparkles } from 'lucide-react'
import { generatePageSEO } from '@/lib/seo-utils'
import type { Metadata } from 'next'

interface Product {
  id: string
  name: string
  slug: string
  description: string
  price: number
  compareAtPrice?: number
  image: string
  category: string
  skinTypes: string[]
  featured: boolean
  bestseller: boolean
  newProduct: boolean
  rating?: {
    average: number
    count: number
  }
}

export default function ProductsPage() {
  const { addToCart } = useCart()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('alla')
  const [sortBy, setSortBy] = useState<'featured' | 'price-low' | 'price-high' | 'name'>('featured')
  const [showFilters, setShowFilters] = useState(false)
  const [activeFilter, setActiveFilter] = useState<string | null>(null)
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null)
  const [favorites, setFavorites] = useState<string[]>([])

  useEffect(() => {
    fetchProducts()
    // Load favorites from localStorage
    const savedFavorites = localStorage.getItem('favorites')
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites))
    }
  }, [])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002'}/api/products?sort=featured`)
      const data = await response.json()
      
      // Ensure data is an array
      const productsArray = Array.isArray(data) ? data : (data.products || [])
      setProducts(productsArray)
    } catch (error) {
      console.error('Error fetching products:', error)
      setProducts([]) // Set empty array on error
    } finally {
      setLoading(false)
    }
  }

  // Filter products based on category only
  useEffect(() => {
    const safeProducts = Array.isArray(products) ? products : []
    let currentFiltered = [...safeProducts]
    
    // Filter by category
    if (selectedCategory !== 'alla') {
      currentFiltered = currentFiltered.filter(product => product.category === selectedCategory)
    }

    // Sort products
    switch (sortBy) {
      case 'price-low':
        currentFiltered.sort((a, b) => a.price - b.price)
        break
      case 'price-high':
        currentFiltered.sort((a, b) => b.price - a.price)
        break
      case 'name':
        currentFiltered.sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'featured':
      default:
        // Custom order for featured products
        const customOrder = [
          'duo-kit-ta-da-serum',
          'duo-kit-the-one-i-love',
          'ta-da-serum',
          'au-naturel-makeup-remover',
          'fungtastic-mushroom-extract',
          'i-love-facial-oil',
          'the-one-facial-oil'
        ]
        
        currentFiltered.sort((a, b) => {
          const aIndex = customOrder.indexOf(a.slug)
          const bIndex = customOrder.indexOf(b.slug)
          
          if (aIndex !== -1 && bIndex !== -1) {
            return aIndex - bIndex
          }
          if (aIndex !== -1 && bIndex === -1) return -1
          if (aIndex === -1 && bIndex !== -1) return 1
          if (a.featured && !b.featured) return -1
          if (!a.featured && b.featured) return 1
          return 0
        })
        break
    }

    setFilteredProducts(currentFiltered)
  }, [selectedCategory, products, activeFilter, sortBy])

  const toggleFavorite = (productId: string) => {
    const newFavorites = favorites.includes(productId)
      ? favorites.filter(id => id !== productId)
      : [...favorites, productId]
    
    setFavorites(newFavorites)
    localStorage.setItem('favorites', JSON.stringify(newFavorites))
  }

  const resetFilters = () => {
    setSelectedCategory('alla')
    setActiveFilter(null)
  }

  // Ensure products is always an array before mapping
  const safeProducts = Array.isArray(products) ? products : []
  const categories = ['alla', ...Array.from(new Set(safeProducts.map(p => p.category).filter(Boolean)))]

  const categoryLabels: Record<string, string> = {
    'alla': 'Alla',
    'bestseller': 'Bestsellers',
    'nytt': 'Nytt'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-20 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#4A3428] mx-auto"></div>
              <p className="mt-4 text-gray-600">Laddar produkter...</p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="pt-20 pb-16">
        {/* Hero Section */}
        <div className="bg-gradient-to-b from-white to-gray-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-block px-4 py-2 bg-[#4A3428] text-white text-sm font-medium rounded-full mb-4">
                CBD-BERIKAD HUDVÅRD
              </span>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                VÅRA PRODUKTER
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Upptäck kraften i naturlig hudvård med våra noggrant utvalda CBD- och CBG-berikade produkter
              </p>
            </motion.div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Filters */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              {/* Left side - Filters */}
              <div className="flex flex-wrap items-center gap-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Filter className="w-5 h-5 text-[#4A3428]" />
                  FILTER
                </h3>
                
                {/* Category Filter */}
                <div className="flex flex-wrap gap-2">
                  {categories.map(category => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                        selectedCategory === category
                          ? 'bg-[#4A3428] text-white shadow-lg'
                          : 'bg-white text-gray-700 border border-gray-200 hover:border-[#4A3428] hover:text-[#4A3428]'
                      }`}
                    >
                      {categoryLabels[category] || category.charAt(0).toUpperCase() + category.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Right side - Sort & Reset */}
              <div className="flex items-center gap-4">
                {/* Active Filters Count */}
                {selectedCategory !== 'alla' && (
                  <span className="text-sm text-gray-600">
                    {[selectedCategory !== 'alla'].filter(Boolean).length} filter aktiv
                  </span>
                )}

                {/* Sort Dropdown */}
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-[#4A3428] focus:border-transparent"
                  >
                    <option value="featured">Utvalda först</option>
                    <option value="name">Namn A-Ö</option>
                    <option value="price-low">Pris: Låg till hög</option>
                    <option value="price-high">Pris: Hög till låg</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>

                {/* Reset Filters */}
                {selectedCategory !== 'alla' && (
                  <button
                    onClick={resetFilters}
                    className="text-sm text-[#4A3428] hover:text-[#3A2418] font-medium transition-colors"
                  >
                    Rensa filter
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <AnimatePresence mode="wait">
            {filteredProducts.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16"
              >
                <p className="text-gray-600 text-lg">Inga produkter hittades med nuvarande filter.</p>
                <button
                  onClick={resetFilters}
                  className="mt-4 px-6 py-2 bg-[#4A3428] text-white rounded-lg hover:bg-[#3A2418] transition-colors"
                >
                  Visa alla produkter
                </button>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
              >
                {filteredProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group relative"
                    onMouseEnter={() => setHoveredProduct(product.id)}
                    onMouseLeave={() => setHoveredProduct(null)}
                  >
                    {/* Product Badges */}
                    <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                      {product.featured && (
                        <span className="bg-[#4A3428] text-white text-xs font-bold px-3 py-1 rounded-full">
                          REKOMMENDERAT
                        </span>
                      )}
                      {product.bestseller && (
                        <span className="bg-yellow-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                          BESTSELLER
                        </span>
                      )}
                      {product.newProduct && (
                        <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                          NYTT
                        </span>
                      )}
                    </div>

                    {/* Favorite Button */}
                    <button
                      onClick={() => toggleFavorite(product.id)}
                      className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all duration-200"
                    >
                      <Heart 
                        className={`w-5 h-5 transition-colors ${
                          favorites.includes(product.id) 
                            ? 'text-red-500 fill-red-500' 
                            : 'text-gray-600 hover:text-red-500'
                        }`} 
                      />
                    </button>

                    {/* Product Image */}
                    <div className="relative h-64 bg-gray-100 overflow-hidden">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                      />
                      
                      {/* Quick View Overlay */}
                      <div className={`absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity duration-300 ${
                        hoveredProduct === product.id ? 'opacity-100' : 'opacity-0'
                      }`}>
                        <Link
                          href={`/products/${product.slug}`}
                          className="bg-white text-gray-900 px-6 py-2 rounded-full font-medium hover:bg-gray-100 transition-colors flex items-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          Snabbtitt
                        </Link>
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="p-6">
                      <div className="mb-2">
                        <span className="text-xs font-medium text-[#4A3428] uppercase tracking-wider">
                          {product.category}
                        </span>
                      </div>
                      
                      <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-[#4A3428] transition-colors">
                        {product.name}
                      </h3>
                      
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {product.description}
                      </p>

                      {/* Rating */}
                      {product.rating && (
                        <div className="flex items-center gap-2 mb-4">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < Math.floor(product.rating!.average)
                                    ? 'text-yellow-400 fill-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-gray-500">
                            ({product.rating.count})
                          </span>
                        </div>
                      )}

                      {/* Price */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold text-gray-900">
                            {product.price} kr
                          </span>
                          {product.compareAtPrice && (
                            <span className="text-lg text-gray-500 line-through">
                              {product.compareAtPrice} kr
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Add to Cart Button */}
                      <button
                        onClick={() => addToCart({
                          ...product,
                          tags: [],
                          images: [{ url: product.image, alt: product.name, position: 0 }],
                          variants: [],
                          inventory: 100,
                          trackInventory: false,
                          allowBackorder: true,
                          isActive: true,
                          isFeatured: product.featured,
                          seoKeywords: [],
                          keyIngredients: [],
                          skinConcerns: [],
                          timeOfDay: undefined,
                          benefitsDetails: [],
                          ingredientsDetails: [],
                          imagesData: [],
                          rating: product.rating || { average: 0, count: 0 },
                          createdAt: new Date().toISOString(),
                          updatedAt: new Date().toISOString()
                        })}
                        className="w-full bg-[#4A3428] text-white py-3 rounded-xl font-medium hover:bg-[#3A2418] transition-colors flex items-center justify-center gap-2 group"
                      >
                        <ShoppingBag className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        Lägg i varukorg
                      </button>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Newsletter Signup */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mt-16 bg-gradient-to-r from-[#4A3428] to-[#3A2418] rounded-2xl p-8 text-center text-white"
          >
            <Sparkles className="w-12 h-12 mx-auto mb-4 text-white/80" />
            <h3 className="text-2xl font-bold mb-2">Missa inte våra nyheter</h3>
            <p className="text-white/80 mb-6">
              Prenumerera på vårt nyhetsbrev för exklusiva erbjudanden och hudvårdstips
            </p>
            <div className="max-w-md mx-auto flex gap-4">
              <input
                type="email"
                placeholder="Din e-postadress"
                className="flex-1 px-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
              />
              <button className="bg-white text-[#4A3428] px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors">
                Prenumerera
              </button>
            </div>
          </motion.div>

          {/* Quiz CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-8 text-center"
          >
            <Link
              href="/quiz"
              className="inline-flex items-center gap-2 bg-white border-2 border-[#4A3428] text-[#4A3428] px-8 py-4 rounded-xl font-medium hover:bg-[#4A3428] hover:text-white transition-all duration-300 shadow-lg"
            >
              <Sparkles className="w-5 h-5" />
              Gör vår hudanalys
            </Link>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  )
} 