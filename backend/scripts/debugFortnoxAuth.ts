import axios from 'axios'

const FORTNOX_BASE_URL = process.env.FORTNOX_BASE_URL || 'https://api.fortnox.se/3'
const FORTNOX_API_TOKEN = process.env.FORTNOX_API_TOKEN

console.log('🔍 Debugging Fortnox Bearer Token Authentication...')
console.log('Base URL:', FORTNOX_BASE_URL)
console.log('Has API Token:', !!FORTNOX_API_TOKEN)

if (!FORTNOX_API_TOKEN) {
  console.error('❌ FORTNOX_API_TOKEN is missing')
  process.exit(1)
}

// Show token format (masked for security)
const tokenStart = FORTNOX_API_TOKEN.substring(0, 10)
const tokenEnd = FORTNOX_API_TOKEN.substring(FORTNOX_API_TOKEN.length - 10)
console.log(`Token format: ${tokenStart}...${tokenEnd} (length: ${FORTNOX_API_TOKEN.length})`)

// Check if it looks like a JWT
const isJwtFormat = FORTNOX_API_TOKEN.includes('.') && FORTNOX_API_TOKEN.split('.').length === 3
console.log('JWT format:', isJwtFormat)

if (isJwtFormat) {
  const parts = FORTNOX_API_TOKEN.split('.')
  console.log('JWT parts:', parts.map(p => `${p.substring(0, 10)}...${p.substring(p.length - 5)} (${p.length})`))
}

const headers = {
  'Authorization': `Bearer ${FORTNOX_API_TOKEN}`,
  'Content-Type': 'application/json',
  'Accept': 'application/json'
}

console.log('\n🔐 Request Headers:')
console.log('Authorization:', `Bearer ${tokenStart}...${tokenEnd}`)
console.log('Content-Type:', headers['Content-Type'])
console.log('Accept:', headers['Accept'])

async function testCompanyInfo() {
  try {
    console.log('\n📡 Making request to /companyinformation...')
    
    const response = await axios.get(`${FORTNOX_BASE_URL}/companyinformation`, { 
      headers,
      timeout: 10000,
      validateStatus: () => true // Don't throw on 4xx/5xx
    })
    
    console.log(`📊 Response Status: ${response.status} ${response.statusText}`)
    console.log('📋 Response Headers:')
    Object.entries(response.headers).forEach(([key, value]) => {
      console.log(`   ${key}: ${value}`)
    })
    
    console.log('\n📄 Response Body:')
    console.log(JSON.stringify(response.data, null, 2))
    
    if (response.status === 200) {
      console.log('✅ SUCCESS: Bearer token is working!')
    } else if (response.status === 401) {
      console.log('❌ UNAUTHORIZED: Bearer token is invalid, expired, or lacks permissions')
      
      if (response.data?.message) {
        console.log(`   Message: ${response.data.message}`)
      }
      if (response.data?.error) {
        console.log(`   Error: ${response.data.error}`)
      }
      if (response.data?.error_description) {
        console.log(`   Description: ${response.data.error_description}`)
      }
    } else if (response.status === 403) {
      console.log('❌ FORBIDDEN: Bearer token is valid but lacks required permissions/scopes')
    } else if (response.status === 429) {
      console.log('⏰ RATE LIMITED: Too many requests')
    }
    
  } catch (error: any) {
    console.error('💥 Request failed:', error.message)
    if (error.code) {
      console.error('   Error code:', error.code)
    }
  }
}

async function main() {
  await testCompanyInfo()
  
  console.log('\n📋 Summary for Fortnox Support:')
  console.log('- Using Bearer token authentication')
  console.log('- Token format appears to be:', isJwtFormat ? 'JWT' : 'Unknown')
  console.log('- Getting 401 Unauthorized response')
  console.log('- No rate limiting (would be 429)')
  console.log('- No IP blocking confirmed by Fortnox')
  console.log('\n🤔 Likely issues:')
  console.log('1. Bearer token is expired')
  console.log('2. Bearer token lacks required scopes')
  console.log('3. Bearer token is malformed')
  console.log('4. Account/app configuration issue')
}

if (require.main === module) {
  main()
} 