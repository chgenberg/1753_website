'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, 
  Leaf, 
  Heart, 
  Shield, 
  Brain,
  ChevronRight,
  Info,
  BookOpen,
  Sparkles
} from 'lucide-react'
import Link from 'next/link'

interface RawMaterial {
  id: string
  name: string
  swedishName: string
  origin: string
  category: string
  healthBenefits: string[]
  description: string
  nutrients: string[]
  howToUse?: string
  dosage?: string
  precautions?: string
  slug: string
  thumbnail?: string
  references?: string[]
  studies?: string[]
}

const categoryIcons = {
  berry: <Heart className="w-6 h-6" />,
  herb: <Leaf className="w-6 h-6" />,
  fermented: <Brain className="w-6 h-6" />,
  tea: <Sparkles className="w-6 h-6" />,
  vegetable: <Shield className="w-6 h-6" />,
  default: <Leaf className="w-6 h-6" />
}

const categoryColors = {
  berry: 'from-red-50 to-pink-50',
  herb: 'from-green-50 to-emerald-50',
  fermented: 'from-purple-50 to-indigo-50',
  tea: 'from-amber-50 to-yellow-50',
  vegetable: 'from-orange-50 to-red-50',
  default: 'from-gray-50 to-gray-100'
}

export default function RawMaterialPage() {
  const params = useParams()
  const [material, setMaterial] = useState<RawMaterial | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchRawMaterial()
  }, [params.slug])

  const fetchRawMaterial = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/raw-materials/${params.slug}`)
      
      if (response.status === 404) {
        setError('Denna råvara hittades inte.')
        return
      }
      
      if (!response.ok) {
        throw new Error('Kunde inte ladda råvaran')
      }
      
      const data = await response.json()
      setMaterial(data)
    } catch (err) {
      console.error('Error fetching raw material:', err)
      setError('Ett fel uppstod när råvaran skulle laddas.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50 pt-24">
          <div className="container mx-auto px-4 py-12">
            <div className="max-w-4xl mx-auto">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="h-12 bg-gray-200 rounded w-2/3 mb-6"></div>
                <div className="h-32 bg-gray-200 rounded mb-6"></div>
                <div className="space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  if (error || !material) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50 pt-24">
          <div className="container mx-auto px-4 py-12">
            <div className="max-w-4xl mx-auto text-center">
              <div className="bg-white rounded-2xl shadow-sm p-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Info className="w-8 h-8 text-gray-400" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-4">
                  {error || 'Råvaran hittades inte'}
                </h1>
                <p className="text-gray-600 mb-8">
                  Den råvara du letar efter finns inte eller har tagits bort.
                </p>
                <Link
                  href="/kunskap/funktionella-ravaror"
                  className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Tillbaka till råvaror
                </Link>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  const categoryIcon = categoryIcons[material.category as keyof typeof categoryIcons] || categoryIcons.default
  const categoryColor = categoryColors[material.category as keyof typeof categoryColors] || categoryColors.default

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 pt-24">
        {/* Breadcrumb */}
        <div className="bg-white border-b">
          <div className="container mx-auto px-4 py-4">
            <nav className="flex items-center space-x-2 text-sm text-gray-600">
              <Link href="/kunskap" className="hover:text-amber-600 transition-colors">
                Kunskap
              </Link>
              <ChevronRight className="w-4 h-4" />
              <Link href="/kunskap/funktionella-ravaror" className="hover:text-amber-600 transition-colors">
                Funktionella Råvaror
              </Link>
              <ChevronRight className="w-4 h-4" />
              <span className="text-gray-900">{material.swedishName}</span>
            </nav>
          </div>
        </div>

        {/* Hero Section */}
        <section className={`relative bg-gradient-to-br ${categoryColor} py-16`}>
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
                  {categoryIcon}
                  <span className="text-sm font-medium text-gray-700 capitalize">
                    {material.category === 'berry' ? 'Bär' :
                     material.category === 'herb' ? 'Ört' :
                     material.category === 'fermented' ? 'Fermenterat' :
                     material.category === 'tea' ? 'Te' :
                     material.category === 'vegetable' ? 'Grönsak' :
                     material.category}
                  </span>
                  <span className="text-gray-400">•</span>
                  <span className="text-sm text-gray-600">{material.origin}</span>
                </div>
                
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                  {material.swedishName}
                </h1>
                
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  {material.description}
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="grid md:grid-cols-2 gap-12">
                {/* Health Benefits */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white rounded-2xl shadow-sm p-8"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Heart className="w-5 h-5 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Hälsofördelar</h2>
                  </div>
                  
                  <ul className="space-y-3">
                    {material.healthBenefits.map((benefit, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        </div>
                        <span className="text-gray-700">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>

                {/* Nutrients */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white rounded-2xl shadow-sm p-8"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-blue-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Nyckelämnen</h2>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {material.nutrients.map((nutrient, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium"
                      >
                        {nutrient}
                      </span>
                    ))}
                  </div>
                </motion.div>
              </div>

              {/* Usage Information */}
              {(material.howToUse || material.dosage || material.precautions) && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl shadow-sm p-8 mt-8"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-amber-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Användning</h2>
                  </div>
                  
                  <div className="space-y-6">
                    {material.howToUse && (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Hur du använder det:</h3>
                        <p className="text-gray-700">{material.howToUse}</p>
                      </div>
                    )}
                    
                    {material.dosage && (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Dosering:</h3>
                        <p className="text-gray-700">{material.dosage}</p>
                      </div>
                    )}
                    
                    {material.precautions && (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <h3 className="font-semibold text-amber-800 mb-2">Försiktighetsåtgärder:</h3>
                        <p className="text-amber-700">{material.precautions}</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Scientific References */}
              {(material.references && material.references.length > 0) && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl shadow-sm p-8 mt-8"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Shield className="w-5 h-5 text-purple-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Vetenskapliga Referenser</h2>
                  </div>
                  
                  <ul className="space-y-2">
                    {material.references.map((reference, index) => (
                      <li key={index} className="text-sm text-gray-600">
                        {index + 1}. {reference}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}

              {/* Back Button */}
              <div className="mt-12 text-center">
                <Link
                  href="/kunskap/funktionella-ravaror"
                  className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Tillbaka till alla råvaror
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
} 