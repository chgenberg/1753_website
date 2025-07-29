import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    
    const backendUrl = process.env.BACKEND_URL || 'https://1753website-production.up.railway.app'
    const response = await fetch(`${backendUrl}/api/reviews/product/${slug}/stats`, {
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    })
    
    if (!response.ok) {
      console.error('Backend stats error:', response.status, response.statusText)
      return NextResponse.json(
        { 
          success: false,
          data: {
            totalReviews: 0,
            averageRating: 0,
            ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
          }
        },
        { status: response.status }
      )
    }
    
    const data = await response.json()
    return NextResponse.json(data)
    
  } catch (error) {
    console.error('Error fetching product review stats:', error)
    return NextResponse.json(
      { 
        success: false,
        data: {
          totalReviews: 0,
          averageRating: 0,
          ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
        },
        error: 'Internal server error'
      },
      { status: 500 }
    )
  }
} 