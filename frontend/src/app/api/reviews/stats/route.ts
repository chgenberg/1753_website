import { NextResponse } from 'next/server'

// Force localhost in development, regardless of NEXT_PUBLIC_API_URL
const BACKEND_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:5002' 
  : (process.env.NEXT_PUBLIC_API_URL || 'https://1753websitebackend-production.up.railway.app')

export async function GET() {
  try {
    const fullUrl = `${BACKEND_URL}/api/reviews/stats`
    console.log('Fetching review stats from:', fullUrl)
    
    const response = await fetch(fullUrl, {
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    })

    console.log('Backend stats response status:', response.status)

    if (!response.ok) {
      console.error('Backend stats error:', response.status, response.statusText)
      
      // Return mock stats if backend is not available
      return NextResponse.json({
        totalReviews: 823,
        averageRating: 4.6,
        ratingDistribution: {
          1: 5,
          2: 8,
          3: 15,
          4: 95,
          5: 700
        },
        error: `Backend unavailable (${response.status})`
      })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching review stats:', error)
    
    // Return mock stats if there's a connection error
    return NextResponse.json({
      totalReviews: 823,
      averageRating: 4.6,
      ratingDistribution: {
        1: 5,
        2: 8,
        3: 15,
        4: 95,
        5: 700
      },
      error: 'Backend connection failed'
    })
  }
} 