'use client'
 
 import { motion } from 'framer-motion'
 import { MapPin, Phone, Globe, Search } from 'lucide-react'
 import dynamic from 'next/dynamic'
 import type { CityPoint } from '@/components/maps/RetailersLeafletMap'
 import { useEffect, useMemo, useState } from 'react'
 
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
   // ... existing code ...
   'Saltsjöqvarn': { lat: 59.31, lon: 18.12 },
 }
 
 async function fetchRetailers(q: string = ''): Promise<Retailer[]> {
   const params = new URLSearchParams()
   if (q) params.set('q', q)
   const res = await fetch(`/api/retailers?${params.toString()}`, { cache: 'no-store' })
   if (!res.ok) return []
   const json = await res.json()
   return json.data || []
}
 
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
 
   // Alfabetisk lista (stad -> återförsäljare)
   const alphaList = useMemo(() => {
     const cities = [...points].sort((a,b) => a.city.localeCompare(b.city, 'sv'))
     const groups = new Map<string, CityPoint[]>()
     cities.forEach(c => {
       const letter = c.city[0]?.toUpperCase() || '#'
       if (!groups.has(letter)) groups.set(letter, [])
       groups.get(letter)!.push(c)
     })
     return Array.from(groups.entries()).sort((a,b) => a[0].localeCompare(b[0], 'sv'))
   }, [points])
 
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
                   <button onClick={() => (window as any).dispatchEvent(new CustomEvent('focus-city', { detail: p.city }))} className="truncate text-left hover:underline">
                     {p.city}
                   </button>
                   <span className="px-2 py-0.5 text-xs rounded-full bg-[#FCB237]/10 text-[#FCB237]">{p.retailers.length}</span>
                 </li>
               ))}
             </ul>
           </div>
         </div>

         {/* Alfabetisk lista under kartan */}
         <div className="mt-8">
           <h3 className="text-xl font-semibold text-gray-900 mb-3">Återförsäljare A–Ö</h3>
           <div className="grid md:grid-cols-2 gap-6">
             {alphaList.map(([letter, cities]) => (
               <div key={letter}>
                 <div className="text-sm font-medium text-gray-500 mb-1">{letter}</div>
                 <div className="space-y-3">
                   {cities.map(city => (
                     <div key={city.city} className="border rounded-lg p-3">
                       <div className="flex items-center justify-between mb-1">
                         <button onClick={() => (window as any).dispatchEvent(new CustomEvent('focus-city', { detail: city.city }))} className="font-semibold text-gray-900 hover:underline flex items-center gap-2">
                           <MapPin className="w-4 h-4 text-[#FCB237]" /> {city.city}
                         </button>
                         <span className="px-2 py-0.5 text-xs rounded-full bg-[#FCB237]/10 text-[#FCB237]">{city.retailers.length}</span>
                       </div>
                       <ul className="text-sm text-gray-700 space-y-1">
                         {city.retailers.map((r, idx) => (
                           <li key={idx} className="flex items-center justify-between">
                             <span className="font-medium">{r.name}</span>
                             <span className="text-gray-500">{r.address}, {r.postalCode}</span>
                           </li>
                         ))}
                       </ul>
                     </div>
                   ))}
                 </div>
               </div>
             ))}
           </div>
         </div>
       </div>
     </section>
   )
 }
 
 export default function ClientRetailersPage() {
   const [searchTerm, setSearchTerm] = useState('')
   const [allRetailers, setAllRetailers] = useState<Retailer[]>([])

   useEffect(() => {
     fetchRetailers('').then(setAllRetailers)
   }, [])
 
   return (
     <main className="pt-20">
      <SwedenMap items={allRetailers} />
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