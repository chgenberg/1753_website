#!/usr/bin/env node
const fs = require('fs')
const path = require('path')

const MESSAGES_DIR = path.resolve(__dirname, '../../messages')
const SOURCE_LOCALE = 'en'
const TARGET_LOCALES = ['es', 'de', 'fr']

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'))
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf-8')
}

async function main() {
  const sourcePath = path.join(MESSAGES_DIR, `${SOURCE_LOCALE}.json`)
  if (!fs.existsSync(sourcePath)) {
    console.error(`Source messages not found: ${sourcePath}`)
    process.exit(1)
  }
  const source = readJson(sourcePath)

  for (const locale of TARGET_LOCALES) {
    const outPath = path.join(MESSAGES_DIR, `${locale}.json`)
    if (fs.existsSync(outPath)) {
      console.log(`Skipping ${locale}: file already exists`)
      continue
    }
    // Simple initial seed: copy English as a base
    // TODO: Integrate OpenAI translation step if desired
    writeJson(outPath, source)
    console.log(`Created ${outPath} (copied from ${SOURCE_LOCALE})`)
  }

  console.log('Done. You can now fill in translations for es/de/fr.')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
}) 