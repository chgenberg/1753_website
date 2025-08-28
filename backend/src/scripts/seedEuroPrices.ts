#!/usr/bin/env ts-node
import 'dotenv/config'
import { prisma } from '../lib/prisma'

const prices: Record<string, number> = {
  'the-one-facial-oil': 51,
  'i-love-facial-oil': 66,
  'duo-kit-the-one-i-love': 86,
  'au-naturel-makeup-remover': 39,
  'fungtastic-mushroom-extract': 39,
  'ta-da-serum': 55,
  'duo-kit-ta-da-serum': 117
}

async function main() {
  let updated = 0
  for (const [slug, priceEUR] of Object.entries(prices)) {
    const product = await prisma.product.findUnique({ where: { slug } })
    if (!product) {
      console.warn(`Product not found for slug: ${slug}`)
      continue
    }
    await prisma.product.update({ where: { id: product.id }, data: { priceEUR } })
    console.log(`Set EUR price for ${slug} -> €${priceEUR}`)
    updated++
  }
  console.log(`Done. Updated ${updated} products.`)
}

main().catch(err => { console.error(err); process.exit(1) }) 