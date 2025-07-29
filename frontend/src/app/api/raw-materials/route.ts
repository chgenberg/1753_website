import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = searchParams.get('page') || '1'
    const limit = searchParams.get('limit') || '12'
    const category = searchParams.get('category') || ''
    const search = searchParams.get('search') || ''
    const sort = searchParams.get('sort') || 'name'

    // Build query string
    const queryParams = new URLSearchParams({
      page,
      limit,
      ...(category && { category }),
      ...(search && { search }),
      sort
    })

    const backendUrl = process.env.BACKEND_URL || 'https://1753website-production.up.railway.app'
    const response = await fetch(`${backendUrl}/api/raw-materials?${queryParams}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      // Don't cache for now to avoid cache issues
      cache: 'no-store'
    })
    
    if (!response.ok) {
      console.error('Backend error:', response.status, response.statusText)
      return NextResponse.json(
        { error: 'Failed to fetch raw materials' },
        { status: response.status }
      )
    }
    
    const data = await response.json()
    return NextResponse.json(data)
    
  } catch (error) {
    console.error('Error fetching raw materials:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 