import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q') || ''
    const city = searchParams.get('city') || ''
    const backendUrl = process.env.BACKEND_URL || 'https://1753websitebackend-production.up.railway.app'
    const query = new URLSearchParams()
    if (q) query.set('q', q)
    if (city) query.set('city', city)

    const resp = await fetch(`${backendUrl}/api/retailers?${query.toString()}`, {
      headers: { 'Content-Type': 'application/json' },
      next: { revalidate: 300 },
    })

    if (!resp.ok) {
      return NextResponse.json({ error: 'Failed to fetch retailers' }, { status: resp.status })
    }
    const data = await resp.json()
    return NextResponse.json(data, { headers: { 'Cache-Control': 's-maxage=300, stale-while-revalidate=600' } })
  } catch (e) {
    console.error('Retailers proxy error', e)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
} 