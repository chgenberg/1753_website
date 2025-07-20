'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { JudgeMeWidget } from '@/components/reviews/JudgeMeWidget'
import { useCart } from '@/contexts/CartContext'
import { Filter, ChevronDown, ShoppingBag, Star } from 'lucide-react'
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

  useEffect(() => {
    fetchProducts()
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

  const handleFilter = (filterType: string | null) => {
    setActiveFilter(filterType)
    // Logic to apply filter will go here
  }

  // Filter products
  const applyFilters = () => {
    let currentFiltered = products

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
  }, [selectedCategory, selectedSkinType, products])

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
        sorted.sort((a, b) => {
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
  }, [sortBy, filteredProducts])

  return (
    <>
      <Header />
      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative py-24 bg-white overflow-hidden">
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-50/50"></div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tighter">VÅRA PRODUKTER</h1>
              <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto font-light">
                Upptäck vårt utvalda sortiment av CBD-berikade hudvårdsprodukter
              </p>
            </motion.div>
          </div>
        </section>

        {/* Filter Bar - Minimalist Apple Style */}
        <section className="sticky top-20 z-40 bg-white/80 backdrop-blur-lg border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto">
                {/* Filter Pills */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-full font-medium transition-all whitespace-nowrap"
                >
                  <Filter className="w-4 h-4" />
                  <span>FILTER</span>
                  {(selectedCategory !== 'alla' || selectedSkinType !== 'alla') && (
                    <span className="bg-[#00937c] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {[selectedCategory !== 'alla', selectedSkinType !== 'alla'].filter(Boolean).length}
                    </span>
                  )}
                </motion.button>
                
                <div className="h-6 w-px bg-gray-200"></div>
                
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleFilter(null)}
                    className={`px-5 py-2.5 rounded-full font-medium transition-all ${
                      activeFilter === null 
                        ? 'bg-black text-white' 
                        : 'bg-gray-100 hover:bg-gray-200'
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
                        ? 'bg-black text-white' 
                        : 'bg-gray-100 hover:bg-gray-200'
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
                        ? 'bg-black text-white' 
                        : 'bg-gray-100 hover:bg-gray-200'
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
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-[#00937c]"
                >
                  <option value="featured">Utvalda först</option>
                  <option value="name">Namn A-Ö</option>
                  <option value="price-low">Pris: Låg till hög</option>
                  <option value="price-high">Pris: Hög till låg</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Expandable Filters */}
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-gray-200 overflow-hidden"
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Categories */}
                  <div>
                    <h3 className="font-semibold mb-3">Kategori</h3>
                    <div className="flex flex-wrap gap-2">
                      {products.length > 0 && (
                        <>
                          <button
                            onClick={() => setSelectedCategory('alla')}
                            className={`px-4 py-2 rounded-full transition-all ${
                              selectedCategory === 'alla'
                                ? 'bg-[#00937c] text-white'
                                : 'bg-gray-100 hover:bg-gray-200'
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
                                  ? 'bg-[#00937c] text-white'
                                  : 'bg-gray-100 hover:bg-gray-200'
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
                    <h3 className="font-semibold mb-3">Hudtyp</h3>
                    <div className="flex flex-wrap gap-2">
                      {products.length > 0 && (
                        <>
                          <button
                            onClick={() => setSelectedSkinType('alla')}
                            className={`px-4 py-2 rounded-full transition-all ${
                              selectedSkinType === 'alla'
                                ? 'bg-[#00937c] text-white'
                                : 'bg-gray-100 hover:bg-gray-200'
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
                                  ? 'bg-[#00937c] text-white'
                                  : 'bg-gray-100 hover:bg-gray-200'
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
                    className="mt-4 text-sm text-gray-600 hover:text-gray-800 underline"
                  >
                    Rensa alla filter
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </section>

        {/* Products Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {loading ? (
            <div className="text-center py-20">
              <p className="text-gray-500 text-lg">Laddar produkter...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-500 text-lg">Inga produkter hittades med valda filter.</p>
              <button
                onClick={() => {
                  setSelectedCategory('alla')
                  setSelectedSkinType('alla')
                }}
                className="mt-4 text-[#00937c] hover:text-[#007363] underline"
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
                  whileHover={{ y: -8 }}
                  className="group"
                >
                  <Link href={`/products/${product.slug}`}>
                    <div className="relative bg-white rounded-3xl overflow-hidden transition-all duration-500 hover:shadow-2xl cursor-pointer">
                      {/* Image Container - Minimalist Style */}
                      <div className="relative aspect-[4/5] overflow-hidden bg-gradient-to-b from-gray-50 to-white">
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.6 }}
                          className="relative w-full h-full"
                        >
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            className="object-contain p-8"
                          />
                        </motion.div>
                        
                        {/* Minimal Badges */}
                        <div className="absolute top-6 left-6 flex flex-col gap-2">
                          {product.bestseller && (
                            <motion.span
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="bg-black text-white text-xs px-4 py-2 rounded-full font-medium"
                            >
                              BESTSELLER
                            </motion.span>
                          )}
                          {product.newProduct && (
                            <motion.span
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.1 }}
                              className="bg-[#00937c] text-white text-xs px-4 py-2 rounded-full font-medium"
                            >
                              NYHET
                            </motion.span>
                          )}
                        </div>

                        {/* Quick View on Hover */}
                        <motion.div
                          initial={{ opacity: 0 }}
                          whileHover={{ opacity: 1 }}
                          className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        >
                          <span className="text-white font-medium px-6 py-3 bg-white/20 backdrop-blur-sm rounded-full">
                            SE PRODUKT
                          </span>
                        </motion.div>
                      </div>

                      {/* Product Info - Clean Typography */}
                      <div className="p-8">
                                                 <div className="mb-3">
                           <span className="text-xs text-gray-500 font-medium tracking-[0.1em] uppercase">
                             {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
                           </span>
                         </div>
                        
                        <h3 className="font-semibold text-xl mb-3 tracking-tight">
                          {product.name}
                        </h3>
                        
                        <p className="text-gray-600 mb-6 line-clamp-2 font-light">
                          {product.description}
                        </p>

                        {/* Price - Bold and Clear */}
                        <div className="flex items-baseline gap-3">
                          <span className="text-2xl font-bold">
                            {product.price} kr
                          </span>
                          {product.compareAtPrice && (
                            <span className="text-lg text-gray-400 line-through">
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
                          className="mt-6 w-full bg-black text-white py-4 rounded-full font-medium hover:bg-gray-900 transition-colors"
                        >
                          LÄGG I VARUKORG
                        </motion.button>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </section>
      </main>
      <Footer />
    </>
  )
} 