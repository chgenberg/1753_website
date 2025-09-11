import axios from 'axios'

const CLIENT_ID = 'lWspWpJ1EjTS'
const REDIRECT_URI = 'https://1753websitebackend-production.up.railway.app/oauth/callback'
const SCOPE = 'companyinformation+customer+article+order+invoice'

const endpoints = [
  'https://apps.fortnox.se/oauth-v1/authorize',
  'https://api.fortnox.se/oauth2/authorize', 
  'https://api.fortnox.se/3/oauth2/authorize',
  'https://apps.fortnox.se/oauth/authorize',
  'https://apps.fortnox.se/oauth2/authorize',
  'https://auth.fortnox.se/oauth2/authorize',
  'https://login.fortnox.se/oauth2/authorize',
  'https://apps5.fortnox.se/oauth-v1/authorize',
  'https://apps5.fortnox.se/oauth2/authorize'
]

async function testEndpoint(baseUrl: string) {
  const fullUrl = `${baseUrl}?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=${SCOPE}`
  
  try {
    console.log(`\n🔍 Testing: ${baseUrl}`)
    
    const response = await axios.get(fullUrl, {
      timeout: 5000,
      validateStatus: () => true, // Don't throw on any status
      maxRedirects: 0 // Don't follow redirects
    })
    
    console.log(`📊 Status: ${response.status} ${response.statusText}`)
    
    if (response.status === 200) {
      console.log('✅ SUCCESS: This endpoint works!')
      console.log('🌐 Full URL:', fullUrl)
      return { url: baseUrl, status: response.status, working: true }
    } else if (response.status === 302 || response.status === 301) {
      console.log('🔄 REDIRECT: This might be the right endpoint!')
      console.log('📍 Location:', response.headers.location)
      console.log('🌐 Full URL:', fullUrl)
      return { url: baseUrl, status: response.status, working: true }
    } else if (response.status === 400) {
      console.log('⚠️  BAD REQUEST: Endpoint exists but parameters might be wrong')
      if (response.data) {
        console.log('📄 Response:', typeof response.data === 'string' ? response.data.substring(0, 200) : JSON.stringify(response.data))
      }
      return { url: baseUrl, status: response.status, working: false }
    } else {
      console.log(`❌ Status ${response.status}: ${response.data ? (typeof response.data === 'string' ? response.data.substring(0, 100) : JSON.stringify(response.data)) : 'No response data'}`)
      return { url: baseUrl, status: response.status, working: false }
    }
    
  } catch (error: any) {
    if (error.code === 'ENOTFOUND') {
      console.log('❌ DNS ERROR: Domain not found')
    } else if (error.code === 'ECONNREFUSED') {
      console.log('❌ CONNECTION REFUSED')
    } else if (error.response) {
      console.log(`❌ HTTP ${error.response.status}: ${error.response.statusText}`)
    } else {
      console.log(`❌ ERROR: ${error.message}`)
    }
    return { url: baseUrl, status: error.response?.status || 'ERROR', working: false }
  }
}

async function main() {
  console.log('🔍 Testing Fortnox OAuth Authorization Endpoints...')
  console.log(`Client ID: ${CLIENT_ID}`)
  console.log(`Redirect URI: ${REDIRECT_URI}`)
  console.log(`Scope: ${SCOPE}`)
  
  const results: any[] = []
  
  for (const endpoint of endpoints) {
    const result = await testEndpoint(endpoint)
    results.push(result)
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
  
  console.log('\n📋 SUMMARY:')
  console.log('='.repeat(50))
  
  const workingEndpoints = results.filter(r => r.working)
  const possibleEndpoints = results.filter(r => r.status === 400)
  
  if (workingEndpoints.length > 0) {
    console.log('✅ WORKING ENDPOINTS:')
    workingEndpoints.forEach(r => {
      console.log(`   ${r.url} (${r.status})`)
    })
  }
  
  if (possibleEndpoints.length > 0) {
    console.log('\n⚠️  POSSIBLE ENDPOINTS (400 Bad Request):')
    possibleEndpoints.forEach(r => {
      console.log(`   ${r.url} (${r.status})`)
    })
    console.log('   ^ These exist but may need different parameters')
  }
  
  if (workingEndpoints.length === 0 && possibleEndpoints.length === 0) {
    console.log('❌ No working endpoints found!')
    console.log('   The OAuth system might have changed significantly.')
    console.log('   Contact Fortnox support or check their latest documentation.')
  }
  
  console.log('\n🎯 RECOMMENDED NEXT STEPS:')
  if (workingEndpoints.length > 0) {
    const best = workingEndpoints[0]
    const fullUrl = `${best.url}?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=${SCOPE}`
    console.log('Use this URL in your browser:')
    console.log(fullUrl)
  } else {
    console.log('Contact Fortnox support with your Client ID and ask for the correct OAuth authorization endpoint.')
  }
}

if (require.main === module) {
  main()
} 