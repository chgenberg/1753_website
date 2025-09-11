const FORTNOX_API_TOKEN = process.env.FORTNOX_API_TOKEN

console.log('🔍 Debugging Fortnox Authorization Header...')

if (!FORTNOX_API_TOKEN) {
  console.error('❌ FORTNOX_API_TOKEN is missing')
  process.exit(1)
}

console.log('\n📋 Token Analysis:')
console.log('Token length:', FORTNOX_API_TOKEN.length)
console.log('Token start:', FORTNOX_API_TOKEN.substring(0, 50))
console.log('Token end:', FORTNOX_API_TOKEN.substring(FORTNOX_API_TOKEN.length - 50))

// Check for invalid characters
const invalidChars: Array<{char: string, position: number, code: number}> = []
const validHeaderChars = /^[\x21-\x7E\x80-\xFF]*$/ // Valid HTTP header characters

for (let i = 0; i < FORTNOX_API_TOKEN.length; i++) {
  const char = FORTNOX_API_TOKEN[i]
  const charCode = char.charCodeAt(0)
  
  // Check for common problematic characters
  if (charCode < 32 || charCode === 127) {
    invalidChars.push({
      char: char === '\n' ? '\\n' : char === '\r' ? '\\r' : char === '\t' ? '\\t' : `\\x${charCode.toString(16).padStart(2, '0')}`,
      position: i,
      code: charCode
    })
  }
}

console.log('\n🔍 Invalid Characters Found:')
if (invalidChars.length === 0) {
  console.log('✅ No obviously invalid characters found')
} else {
  console.log(`❌ Found ${invalidChars.length} invalid characters:`)
  invalidChars.forEach(invalid => {
    console.log(`   Position ${invalid.position}: "${invalid.char}" (code: ${invalid.code})`)
  })
}

// Check for line breaks specifically
const hasLineBreaks = /[\r\n]/.test(FORTNOX_API_TOKEN)
console.log('\n📄 Line Break Check:')
console.log('Has line breaks:', hasLineBreaks)

if (hasLineBreaks) {
  const lines = FORTNOX_API_TOKEN.split(/[\r\n]+/)
  console.log(`Token is split into ${lines.length} lines:`)
  lines.forEach((line, index) => {
    if (line.length > 0) {
      console.log(`   Line ${index + 1}: "${line.substring(0, 30)}..." (${line.length} chars)`)
    }
  })
}

// Show what the Authorization header would look like
const authHeader = `Bearer ${FORTNOX_API_TOKEN}`
console.log('\n🔐 Authorization Header:')
console.log('Header length:', authHeader.length)
console.log('Header start:', authHeader.substring(0, 80))
console.log('Header end:', authHeader.substring(authHeader.length - 30))

// Check if header contains any control characters
const controlChars = authHeader.match(/[\x00-\x1F\x7F]/g)
if (controlChars) {
  console.log('\n❌ Control characters in header:')
  controlChars.forEach((char, index) => {
    console.log(`   "${char}" (code: ${char.charCodeAt(0)})`)
  })
} else {
  console.log('\n✅ No control characters in header')
}

// Test if we can create the header without errors
try {
  const testHeaders = {
    'Authorization': authHeader,
    'Content-Type': 'application/json'
  }
  console.log('\n✅ Header creation test: SUCCESS')
} catch (error: any) {
  console.log('\n❌ Header creation test: FAILED')
  console.log('Error:', error.message)
} 