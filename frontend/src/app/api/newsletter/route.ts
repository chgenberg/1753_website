import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email, tags = [], source = 'website' } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'E-postadress krävs' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Ogiltig e-postadress' },
        { status: 400 }
      )
    }

    // Drip API configuration
    const dripAccountId = process.env.DRIP_ACCOUNT_ID
    const dripApiToken = process.env.DRIP_API_TOKEN

    if (!dripAccountId || !dripApiToken) {
      console.error('Drip credentials not configured')
      return NextResponse.json(
        { error: 'Konfigurationsfel' },
        { status: 500 }
      )
    }

    // Subscribe to Drip
    const dripResponse = await fetch(`https://api.getdrip.com/v2/${dripAccountId}/subscribers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(dripApiToken + ':').toString('base64')}`,
      },
      body: JSON.stringify({
        subscribers: [{
          email: email.toLowerCase().trim(),
          tags: tags,
          custom_fields: {
            source: source,
            subscription_date: new Date().toISOString(),
          }
        }]
      }),
    })

    if (!dripResponse.ok) {
      const errorData = await dripResponse.text()
      console.error('Drip API error:', errorData)
      return NextResponse.json(
        { error: 'Ett fel uppstod vid prenumeration' },
        { status: 500 }
      )
    }

    const dripData = await dripResponse.json()
    console.log('Successfully subscribed to Drip:', email)

    return NextResponse.json({
      success: true,
      message: 'Prenumeration lyckades',
      subscriber: dripData.subscribers?.[0]
    })

  } catch (error) {
    console.error('Newsletter subscription error:', error)
    return NextResponse.json(
      { error: 'Ett oväntat fel uppstod' },
      { status: 500 }
    )
  }
} 