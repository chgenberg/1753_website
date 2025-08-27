#!/usr/bin/env node
const fs = require('fs')
const path = require('path')

const MESSAGES_DIR = path.resolve(__dirname, '../../messages')
const SOURCE_LOCALE = 'sv'
const TARGET_LOCALES = ['en', 'es', 'de', 'fr']

// Configurable tokens per string; default 1000 for ample room
const MAX_COMPLETION_TOKENS = parseInt(process.env.OPENAI_MAX_COMPLETION_TOKENS || '1000', 10)
const VERBOSE = process.env.TRANSLATE_VERBOSE === '1' || process.env.VERBOSE === '1'

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'))
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf-8')
}

function countStrings(obj) {
  let c = 0
  const walk = (o) => {
    if (o && typeof o === 'object') {
      for (const k of Object.keys(o)) walk(o[k])
    } else if (typeof o === 'string') {
      c++
    }
  }
  walk(obj)
  return c
}

async function translateWithDeepL(text, targetLocale) {
  const apiKey = process.env.DEEPL_API_KEY
  if (!apiKey) return { text: null, provider: null }
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
  return { text: data?.translations?.[0]?.text || null, provider: 'deepl' }
}

async function translateWithOpenAI(text, targetLocale) {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return { text: null, provider: null }
  const { OpenAI } = require('openai')
  const client = new OpenAI({ apiKey })
  const model = process.env.OPENAI_MODEL || 'gpt-5-mini'
  const prompt = `Translate to ${targetLocale}. Keep placeholders and HTML tags intact. If untranslatable, return original.\n\nText: ${text}`
  const completion = await client.chat.completions.create({
    model,
    messages: [{ role: 'user', content: prompt }],
    max_completion_tokens: MAX_COMPLETION_TOKENS
  })
  return { text: completion.choices[0]?.message?.content?.trim() || null, provider: 'openai' }
}

async function translateText(text, targetLocale, stats) {
  try {
    const viaDeepL = await translateWithDeepL(text, targetLocale)
    if (viaDeepL.text) {
      stats.deepl++
      return viaDeepL.text
    }
  } catch (e) {
    if (VERBOSE) console.warn('DeepL failed:', e && e.message)
  }
  try {
    const viaOpenAI = await translateWithOpenAI(text, targetLocale)
    if (viaOpenAI.text) {
      stats.openai++
      return viaOpenAI.text
    }
  } catch (e) {
    if (VERBOSE) console.warn('OpenAI failed:', e && e.message)
  }
  stats.fallback++
  return null
}

async function translateObject(obj, targetLocale, onProgress, stats) {
  const out = Array.isArray(obj) ? [] : {}
  for (const key of Object.keys(obj)) {
    const val = obj[key]
    if (val && typeof val === 'object') {
      out[key] = await translateObject(val, targetLocale, onProgress, stats)
    } else if (typeof val === 'string') {
      const translated = await translateText(val, targetLocale, stats)
      out[key] = translated || val
      onProgress()
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
  const totalStrings = countStrings(sv)

  const enPath = path.join(MESSAGES_DIR, 'en.json')
  if (!fs.existsSync(enPath)) {
    writeJson(enPath, sv)
    console.log(`Seeded en.json from sv.json`)
  }

  for (const locale of TARGET_LOCALES) {
    const outPath = path.join(MESSAGES_DIR, `${locale}.json`)
    if (process.env.DEEPL_API_KEY || process.env.OPENAI_API_KEY) {
      console.log(`\n▶ Translating to ${locale} (${totalStrings} strings)...`)
      const stats = { deepl: 0, openai: 0, fallback: 0 }
      let done = 0
      const started = Date.now()
      const onProgress = () => {
        done++
        if (VERBOSE || done % 50 === 0) {
          const pct = Math.round((done / totalStrings) * 100)
          const elapsed = Math.round((Date.now() - started) / 1000)
          process.stdout.write(`\r   ${locale}: ${done}/${totalStrings} (${pct}%) • ${elapsed}s elapsed   `)
        }
      }
      const translated = await translateObject(sv, locale, onProgress, stats)
      if (!(VERBOSE || totalStrings % 50 === 0)) process.stdout.write('\n')
      writeJson(outPath, translated)
      console.log(`✓ Wrote ${outPath} | deepl=${stats.deepl} openai=${stats.openai} fallback=${stats.fallback}`)
    } else {
      const base = readJson(enPath)
      writeJson(outPath, base)
      console.log(`No translation API key set. Copied en.json to ${locale}.json as placeholder.`)
    }
  }

  console.log('\nDone.')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
}) 