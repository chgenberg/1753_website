'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { JudgeMeWidget } from '@/components/reviews/JudgeMeWidget'
import { Filter, ChevronDown } from 'lucide-react'
import { generatePageSEO } from '@/lib/seo-utils'
import type { Metadata } from 'next'

// Mock products data - replace with real data later
const mockProducts = [
  {
    id: '1',
    name: 'THE ONE - Ansiktsolja',
    slug: 'the-one-ansiktsolja',
    description: 'Vår populäraste ansiktsolja med CBD och CBG för alla hudtyper',
    price: 899,
    compareAtPrice: 1099,
    image: '/images/products/TheONE.png',
    category: 'ansiktsolja',
    skinTypes: ['alla'],
    featured: true,
    bestseller: true,
    newProduct: false
  },
  {
    id: '2', 
    name: 'NATUREL - Ansiktsolja',
    slug: 'naturel-ansiktsolja',
    description: 'Mild ansiktsolja för känslig hud med naturliga ingredienser',
    price: 799,
    image: '/images/products/Naturel.png',
    category: 'ansiktsolja',
    skinTypes: ['känslig'],
    featured: true,
    bestseller: false,
    newProduct: false
  },
  {
    id: '3',
    name: 'TA-DA - Ansiktsolja',
    slug: 'ta-da-ansiktsolja',
    description: 'Kraftfull ansiktsolja för problematisk hud',
    price: 899,
    image: '/images/products/TA-DA.png',
    category: 'ansiktsolja',
    skinTypes: ['problematisk'],
    featured: false,
    bestseller: false,
    newProduct: true
  },
  {
    id: '4',
    name: 'FUNGTASTIC - Svampextrakt',
    slug: 'fungtastic-svampextrakt',
    description: 'Kraftfulla medicinska svampar för hud och hälsa',
    price: 699,
    image: '/images/products/Fungtastic.png',
    category: 'kosttillskott',
    skinTypes: ['alla'],
    featured: true,
    bestseller: false,
    newProduct: false
  },
  {
    id: '5',
    name: 'I LOVE - Hudvårdskit',
    slug: 'i-love-hudvardskit',
    description: 'Komplett hudvårdskit för nybörjare',
    price: 1499,
    compareAtPrice: 1799,
    image: '/images/products/ILOVE.png',
    category: 'kit',
    skinTypes: ['alla'],
    featured: true,
    bestseller: true,
    newProduct: false
  },
  {
    id: '6',
    name: 'DUO - Hudvårdskit',
    slug: 'duo-hudvardskit',
    description: 'Perfekt kombination för optimal hudvård',
    price: 1299,
    image: '/images/products/DUO.png',
    category: 'kit',
    skinTypes: ['alla'],
    featured: false,
    bestseller: false,
    newProduct: false
  }
]

const categories = [
  { value: 'alla', label: 'Alla produkter' },
  { value: 'ansiktsolja', label: 'Ansiktsolja' },
  { value: 'kit', label: 'Hudvårdskit' },
  { value: 'kosttillskott', label: 'Kosttillskott' }
]

const skinTypes = [
  { value: 'alla', label: 'Alla hudtyper' },
  { value: 'känslig', label: 'Känslig hud' },
  { value: 'problematisk', label: 'Problematisk hud' }
]

