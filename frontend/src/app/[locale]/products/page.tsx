'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { useCart } from '@/contexts/CartContext'
import { Filter, ChevronDown, ShoppingBag, Star, Heart, Eye, Sparkles, Package } from 'lucide-react'
import { useTranslations } from 'next-intl'

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
  images?: string[]
}

export default function ProductsPage() {
  const t = useTranslations()
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
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    fetchProducts()
    const savedFavorites = localStorage.getItem('favorites')
    if (savedFavorites) setFavorites(JSON.parse(savedFavorites))
  }, [])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const locale = (typeof window !== 'undefined' ? window.location.pathname.split('/')[1] : 'sv') || 'sv'
      const apiUrl = `/api/products?sort=featured&locale=${encodeURIComponent(locale)}`
      const response = await fetch(apiUrl)
      const data = await response.json()
      const productsArray = Array.isArray(data) ? data : (data.data || data.products || [])
      setProducts(productsArray)
    } catch (error) {
      console.error('Error fetching products:', error)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const safeProducts = Array.isArray(products) ? products : []
    let currentFiltered = [...safeProducts]
    if (selectedCategory !== 'alla') currentFiltered = currentFiltered.filter(product => product.category === selectedCategory)
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
        const customOrder = ['duo-kit-ta-da-serum','duo-kit-the-one-i-love','ta-da-serum','au-naturel-makeup-remover','fungtastic-mushroom-extract','i-love-facial-oil','the-one-facial-oil']
        currentFiltered.sort((a, b) => {
          const aIndex = customOrder.indexOf(a.slug)
          const bIndex = customOrder.indexOf(b.slug)
          if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex
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
    const newFavorites = favorites.includes(productId) ? favorites.filter(id => id !== productId) : [...favorites, productId]
    setFavorites(newFavorites)
    localStorage.setItem('favorites', JSON.stringify(newFavorites))
  }

  const resetFilters = () => {
    setSelectedCategory('alla')
    setActiveFilter(null)
  }

  const safeProducts = Array.isArray(products) ? products : []
  const categories = ['alla', ...Array.from(new Set(safeProducts.map(p => p.category).filter(Boolean)))]
  const categoryLabels: Record<string, string> = {
    'alla': t('productsPage.categories.all'),
    'bestseller': t('productsPage.categories.bestseller'),
    'nytt': t('productsPage.categories.new')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-20 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#FCB237] mx-auto"></div>
              <p className="mt-4 text-gray-600">{t('productsPage.loading')}</p>
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
        <div className="bg-gradient-to-b from-white to-gray-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <span className="inline-block px-4 py-2 bg-[#FCB237] text-white text-sm font-medium rounded-full mb-4">
                {t('productsPage.badgeCBD')}
              </span>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">{t('productsPage.title')}</h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">{t('productsPage.subtitle')}</p>
            </motion.div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div className="flex flex-wrap items-center gap-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Filter className="w-5 h-5 text-[#FCB237]" />
                  {t('productsPage.filter')}
                </h3>

                <div className="flex flex-wrap gap-2">
                  {categories.map(category => (
                    <button key={category} onClick={() => setSelectedCategory(category)} className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${selectedCategory === category ? 'bg-[#FCB237] text-white shadow-lg' : 'bg-white text-gray-700 border border-gray-200 hover:border-[#FCB237] hover:text-[#FCB237]'}`}>
                      {categoryLabels[category] || category.charAt(0).toUpperCase() + category.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-4">
                {selectedCategory !== 'alla' && (
                  <span className="text-sm text-gray-600">
                    {t('productsPage.activeFilters', { count: 1 })}
                  </span>
                )}

                <div className="relative">
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-[#FCB237] focus:border-transparent">
                    <option value="featured">{t('productsPage.sort.featured')}</option>
                    <option value="name">{t('productsPage.sort.name')}</option>
                    <option value="price-low">{t('productsPage.sort.priceLow')}</option>
                    <option value="price-high">{t('productsPage.sort.priceHigh')}</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>

                {selectedCategory !== 'alla' && (
                  <button onClick={resetFilters} className="text-sm text-[#FCB237] hover:text-[#E79C1A] font-medium transition-colors">
                    {t('productsPage.resetFilters')}
                  </button>
                )}
              </div>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {filteredProducts.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
                <p className="text-gray-600 text-lg">{t('productsPage.empty.title')}</p>
                <button onClick={resetFilters} className="mt-4 px-6 py-2 bg-[#FCB237] text-white rounded-lg hover:bg-[#E79C1A] transition-colors">
                  {t('productsPage.empty.showAll')}
                </button>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {filteredProducts.map((product, index) => (
                  <motion.div key={product.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: index * 0.1 }} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group relative" onMouseEnter={() => setHoveredProduct(product.id)} onMouseLeave={() => setHoveredProduct(null)}>
                    <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                      {product.featured && (<span className="bg-[#FCB237] text-white text-xs font-bold px-3 py-1 rounded-full">{t('productsPage.badges.recommended')}</span>)}
                      {product.bestseller && (<span className="bg-[#FCB237] text-white text-xs font-bold px-3 py-1 rounded-full">{t('productsPage.badges.bestseller')}</span>)}
                      {product.newProduct && (<span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">{t('productsPage.badges.new')}</span>)}
                    </div>
                    <button onClick={() => toggleFavorite(product.id)} className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all duration-200">
                      <Heart className={`w-5 h-5 transition-colors ${favorites.includes(product.id) ? 'text-red-500 fill-red-500' : 'text-gray-600 hover:text-red-500'}`} />
                    </button>
                    <div className="relative h-64 bg-gray-100 overflow-hidden">
                      {product.images && product.images.length > 0 ? (
                        <Image src={product.images[0]} alt={product.name} fill className="object-contain p-4 group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400"><Package className="w-16 h-16" /></div>
                      )}
                      <div className={`absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity duration-300 ${hoveredProduct === product.id ? 'opacity-100' : 'opacity-0'}`}>
                        <Link href={`/products/${product.slug}`} className="bg-white text-gray-900 px-6 py-2 rounded-full font-medium hover:bg-gray-100 transition-colors flex items-center gap-2">
                          <Eye className="w-4 h-4" />
                          {t('productsPage.quickView')}
                        </Link>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="mb-2"><span className="text-xs font-medium text-[#FCB237] uppercase tracking-wider">{product.category}</span></div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-[#FCB237] transition-colors">{product.name}</h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>
                      {product.rating && (
                        <div className="flex items-center gap-2 mb-4">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-4 h-4 ${i < Math.round(product.rating!.average) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                            ))}
                          </div>
                          <span className="text-sm text-gray-500">{product.rating.average.toFixed(1)} ({product.rating.count})</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold text-gray-900">{product.price} kr</span>
                          {product.compareAtPrice && (<span className="text-lg text-gray-500 line-through">{product.compareAtPrice} kr</span>)}
                        </div>
                      </div>
                      <button onClick={() => addToCart({ ...product, tags: [], images: [{ url: product.image, alt: product.name, position: 0 }], variants: [], inventory: 100, trackInventory: false, allowBackorder: true, isActive: true, isFeatured: product.featured, seoKeywords: [], keyIngredients: [], skinConcerns: [], timeOfDay: undefined, benefitsDetails: [], ingredientsDetails: [], imagesData: [], rating: product.rating || { average: 0, count: 0 }, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() })} className="w-full bg-[#FCB237] text-white py-3 rounded-xl font-medium hover:bg-[#E79C1A] transition-colors flex items-center justify-center gap-2 group">
                        <ShoppingBag className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        {t('productsPage.addToCart')}
                      </button>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="mt-16 bg-gradient-to-r from-[#FCB237] to-[#E79C1A] rounded-2xl p-8 text-center text-white">
            <Sparkles className="w-12 h-12 mx-auto mb-4 text-white/80" />
            <h3 className="text-2xl font-bold mb-2">{t('productsPage.newsletter.title')}</h3>
            <p className="text-white/80 mb-6">{t('productsPage.newsletter.description')}</p>
            <div className="max-w-md mx-auto flex gap-4">
              <input type="email" placeholder={t('productsPage.newsletter.placeholderEmail')} className="flex-1 px-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white" />
              <button className="bg-white text-[#FCB237] px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors">{t('productsPage.newsletter.subscribe')}</button>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }} className="mt-8 text-center">
            <Link href="/quiz" className="inline-flex items-center gap-2 bg-white border-2 border-[#FCB237] text-[#FCB237] px-8 py-4 rounded-xl font-medium hover:bg-[#FCB237] hover:text-white transition-all duration-300 shadow-lg">
              <Sparkles className="w-5 h-5" />
              {t('productsPage.quizCta')}
            </Link>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  )
} 