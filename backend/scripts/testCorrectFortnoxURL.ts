import axios from 'axios'

const CLIENT_ID = 'lWspWpJ1EjTS'
const REDIRECT_URI = 'https://1753websitebackend-production.up.railway.app/oauth/callback'
const BASE_URL = 'https://apps.fortnox.se/oauth-v1/auth'

// Test different scope formats
const scopeVariants = [
  // Original format we used
  'companyinformation+customer+article+order+invoice',
  // Space separated (URL encoded)
  'companyinformation%20customer%20article%20order%20invoice',
  // Space separated (not encoded)
  'companyinformation customer article order invoice',
  // Comma separated
  'companyinformation,customer,article,order,invoice',
  // From Fortnox support (fixed)
  'article%20invoice%20companyinformation%20customer%20order'
]

async function testURL(scope: string, description: string) {
  // Build URL with all parameters from Fortnox support
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    scope: scope,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    access_type: 'offline',
    account_type: 'service',
    state: 'test123'
  })
  
  const fullUrl = `${BASE_URL}?${params.toString()}`
  
  try {
    console.log(`\n🔍 Testing: ${description}`)
    console.log(`📋 Scope: ${scope}`)
    
    const response = await axios.get(fullUrl, {
      timeout: 10000,
      validateStatus: () => true, // Don't throw on any status
      maxRedirects: 0 // Don't follow redirects
    })
    
    console.log(`📊 Status: ${response.status} ${response.statusText}`)
    
    if (response.status === 200) {
      console.log('✅ SUCCESS: This URL works!')
      console.log('🌐 Use this URL:', fullUrl)
      return { success: true, url: fullUrl, status: response.status }
    } else if (response.status === 302 || response.status === 301) {
      console.log('🔄 REDIRECT: This might work!')
      console.log('📍 Redirects to:', response.headers.location)
      console.log('🌐 Use this URL:', fullUrl)
      return { success: true, url: fullUrl, status: response.status }
    } else if (response.status === 400) {
      console.log('⚠️  BAD REQUEST: Parameters might be wrong')
      if (response.data) {
        console.log('📄 Error:', typeof response.data === 'string' ? response.data : JSON.stringify(response.data))
      }
      return { success: false, url: fullUrl, status: response.status }
    } else {
      console.log(`❌ Status ${response.status}`)
      if (response.data) {
        console.log('📄 Response:', typeof response.data === 'string' ? response.data.substring(0, 200) : JSON.stringify(response.data))
      }
      return { success: false, url: fullUrl, status: response.status }
    }
    
  } catch (error: any) {
    console.log(`💥 Error: ${error.message}`)
    return { success: false, url: fullUrl, status: 'ERROR' }
  }
}

async function main() {
  console.log('🔍 Testing Corrected Fortnox OAuth URL...')
  console.log(`Base URL: ${BASE_URL}`)
  console.log(`Client ID: ${CLIENT_ID}`)
  console.log(`Redirect URI: ${REDIRECT_URI}`)
  
  const results: any[] = []
  
  for (let i = 0; i < scopeVariants.length; i++) {
    const scope = scopeVariants[i]
    const description = `Variant ${i + 1}`
    const result = await testURL(scope, description)
    results.push(result)
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
  
  console.log('\n📋 SUMMARY:')
  console.log('='.repeat(60))
  
  const workingUrls = results.filter(r => r.success)
  
  if (workingUrls.length > 0) {
    console.log('✅ WORKING URL(S):')
    workingUrls.forEach((result, index) => {
      console.log(`\n${index + 1}. Status: ${result.status}`)
      console.log(`   URL: ${result.url}`)
    })
    
    console.log('\n🎯 NEXT STEPS:')
    console.log('1. Copy the working URL above')
    console.log('2. Open it in your browser')
    console.log('3. Log in to Fortnox and approve the permissions')
    console.log('4. Copy the authorization code from the callback URL')
    console.log('5. Run: railway run npx ts-node scripts/exchangeFortnoxCode.ts [CODE]')
  } else {
    console.log('❌ No working URLs found')
    console.log('\n🤔 Possible issues:')
    console.log('- Client ID might be incorrect')
    console.log('- Redirect URI might not be registered')
    console.log('- Account type or access type parameters might be wrong')
    console.log('\n📞 Contact Fortnox support again with these test results')
  }
}

if (require.main === module) {
  main()
} 