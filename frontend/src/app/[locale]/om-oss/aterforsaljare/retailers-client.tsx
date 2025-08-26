'use client'

import { motion } from 'framer-motion'
import { MapPin, Phone, Globe, Search, Map as MapIcon, List } from 'lucide-react'
import dynamic from 'next/dynamic'
import type { CityPoint } from '@/components/maps/RetailersLeafletMap'
import { useMemo, useState, useEffect } from 'react'

const RetailersLeafletMap: any = dynamic(() => import('@/components/maps/RetailersLeafletMap'), { ssr: false })

interface Retailer {
  name: string
  phone?: string
  website?: string
  address: string
  postalCode: string
  city: string
}

// Simple lat/lon mapping for Swedish cities used on this page
const CITY_COORDS: Record<string, { lat: number; lon: number }> = {
  'Alingsås': { lat: 57.93, lon: 12.53 },
  'Almunge': { lat: 59.90, lon: 18.07 },
  'Avesta': { lat: 60.15, lon: 16.17 },
  'Borgholm': { lat: 56.88, lon: 16.65 },
  'Borås': { lat: 57.72, lon: 12.94 },
  'Bromma': { lat: 59.34, lon: 17.94 },
  'Deje': { lat: 59.60, lon: 13.47 },
  'Edsbruk': { lat: 57.98, lon: 16.56 },
  'Enköping': { lat: 59.64, lon: 17.08 },
  'Eskilstuna': { lat: 59.37, lon: 16.51 },
  'Farsta': { lat: 59.24, lon: 18.09 },
  'Gislaved': { lat: 57.30, lon: 13.54 },
  'Gräsmark': { lat: 59.77, lon: 13.14 },
  'Gråbo': { lat: 57.84, lon: 12.30 },
  'Halmstad': { lat: 56.67, lon: 12.86 },
  'Hudiksvall': { lat: 61.73, lon: 17.10 },
  'Hörby': { lat: 55.85, lon: 13.66 },
  'Jönköping': { lat: 57.78, lon: 14.16 },
  'Karlskrona': { lat: 56.16, lon: 15.59 },
  'Karlstad': { lat: 59.38, lon: 13.50 },
  'Leksand': { lat: 60.73, lon: 14.99 },
  'Lidköping': { lat: 58.50, lon: 13.16 },
  'Ljungskile': { lat: 58.22, lon: 11.92 },
  'Ljusdal': { lat: 61.83, lon: 16.09 },
  'Motala': { lat: 58.54, lon: 15.04 },
  'Mölndal': { lat: 57.66, lon: 12.01 },
  'Mölnlycke': { lat: 57.66, lon: 12.11 },
  'Norrtälje': { lat: 59.76, lon: 18.70 },
  'Nyköping': { lat: 58.75, lon: 17.01 },
  'Partille': { lat: 57.74, lon: 12.11 },
  'Piteå': { lat: 65.32, lon: 21.48 },
  'Sandviken': { lat: 60.62, lon: 16.78 },
  'Stenungsund': { lat: 58.07, lon: 11.82 },
  'Stockholm': { lat: 59.33, lon: 18.06 },
  'Storuman': { lat: 65.10, lon: 17.12 },
  'Strängnäs': { lat: 59.38, lon: 17.03 },
  'Sundbyberg': { lat: 59.36, lon: 17.97 },
  'Tjörnarp': { lat: 55.97, lon: 13.60 },
  'Tullinge': { lat: 59.20, lon: 17.90 },
  'Tyresö': { lat: 59.24, lon: 18.23 },
  'Uddevalla': { lat: 58.35, lon: 11.93 },
  'Vadstena': { lat: 58.45, lon: 14.89 },
  'Vallentuna': { lat: 59.53, lon: 18.08 },
  'Vimmerby': { lat: 57.67, lon: 15.86 },
  'Visby': { lat: 57.63, lon: 18.30 },
  'Västerås': { lat: 59.61, lon: 16.55 },
  'Växjö': { lat: 56.88, lon: 14.81 },
  'Ystad': { lat: 55.43, lon: 13.82 },
  'Älmhult': { lat: 56.55, lon: 14.13 },
  'Örebro': { lat: 59.27, lon: 15.21 },
  'Brommaplan 403, 2tr': { lat: 59.34, lon: 17.94 },
  'Saltsjöqvarn': { lat: 59.31, lon: 18.12 },
}

// Fallback data if API fails
const fallbackRetailers: Retailer[] = [
  { name: 'Skincare Studio City', address: 'Storgatan 1', postalCode: '111 22', city: 'Stockholm', phone: '08-123456', website: 'https://example.com' },
  { name: 'Hudhälsa Mölndal', address: 'Kvarnbygatan 2', postalCode: '431 34', city: 'Mölndal' },
  { name: 'Växjö Hud & Hälsa', address: 'Kungsgatan 12', postalCode: '352 30', city: 'Växjö' },
  { name: 'Hudkliniken Halmstad', address: 'Strandgatan 3', postalCode: '302 42', city: 'Halmstad' },
  { name: 'Tyresö Hudvård', address: 'Tyresövägen 10', postalCode: '135 40', city: 'Tyresö' },
  { name: 'Västerås Skincare', address: 'Munktellvägen 7', postalCode: '722 12', city: 'Västerås' },
  { name: 'Jönköping Hudcenter', address: 'Östra Storgatan 25', postalCode: '553 21', city: 'Jönköping' },
  { name: 'Norrtälje Hudstudio', address: 'Badhusgatan 4', postalCode: '761 30', city: 'Norrtälje' },
]

