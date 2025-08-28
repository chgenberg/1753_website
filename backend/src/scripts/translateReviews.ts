#!/usr/bin/env ts-node
import 'dotenv/config'
import { prisma } from '../lib/prisma'
import { OpenAI } from 'openai'

const SUPPORTED = ['en','es','de','fr'] as const

type Locale = typeof SUPPORTED[number]

function getClient() {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) throw new Error('OPENAI_API_KEY not set')
  return new OpenAI({ apiKey })
}

async function translateText(client: OpenAI, text: string, target: Locale): Promise<string> {
  if (!text) return text
  const prompt = `Translate to ${target}. Keep names (people, brands, product names, INCI) unchanged. Preserve formatting, punctuation and line breaks. If already in ${target}, return as-is.\n\nText:\n${text}`
  const completion = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL || 'gpt-5-mini',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.2,
    max_tokens: 800
  })
  return (completion.choices[0]?.message?.content || '').trim()
}

async function translateReviews() {
  const client = getClient()
  const pageSize = 200
  let skip = 0
  let processed = 0

  for (;;) {
    const reviews = await prisma.review.findMany({
      where: { status: 'APPROVED' },
      orderBy: { createdAt: 'desc' },
      select: { id: true, title: true, body: true },
      skip,
      take: pageSize
    })
    if (reviews.length === 0) break

    for (const r of reviews) {
      for (const loc of SUPPORTED) {
        // Check existing translation
        const existing = await prisma.reviewTranslation.findUnique({
          where: { reviewId_locale: { reviewId: r.id, locale: loc } }
        }).catch(() => null)

        const title = await translateText(client, r.title || '', loc)
        const body = await translateText(client, r.body || '', loc)

        if (existing) {
          await prisma.reviewTranslation.update({
            where: { id: existing.id },
            data: { title, body }
          })
        } else {
          await prisma.reviewTranslation.create({
            data: { reviewId: r.id, locale: loc, title, body }
          })
        }
      }
      processed++
      if (processed % 25 === 0) {
        // brief delay to be gentle on API
        await new Promise(res => setTimeout(res, 350))
      }
    }

    skip += pageSize
    console.log(`Translated batch, total processed: ${processed}`)
  }

  console.log(`Review translations complete. Total reviews processed: ${processed}`)
}

translateReviews().catch(err => { console.error(err); process.exit(1) }) 