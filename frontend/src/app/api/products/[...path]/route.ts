import { NextRequest, NextResponse } from 'next/server'

// Derive the dynamic path from the URL instead of using the context param to
// maintain compatibility with the latest Next.js Route Handler typing.

export async function GET(request: NextRequest) {
  // Extract the pathname (e.g. "/api/products/duo/related") and query params
  const { pathname, searchParams } = new URL(request.url)

  // Remove the "/api/products/" prefix to obtain the dynamic segments
  const apiPath = pathname.replace(/^\/api\/products\//, '')

  // Split the rest of the path into segments
  const path = apiPath.split('/').filter(Boolean)

  try {
    // "path" now contains the dynamic segments previously supplied via params
    
    // Build backend URL
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5002'
    
    // Handle different path structures
    let endpoint = ''
    if (path.length === 1) {
      // /api/products/[slug] -> /api/products/[slug]
      endpoint = `/api/products/${path[0]}`
    } else if (path.length === 2 && path[1] === 'related') {
      // /api/products/[slug]/related -> /api/products/[slug]/related
      endpoint = `/api/products/${path[0]}/related`
    } else {
      // Default fallback
      endpoint = `/api/products/${path.join('/')}`
    }
    
    // Append query parameters
    const queryString = searchParams.toString()
    const fullUrl = `${backendUrl}${endpoint}${queryString ? `?${queryString}` : ''}`
    
    console.log('Proxying request to:', fullUrl)
    
    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store' // Disable caching for dynamic content
    })

    if (!response.ok) {
      console.error('Backend response error:', response.status, response.statusText)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch from backend' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)

  } catch (error) {
    console.error('API proxy error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
} 