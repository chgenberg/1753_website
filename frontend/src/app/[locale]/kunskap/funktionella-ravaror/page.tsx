'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { ChevronDown, ChevronUp, ChevronRight, Leaf, Heart, Brain, Shield, Sparkles, Apple } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface RawMaterial {
  id: string
  name: string
  swedishName: string
  category: string
  origin: string
  slug: string
  description: string
  thumbnail?: string
  healthBenefits?: string[]
  nutrients?: string[]
}

// Temporary data until we fetch from API
const rawMaterials = [
  {
    id: '1',
    name: 'Blueberry',
    swedishName: 'Blåbär',
    category: 'berry',
    origin: 'Nordisk',
    slug: 'blabar',
    description: 'Rika på antocyaniner som motverkar oxidativ stress',
    thumbnail: '/images/raw-materials/blueberry.jpg'
  },
  {
    id: '2',
    name: 'Lingonberry',
    swedishName: 'Lingon',
    category: 'berry',
    origin: 'Nordisk',
    slug: 'lingon',
    description: 'Antiinflammatorisk verkan som gynnar hudhälsan',
    thumbnail: '/images/raw-materials/lingonberry.jpg'
  },
  {
    id: '3',
    name: 'Sea Buckthorn',
    swedishName: 'Havtorn',
    category: 'berry',
    origin: 'Nordisk/Asiatisk',
    slug: 'havtorn',
    description: 'Omega-7 för starkare hudbarriär',
    thumbnail: '/images/raw-materials/sea-buckthorn.jpg'
  },
  {
    id: '4',
    name: 'Green Tea',
    swedishName: 'Grönt te',
    category: 'tea',
    origin: 'Asiatisk',
    slug: 'gront-te',
    description: 'Katechiner som skyddar mot UV-stress',
    thumbnail: '/images/raw-materials/green-tea.jpg'
  },
  {
    id: '5',
    name: 'Turmeric',
    swedishName: 'Gurkmeja',
    category: 'herb',
    origin: 'Asiatisk',
    slug: 'gurkmeja',
    description: 'Curcumin som dämpar hudinflammation',
    thumbnail: '/images/raw-materials/turmeric.jpg'
  },
  {
    id: '6',
    name: 'Kimchi',
    swedishName: 'Kimchi',
    category: 'fermented',
    origin: 'Asiatisk',
    slug: 'kimchi',
    description: 'Probiotika för balanserad gut-skin-axel',
    thumbnail: '/images/raw-materials/kimchi.jpg'
  }
]

const categories = [
  { id: 'all', name: 'Alla', icon: <Leaf className="w-4 h-4" /> },
  { id: 'berry', name: 'Bär', icon: <Heart className="w-4 h-4" /> },
  { id: 'fermented', name: 'Fermenterat', icon: <Brain className="w-4 h-4" /> },
  { id: 'herb', name: 'Örter', icon: <Shield className="w-4 h-4" /> },
]

