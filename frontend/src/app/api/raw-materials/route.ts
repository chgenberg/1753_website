import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    
    // Build query string
    const queryParams = new URLSearchParams()
    if (category) queryParams.append('category', category)
    if (search) queryParams.append('search', search)
    
    // Use backend API URL
    const backendUrl = process.env.BACKEND_URL || 'https://1753websitebackend-production.up.railway.app'
    const url = `${backendUrl}/api/raw-materials${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
      // Don't cache for now to avoid cache issues
      cache: 'no-store'
    })
    
    if (!response.ok) {
      throw new Error(`Backend responded with ${response.status}`)
    }
    
    const data = await response.json()
    return NextResponse.json(data)
    
  } catch (error) {
    console.error('Error fetching raw materials:', error)
    return NextResponse.json(
      { error: 'Failed to fetch raw materials' },
      { status: 500 }
    )
  }
} 