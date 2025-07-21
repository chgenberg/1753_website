import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002';
    const url = `${backendUrl}/api/blog`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store', // Disable cache to avoid 2MB limit
    });

    if (!response.ok) {
      // Return empty array if backend is not available or has no blog posts
      return NextResponse.json([]);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error proxying to backend blog:', error);
    // Return empty array instead of error to prevent page crash
    return NextResponse.json([]);
  }
} 