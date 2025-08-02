import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    
    console.log('Frontend API Stats: Processing stats request for slug:', slug)
    
    const backendUrl = process.env.BACKEND_URL || 'https://1753websitebackend-production.up.railway.app'
    const fullUrl = `${backendUrl}/api/reviews/product/${slug}/stats`
    
    console.log('Frontend API Stats: Backend URL:', backendUrl)
    console.log('Frontend API Stats: Full request URL:', fullUrl)
    
    const response = await fetch(fullUrl, {
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    })
    
    console.log('Frontend API Stats: Backend response status:', response.status)
    console.log('Frontend API Stats: Backend response statusText:', response.statusText)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('Frontend API Stats: Backend error response text:', errorText)
      console.error('Frontend API Stats: Backend error:', response.status, response.statusText)
      
      return NextResponse.json(
        { 
          success: false,
          data: {
            totalReviews: 0,
            averageRating: 0,
            ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
          },
          error: `Backend error: ${response.status} - ${errorText}`
        },
        { status: response.status }
      )
    }
    
    const data = await response.json()
    console.log('Frontend API Stats: Backend response data:', JSON.stringify(data, null, 2))
    
    return NextResponse.json(data)
    
  } catch (error) {
    console.error('Frontend API Stats: Error fetching stats:', error)
    console.error('Frontend API Stats: Error details:', error instanceof Error ? error.message : 'Unknown error')
    
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