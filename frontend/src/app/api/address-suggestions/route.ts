import { NextRequest, NextResponse } from 'next/server'

interface AddressSuggestion {
  address: string
  city: string
  postalCode: string
  municipality?: string
}

// Mock Swedish addresses for demonstration
// In production, you would integrate with a real Swedish address API like:
// - Postnord API
// - Lantmäteriet API
// - Google Places API for Sweden
const mockAddresses: AddressSuggestion[] = [
  // Stockholm
  { address: 'Kungsgatan 1', city: 'Stockholm', postalCode: '111 43', municipality: 'Stockholm' },
  { address: 'Kungsgatan 25', city: 'Stockholm', postalCode: '111 56', municipality: 'Stockholm' },
  { address: 'Kungsgatan 44', city: 'Stockholm', postalCode: '111 35', municipality: 'Stockholm' },
  { address: 'Drottninggatan 1', city: 'Stockholm', postalCode: '111 51', municipality: 'Stockholm' },
  { address: 'Drottninggatan 89', city: 'Stockholm', postalCode: '113 60', municipality: 'Stockholm' },
  { address: 'Sveavägen 24', city: 'Stockholm', postalCode: '111 34', municipality: 'Stockholm' },
  { address: 'Sveavägen 44', city: 'Stockholm', postalCode: '111 34', municipality: 'Stockholm' },
  { address: 'Östermalmsgatat 1', city: 'Stockholm', postalCode: '114 42', municipality: 'Stockholm' },
  
  // Göteborg
  { address: 'Kronhusgatan 1', city: 'Göteborg', postalCode: '411 13', municipality: 'Göteborg' },
  { address: 'Kronhusgatan 10', city: 'Göteborg', postalCode: '411 13', municipality: 'Göteborg' },
  { address: 'Kronhusgatan 15', city: 'Göteborg', postalCode: '411 13', municipality: 'Göteborg' },
  { address: 'Avenyn 1', city: 'Göteborg', postalCode: '411 36', municipality: 'Göteborg' },
  { address: 'Linnégatan 5', city: 'Göteborg', postalCode: '413 04', municipality: 'Göteborg' },
  { address: 'Vasagatan 10', city: 'Göteborg', postalCode: '411 37', municipality: 'Göteborg' },
  
  // Malmö
  { address: 'Stortorget 1', city: 'Malmö', postalCode: '211 34', municipality: 'Malmö' },
  { address: 'Södergatan 5', city: 'Malmö', postalCode: '211 34', municipality: 'Malmö' },
  { address: 'Västra Hamngatan 1', city: 'Malmö', postalCode: '211 25', municipality: 'Malmö' },
  
  // Uppsala
  { address: 'Dragarbrunnsgatan 1', city: 'Uppsala', postalCode: '753 20', municipality: 'Uppsala' },
  { address: 'Sankt Eriks gränd 3', city: 'Uppsala', postalCode: '753 10', municipality: 'Uppsala' },
  
  // Lund
  { address: 'Stora Södergatan 1', city: 'Lund', postalCode: '222 23', municipality: 'Lund' },
  { address: 'Klostergatan 5', city: 'Lund', postalCode: '222 22', municipality: 'Lund' },
  
  // Åsa (where 1753 is located)
  { address: 'Södra Skjutbanevägen 10', city: 'Åsa', postalCode: '439 55', municipality: 'Kungsbacka' },
  { address: 'Åsavägen 1', city: 'Åsa', postalCode: '439 30', municipality: 'Kungsbacka' },
  { address: 'Strandvägen 5', city: 'Åsa', postalCode: '439 56', municipality: 'Kungsbacka' },
  
  // Common street names across Sweden
  { address: 'Järnvägsgatan 1', city: 'Varberg', postalCode: '432 41', municipality: 'Varberg' },
  { address: 'Järnvägsgatan 15', city: 'Halmstad', postalCode: '302 45', municipality: 'Halmstad' },
  { address: 'Järnvägsgatan 22', city: 'Helsingborg', postalCode: '252 78', municipality: 'Helsingborg' },
  
  { address: 'Parkgatan 1', city: 'Växjö', postalCode: '352 31', municipality: 'Växjö' },
  { address: 'Parkgatan 8', city: 'Kalmar', postalCode: '392 33', municipality: 'Kalmar' },
  
  { address: 'Nygatan 5', city: 'Jönköping', postalCode: '553 15', municipality: 'Jönköping' },
  { address: 'Nygatan 12', city: 'Kristianstad', postalCode: '291 31', municipality: 'Kristianstad' },
  
  { address: 'Torggatan 3', city: 'Karlstad', postalCode: '652 24', municipality: 'Karlstad' },
  { address: 'Torggatan 7', city: 'Örebro', postalCode: '701 10', municipality: 'Örebro' },
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const limit = parseInt(searchParams.get('limit') || '10')

    if (!query || query.length < 2) {
      return NextResponse.json({
        success: true,
        suggestions: []
      })
    }

    // Filter addresses based on query
    const filteredAddresses = mockAddresses.filter(address => {
      const searchQuery = query.toLowerCase()
      return (
        address.address.toLowerCase().includes(searchQuery) ||
        address.city.toLowerCase().includes(searchQuery) ||
        address.postalCode.includes(searchQuery) ||
        (address.municipality && address.municipality.toLowerCase().includes(searchQuery))
      )
    })

    // Sort by relevance (exact match first, then starts with, then contains)
    const sorted = filteredAddresses.sort((a, b) => {
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

    const suggestions = sorted.slice(0, limit)

    return NextResponse.json({
      success: true,
      suggestions,
      count: suggestions.length,
      total: filteredAddresses.length
    })

  } catch (error) {
    console.error('Error fetching address suggestions:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Fel vid hämtning av adressförslag'
      },
      { status: 500 }
    )
  }
} 