'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { JudgeMeWidget } from '@/components/reviews/JudgeMeWidget'
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

const skinTypeTranslations: Record<string, string> = {
  'alla': 'Alla hudtyper',
  'torr': 'Torr hud',
  'fet': 'Fet hud',
  'kombinerad': 'Kombinerad hud',
  'känslig': 'Känslig hud',
  'normal': 'Normal hud',
  'problematisk': 'Problematisk hud',
  'mogen': 'Mogen hud'
}

export default function ProductsPage() {
  const { addToCart } = useCart()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('alla')
  const [selectedSkinType, setSelectedSkinType] = useState<string>('alla')
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002'}/api/products`)
      const data = await response.json()
      
      if (data.success) {
        // Transform API products to match our interface and filter out store products
        const transformedProducts: Product[] = data.data
          .filter((p: any) => p.category !== 'Store') // Remove store review products
          .map((p: any) => ({
            id: p.id,
            name: p.name,
            slug: p.slug,
            description: p.description || p.shortDescription || '',
            price: p.price,
            compareAtPrice: p.compareAtPrice,
            image: p.images?.[0] || '/images/products/default.png',
            category: p.category?.toLowerCase() || 'hudvård',
            skinTypes: p.skinTypes?.length > 0 ? p.skinTypes : ['alla'],
            featured: p.isFeatured || false,
            bestseller: p.tags?.includes('bestseller') || false,
            newProduct: p.tags?.includes('new') || false,
            rating: p.rating || { average: 0, count: 0 }
          }))
        
        setProducts(transformedProducts)
        setFilteredProducts(transformedProducts)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
      setProducts([])
      setFilteredProducts([])
    } finally {
      setLoading(false)
    }
  }

  const toggleFavorite = (productId: string) => {
    const newFavorites = favorites.includes(productId)
      ? favorites.filter(id => id !== productId)
      : [...favorites, productId]
    
    setFavorites(newFavorites)
    localStorage.setItem('favorites', JSON.stringify(newFavorites))
  }

  const handleFilter = (filterType: string | null) => {
    setActiveFilter(filterType)
    
    if (filterType === null) {
      setFilteredProducts(products)
    } else if (filterType === 'bestseller') {
      setFilteredProducts(products.filter(p => p.bestseller))
    } else if (filterType === 'new') {
      setFilteredProducts(products.filter(p => p.newProduct))
    }
  }

  // Filter products
  const applyFilters = () => {
    let currentFiltered = products

    if (activeFilter === 'bestseller') {
      currentFiltered = currentFiltered.filter(p => p.bestseller)
    } else if (activeFilter === 'new') {
      currentFiltered = currentFiltered.filter(p => p.newProduct)
    }

    if (selectedCategory !== 'alla') {
      currentFiltered = currentFiltered.filter(product => product.category === selectedCategory)
    }

    if (selectedSkinType !== 'alla') {
      currentFiltered = currentFiltered.filter(product => product.skinTypes.includes(selectedSkinType) || product.skinTypes.includes('alla'))
    }

    setFilteredProducts(currentFiltered)
  }

  useEffect(() => {
    applyFilters()
  }, [selectedCategory, selectedSkinType, products, activeFilter])

  const sortProducts = () => {
    let sorted = [...filteredProducts]

    switch (sortBy) {
      case 'price-low':
        sorted.sort((a, b) => a.price - b.price)
        break
      case 'price-high':
        sorted.sort((a, b) => b.price - a.price)
        break
      case 'name':
        sorted.sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'featured':
      default:
        // Custom order for all products
        const customOrder = [
          'duo-kit-ta-da-serum',
          'duo-kit-the-one-i-love', 
          'ta-da-serum',
          'au-naturel-makeup-remover',
          'fungtastic-mushroom-extract',
          'i-love-facial-oil',
          'the-one-facial-oil'
        ]
        
        sorted.sort((a, b) => {
          const aIndex = customOrder.indexOf(a.slug)
          const bIndex = customOrder.indexOf(b.slug)
          
          // If both products are in custom order, sort by custom order
          if (aIndex !== -1 && bIndex !== -1) {
            return aIndex - bIndex
          }
          
          // If only a is in custom order, a comes first
          if (aIndex !== -1 && bIndex === -1) return -1
          
          // If only b is in custom order, b comes first
          if (aIndex === -1 && bIndex !== -1) return 1
          
          // If neither is in custom order, fall back to featured/bestseller logic
          if (a.featured && !b.featured) return -1
          if (!a.featured && b.featured) return 1
          if (a.bestseller && !b.bestseller) return -1
          if (!a.bestseller && b.bestseller) return 1
          return 0
        })
        break
    }
    setFilteredProducts(sorted)
  }

  useEffect(() => {
    sortProducts()
  }, [sortBy])

  return (
    <>
      <Header />
      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative py-16 md:py-24 bg-gradient-to-b from-[#F5F3F0] to-white overflow-hidden">
          <div className="absolute inset-0 z-0">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#E5DDD5]/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#D5CCC4]/20 rounded-full blur-3xl"></div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <div className="flex items-center justify-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-[#8B7355]" />
                <span className="text-[#8B7355] font-medium">CBD-BERIKAD HUDVÅRD</span>
                <Sparkles className="w-5 h-5 text-[#8B7355]" />
              </div>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight text-[#4A3428]">
                VÅRA PRODUKTER
              </h1>
              <p className="text-lg md:text-xl text-[#6B5D54] max-w-3xl mx-auto">
                Upptäck kraften i naturlig hudvård med våra noggrant utvalda 
                CBD- och CBG-berikade produkter
              </p>
            </motion.div>
          </div>
        </section>

        {/* Filter Bar */}
        <section className="sticky top-28 z-30 bg-white/90 backdrop-blur-lg border-b border-[#E5DDD5]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto">
                {/* Filter Pills */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#F5F3F0] hover:bg-[#E5DDD5] rounded-full font-medium transition-all whitespace-nowrap text-[#4A3428]"
                >
                  <Filter className="w-4 h-4" />
                  <span>FILTER</span>
                  {(selectedCategory !== 'alla' || selectedSkinType !== 'alla') && (
                    <span className="bg-[#4A3428] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {[selectedCategory !== 'alla', selectedSkinType !== 'alla'].filter(Boolean).length}
                    </span>
                  )}
                </motion.button>
                
                <div className="h-6 w-px bg-[#E5DDD5]"></div>
                
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleFilter(null)}
                    className={`px-5 py-2.5 rounded-full font-medium transition-all ${
                      activeFilter === null 
                        ? 'bg-[#4A3428] text-white' 
                        : 'bg-[#F5F3F0] hover:bg-[#E5DDD5] text-[#4A3428]'
                    }`}
                  >
                    ALLA
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleFilter('bestseller')}
                    className={`px-5 py-2.5 rounded-full font-medium transition-all ${
                      activeFilter === 'bestseller' 
                        ? 'bg-[#4A3428] text-white' 
                        : 'bg-[#F5F3F0] hover:bg-[#E5DDD5] text-[#4A3428]'
                    }`}
                  >
                    BESTSELLERS
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleFilter('new')}
                    className={`px-5 py-2.5 rounded-full font-medium transition-all ${
                      activeFilter === 'new' 
                        ? 'bg-[#4A3428] text-white' 
                        : 'bg-[#F5F3F0] hover:bg-[#E5DDD5] text-[#4A3428]'
                    }`}
                  >
                    NYTT
                  </motion.button>
                </div>
              </div>

              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'featured' | 'price-low' | 'price-high' | 'name')}
                  className="appearance-none bg-white border border-[#E5DDD5] rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-[#8B7355] text-[#4A3428]"
                >
                  <option value="featured">Utvalda först</option>
                  <option value="name">Namn A-Ö</option>
                  <option value="price-low">Pris: Låg till hög</option>
                  <option value="price-high">Pris: Hög till låg</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#8B7355] pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Expandable Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="border-t border-[#E5DDD5] overflow-hidden bg-[#FAFAF9]"
              >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Categories */}
                    <div>
                      <h3 className="font-semibold mb-3 text-[#4A3428]">Kategori</h3>
                      <div className="flex flex-wrap gap-2">
                        {products.length > 0 && (
                          <>
                            <button
                              onClick={() => setSelectedCategory('alla')}
                              className={`px-4 py-2 rounded-full transition-all ${
                                selectedCategory === 'alla'
                                  ? 'bg-[#4A3428] text-white'
                                  : 'bg-white hover:bg-[#F5F3F0] text-[#4A3428] border border-[#E5DDD5]'
                              }`}
                            >
                              Alla produkter
                            </button>
                            {Array.from(new Set(products.map(p => p.category))).map(category => (
                              <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`px-4 py-2 rounded-full transition-all ${
                                  selectedCategory === category
                                    ? 'bg-[#4A3428] text-white'
                                    : 'bg-white hover:bg-[#F5F3F0] text-[#4A3428] border border-[#E5DDD5]'
                                }`}
                              >
                                {category.charAt(0).toUpperCase() + category.slice(1)}
                              </button>
                            ))}
                          </>
                        )}
                      </div>
                    </div>

                    {/* Skin Types */}
                    <div>
                      <h3 className="font-semibold mb-3 text-[#4A3428]">Hudtyp</h3>
                      <div className="flex flex-wrap gap-2">
                        {products.length > 0 && (
                          <>
                            <button
                              onClick={() => setSelectedSkinType('alla')}
                              className={`px-4 py-2 rounded-full transition-all ${
                                selectedSkinType === 'alla'
                                  ? 'bg-[#4A3428] text-white'
                                  : 'bg-white hover:bg-[#F5F3F0] text-[#4A3428] border border-[#E5DDD5]'
                              }`}
                            >
                              Alla hudtyper
                            </button>
                            {Array.from(new Set(products.flatMap(p => p.skinTypes))).map(type => (
                              <button
                                key={type}
                                onClick={() => setSelectedSkinType(type)}
                                className={`px-4 py-2 rounded-full transition-all ${
                                  selectedSkinType === type
                                    ? 'bg-[#4A3428] text-white'
                                    : 'bg-white hover:bg-[#F5F3F0] text-[#4A3428] border border-[#E5DDD5]'
                                }`}
                              >
                                {skinTypeTranslations[type] || type}
                              </button>
                            ))}
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Clear Filters */}
                  {(selectedCategory !== 'alla' || selectedSkinType !== 'alla') && (
                    <button
                      onClick={() => {
                        setSelectedCategory('alla')
                        setSelectedSkinType('alla')
                      }}
                      className="mt-4 text-sm text-[#8B7355] hover:text-[#6B5D54] underline"
                    >
                      Rensa alla filter
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Products Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-12 h-12 border-3 border-[#8B7355] border-t-transparent rounded-full"
              />
              <p className="text-[#6B5D54] text-lg mt-4">Laddar produkter...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-[#6B5D54] text-lg">Inga produkter hittades med valda filter.</p>
              <button
                onClick={() => {
                  setSelectedCategory('alla')
                  setSelectedSkinType('alla')
                  setActiveFilter(null)
                }}
                className="mt-4 text-[#8B7355] hover:text-[#6B5D54] underline"
              >
                Rensa filter
              </button>
            </div>
          ) : (
            <motion.div 
              layout
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  onMouseEnter={() => setHoveredProduct(product.id)}
                  onMouseLeave={() => setHoveredProduct(null)}
                  className="group"
                >
                  <div className="relative bg-white rounded-2xl overflow-hidden transition-all duration-500 hover:shadow-xl border border-[#E5DDD5] h-full flex flex-col">
                    {/* Image Container - Fixed Height */}
                    <div className="relative h-80 overflow-hidden bg-gradient-to-b from-[#FAFAF9] to-white">
                      <Link href={`/products/${product.slug}`}>
                        <motion.div
                          animate={{
                            scale: hoveredProduct === product.id ? 1.05 : 1
                          }}
                          transition={{ duration: 0.6 }}
                          className="relative w-full h-full cursor-pointer"
                        >
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            className="object-contain p-6"
                          />
                        </motion.div>
                      </Link>
                      
                      {/* Badges */}
                      <div className="absolute top-4 left-4 flex flex-col gap-2">
                        {product.bestseller && (
                          <motion.span
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-[#4A3428] text-white text-xs px-3 py-1.5 rounded-full font-medium"
                          >
                            BESTSELLER
                          </motion.span>
                        )}
                        {product.newProduct && (
                          <motion.span
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-[#8B7355] text-white text-xs px-3 py-1.5 rounded-full font-medium"
                          >
                            NYHET
                          </motion.span>
                        )}
                      </div>

                      {/* Favorite Button */}
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => toggleFavorite(product.id)}
                        className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-shadow"
                      >
                        <Heart 
                          className={`w-5 h-5 transition-colors ${
                            favorites.includes(product.id) 
                              ? 'fill-red-500 text-red-500' 
                              : 'text-[#6B5D54]'
                          }`}
                        />
                      </motion.button>

                      {/* Quick Actions - Show on Hover */}
                      <AnimatePresence>
                        {hoveredProduct === product.id && (
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="absolute bottom-4 left-4 right-4 flex gap-2"
                          >
                            <Link href={`/products/${product.slug}`} className="flex-1">
                              <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full bg-white/90 backdrop-blur-sm text-[#4A3428] py-3 rounded-lg font-medium hover:bg-white transition-colors flex items-center justify-center gap-2 shadow-lg"
                              >
                                <Eye className="w-4 h-4" />
                                Visa detaljer
                              </motion.button>
                            </Link>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Product Info - Fixed Layout */}
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="mb-2">
                        <span className="text-xs text-[#8B7355] font-medium tracking-wider uppercase">
                          {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
                        </span>
                      </div>
                      
                      <h3 className="font-semibold text-lg mb-2 text-[#4A3428] line-clamp-2">
                        {product.name}
                      </h3>
                      
                      <p className="text-[#6B5D54] text-sm mb-4 line-clamp-2 flex-1">
                        {product.description}
                      </p>

                      {/* Rating */}
                      {product.rating && product.rating.count > 0 && (
                        <div className="flex items-center gap-2 mb-4">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < Math.round(product.rating!.average)
                                    ? 'fill-[#F5C842] text-[#F5C842]'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-[#6B5D54]">
                            ({product.rating.count})
                          </span>
                        </div>
                      )}

                      {/* Price */}
                      <div className="flex items-baseline gap-2 mb-4">
                        <span className="text-2xl font-bold text-[#4A3428]">
                          {product.price} kr
                        </span>
                        {product.compareAtPrice && (
                          <span className="text-sm text-[#8B7355] line-through">
                            {product.compareAtPrice} kr
                          </span>
                        )}
                      </div>

                      {/* Add to Cart Button */}
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={(e) => {
                          e.preventDefault()
                          // Create a simplified product object for cart
                          const cartProduct = {
                            id: product.id,
                            name: product.name,
                            slug: product.slug,
                            description: product.description,
                            longDescription: product.description,
                            price: product.price,
                            compareAtPrice: product.compareAtPrice,
                            images: [{
                              id: 'img-1',
                              url: product.image,
                              alt: product.name,
                              position: 0
                            }],
                            variants: [],
                            category: { name: product.category, slug: product.category },
                            tags: [],
                            ingredients: [],
                            skinTypes: product.skinTypes,
                            benefits: [],
                            howToUse: '',
                            featured: product.featured,
                            bestseller: product.bestseller,
                            newProduct: product.newProduct,
                            saleProduct: false,
                            inventory: {
                              quantity: 100,
                              sku: product.slug,
                              trackQuantity: false
                            },
                            seo: {
                              title: product.name,
                              description: product.description,
                              keywords: []
                            },
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString()
                          }
                          addToCart(cartProduct as any, 1)
                        }}
                        className="w-full bg-[#4A3428] text-white py-3 rounded-lg font-medium hover:bg-[#3A2A1E] transition-colors flex items-center justify-center gap-2"
                      >
                        <ShoppingBag className="w-4 h-4" />
                        Lägg i varukorg
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </section>

        {/* Newsletter Section */}
        <section className="bg-gradient-to-b from-white to-[#F5F3F0] py-16">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4 text-[#4A3428]">
              Missa inte våra nyheter
            </h2>
            <p className="text-[#6B5D54] mb-8">
              Prenumerera på vårt nyhetsbrev för exklusiva erbjudanden och hudvårdstips
            </p>
            <Link href="/quiz">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-[#8B7355] text-white px-8 py-4 rounded-full font-medium hover:bg-[#6B5D54] transition-colors"
              >
                Gör vår hudanalys
              </motion.button>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
} 