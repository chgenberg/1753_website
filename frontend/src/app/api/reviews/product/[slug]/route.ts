import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const { searchParams } = new URL(request.url)
    
    // Build query params
    const queryParams = new URLSearchParams({
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '10',
      sortBy: searchParams.get('sortBy') || 'createdAt',
      ...(searchParams.get('rating') && { rating: searchParams.get('rating')! })
    })
    
    const backendUrl = process.env.BACKEND_URL || 'https://1753websitebackend-production.up.railway.app'
    const response = await fetch(`${backendUrl}/api/reviews/product/${slug}?${queryParams}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    })
    
    if (!response.ok) {
      console.error('Backend error:', response.status, response.statusText)
      return NextResponse.json(
        { 
          success: false,
          data: {
            reviews: [],
            stats: {
              totalReviews: 0,
              averageRating: 0,
              ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
            }
          }
        },
        { status: response.status }
      )
    }
    
    const data = await response.json()
    return NextResponse.json(data)
    
  } catch (error) {
    console.error('Error fetching product reviews:', error)
    return NextResponse.json(
      { 
        success: false,
        data: {
          reviews: [],
          stats: {
            totalReviews: 0,
            averageRating: 0,
            ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
          }
        },
        error: 'Internal server error'
      },
      { status: 500 }
    )
  }
} 