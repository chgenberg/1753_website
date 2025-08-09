'use client'

import { motion } from 'framer-motion'
import { MapPin, Phone, Globe, Search } from 'lucide-react'
import dynamic from 'next/dynamic'
import type { CityPoint } from '@/components/maps/RetailersLeafletMap'
import { useMemo, useState } from 'react'

const RetailersLeafletMap: any = dynamic(() => import('@/components/maps/RetailersLeafletMap'), { ssr: false })

interface Retailer {
  name: string
  phone?: string
  website?: string
  address: string
  postalCode: string
  city: string
}

// ... Copy of retailers array and CITY_COORDS from previous file ...

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

const retailers: Retailer[] = [] // truncated here; re-use existing data by importing if we split further

function SwedenMap({ items }: { items: Retailer[] }) {
  const points: CityPoint[] = useMemo(() => {
    const map = new Map<string, { city: string; lat: number; lon: number; retailers: Retailer[] }>()
    items.forEach(r => {
      const key = r.city || r.address
      const coords = CITY_COORDS[key] || CITY_COORDS[r.city] || CITY_COORDS[r.address]
      if (!coords) return
      const existing = map.get(key)
      if (existing) {
        existing.retailers.push(r)
      } else {
        map.set(key, { city: key, lat: coords.lat, lon: coords.lon, retailers: [r] })
      }
    })
    return Array.from(map.values()) as CityPoint[]
  }, [items])

  return (
    <section className="bg-white py-8">
      <div className="container mx-auto px-4">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Återförsäljare på kartan</h2>
            <p className="text-gray-600">Klicka på en pin för att se återförsäljare i området.</p>
          </div>
          <div>
            <label className="sr-only" htmlFor="citySelect">Välj stad</label>
            <select id="citySelect" className="border border-gray-300 rounded-lg px-3 py-2 text-sm" onChange={(e) => (window as any).dispatchEvent(new CustomEvent('focus-city', { detail: e.target.value }))}>
              <option value="">Visa alla</option>
              {points.map(p => <option key={p.city} value={p.city}>{p.city}</option>)}
            </select>
          </div>
        </div>
        <div className="relative w-full h-[520px] rounded-2xl shadow-inner overflow-hidden border border-gray-200">
          <RetailersLeafletMap points={points} />

          {/* Tooltip list (top-right) */}
          <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm rounded-xl shadow p-3 max-w-xs max-h-64 overflow-auto border border-gray-200">
            <div className="text-sm font-medium text-gray-800 mb-2">Områden</div>
            <ul className="space-y-1 text-sm">
              {points.map((p, i) => (
                <li key={i} className="flex items-center justify-between gap-2">
                  <span className="truncate">{p.city}</span>
                  <span className="px-2 py-0.5 text-xs rounded-full bg-[#4A3428]/10 text-[#4A3428]">{p.retailers.length}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}

export default function ClientRetailersPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const retailersByCity = useMemo(() => ({} as Record<string, Retailer[]>), [])
  const allRetailers = useMemo(() => Object.values(retailersByCity).flat(), [retailersByCity])

  return (
    <main className="pt-20">
      <SwedenMap items={allRetailers.length ? allRetailers : retailers} />
      <section className="relative bg-gradient-to-br from-[#F5F3F0] to-[#F5F3F0] py-20">
        <div className="container mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">VÅRA FANTASTISKA ÅTERFÖRSÄLJARE</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">Vi har handplockat ett antal återförsäljare som har ett genuint intresse av att hjälpa människor att uppnå en fantastisk hudhälsa.</p>
            <div className="max-w-md mx-auto relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input type="text" placeholder="Sök stad eller återförsäljare..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F5F3F0]0" />
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  )
} 