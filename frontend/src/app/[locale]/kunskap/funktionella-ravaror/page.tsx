'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

import { Footer } from '@/components/layout/Footer'
import { ChevronDown, ChevronUp, ChevronRight, ShoppingBag, User } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/contexts/AuthContext'
import { CartDrawer } from '@/components/cart/CartDrawer'

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
  const [isMobile, setIsMobile] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const currentLocale = (pathname.split('/')[1] || 'sv') as string
  const { cartCount, openCart } = useCart()
  const { user } = useAuth()

  useEffect(() => {
    fetchRawMaterials()
  }, [])

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
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
      {/* Full-screen Hero Section without regular header */}
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section with Background Image - Full Height */}
        <section className="relative h-screen overflow-hidden">
          {/* Background Image with fallback */}
          <div className="absolute inset-0 z-0 bg-gradient-to-br from-green-900 via-green-800 to-green-700">
            <Image
              src={isMobile 
                ? "/background/herbs_mobile.png"
                : "/background/herbs_desktop.png"
              }
              alt="Funktionella råvaror bakgrund"
              fill
              priority
              sizes="100vw"
              className="object-cover"
              onError={(e) => {
                console.error('Image failed to load:', e);
              }}
              
            />
            {/* Gradient overlay for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/30" />
          </div>

          {/* White Navigation on top of hero - positioned at very top */}
          <nav className="absolute top-0 left-0 right-0 z-20 p-4 md:p-6">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <Link href={`/${currentLocale}`} className="block">
                <Image
                  src="/1753_white.png"
                  alt="1753 Skincare"
                  width={240}
                  height={96}
                  className="h-16 md:h-24 w-auto"
                  priority
                />
              </Link>

              {/* Desktop Navigation Links */}
              <div className="hidden md:flex items-center gap-8">
                <Link href={`/${currentLocale}/produkter`} className="text-white hover:text-amber-200 transition-colors font-light">
                  Produkter
                </Link>
                <Link href={`/${currentLocale}/om-oss`} className="text-white hover:text-amber-200 transition-colors font-light">
                  Om oss
                </Link>
                <Link href={`/${currentLocale}/kunskap`} className="text-white hover:text-amber-200 transition-colors font-light">
                  Kunskap
                </Link>
                <Link href={`/${currentLocale}/kontakt`} className="text-white hover:text-amber-200 transition-colors font-light">
                  Kontakt
                </Link>
              </div>

              {/* Right Navigation Icons */}
              <div className="flex items-center gap-2">
                {/* Cart Icon */}
                <button 
                  onClick={openCart} 
                  className="relative p-2 hover:opacity-70 transition-opacity"
                >
                  <ShoppingBag className="w-6 h-6 text-white" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-[#FCB237] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </button>

                {/* Account Icon */}
                <Link 
                  href={user ? `/${currentLocale}/dashboard` : `/${currentLocale}/auth/login`}
                  className="p-2 hover:opacity-70 transition-opacity"
                >
                  <User className="w-6 h-6 text-white" />
                </Link>

                {/* Mobile Menu Button */}
                <button 
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="p-2 hover:opacity-70 transition-opacity"
                >
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
          </nav>

          {/* Mobile Menu */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="absolute top-20 left-4 right-4 z-30 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg md:hidden"
              >
                <div className="p-4 space-y-4">
                  <Link 
                    href={`/${currentLocale}/produkter`}
                    className="block text-gray-800 hover:text-amber-600 font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Produkter
                  </Link>
                  <Link 
                    href={`/${currentLocale}/om-oss`}
                    className="block text-gray-800 hover:text-amber-600 font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Om oss
                  </Link>
                  <Link 
                    href={`/${currentLocale}/kunskap`}
                    className="block text-gray-800 hover:text-amber-600 font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Kunskap
                  </Link>
                  <Link 
                    href={`/${currentLocale}/kontakt`}
                    className="block text-gray-800 hover:text-amber-600 font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Kontakt
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Hero Content */}
          <div className="relative z-10 h-full flex flex-col items-center justify-center px-4">
            <div className="max-w-4xl mx-auto text-center">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-white text-center px-6 md:px-8 max-w-4xl"
              >
                <span className="block text-sm md:text-base font-light tracking-[0.3em] uppercase">
                  FUNKTIONELLA RÅVAROR FÖR HUDHÄLSA
                </span>
              </motion.h1>
            </div>
            
            {/* Scroll Arrow */}
            <motion.div 
              className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5, repeat: Infinity, repeatType: "reverse" }}
            >
              <ChevronDown className="w-8 h-8 text-white/80" />
            </motion.div>
          </div>
        </section>

        {/* Introduction Section */}
        <section className="py-16 md:py-24 bg-gradient-to-b from-amber-50 to-white">
          <div className="container mx-auto px-4">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-4xl mx-auto text-center"
            >
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-light text-gray-900 mb-6 tracking-wide">
                GUT-SKIN-AXELN
              </h2>
              <p className="text-lg md:text-xl text-gray-700 leading-relaxed">
                Upptäck kraften i naturens råvaror som arbetar via gut-skin-axeln för att 
                förbättra din hudhälsa inifrån och ut.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Raw Materials Grid */}
        <section className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-light text-gray-900 mb-4">
              Naturens Kraftfulla Råvaror
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Utforska vårt urval av funktionella råvaror som stödjer din hud inifrån
            </p>
          </motion.div>
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
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: rawMaterials.indexOf(material) * 0.1 }}
                    className="bg-white rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
                  >
                    <button
                      onClick={() => toggleExpanded(material.id)}
                      className="w-full p-6 sm:p-8 text-left focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 sm:gap-4 flex-1">
                          {/* Image */}
                          <div className="flex-shrink-0">
                            {material.thumbnail ? (
                              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-gradient-to-br from-amber-100 to-amber-200 shadow-md">
                                <Image
                                  src={material.thumbnail}
                                  alt={material.swedishName}
                                  width={96}
                                  height={96}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    // Fallback to gradient if image fails to load
                                    const target = e.target as HTMLElement
                                    target.style.display = 'none'
                                    if (target.nextSibling) {
                                      (target.nextSibling as HTMLElement).style.display = 'flex'
                                    }
                                  }}
                                />
                                <div 
                                  className="w-full h-full bg-gradient-to-br from-amber-400 to-orange-500 items-center justify-center text-white text-xs font-medium hidden"
                                >
                                  {material.swedishName.charAt(0).toUpperCase()}
                                </div>
                              </div>
                            ) : (
                              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-lg font-medium">
                                {material.swedishName.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-3 mb-2">
                              <h3 className="text-xl sm:text-2xl font-light text-gray-900 break-words tracking-wide">
                                {material.swedishName}
                              </h3>
                              <span className="px-3 py-1 text-xs font-medium text-amber-700 bg-amber-100 rounded-full whitespace-nowrap">
                                {material.origin}
                              </span>
                            </div>
                            <p className="text-gray-600 leading-relaxed break-words">
                              {material.description}
                            </p>
                          </div>
                        </div>
                        
                        <motion.div 
                          className="ml-4 flex-shrink-0"
                          animate={{ rotate: isExpanded ? 180 : 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                            <ChevronDown className="w-5 h-5 text-amber-700" />
                          </div>
                        </motion.div>
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
                                      <span className="text-sm text-gray-700 break-words">{benefit}</span>
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
                                      className="px-2 sm:px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs sm:text-sm break-all"
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
      <section className="py-20 md:py-32 bg-gradient-to-t from-amber-50 to-white">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="container mx-auto px-4"
        >
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-light text-gray-900 mb-8 tracking-wide">
              Forskning & Vetenskap
            </h2>
            <p className="text-lg sm:text-xl text-gray-700 mb-12 leading-relaxed px-4">
              Forskning visar att det finns en stark koppling mellan tarmhälsa och hudhälsa. 
              Genom att äta rätt funktionella råvaror kan du stödja både din tarmflora och 
              din hud för optimal hälsa och skönhet inifrån.
            </p>
            <Link
              href={`/${currentLocale}/kunskap`}
              className="inline-flex items-center gap-3 px-8 py-4 bg-[#FCB237] text-white rounded-full hover:bg-[#E79C1A] transition-all transform hover:scale-105 text-lg font-medium shadow-lg"
            >
              Utforska mer kunskap
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
    <Footer />
    <CartDrawer />
  </>
  )
} 