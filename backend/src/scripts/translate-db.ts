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
  const prompt = `Translate to ${target}. Keep placeholders, markdown and HTML tags intact. Keep product/INCI names unchanged. If already in target language, return as-is.\n\nText:\n${text}`
  const completion = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.2,
    max_tokens: 1200
  })
  return (completion.choices[0]?.message?.content || '').trim()
}

async function translateArray(client: OpenAI, items: string[] | null | undefined, target: Locale) {
  if (!items || items.length === 0) return [] as string[]
  const joined = items.join('\n')
  const translated = await translateText(client, joined, target)
  return translated.split('\n').map(s => s.trim()).filter(Boolean)
}

async function translateProducts() {
  const client = getClient()
  const products = await prisma.product.findMany({})
  for (const p of products) {
    for (const loc of SUPPORTED) {
      const existing = await prisma.productTranslation.findUnique({ where: { productId_locale: { productId: p.id, locale: loc } } })
      const name = await translateText(client, p.name, loc)
      const description = await translateText(client, p.description || '', loc)
      const longDescription = await translateText(client, p.longDescription || '', loc)
      const howToUse = await translateText(client, p.howToUse || '', loc)
      const metaTitle = await translateText(client, p.metaTitle || '', loc)
      const metaDescription = await translateText(client, p.metaDescription || '', loc)
      if (existing) {
        await prisma.productTranslation.update({ where: { id: existing.id }, data: { name, description, longDescription, howToUse, metaTitle, metaDescription } })
      } else {
        await prisma.productTranslation.create({ data: { productId: p.id, locale: loc, name, description, longDescription, howToUse, metaTitle, metaDescription } })
      }
      console.log(`Product ${p.slug} -> ${loc} translated`)
    }
  }
}

async function translateIngredients() {
  const client = getClient()
  const ingredients = await prisma.ingredientInfo.findMany({})
  for (const ing of ingredients) {
    for (const loc of SUPPORTED) {
      const existing = await prisma.ingredientInfoTranslation.findUnique({ where: { ingredientId_locale: { ingredientId: ing.id, locale: loc } } })
      const displayName = await translateText(client, ing.displayName, loc)
      const description = await translateText(client, ing.description, loc)
      const benefits = await translateArray(client, ing.benefits, loc)
      const suitableFor = await translateArray(client, ing.suitableFor, loc)
      const notSuitableFor = await translateArray(client, ing.notSuitableFor, loc)
      const concentration = await translateText(client, ing.concentration || '', loc)
      const pHRange = await translateText(client, ing.pHRange || '', loc)
      const timeOfDay = await translateText(client, ing.timeOfDay || '', loc)
      const frequency = await translateText(client, ing.frequency || '', loc)
      const worksWellWith = await translateArray(client, ing.worksWellWith, loc)
      const avoidWith = await translateArray(client, ing.avoidWith, loc)
      const metaDescription = await translateText(client, ing.metaDescription || '', loc)
      const keywords = await translateArray(client, ing.keywords, loc)
      if (existing) {
        await prisma.ingredientInfoTranslation.update({ where: { id: existing.id }, data: { displayName, description, benefits, suitableFor, notSuitableFor, concentration, pHRange, timeOfDay, frequency, worksWellWith, avoidWith, metaDescription, keywords } })
      } else {
        await prisma.ingredientInfoTranslation.create({ data: { ingredientId: ing.id, locale: loc, displayName, description, benefits, suitableFor, notSuitableFor, concentration, pHRange, timeOfDay, frequency, worksWellWith, avoidWith, metaDescription, keywords } })
      }
      console.log(`Ingredient ${ing.slug} -> ${loc} translated`)
    }
  }
}

async function translateEducational() {
  const client = getClient()
  const items = await prisma.educationalContent.findMany({})
  for (const c of items) {
    for (const loc of SUPPORTED) {
      const existing = await prisma.educationalContentTranslation.findUnique({ where: { contentId_locale: { contentId: c.id, locale: loc } } })
      const title = await translateText(client, c.title || '', loc)
      const content = await translateText(client, c.content || '', loc)
      const excerpt = await translateText(client, c.excerpt || '', loc)
      const metaTitle = await translateText(client, c.metaTitle || '', loc)
      const metaDescription = await translateText(client, c.metaDescription || '', loc)
      const keywords = await translateArray(client, c.keywords || [], loc)
      if (existing) {
        await prisma.educationalContentTranslation.update({ where: { id: existing.id }, data: { title, content, excerpt, metaTitle, metaDescription, keywords } })
      } else {
        await prisma.educationalContentTranslation.create({ data: { contentId: c.id, locale: loc, title, content, excerpt, metaTitle, metaDescription, keywords } })
      }
      console.log(`Educational ${c.slug} -> ${loc} translated`)
    }
  }
}

async function translateBlog() {
  const client = getClient()
  const posts = await prisma.blogPost.findMany({})
  for (const post of posts) {
    for (const loc of SUPPORTED) {
      const existing = await prisma.blogPostTranslation.findUnique({ where: { postId_locale: { postId: post.id, locale: loc } } })
      const title = await translateText(client, post.title || '', loc)
      const content = await translateText(client, post.content || '', loc)
      const excerptSource = (post as any).excerpt || post.thumbnail || ''
      const excerpt = await translateText(client, excerptSource, loc)
      const metaTitle = await translateText(client, post.metaTitle || post.title || '', loc)
      const metaDescription = await translateText(client, post.metaDescription || excerptSource || '', loc)
      if (existing) {
        await prisma.blogPostTranslation.update({ where: { id: existing.id }, data: { title, content, excerpt, metaTitle, metaDescription } })
      } else {
        await prisma.blogPostTranslation.create({ data: { postId: post.id, locale: loc, title, content, excerpt, metaTitle, metaDescription } })
      }
      console.log(`Blog ${post.slug} -> ${loc} translated`)
    }
  }
}

async function translateRawMaterials() {
  const client = getClient()
  const items = await prisma.rawMaterial.findMany({})
  for (const r of items) {
    for (const loc of SUPPORTED) {
      const existing = await prisma.rawMaterialTranslation.findUnique({ where: { rawMaterialId_locale: { rawMaterialId: r.id, locale: loc } } })
      const name = await translateText(client, r.name || '', loc)
      const description = await translateText(client, r.description || '', loc)
      const healthBenefits = await translateArray(client, r.healthBenefits || [], loc)
      const nutrients = await translateArray(client, r.nutrients || [], loc)
      const metaTitle = await translateText(client, r.metaTitle || '', loc)
      const metaDescription = await translateText(client, r.metaDescription || '', loc)
      if (existing) {
        await prisma.rawMaterialTranslation.update({ where: { id: existing.id }, data: { name, description, healthBenefits, nutrients, metaTitle, metaDescription } })
      } else {
        await prisma.rawMaterialTranslation.create({ data: { rawMaterialId: r.id, locale: loc, name, description, healthBenefits, nutrients, metaTitle, metaDescription } })
      }
      console.log(`RawMaterial ${r.slug} -> ${loc} translated`)
    }
  }
}

async function main() {
  await translateProducts()
  await translateIngredients()
  await translateEducational()
  await translateBlog()
  await translateRawMaterials()
  console.log('DB translations complete.')
}

main().catch((e) => { console.error(e); process.exit(1) }) 