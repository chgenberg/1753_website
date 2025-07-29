import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const backendUrl = process.env.BACKEND_URL || 'https://1753website-production.up.railway.app'
    const fullUrl = `${backendUrl}/api/reviews/stats`
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
      
      // Return empty stats if backend is not available
      return NextResponse.json({
        totalReviews: 0,
        averageRating: 0,
        ratingDistribution: {
          1: 0,
          2: 0,
          3: 0,
          4: 0,
          5: 0
        },
        error: `Backend unavailable (${response.status})`
      })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching review stats:', error)
    
    // Return empty stats if there's a connection error
    return NextResponse.json({
      totalReviews: 0,
      averageRating: 0,
      ratingDistribution: {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0
      },
      error: 'Backend connection failed'
    })
  }
} 