export default function FunctionalRawMaterialsPage() {
  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchRawMaterials()
  }, [selectedCategory])

  const fetchRawMaterials = async () => {
    try {
      setLoading(true)
      const params = selectedCategory !== 'all' ? `?category=${selectedCategory}` : ''
      const response = await fetch(`/api/raw-materials${params}`)
      
      if (response.ok) {
        const data = await response.json()
        setRawMaterials(data)
      } else {
        console.error('Failed to fetch raw materials')
        // Fallback to empty array
        setRawMaterials([])
      }
    } catch (error) {
      console.error('Error fetching raw materials:', error)
      setRawMaterials([])
    } finally {
      setLoading(false)
    }
  }

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId)
  }

  const toggleExpanded = (materialId: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev)
      if (newSet.has(materialId)) {
        newSet.delete(materialId)
      } else {
        newSet.add(materialId)
      }
      return newSet
    })
  }
  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 pt-24">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-amber-50 to-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-light text-gray-900 mb-6">
              Funktionella Råvaror för Hudhälsa
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Upptäck kraften i naturens råvaror som arbetar via gut-skin-axeln för att 
              förbättra din hudhälsa inifrån och ut. Baserat på vetenskaplig forskning.
            </p>
            
            {/* Category Filter */}
            <div className="flex flex-wrap justify-center gap-3 mb-12">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryChange(category.id)}
                  className={`flex items-center gap-2 px-6 py-3 border rounded-full transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-amber-500 text-white border-amber-500'
                      : 'bg-white border-gray-200 hover:border-amber-500 hover:bg-amber-50'
                  }`}
                >
                  {category.icon}
                  <span>{category.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Raw Materials Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl shadow-sm overflow-hidden animate-pulse">
                  <div className="aspect-[4/3] bg-gray-200"></div>
                  <div className="p-6">
                    <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                    <div className="h-6 bg-gray-200 rounded w-2/3 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : rawMaterials.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Inga råvaror hittades för den valda kategorin.</p>
            </div>
          ) : (
            <div className="space-y-4 max-w-4xl mx-auto">
              {rawMaterials.map((material) => {
                const isExpanded = expandedItems.has(material.id)
                const categoryIcon = {
                  berry: <Heart className="w-5 h-5" />,
                  herb: <Leaf className="w-5 h-5" />,
                  fermented: <Brain className="w-5 h-5" />,
                  tea: <Sparkles className="w-5 h-5" />,
                  vegetable: <Shield className="w-5 h-5" />,
                  fruit: <Apple className="w-5 h-5" />,
                  default: <Leaf className="w-5 h-5" />
                }[material.category] || <Leaf className="w-5 h-5" />
                
                return (
                  <motion.div
                    key={material.id}
                    layout
                    className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300"
                  >
                    <button
                      onClick={() => toggleExpanded(material.id)}
                      className="w-full p-6 text-left focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 rounded-2xl"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            material.category === 'berry' ? 'bg-red-100 text-red-600' :
                            material.category === 'herb' ? 'bg-green-100 text-green-600' :
                            material.category === 'fermented' ? 'bg-purple-100 text-purple-600' :
                            material.category === 'tea' ? 'bg-amber-100 text-amber-600' :
                            material.category === 'vegetable' ? 'bg-orange-100 text-orange-600' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {categoryIcon}
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {material.swedishName}
                              </h3>
                              <span className="text-sm text-gray-500">
                                {material.origin}
                              </span>
                            </div>
                            <p className="text-gray-600">
                              {material.description}
                            </p>
                          </div>
                        </div>
                        
                        <div className="ml-4 flex-shrink-0">
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                      </div>
                    </button>
                    
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="px-6 pb-6 border-t border-gray-100 pt-4">
                            {material.healthBenefits && material.healthBenefits.length > 0 && (
                              <div className="mb-4">
                                <h4 className="font-semibold text-gray-900 mb-2">Hälsofördelar:</h4>
                                <ul className="space-y-1">
                                  {material.healthBenefits.map((benefit, index) => (
                                    <li key={index} className="flex items-start gap-2">
                                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></div>
                                      <span className="text-sm text-gray-700">{benefit}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {material.nutrients && material.nutrients.length > 0 && (
                              <div>
                                <h4 className="font-semibold text-gray-900 mb-2">Nyckelämnen:</h4>
                                <div className="flex flex-wrap gap-2">
                                  {material.nutrients.map((nutrient, index) => (
                                    <span
                                      key={index}
                                      className="px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-sm"
                                    >
                                      {nutrient}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* Info Section */}
      <section className="py-16 bg-amber-50/50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-light text-gray-900 mb-6">
              Gut-Skin-Axeln
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Forskning visar att det finns en stark koppling mellan tarmhälsa och hudhälsa. 
              Genom att äta rätt funktionella råvaror kan du stödja både din tarmflora och 
              din hud för optimal hälsa och skönhet inifrån.
            </p>
            <Link
              href="/kunskap"
              className="inline-flex items-center gap-2 px-6 py-3 bg-amber-600 text-white rounded-full hover:bg-amber-700 transition-colors"
            >
              Utforska mer kunskap
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
    <Footer />
  </>
  )
} 