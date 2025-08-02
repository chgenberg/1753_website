import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const { searchParams } = new URL(request.url)
    
    console.log('Frontend API: Processing reviews request for slug:', slug)
    console.log('Frontend API: Search params:', Object.fromEntries(searchParams.entries()))
    
    // Build query params
    const queryParams = new URLSearchParams({
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '10',
      sortBy: searchParams.get('sortBy') || 'newest',
      ...(searchParams.get('rating') && { rating: searchParams.get('rating')! })
    })
    
    const backendUrl = process.env.BACKEND_URL || 'https://1753websitebackend-production.up.railway.app'
    const fullUrl = `${backendUrl}/api/reviews/product/${slug}?${queryParams}`
    
    console.log('Frontend API: Backend URL:', backendUrl)
    console.log('Frontend API: Full request URL:', fullUrl)
    console.log('Frontend API: Query params:', queryParams.toString())
    
    const response = await fetch(fullUrl, {
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    })
    
    console.log('Frontend API: Backend response status:', response.status)
    console.log('Frontend API: Backend response statusText:', response.statusText)
    console.log('Frontend API: Backend response headers:', Object.fromEntries(response.headers.entries()))
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('Frontend API: Backend error response text:', errorText)
      console.error('Frontend API: Backend error:', response.status, response.statusText)
      
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
          error: `Backend error: ${response.status} - ${errorText}`
        },
        { status: response.status }
      )
    }
    
    const data = await response.json()
    console.log('Frontend API: Backend response data:', JSON.stringify(data, null, 2))
    console.log('Frontend API: Reviews count:', data?.data?.reviews?.length || 0)
    
    return NextResponse.json(data)
    
  } catch (error) {
    console.error('Frontend API: Error fetching product reviews:', error)
    console.error('Frontend API: Error details:', error instanceof Error ? error.message : 'Unknown error')
    console.error('Frontend API: Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    
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