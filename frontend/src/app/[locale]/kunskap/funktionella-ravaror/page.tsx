'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronRight, Leaf, Heart, Brain, Shield } from 'lucide-react'

interface RawMaterial {
  id: string
  name: string
  swedishName: string
  category: string
  origin: string
  slug: string
  description: string
  thumbnail?: string
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
  return (
    <div className="min-h-screen bg-gray-50">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rawMaterials.map((material) => (
              <Link
                key={material.id}
                href={`/kunskap/funktionella-ravaror/${material.slug}`}
                className="group bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
              >
                <div className="aspect-[4/3] relative bg-gradient-to-br from-amber-50 to-amber-100">
                  {/* Placeholder for image */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Leaf className="w-16 h-16 text-amber-300" />
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                    <span className="capitalize">{material.category}</span>
                    <span>•</span>
                    <span>{material.origin}</span>
                  </div>
                  
                  <h3 className="text-xl font-medium text-gray-900 mb-2 group-hover:text-amber-600 transition-colors">
                    {material.swedishName}
                  </h3>
                  
                  <p className="text-gray-600 mb-4">
                    {material.description}
                  </p>
                  
                  <div className="flex items-center gap-2 text-amber-600 font-medium">
                    <span>Läs mer</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
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
  )
} 