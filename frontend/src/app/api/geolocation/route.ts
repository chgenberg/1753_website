import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Get client IP from headers
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0].trim() : 
               request.headers.get('x-real-ip') || 
               '127.0.0.1'

    // Skip geolocation for localhost
    if (ip === '127.0.0.1' || ip === '::1') {
      return NextResponse.json({ 
        country_code: 'SE', // Default to Sweden for local development
        country_name: 'Sweden',
        city: 'Stockholm'
      })
    }

    // Use ipapi.co for geolocation
    const response = await fetch(`https://ipapi.co/${ip}/json/`)
    const data = await response.json()

    return NextResponse.json({
      country_code: data.country_code || 'SE',
      country_name: data.country_name || 'Sweden',
      city: data.city || 'Unknown',
      region: data.region || '',
      ip: ip
    })
  } catch (error) {
    console.error('Geolocation error:', error)
    return NextResponse.json({ 
      country_code: 'SE',
      country_name: 'Sweden',
      city: 'Stockholm',
      error: 'Failed to detect location'
    })
  }
} 