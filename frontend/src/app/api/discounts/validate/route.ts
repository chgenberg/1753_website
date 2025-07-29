import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const backendUrl = process.env.BACKEND_URL || 'https://1753websitebackend-production.up.railway.app'
    const response = await fetch(`${backendUrl}/api/discounts/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      cache: 'no-store'
    })

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('Discount validate proxy error:', error)
    return NextResponse.json({ success: false, message: 'Proxy error' }, { status: 500 })
  }
} 