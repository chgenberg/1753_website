import axios from 'axios'

const FORTNOX_BASE_URL = process.env.FORTNOX_BASE_URL || 'https://api.fortnox.se/3'
const FORTNOX_API_TOKEN = process.env.FORTNOX_API_TOKEN
const FORTNOX_CLIENT_SECRET = process.env.FORTNOX_CLIENT_SECRET
const FORTNOX_USE_OAUTH = process.env.FORTNOX_USE_OAUTH

console.log('🔍 Testing Fortnox Header Configurations...')
console.log('Base URL:', FORTNOX_BASE_URL)
console.log('Has API Token:', !!FORTNOX_API_TOKEN)
console.log('Has Client Secret:', !!FORTNOX_CLIENT_SECRET)
console.log('FORTNOX_USE_OAUTH:', FORTNOX_USE_OAUTH)

if (!FORTNOX_API_TOKEN) {
  console.error('❌ FORTNOX_API_TOKEN is missing')
  process.exit(1)
}

// Test different header configurations
const headerConfigs = [
  {
    name: 'OAuth Bearer (standard)',
    headers: {
      'Authorization': `Bearer ${FORTNOX_API_TOKEN}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  },
  {
    name: 'OAuth Bearer (lowercase)',
    headers: {
      'authorization': `Bearer ${FORTNOX_API_TOKEN}`,
      'content-type': 'application/json',
      'accept': 'application/json'
    }
  },
  {
    name: 'OAuth Bearer (without Bearer prefix)',
    headers: {
      'Authorization': FORTNOX_API_TOKEN,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  },
  {
    name: 'Legacy Access-Token + Client-Secret',
    headers: {
      'Access-Token': FORTNOX_API_TOKEN,
      'Client-Secret': FORTNOX_CLIENT_SECRET || '',
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  }
]

async function testHeaderConfig(config: any) {
  try {
    console.log(`\n📡 Testing: ${config.name}`)
    console.log('Headers being sent:')
    Object.entries(config.headers).forEach(([key, value]) => {
      if (key.toLowerCase().includes('auth') || key.toLowerCase().includes('token')) {
        // Mask sensitive data
        const val = String(value)
        const masked = val.length > 20 ? val.substring(0, 20) + '...' : val
        console.log(`  ${key}: ${masked}`)
      } else {
        console.log(`  ${key}: ${value}`)
      }
    })
    
    const response = await axios.get(`${FORTNOX_BASE_URL}/companyinformation`, { 
      headers: config.headers,
      timeout: 10000,
      validateStatus: () => true // Don't throw on 4xx/5xx
    })
    
    console.log(`📊 Response: ${response.status} ${response.statusText}`)
    
    if (response.status === 200) {
      console.log('✅ SUCCESS: This header configuration works!')
      if (response.data?.CompanyInformation) {
        console.log(`Company: ${response.data.CompanyInformation.CompanyName || 'N/A'}`)
      }
      return true
    } else if (response.status === 401) {
      console.log('❌ UNAUTHORIZED')
      if (response.data?.ErrorInformation) {
        console.log(`Error: ${response.data.ErrorInformation.Message} (Code: ${response.data.ErrorInformation.Code})`)
      } else if (response.data?.message) {
        console.log(`Message: ${response.data.message}`)
      }
    } else if (response.status === 403) {
      console.log('❌ FORBIDDEN - Token valid but lacks permissions')
    } else {
      console.log(`❌ Unexpected status: ${response.status}`)
    }
    
    return false
    
  } catch (error: any) {
    console.log(`💥 Request failed: ${error.message}`)
    return false
  }
}

async function main() {
  let workingConfig: any = null
  
  for (const config of headerConfigs) {
    const success = await testHeaderConfig(config)
    if (success && !workingConfig) {
      workingConfig = config
    }
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500))
  }
  
  console.log('\n📋 Summary:')
  if (workingConfig) {
    console.log(`✅ Working configuration found: ${workingConfig.name}`)
    console.log('\n🎯 Recommendation:')
    if (workingConfig.name.includes('Legacy')) {
      console.log('Your token works with the legacy API authentication method.')
      console.log('Make sure FORTNOX_USE_OAUTH is set to "false" in Railway.')
    } else {
      console.log('Your token works with OAuth Bearer authentication.')
      console.log('Make sure FORTNOX_USE_OAUTH is set to "true" in Railway.')
    }
  } else {
    console.log('❌ No working configuration found!')
    console.log('\n🤔 Possible issues:')
    console.log('1. Token is expired or invalid')
    console.log('2. Token lacks required permissions')
    console.log('3. Account/app configuration issue')
    console.log('\nYou need to generate new tokens in Fortnox Developer Portal.')
  }
}

if (require.main === module) {
  main()
} 