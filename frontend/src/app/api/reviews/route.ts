import { NextRequest, NextResponse } from 'next/server'

// Force localhost in development, regardless of NEXT_PUBLIC_API_URL
const BACKEND_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:5002' 
  : (process.env.NEXT_PUBLIC_API_URL || 'https://1753-website-backend-production.up.railway.app')

// Mock reviews data (only used if backend fails)
const mockReviews = [
  {
    id: '1',
    productId: '1',
    rating: 5,
    title: 'Fantastiska produkter!',
    body: 'Min hud har aldrig känt sig så mjuk och balanserad. CBD-oljan har verkligen hjälpt min känsliga hud.',
    reviewerName: 'Emma Svensson',
    isVerified: true,
    createdAt: '2024-01-15T10:30:00Z',
    product: {
      id: '1',
      name: 'The ONE Facial Oil',
      slug: 'the-one-facial-oil',
      images: ['/images/products/TheONE.png']
    }
  },
  {
    id: '2',
    productId: '2',
    rating: 5,
    title: 'Älskar konsistensen och doften',
    body: 'CBD-oljan har verkligen hjälpt min känsliga hud. Rekommenderar starkt!',
    reviewerName: 'Marcus Andersson',
    isVerified: true,
    createdAt: '2024-01-10T14:20:00Z',
    product: {
      id: '2',
      name: 'Au Naturel Makeup Remover',
      slug: 'au-naturel',
              images: ['/images/products/Naturel.png']
    }
  },
  {
    id: '3',
    productId: '3',
    rating: 5,
    title: 'Ser redan resultat efter två veckor!',
    body: 'Fantastisk produkt! Min hud ser så mycket bättre ut och känns mjukare.',
    reviewerName: 'Sofia Lindberg',
    isVerified: true,
    createdAt: '2024-01-05T09:15:00Z',
    product: {
      id: '3',
      name: 'TA-DA Serum',
      slug: 'ta-da-serum',
      images: ['/images/products/TADA.png']
    }
  }
]

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const queryString = searchParams.toString()
    const fullUrl = `${BACKEND_URL}/api/reviews?${queryString}`
    
    console.log('Fetching reviews from:', fullUrl)
    
    const response = await fetch(fullUrl, {
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    })

    console.log('Backend response status:', response.status)

    if (!response.ok) {
      console.error('Backend error:', response.status, response.statusText)
      
      // Return mock data if backend is not available
      return NextResponse.json({
        reviews: mockReviews,
        totalCount: mockReviews.length,
        hasMore: false,
        currentPage: 1,
        totalPages: 1,
        error: `Backend unavailable (${response.status}) - Showing sample data`
      })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching reviews:', error)
    
    // Return mock data if there's a connection error
    return NextResponse.json({
      reviews: mockReviews,
      totalCount: mockReviews.length,
      hasMore: false,
      currentPage: 1,
      totalPages: 1,
      error: 'Backend connection failed - Showing sample data'
    })
  }
} 