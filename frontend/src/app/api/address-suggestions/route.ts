import { NextRequest, NextResponse } from 'next/server'

interface AddressSuggestion {
  address: string
  city: string
  postalCode: string
  municipality?: string
}

interface NominatimResult {
  display_name: string
  address: {
    house_number?: string
    road?: string
    city?: string
    town?: string
    municipality?: string
    postcode?: string
    country?: string
    state?: string
    county?: string
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')
  const limit = parseInt(searchParams.get('limit') || '8')

  if (!query || query.length < 2) {
    return NextResponse.json({
      success: true,
      suggestions: []
    })
  }

  try {
    // Use Nominatim (OpenStreetMap) for real Swedish address data
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?` + new URLSearchParams({
      q: `${query}, Sweden`,
      format: 'json',
      addressdetails: '1',
      limit: String(limit * 2), // Get more results to filter better
      countrycodes: 'se', // Only Sweden
      'accept-language': 'sv,en'
    })

    const response = await fetch(nominatimUrl, {
      headers: {
        'User-Agent': '1753Skincare/1.0 (contact@1753skincare.com)'
      }
    })

    if (!response.ok) {
      throw new Error(`Nominatim API error: ${response.status}`)
    }

    const nominatimResults: NominatimResult[] = await response.json()

    // Process and filter results
    const suggestions: AddressSuggestion[] = []
    const seenAddresses = new Set<string>()

    for (const result of nominatimResults) {
      if (suggestions.length >= limit) break

      const addr = result.address
      
      // Skip if no road/address
      if (!addr.road) continue

      // Build address string
      let address = addr.road
      if (addr.house_number) {
        address = `${addr.road} ${addr.house_number}`
      }

      // Get city (prefer city over town over municipality)
      const city = addr.city || addr.town || addr.municipality || ''
      if (!city) continue

      // Get postal code
      const postalCode = addr.postcode || ''

      // Create unique key to avoid duplicates
      const addressKey = `${address}-${city}-${postalCode}`.toLowerCase()
      if (seenAddresses.has(addressKey)) continue
      seenAddresses.add(addressKey)

      // Only include if it seems relevant to the search
      const searchLower = query.toLowerCase()
      const isRelevant = 
        address.toLowerCase().includes(searchLower) ||
        city.toLowerCase().includes(searchLower) ||
        postalCode.includes(searchLower)

      if (!isRelevant) continue

      suggestions.push({
        address,
        city,
        postalCode,
        municipality: addr.municipality
      })
    }

    // Sort by relevance
    const sorted = suggestions.sort((a, b) => {
      const queryLower = query.toLowerCase()
      
      // Exact match gets highest priority
      if (a.address.toLowerCase() === queryLower) return -1
      if (b.address.toLowerCase() === queryLower) return 1
      
      // Address starts with query gets next priority
      if (a.address.toLowerCase().startsWith(queryLower) && !b.address.toLowerCase().startsWith(queryLower)) return -1
      if (b.address.toLowerCase().startsWith(queryLower) && !a.address.toLowerCase().startsWith(queryLower)) return 1
      
      // City starts with query
      if (a.city.toLowerCase().startsWith(queryLower) && !b.city.toLowerCase().startsWith(queryLower)) return -1
      if (b.city.toLowerCase().startsWith(queryLower) && !a.city.toLowerCase().startsWith(queryLower)) return 1
      
      // Alphabetical order for remaining
      return a.address.localeCompare(b.address, 'sv')
    })

    return NextResponse.json({
      success: true,
      suggestions: sorted,
      count: sorted.length
    })

  } catch (error) {
    console.error('Error fetching address suggestions:', error)
    
    // Fallback to some common Swedish addresses if API fails
    const fallbackSuggestions: AddressSuggestion[] = [
      { address: 'Kungsgatan 1', city: 'Stockholm', postalCode: '111 43' },
      { address: 'Kronhusgatan 1', city: 'Göteborg', postalCode: '411 13' },
      { address: 'Stortorget 1', city: 'Malmö', postalCode: '211 34' }
    ].filter(addr => 
      addr.address.toLowerCase().includes((query || '').toLowerCase()) ||
      addr.city.toLowerCase().includes((query || '').toLowerCase())
    )

    return NextResponse.json({
      success: true,
      suggestions: fallbackSuggestions,
      count: fallbackSuggestions.length,
      fallback: true
    })
  }
} 