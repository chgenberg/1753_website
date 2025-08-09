import { NextRequest, NextResponse } from 'next/server'

const SUPPORTED = ['sv', 'en', 'es', 'de', 'fr'] as const

function detectLocale(req: NextRequest, searchParams: URLSearchParams): string {
  const qp = (searchParams.get('locale') || '').toLowerCase()
  if (qp && SUPPORTED.includes(qp as any)) return qp
  const header = (req.headers.get('x-locale') || '').toLowerCase()
  if (header && SUPPORTED.includes(header as any)) return header
  const referer = req.headers.get('referer') || ''
  try {
    const { pathname } = new URL(referer)
    const seg = pathname.split('/')[1]?.toLowerCase()
    if (seg && SUPPORTED.includes(seg as any)) return seg
  } catch {}
  return 'sv'
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = searchParams.get('page') || '1'
    const limit = searchParams.get('limit') || '20'
    const category = searchParams.get('category') || ''
    const skinType = searchParams.get('skinType') || ''
    const difficulty = searchParams.get('difficulty') || ''
    const search = searchParams.get('search') || ''
    const skinConcerns = searchParams.getAll('skinConcerns')
    const locale = detectLocale(request, searchParams)

    const queryParams = new URLSearchParams({ page, limit, locale })
    if (category) queryParams.set('category', category)
    if (skinType) queryParams.set('skinType', skinType)
    if (difficulty) queryParams.set('difficulty', difficulty)
    if (search) queryParams.set('search', search)
    for (const c of skinConcerns) queryParams.append('skinConcerns', c)

    const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002'
    const url = `${backendUrl}/api/knowledge/content?${queryParams.toString()}`

    const response = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      next: { revalidate: 600 }
    })

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch educational content' }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error proxying knowledge content:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 