import { NextRequest, NextResponse } from 'next/server';

// Extract dynamic path segments from the URL to comply with the latest
// Next.js route-handler types.

export async function GET(request: NextRequest) {
  try {
    // Parse the URL to get pathname and query params
    const { pathname, searchParams } = new URL(request.url);

    // Remove the "/api/reviews/" prefix and split the remainder into segments
    const pathSegments = pathname.replace(/^\/api\/reviews\//, '').split('/').filter(Boolean);

    const apiPath = pathSegments.join('/');
    const queryString = searchParams.toString();
    
    const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002';
    const url = `${backendUrl}/api/reviews/${apiPath}${queryString ? `?${queryString}` : ''}`;
    
    console.log('Proxying to:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      throw new Error(`Backend responded with ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error proxying to backend:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { pathname } = new URL(request.url);
    const pathSegments = pathname.replace(/^\/api\/reviews\//, '').split('/').filter(Boolean);
    const apiPath = pathSegments.join('/');

    const body = await request.json();
    
    const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002';
    const url = `${backendUrl}/api/reviews/${apiPath}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Backend responded with ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error proxying to backend:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
} 