import { NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002'

export async function GET() {
  try {
    const fullUrl = `${BACKEND_URL}/api/products`
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