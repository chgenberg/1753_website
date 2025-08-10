import { Router } from 'express'
import fs from 'fs'
import path from 'path'

const router = Router()

export interface Retailer {
  name: string
  phone?: string
  website?: string
  address: string
  postalCode: string
  city: string
}

function loadRetailers(): Retailer[] {
  const filePath = path.resolve(__dirname, '../../data/retailers.json')
  try {
    const raw = fs.readFileSync(filePath, 'utf-8')
    const data = JSON.parse(raw)
    if (Array.isArray(data)) return data
    return data?.retailers || []
  } catch (e) {
    console.warn('Could not read retailers.json, returning empty list', e)
    return []
  }
}

router.get('/', (req, res) => {
  const q = (req.query.q as string || '').toLowerCase()
  const city = (req.query.city as string || '').toLowerCase()
  let items = loadRetailers()
  if (city) items = items.filter(r => (r.city || '').toLowerCase() === city)
  if (q) {
    items = items.filter(r =>
      (r.name || '').toLowerCase().includes(q) ||
      (r.city || '').toLowerCase().includes(q) ||
      (r.address || '').toLowerCase().includes(q)
    )
  }
  res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=300, stale-while-revalidate=600')
  res.json({ success: true, count: items.length, data: items })
})

router.get('/cities', (_req, res) => {
  const items = loadRetailers()
  const byCity: Record<string, Retailer[]> = {}
  for (const r of items) {
    const key = r.city || 'Okänd'
    if (!byCity[key]) byCity[key] = []
    byCity[key].push(r)
  }
  res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=300, stale-while-revalidate=600')
  res.json({ success: true, cities: Object.keys(byCity).length, data: byCity })
})

export default router 