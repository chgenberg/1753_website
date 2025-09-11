import axios from 'axios'

const FORTNOX_BASE_URL = process.env.FORTNOX_BASE_URL || 'https://api.fortnox.se/3'
const FORTNOX_API_TOKEN = process.env.FORTNOX_API_TOKEN
const FORTNOX_CLIENT_SECRET = process.env.FORTNOX_CLIENT_SECRET

console.log('🔍 Testing Fortnox API Connection...')
console.log('Base URL:', FORTNOX_BASE_URL)
console.log('Has API Token:', !!FORTNOX_API_TOKEN)
console.log('Has Client Secret:', !!FORTNOX_CLIENT_SECRET)

if (!FORTNOX_API_TOKEN) {
  console.error('❌ FORTNOX_API_TOKEN is missing')
  process.exit(1)
}

// Determine auth method
const isJwt = FORTNOX_API_TOKEN.includes('.') && FORTNOX_API_TOKEN.split('.').length >= 3

const headers = isJwt ? {
  'Authorization': `Bearer ${FORTNOX_API_TOKEN}`,
  'Content-Type': 'application/json',
  'Accept': 'application/json'
} : {
  'Access-Token': FORTNOX_API_TOKEN,
  'Client-Secret': FORTNOX_CLIENT_SECRET || '',
  'Content-Type': 'application/json',
  'Accept': 'application/json'
}

console.log('🔐 Auth method:', isJwt ? 'OAuth Bearer Token' : 'Legacy Access-Token + Client-Secret')

async function testFortnoxEndpoints() {
  const endpoints = [
    { name: 'Company Information', url: '/companyinformation' },
    { name: 'Orders List', url: '/orders' },
    { name: 'Customers List', url: '/customers' },
    { name: 'Articles List', url: '/articles' }
  ]

  for (const endpoint of endpoints) {
    try {
      console.log(`\n📡 Testing ${endpoint.name} (${endpoint.url})...`)
      
      const response = await axios.get(`${FORTNOX_BASE_URL}${endpoint.url}`, { 
        headers,
        timeout: 10000
      })
      
      console.log(`✅ ${endpoint.name}: Success (${response.status})`)
      
      if (response.data.ErrorInformation) {
        console.log('⚠️  API returned error info:', response.data.ErrorInformation)
      } else {
        // Show some basic info about the response
        const data = response.data
        if (endpoint.url === '/orders' && data.Orders) {
          console.log(`📊 Found ${data.Orders.length} orders`)
        } else if (endpoint.url === '/customers' && data.Customers) {
          console.log(`📊 Found ${data.Customers.length} customers`)
        } else if (endpoint.url === '/articles' && data.Articles) {
          console.log(`📊 Found ${data.Articles.length} articles`)
        } else if (endpoint.url === '/companyinformation' && data.CompanyInformation) {
          console.log(`📊 Company: ${data.CompanyInformation.CompanyName || 'N/A'}`)
        }
      }
      
    } catch (error: any) {
      console.log(`❌ ${endpoint.name}: Failed`)
      
      if (error.response) {
        console.log(`   Status: ${error.response.status}`)
        console.log(`   Status Text: ${error.response.statusText}`)
        
        if (error.response.data?.ErrorInformation) {
          const errorInfo = error.response.data.ErrorInformation
          console.log(`   Error: ${errorInfo.Message} (Code: ${errorInfo.Code})`)
        } else if (error.response.data) {
          console.log(`   Response:`, JSON.stringify(error.response.data, null, 2))
        }
      } else if (error.request) {
        console.log(`   Network Error: ${error.message}`)
      } else {
        console.log(`   Error: ${error.message}`)
      }
    }
    
    // Small delay between requests to be nice to the API
    await new Promise(resolve => setTimeout(resolve, 500))
  }
}

async function main() {
  try {
    await testFortnoxEndpoints()
    console.log('\n🎉 Fortnox API test completed!')
  } catch (error) {
    console.error('\n💥 Test failed:', error)
    process.exit(1)
  }
}

if (require.main === module) {
  main()
} 