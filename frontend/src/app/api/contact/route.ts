import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json({
        success: false,
        message: 'Alla fält krävs'
      }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({
        success: false,
        message: 'Ogiltig e-postadress'
      }, { status: 400 });
    }

    const backendUrl = process.env.BACKEND_URL || 'https://1753websitebackend-production.up.railway.app';

    const response = await fetch(`${backendUrl}/api/contact/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, subject, message }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Backend contact API error:', response.status, data);
      return NextResponse.json({
        success: false,
        message: 'Något gick fel. Försök igen om en stund.'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Tack för ditt meddelande! Vi svarar så snart som möjligt.',
      submissionId: data.submissionId
    });

  } catch (error: any) {
    console.error('Contact API proxy error:', error.message);
    
    return NextResponse.json({
      success: false,
      message: 'Ett tekniskt fel uppstod. Försök igen senare.'
    }, { status: 500 });
  }
} 