import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: Request) {
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
    const response = await fetch(`${backendUrl}/api/raw-materials?${queryParams}`)
    
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