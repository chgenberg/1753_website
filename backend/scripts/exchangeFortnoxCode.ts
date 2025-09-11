import axios from 'axios'

// Du behöver fylla i dessa värden från Fortnox Developer Portal
const FORTNOX_CLIENT_ID = process.env.FORTNOX_CLIENT_ID || 'din_client_id'
const FORTNOX_CLIENT_SECRET = process.env.FORTNOX_CLIENT_SECRET || 'din_client_secret'
const REDIRECT_URI = 'https://1753websitebackend-production.up.railway.app/oauth/callback'

// Du får denna kod från OAuth-flödet
const AUTHORIZATION_CODE = process.argv[2] // Skickas som argument

console.log('🔄 Exchanging Authorization Code for Tokens...')
console.log('Client ID:', FORTNOX_CLIENT_ID)
console.log('Has Client Secret:', !!FORTNOX_CLIENT_SECRET)
console.log('Redirect URI:', REDIRECT_URI)
console.log('Authorization Code:', AUTHORIZATION_CODE ? 'PROVIDED' : 'MISSING')

if (!AUTHORIZATION_CODE) {
  console.error('❌ Usage: npx ts-node scripts/exchangeFortnoxCode.ts [AUTHORIZATION_CODE]')
  console.error('Example: npx ts-node scripts/exchangeFortnoxCode.ts abc123def456')
  process.exit(1)
}

if (!FORTNOX_CLIENT_ID || !FORTNOX_CLIENT_SECRET) {
  console.error('❌ Missing required environment variables:')
  if (!FORTNOX_CLIENT_ID) console.error('  - FORTNOX_CLIENT_ID')
  if (!FORTNOX_CLIENT_SECRET) console.error('  - FORTNOX_CLIENT_SECRET')
  process.exit(1)
}

async function exchangeCodeForTokens() {
  try {
    console.log('\n📡 Making token exchange request...')
    
    const tokenUrl = 'https://apps.fortnox.se/oauth-v1/token'
    
    const data = new URLSearchParams({
      grant_type: 'authorization_code',
      code: AUTHORIZATION_CODE,
      client_id: FORTNOX_CLIENT_ID,
      client_secret: FORTNOX_CLIENT_SECRET,
      redirect_uri: REDIRECT_URI
    })

    const response = await axios.post(tokenUrl, data, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      timeout: 10000,
      validateStatus: () => true // Don't throw on 4xx/5xx
    })

    console.log(`📊 Response Status: ${response.status} ${response.statusText}`)
    
    if (response.status === 200) {
      const tokenData = response.data
      
      console.log('✅ SUCCESS: Tokens generated successfully!')
      console.log('\n🔑 Token Information:')
      console.log('Access Token (first 50 chars):', tokenData.access_token?.substring(0, 50) + '...')
      console.log('Token Type:', tokenData.token_type)
      console.log('Expires In:', tokenData.expires_in, 'seconds')
      console.log('Scope:', tokenData.scope)
      console.log('Refresh Token:', tokenData.refresh_token?.substring(0, 20) + '...')

      console.log('\n📋 Railway Environment Variables:')
      console.log('Copy and paste these commands:')
      console.log('')
      console.log(`railway variables set FORTNOX_API_TOKEN="${tokenData.access_token}"`)
      console.log(`railway variables set FORTNOX_REFRESH_TOKEN="${tokenData.refresh_token}"`)
      console.log('railway variables set FORTNOX_USE_OAUTH="true"')
      
      console.log('\n🎯 Next Steps:')
      console.log('1. Run the Railway commands above')
      console.log('2. Test the API: railway run npx ts-node scripts/debugFortnoxAuth.ts')
      console.log('3. Try importing orders: railway run npx ts-node scripts/syncPendingOrdersToFortnox.ts')

      return tokenData
      
    } else {
      console.log('❌ FAILED: Token exchange failed')
      console.log('Response Body:', JSON.stringify(response.data, null, 2))
      
      if (response.status === 400) {
        console.log('\n🤔 Common causes for 400 Bad Request:')
        console.log('- Authorization code has expired (codes expire quickly!)')
        console.log('- Authorization code has already been used')
        console.log('- Invalid client credentials')
        console.log('- Wrong redirect_uri')
      } else if (response.status === 401) {
        console.log('\n🤔 Common causes for 401 Unauthorized:')
        console.log('- Invalid client_id or client_secret')
        console.log('- Authorization code is invalid')
      }
      
      return null
    }
    
  } catch (error: any) {
    console.error('💥 Request failed:', error.message)
    if (error.response) {
      console.error('Response Status:', error.response.status)
      console.error('Response Data:', error.response.data)
    }
    return null
  }
}

async function main() {
  const tokens = await exchangeCodeForTokens()
  
  if (tokens) {
    console.log('\n🎉 Token exchange completed successfully!')
  } else {
    console.log('\n💥 Token exchange failed!')
    console.log('Please check the authorization code and try again.')
    console.log('Remember: Authorization codes expire quickly (usually within 10 minutes).')
  }
}

if (require.main === module) {
  main()
} 