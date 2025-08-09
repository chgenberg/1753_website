import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = searchParams.get('page') || '1'
    const limit = searchParams.get('limit') || '12'
    const category = searchParams.get('category') || ''
    const search = searchParams.get('search') || ''
    const sort = searchParams.get('sort') || 'name'
    const locale = searchParams.get('locale') || (request.headers.get('x-locale') || '').toLowerCase() || undefined

    const queryParams = new URLSearchParams({ page, limit, sort })
    if (category) queryParams.set('category', category)
    if (search) queryParams.set('search', search)
    if (locale) queryParams.set('locale', locale)

    const backendUrl = process.env.BACKEND_URL || 'https://1753websitebackend-production.up.railway.app'
    const response = await fetch(`${backendUrl}/api/raw-materials?${queryParams}`, {
      headers: {
        'Content-Type': 'application/json',
      },
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