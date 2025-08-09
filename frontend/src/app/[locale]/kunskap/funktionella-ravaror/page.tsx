'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { ChevronDown, ChevronUp, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'

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
const fallbackRawMaterials = [
  {
    id: '1',
    name: 'Blueberry',
    swedishName: 'Blåbär',
    category: 'berry',
    origin: 'Nordisk',
    slug: 'blabar',
    description: 'Rika på antocyaniner som motverkar oxidativ stress och stödjer hudhälsan inifrån. Blåbär innehåller kraftfulla antioxidanter som skyddar cellerna.',
    thumbnail: '/images/raw-materials/blueberry.jpg',
    healthBenefits: ['Antioxidanter', 'Antiinflammatorisk', 'Stödjer kollagenproduktion'],
    nutrients: ['Antocyaniner', 'Vitamin C', 'Vitamin K', 'Mangan']
  },
  {
    id: '2',
    name: 'Lingonberry',
    swedishName: 'Lingon',
    category: 'berry',
    origin: 'Nordisk',
    slug: 'lingon',
    description: 'Antiinflammatorisk verkan som gynnar hudhälsan och minskar rodnad. Lingon är rikt på proantocyanidiner som stärker kärlväggarna.',
    thumbnail: '/images/raw-materials/lingonberry.jpg',
    healthBenefits: ['Antiinflammatorisk', 'Stärker kärl', 'Antioxidanter'],
    nutrients: ['Proantocyanidiner', 'Vitamin C', 'Mangan', 'Fiber']
  },
  {
    id: '3',
    name: 'Sea Buckthorn',
    swedishName: 'Havtorn',
    category: 'berry',
    origin: 'Nordisk/Asiatisk',
    slug: 'havtorn',
    description: 'Omega-7 för starkare hudbarriär och förbättrad hudelasticitet. Havtorn är ett kraftpaket av näringsämnen för huden.',
    thumbnail: '/images/raw-materials/sea-buckthorn.jpg',
    healthBenefits: ['Stärker hudbarriär', 'Omega-7', 'Läkande egenskaper'],
    nutrients: ['Omega-7', 'Vitamin C', 'Vitamin E', 'Beta-karoten']
  },
  {
    id: '4',
    name: 'Green Tea',
    swedishName: 'Grönt te',
    category: 'tea',
    origin: 'Asiatisk',
    slug: 'gront-te',
    description: 'Katechiner som skyddar mot UV-stress och förhindrar för tidig hudåldrande. Grönt te är en av naturens starkaste antioxidanter.',
    thumbnail: '/images/raw-materials/green-tea.jpg',
    healthBenefits: ['UV-skydd', 'Anti-aging', 'Antioxidanter'],
    nutrients: ['EGCG', 'Katechiner', 'L-theanin', 'Vitamin C']
  },
  {
    id: '5',
    name: 'Turmeric',
    swedishName: 'Gurkmeja',
    category: 'herb',
    origin: 'Asiatisk',
    slug: 'gurkmeja',
    description: 'Curcumin som dämpar hudinflammation och ger huden en naturlig lyster. Gurkmeja har använts i tusentals år för sina läkande egenskaper.',
    thumbnail: '/images/raw-materials/turmeric.jpg',
    healthBenefits: ['Antiinflammatorisk', 'Antioxidanter', 'Läkande'],
    nutrients: ['Curcumin', 'Curcuminoider', 'Järn', 'Mangan']
  },
  {
    id: '6',
    name: 'Kimchi',
    swedishName: 'Kimchi',
    category: 'fermented',
    origin: 'Asiatisk',
    slug: 'kimchi',
    description: 'Probiotika för balanserad gut-skin-axel och förbättrad hudhälsa. Fermenterade livsmedel stödjer både tarmhälsa och hudens mikrobiom.',
    thumbnail: '/images/raw-materials/kimchi.jpg',
    healthBenefits: ['Probiotika', 'Stödjer tarmhälsa', 'Gut-skin-axel'],
    nutrients: ['Lactobacillus', 'Vitamin B12', 'Vitamin K2', 'Fiber']
  },
  {
    id: '7',
    name: 'Chia Seeds',
    swedishName: 'Chiafrön',
    category: 'seed',
    origin: 'Sydamerikansk',
    slug: 'chiafron',
    description: 'Omega-3 fettsyror som stödjer hudens fuktbalans och elasticitet. Chiafrön är en rik källa till växtbaserade omega-3:or.',
    thumbnail: '/images/raw-materials/chia.jpg',
    healthBenefits: ['Omega-3', 'Fuktbalans', 'Antioxidanter'],
    nutrients: ['Alpha-linolensyra', 'Fiber', 'Protein', 'Kalcium']
  },
  {
    id: '8',
    name: 'Kefir',
    swedishName: 'Kefir',
    category: 'fermented',
    origin: 'Kaukasisk',
    slug: 'kefir',
    description: 'Probiotiska kulturer som stärker tarmhälsan och förbättrar hudens utseende via gut-skin-axeln.',
    thumbnail: '/images/raw-materials/kefir.jpg',
    healthBenefits: ['Probiotika', 'Tarmhälsa', 'Immunförsvar'],
    nutrients: ['Probiotiska kulturer', 'Protein', 'B-vitaminer', 'Kalcium']
  }
]

export default function FunctionalRawMaterialsPage() {
  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>(fallbackRawMaterials)
  const [loading, setLoading] = useState(true)
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const pathname = usePathname()
  const currentLocale = (pathname.split('/')[1] || 'sv') as string

  useEffect(() => {
    fetchRawMaterials()
  }, [])

  const fetchRawMaterials = async () => {
    try {
      setLoading(true)
      // Always fetch all raw materials and sort them alphabetically by Swedish name
      const response = await fetch(`/api/raw-materials?locale=${encodeURIComponent(currentLocale)}`)
      
      if (response.ok) {
        const json = await response.json()
        const list = Array.isArray(json) ? json : (json?.data || [])
        if (Array.isArray(list) && list.length) {
          const sortedData = list.sort((a: any, b: any) => {
            const aName = (a.swedishName || a.name || '').toString()
            const bName = (b.swedishName || b.name || '').toString()
            return aName.localeCompare(bName, 'sv')
          })
          setRawMaterials(sortedData)
        } else {
          console.warn('No raw materials from backend; keeping fallback')
        }
      } else {
        console.error('Failed to fetch raw materials, using fallback data')
      }
    } catch (error) {
      console.error('Error fetching raw materials:', error)
    } finally {
      setLoading(false)
    }
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
              <p className="text-gray-600">Inga råvaror hittades.</p>
            </div>
          ) : (
            <div className="space-y-4 max-w-4xl mx-auto">
              {rawMaterials.map((material) => {
                const isExpanded = expandedItems.has(material.id)

                
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
              href={`/${currentLocale}/kunskap`}
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