import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    
    // Forward to backend API
    const backendUrl = process.env.BACKEND_URL || 'https://1753websitebackend-production.up.railway.app'
    const response = await fetch(`${backendUrl}/api/raw-materials/${slug}`)
    
    if (response.status === 404) {
      return NextResponse.json(
        { error: 'Raw material not found' },
        { status: 404 }
      )
    }
    
    if (!response.ok) {
      console.error('Backend error:', response.status, response.statusText)
      return NextResponse.json(
        { error: 'Failed to fetch raw material' },
        { status: response.status }
      )
    }
    
    const data = await response.json()
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching raw material:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 