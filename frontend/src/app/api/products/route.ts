import { NextRequest, NextResponse } from 'next/server'

// Force localhost in development, regardless of NEXT_PUBLIC_API_URL
const BACKEND_URL = process.env.NODE_ENV === 'development'
  ? 'http://localhost:5002'
  : (process.env.NEXT_PUBLIC_API_URL || 'https://1753-website-backend-production.up.railway.app')

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const queryString = searchParams.toString()
    const fullUrl = `${BACKEND_URL}/api/products${queryString ? `?${queryString}` : ''}`
    console.log('Fetching products from:', fullUrl)
    
    const response = await fetch(fullUrl, {
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    })

    console.log('Backend products response status:', response.status)

    if (!response.ok) {
      console.error('Backend products error:', response.status, response.statusText)
      
      // Return mock products if backend is not available
      return NextResponse.json({
        products: [
          { id: '1', name: 'The ONE Facial Oil' },
          { id: '2', name: 'Au Naturel Makeup Remover' },
          { id: '3', name: 'TA-DA Serum' },
          { id: '4', name: 'Fungtastic Mask' }
        ],
        error: `Backend unavailable (${response.status})`
      })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching products:', error)
    
    // Return mock products if there's a connection error
    return NextResponse.json({
      products: [
        { id: '1', name: 'The ONE Facial Oil' },
        { id: '2', name: 'Au Naturel Makeup Remover' },
        { id: '3', name: 'TA-DA Serum' },
        { id: '4', name: 'Fungtastic Mask' }
      ],
      error: 'Backend connection failed'
    })
  }
} 