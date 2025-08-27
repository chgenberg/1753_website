'use client'

import { useState, useEffect } from 'react'
import { MapPin, Loader2 } from 'lucide-react'

interface PostalCodeLookupProps {
  postalCode: string
  onCityFound: (city: string) => void
  className?: string
}

// Swedish postal code to city mapping (sample data - in production use PostNord API)
const POSTAL_CODE_MAP: Record<string, string> = {
  // Stockholm area
  '10000': 'Stockholm',
  '11000': 'Stockholm',
  '12000': 'Stockholm',
  '13000': 'Stockholm',
  '14000': 'Stockholm',
  '15000': 'Stockholm',
  '16000': 'Stockholm',
  '17000': 'Stockholm',
  '18000': 'Stockholm',
  '19000': 'Stockholm',
  
  // Göteborg area
  '40000': 'Göteborg',
  '41000': 'Göteborg',
  '42000': 'Göteborg',
  '43000': 'Göteborg',
  '44000': 'Göteborg',
  '45000': 'Göteborg',
  
  // Malmö area
  '20000': 'Malmö',
  '21000': 'Malmö',
  '22000': 'Malmö',
  
  // Other major cities
  '58000': 'Linköping',
  '70000': 'Örebro',
  '80000': 'Gävle',
  '90000': 'Umeå',
  '97000': 'Luleå',
  '60000': 'Norrköping',
  '72000': 'Västerås',
  '75000': 'Uppsala',
  '35000': 'Växjö',
  '39000': 'Kalmar',
  '65000': 'Karlstad',
  '55000': 'Jönköping',
  '50000': 'Borås',
  
  // Specific examples
  '43955': 'Åsa', // 1753 Skincare location
  '11356': 'Stockholm',
  '21115': 'Malmö'
}

export default function PostalCodeLookup({ postalCode, onCityFound, className = '' }: PostalCodeLookupProps) {
  const [isLooking, setIsLooking] = useState(false)
  const [foundCity, setFoundCity] = useState<string | null>(null)

  useEffect(() => {
    const lookupCity = async () => {
      // Only lookup if we have a 5-digit postal code
      if (!/^\d{5}$/.test(postalCode)) {
        setFoundCity(null)
        return
      }

      setIsLooking(true)

      try {
        // First try exact match
        let city = POSTAL_CODE_MAP[postalCode]
        
        // If no exact match, try prefix matching for major areas
        if (!city) {
          const prefix = postalCode.substring(0, 3) + '00'
          city = POSTAL_CODE_MAP[prefix]
        }

        // If still no match, try broader prefix
        if (!city) {
          const broadPrefix = postalCode.substring(0, 2) + '000'
          city = POSTAL_CODE_MAP[broadPrefix]
        }

        if (city) {
          setFoundCity(city)
          onCityFound(city)
        } else {
          setFoundCity(null)
          // In production, you could call PostNord API here
          // await lookupFromPostNordAPI(postalCode)
        }
      } catch (error) {
        console.error('Postal code lookup error:', error)
        setFoundCity(null)
      } finally {
        setIsLooking(false)
      }
    }

    // Debounce the lookup
    const timeoutId = setTimeout(lookupCity, 300)
    return () => clearTimeout(timeoutId)
  }, [postalCode, onCityFound])

  if (!postalCode || postalCode.length < 5) {
    return null
  }

  return (
    <div className={`flex items-center gap-2 text-sm ${className}`}>
      {isLooking ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
          <span className="text-blue-600">Söker stad...</span>
        </>
      ) : foundCity ? (
        <>
          <MapPin className="w-4 h-4 text-green-500" />
          <span className="text-green-600">Hittade: {foundCity}</span>
        </>
      ) : (
        <span className="text-gray-500">Stad kunde inte hittas automatiskt</span>
      )}
    </div>
  )
}

// Function to call PostNord API (for production use)
async function lookupFromPostNordAPI(postalCode: string): Promise<string | null> {
  try {
    // This would be the actual PostNord API call
    // const response = await fetch(`/api/postal-lookup?code=${postalCode}`)
    // const data = await response.json()
    // return data.city
    return null
  } catch (error) {
    console.error('PostNord API error:', error)
    return null
  }
} 