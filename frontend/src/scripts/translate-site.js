#!/usr/bin/env node
const fs = require('fs')
const path = require('path')

const MESSAGES_DIR = path.resolve(__dirname, '../../messages')
const SOURCE_LOCALE = 'sv'
const TARGET_LOCALES = ['en', 'es', 'de', 'fr']

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'))
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf-8')
}

async function translateWithDeepL(text, targetLocale) {
  const apiKey = process.env.DEEPL_API_KEY
  if (!apiKey) return null
  const endpoint = apiKey.startsWith('free:') ? 'https://api-free.deepl.com/v2/translate' : 'https://api.deepl.com/v2/translate'
  const realKey = apiKey.replace(/^free:/, '')
  const target = (targetLocale || '').toUpperCase()
  const deepLTarget = target === 'SV' ? 'SV' : target === 'EN' ? 'EN-GB' : target
  const params = new URLSearchParams()
  params.append('text', text)
  params.append('target_lang', deepLTarget)
  params.append('source_lang', 'SV')

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'DeepL-Auth-Key ' + realKey,
    },
    body: params,
  })
  if (!res.ok) {
    const msg = await res.text().catch(() => '')
    throw new Error(`DeepL error ${res.status}: ${msg}`)
  }
  const data = await res.json()
  return data?.translations?.[0]?.text || null
}

async function translateWithOpenAI(text, targetLocale) {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return null
  const { OpenAI } = require('openai')
  const client = new OpenAI({ apiKey })
  const model = process.env.OPENAI_MODEL || 'gpt-5-mini'
  const prompt = `Translate to ${targetLocale}. Keep placeholders and HTML tags intact. If untranslatable, return original.\n\nText: ${text}`
  const completion = await client.chat.completions.create({
    model,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.2,
    // gpt-5 / modern OpenAI models use max_completion_tokens instead of max_tokens
    max_completion_tokens: 300
  })
  return completion.choices[0]?.message?.content?.trim() || null
}

async function translateText(text, targetLocale) {
  try {
    const viaDeepL = await translateWithDeepL(text, targetLocale)
    if (viaDeepL) return viaDeepL
  } catch (e) {
    console.warn('DeepL failed, falling back to OpenAI:', e && e.message)
  }
  try {
    const viaOpenAI = await translateWithOpenAI(text, targetLocale)
    if (viaOpenAI) return viaOpenAI
  } catch (e) {
    console.warn('OpenAI failed:', e && e.message)
  }
  return null
}

async function translateObject(obj, targetLocale) {
  const out = Array.isArray(obj) ? [] : {}
  for (const key of Object.keys(obj)) {
    const val = obj[key]
    if (val && typeof val === 'object') {
      out[key] = await translateObject(val, targetLocale)
    } else if (typeof val === 'string') {
      const translated = await translateText(val, targetLocale)
      out[key] = translated || val
    } else {
      out[key] = val
    }
  }
  return out
}

async function main() {
  const svPath = path.join(MESSAGES_DIR, `${SOURCE_LOCALE}.json`)
  if (!fs.existsSync(svPath)) {
    console.error(`Source messages not found: ${svPath}`)
    process.exit(1)
  }
  const sv = readJson(svPath)

  const enPath = path.join(MESSAGES_DIR, 'en.json')
  if (!fs.existsSync(enPath)) {
    writeJson(enPath, sv)
    console.log(`Seeded en.json from sv.json`)
  }

  for (const locale of TARGET_LOCALES) {
    const outPath = path.join(MESSAGES_DIR, `${locale}.json`)
    if (process.env.DEEPL_API_KEY || process.env.OPENAI_API_KEY) {
      console.log(`Translating messages to ${locale}...`)
      const translated = await translateObject(sv, locale)
      writeJson(outPath, translated)
      console.log(`Wrote ${outPath}`)
    } else {
      const base = readJson(enPath)
      writeJson(outPath, base)
      console.log(`No translation API key set. Copied en.json to ${locale}.json as placeholder.`)
    }
  }

  console.log('Done.')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
}) 