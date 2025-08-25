import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, firstName, lastName } = body;

    if (!email) {
      return NextResponse.json({
        success: false,
        message: 'E-postadress krävs'
      }, { status: 200 }); // Changed from 400 to 200
    }

    const backendUrl = process.env.BACKEND_URL || 'https://1753websitebackend-production.up.railway.app';

    const response = await fetch(`${backendUrl}/api/newsletter/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, firstName, lastName }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Backend newsletter API error:', response.status, data);
      return NextResponse.json({
        success: false,
        message: 'Något gick fel. Försök igen om en stund.'
      }, { status: 200 }); // Always return 200, handle error in message
    }

    return NextResponse.json({
      success: true,
      message: 'Tack! Du har registrerats för vårt nyhetsbrev.'
    });

  } catch (error: any) {
    console.error('Newsletter API proxy error:', error.message);
    
    return NextResponse.json({
      success: false,
      message: 'Tyvärr, försök igen om en stund.'
    }, { status: 200 }); // Always return 200, handle error in message
  }
} 