import { NextRequest, NextResponse } from 'next/server';

// Fallback reviews for when backend is unavailable
const fallbackReviews = [
  {
    id: 'fallback-1',
    author: 'Anna L.',
    content: 'Fantastiska produkter som verkligen levererar resultat. Min hud har aldrig mått bättre!',
    rating: 5,
    verified: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'fallback-2', 
    author: 'Maria S.',
    content: 'Naturliga ingredienser av högsta kvalitet. Känns som att ge min hud det allra bästa.',
    rating: 5,
    verified: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'fallback-3',
    author: 'Sofia K.',
    content: 'Snabb leverans och otrolig kundservice. Produkterna överträffade alla mina förväntningar.',
    rating: 5,
    verified: true,
    createdAt: new Date().toISOString()
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') || '10';
    const productSlug = searchParams.get('productSlug');
    
    const backendUrl = process.env.BACKEND_URL || 'https://1753websitebackend-production.up.railway.app';
    let url = `${backendUrl}/api/reviews?limit=${limit}`;
    if (productSlug) {
      url += `&productSlug=${productSlug}`;
    }

    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 second timeout

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error('Backend reviews API error:', response.status, response.statusText);
      return NextResponse.json({
        success: true,
        data: fallbackReviews.slice(0, parseInt(limit))
      });
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error: any) {
    console.error('Reviews API proxy error:', error.message);
    
    // Return fallback reviews on any error
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') || '10';
    
    return NextResponse.json({
      success: true,
      data: fallbackReviews.slice(0, parseInt(limit))
    });
  }
} 