export default function ProductsPage() {
  const [selectedCategory, setSelectedCategory] = useState('alla')
  const [selectedSkinType, setSelectedSkinType] = useState('alla')
  const [sortBy, setSortBy] = useState('featured')
  const [showFilters, setShowFilters] = useState(false)

  // Filter products
  const filteredProducts = mockProducts.filter(product => {
    const categoryMatch = selectedCategory === 'alla' || product.category === selectedCategory
    const skinTypeMatch = selectedSkinType === 'alla' || product.skinTypes.includes(selectedSkinType) || product.skinTypes.includes('alla')
    return categoryMatch && skinTypeMatch
  }).sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price
      case 'price-high':
        return b.price - a.price
      case 'name':
        return a.name.localeCompare(b.name)
      case 'featured':
      default:
        if (a.featured && !b.featured) return -1
        if (!a.featured && b.featured) return 1
        if (a.bestseller && !b.bestseller) return -1
        if (!a.bestseller && b.bestseller) return 1
        return 0
    }
  })

  return (
    <>
      <Header />
      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative h-[40vh] min-h-[400px] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-black to-gray-900"></div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative z-10 text-center text-white px-4"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-4">Våra Produkter</h1>
            <p className="text-xl md:text-2xl max-w-2xl mx-auto">
              Upptäck kraften i CBD & CBG för din hud
            </p>
          </motion.div>
        </section>

        {/* Filter Bar */}
        <section className="sticky top-20 z-40 bg-white shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-4 w-full md:w-auto">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Filter className="w-5 h-5" />
                  <span>Filter</span>
                  {(selectedCategory !== 'alla' || selectedSkinType !== 'alla') && (
                    <span className="bg-[#00937c] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {[selectedCategory !== 'alla', selectedSkinType !== 'alla'].filter(Boolean).length}
                    </span>
                  )}
                </button>
                
                <div className="text-sm text-gray-600">
                  {filteredProducts.length} produkter
                </div>
              </div>

              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
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
                      {categories.map((cat) => (
                        <button
                          key={cat.value}
                          onClick={() => setSelectedCategory(cat.value)}
                          className={`px-4 py-2 rounded-full transition-all ${
                            selectedCategory === cat.value
                              ? 'bg-[#00937c] text-white'
                              : 'bg-gray-100 hover:bg-gray-200'
                          }`}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Skin Types */}
                  <div>
                    <h3 className="font-semibold mb-3">Hudtyp</h3>
                    <div className="flex flex-wrap gap-2">
                      {skinTypes.map((type) => (
                        <button
                          key={type.value}
                          onClick={() => setSelectedSkinType(type.value)}
                          className={`px-4 py-2 rounded-full transition-all ${
                            selectedSkinType === type.value
                              ? 'bg-[#00937c] text-white'
                              : 'bg-gray-100 hover:bg-gray-200'
                          }`}
                        >
                          {type.label}
                        </button>
                      ))}
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
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div 
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                whileHover={{ y: -5 }}
                className="group"
              >
                <Link href={`/products/${product.slug}`}>
                  <div className="bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl cursor-pointer">
                    {/* Image Container */}
                    <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-green-50 to-emerald-50">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      
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
                        {product.compareAtPrice && (
                          <span className="bg-yellow-500 text-white text-xs px-3 py-1 rounded-full">
                            {Math.round((1 - product.price / product.compareAtPrice) * 100)}% rabatt
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="p-6">
                      <div className="mb-2">
                        <span className="text-xs text-gray-500 uppercase tracking-wider">
                          {categories.find(c => c.value === product.category)?.label}
                        </span>
                      </div>
                      
                      <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                        {product.name}
                      </h3>
                      
                      {/* Star Rating */}
                      <div className="mb-2">
                        <JudgeMeWidget
                          shopDomain={process.env.NEXT_PUBLIC_JUDGE_ME_SHOP_DOMAIN || '1753skincare.myshopify.com'}
                          productHandle={product.slug}
                          widgetType="preview-badge"
                          className="text-sm"
                        />
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {product.description}
                      </p>

                      {/* Price */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold text-[#00937c]">
                            {product.price} kr
                          </span>
                          {product.compareAtPrice && (
                            <span className="text-sm text-gray-400 line-through">
                              {product.compareAtPrice} kr
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Add to Cart Button */}
                      <button 
                        className="w-full mt-4 bg-[#00937c] text-white py-2 px-4 rounded-lg hover:bg-[#007363] transition-colors duration-300"
                        onClick={(e) => e.preventDefault()}
                      >
                        Lägg i varukorg
                      </button>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>

          {filteredProducts.length === 0 && (
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
          )}
        </section>
      </main>
      <Footer />
    </>
  )
} 