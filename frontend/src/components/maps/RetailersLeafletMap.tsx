'use client'

import 'leaflet/dist/leaflet.css'
import { MapContainer, TileLayer, Popup, CircleMarker, useMap } from 'react-leaflet'
import type { FC } from 'react'

export interface CityPoint {
  city: string
  lat: number
  lon: number
  retailers: {
    name: string
    phone?: string
    website?: string
    address: string
    postalCode: string
  }[]
}

const FitBounds: FC<{ bounds: [[number, number], [number, number]] | null }> = ({ bounds }) => {
  const map = useMap()
  if (bounds) {
    map.fitBounds(bounds, { padding: [20, 20] })
  } else {
    map.setView([62, 16], 4)
  }
  return null
}

const RetailersLeafletMap: FC<{ points: CityPoint[] }> = ({ points }) => {
  const bounds = (() => {
    if (!points.length) return null
    const lats = points.map(p => p.lat)
    const lons = points.map(p => p.lon)
    const minLat = Math.min(...lats), maxLat = Math.max(...lats)
    const minLon = Math.min(...lons), maxLon = Math.max(...lons)
    return [[minLat, minLon], [maxLat, maxLon]] as [[number, number], [number, number]]
  })()

  return (
    <MapContainer className="w-full h-full" center={[62, 16]} zoom={5} scrollWheelZoom={true} style={{ background: '#F5F3F0' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {points.map((p, idx) => (
        <CircleMarker key={idx} center={[p.lat, p.lon]} radius={6 + Math.min(6, p.retailers.length)} pathOptions={{ color: '#4A3428', fillColor: '#4A3428', fillOpacity: 0.85 }}>
          <Popup>
            <div className="text-sm">
              <div className="font-semibold mb-1">{p.city}</div>
              <ul className="space-y-1">
                {p.retailers.map((r, i) => (
                  <li key={i}>
                    <div className="font-medium">{r.name}</div>
                    <div className="text-gray-600">{r.address}, {r.postalCode}</div>
                    {r.phone && <div className="text-gray-600">{r.phone}</div>}
                    {r.website && r.website !== 'Hemsida' && (
                      <a className="text-[#4A3428] underline" href={r.website.startsWith('http') ? r.website : `https://${r.website}`} target="_blank" rel="noopener noreferrer">Besök webbplats</a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </Popup>
        </CircleMarker>
      ))}
      <FitBounds bounds={bounds} />
    </MapContainer>
  )
}

export default RetailersLeafletMap 