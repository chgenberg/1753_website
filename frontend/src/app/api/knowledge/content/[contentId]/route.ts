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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ contentId: string }> }
) {
  try {
    const { searchParams } = new URL(request.url)
    const locale = detectLocale(request, searchParams)
    const { contentId } = await params

    const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002'
    const url = `${backendUrl}/api/knowledge/content/${contentId}?locale=${encodeURIComponent(locale)}`

    const auth = request.headers.get('authorization') || ''

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(auth ? { Authorization: auth } : {})
      }
    })

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch educational content' }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error proxying educational content by id:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 