export default function ClientRetailersPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [retailers, setRetailers] = useState<Retailer[]>(fallbackRetailers)
  const [loading, setLoading] = useState(true)
  const [showMap, setShowMap] = useState(false)
  const [selectedCity, setSelectedCity] = useState<string>('')

  // Fetch retailers from API
  useEffect(() => {
    async function fetchRetailers() {
      try {
        setLoading(true)
        const response = await fetch('/api/retailers')
        if (response.ok) {
          const data = await response.json()
          if (data.success && Array.isArray(data.data)) {
            setRetailers(data.data)
          }
        }
      } catch (error) {
        console.error('Error fetching retailers:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchRetailers()
  }, [])

  // Filter retailers based on search term and selected city
  const filteredRetailers = useMemo(() => {
    let filtered = retailers
    
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(retailer => 
        retailer.name.toLowerCase().includes(term) ||
        retailer.city.toLowerCase().includes(term) ||
        retailer.address.toLowerCase().includes(term)
      )
    }
    
    if (selectedCity) {
      filtered = filtered.filter(retailer => retailer.city === selectedCity)
    }
    
    return filtered
  }, [retailers, searchTerm, selectedCity])

  // Group retailers by city
  const retailersByCity = useMemo(() => {
    const grouped: Record<string, Retailer[]> = {}
    filteredRetailers.forEach(retailer => {
      if (!grouped[retailer.city]) {
        grouped[retailer.city] = []
      }
      grouped[retailer.city].push(retailer)
    })
    return grouped
  }, [filteredRetailers])

  // Get unique cities for filter
  const cities = useMemo(() => {
    return [...new Set(retailers.map(r => r.city))].sort((a, b) => a.localeCompare(b, 'sv'))
  }, [retailers])

  // Map points for the map view
  const mapPoints: CityPoint[] = useMemo(() => {
    const pointsMap: Map<string, CityPoint> = new Map()
    filteredRetailers.forEach(r => {
      const key = r.city
      const coords = CITY_COORDS[key]
      if (!coords) return
      const existing = pointsMap.get(key)
      if (existing) {
        existing.retailers.push(r)
      } else {
        pointsMap.set(key, { city: key, lat: coords.lat, lon: coords.lon, retailers: [r] })
      }
    })
    return Array.from(pointsMap.values())
  }, [filteredRetailers])

  if (loading) {
    return (
      <main className="pt-20">
        <section className="bg-gradient-to-br from-[#F5F3F0] to-white py-20">
          <div className="container mx-auto px-4">
            <div className="animate-pulse">
              <div className="h-12 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2 mx-auto mb-8"></div>
              <div className="grid gap-4 max-w-4xl mx-auto">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white p-6 rounded-xl">
                    <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="pt-20">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#F5F3F0] to-white py-16">
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              VÅRA FANTASTISKA ÅTERFÖRSÄLJARE
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Vi har handplockat ett antal återförsäljare som har ett genuint intresse av att hjälpa människor att uppnå en fantastisk hudhälsa.
            </p>

            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4 max-w-2xl mx-auto mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input 
                  type="text" 
                  placeholder="Sök stad eller återförsäljare..." 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)} 
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FCB237] focus:border-[#FCB237]" 
                />
              </div>
              <select 
                value={selectedCity} 
                onChange={(e) => setSelectedCity(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FCB237] focus:border-[#FCB237]"
              >
                <option value="">Alla städer</option>
                {cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
              <button
                onClick={() => setShowMap(!showMap)}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-[#FCB237] text-white rounded-lg hover:bg-[#e79c1a] transition-colors"
              >
                {showMap ? <List className="w-5 h-5" /> : <MapIcon className="w-5 h-5" />}
                {showMap ? 'Visa lista' : 'Visa karta'}
              </button>
            </div>

            {/* Results count */}
            <div className="text-sm text-gray-600">
              Visar {filteredRetailers.length} av {retailers.length} återförsäljare
              {selectedCity && ` i ${selectedCity}`}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          {showMap ? (
            // Map View
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="max-w-6xl mx-auto"
            >
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="relative h-[600px]">
                  <RetailersLeafletMap points={mapPoints} />
                </div>
              </div>
            </motion.div>
          ) : (
            // List View
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="max-w-4xl mx-auto"
            >
              <div className="space-y-8">
                {Object.entries(retailersByCity).sort(([a], [b]) => a.localeCompare(b, 'sv')).map(([city, cityRetailers]) => (
                  <motion.div
                    key={city}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <MapPin className="w-6 h-6 text-[#FCB237]" />
                      {city}
                      <span className="text-sm font-normal text-gray-500">({cityRetailers.length} återförsäljare)</span>
                    </h2>
                    <div className="grid gap-4">
                      {cityRetailers.map((retailer, index) => (
                        <motion.div
                          key={`${city}-${index}`}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-100"
                        >
                          <h3 className="text-lg font-semibold text-gray-900 mb-3">{retailer.name}</h3>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-start gap-3">
                              <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-600">{retailer.address}, {retailer.postalCode} {retailer.city}</span>
                            </div>
                            {retailer.phone && (
                              <div className="flex items-center gap-3">
                                <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                <a href={`tel:${retailer.phone}`} className="text-gray-600 hover:text-[#FCB237] transition-colors">
                                  {retailer.phone}
                                </a>
                              </div>
                            )}
                            {retailer.website && (
                              <div className="flex items-center gap-3">
                                <Globe className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                <a 
                                  href={retailer.website.startsWith('http') ? retailer.website : `https://${retailer.website}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="text-[#FCB237] hover:text-[#e79c1a] transition-colors"
                                >
                                  Besök hemsida
                                </a>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>

              {filteredRetailers.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-600">Inga återförsäljare hittades som matchar din sökning.</p>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </section>
    </main>
  )
} 