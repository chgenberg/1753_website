import axios from 'axios'

const FORTNOX_CLIENT_ID = process.env.FORTNOX_CLIENT_ID
const FORTNOX_CLIENT_SECRET = process.env.FORTNOX_CLIENT_SECRET
const FORTNOX_REFRESH_TOKEN = process.env.FORTNOX_REFRESH_TOKEN

console.log('🔄 Refreshing Fortnox Access Token...')
console.log('Client ID:', FORTNOX_CLIENT_ID)
console.log('Has Client Secret:', !!FORTNOX_CLIENT_SECRET)
console.log('Has Refresh Token:', !!FORTNOX_REFRESH_TOKEN)

if (!FORTNOX_CLIENT_ID || !FORTNOX_CLIENT_SECRET || !FORTNOX_REFRESH_TOKEN) {
  console.error('❌ Missing required environment variables:')
  if (!FORTNOX_CLIENT_ID) console.error('  - FORTNOX_CLIENT_ID')
  if (!FORTNOX_CLIENT_SECRET) console.error('  - FORTNOX_CLIENT_SECRET')
  if (!FORTNOX_REFRESH_TOKEN) console.error('  - FORTNOX_REFRESH_TOKEN')
  process.exit(1)
}

async function refreshAccessToken() {
  try {
    console.log('\n📡 Making token refresh request...')
    
    const tokenUrl = 'https://api.fortnox.se/oauth2/token'
    
    const data = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: FORTNOX_REFRESH_TOKEN!,
      client_id: FORTNOX_CLIENT_ID!,
      client_secret: FORTNOX_CLIENT_SECRET!
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
      
      console.log('✅ SUCCESS: Token refreshed successfully!')
      console.log('\n🔑 New Token Information:')
      console.log('Access Token (first 50 chars):', tokenData.access_token?.substring(0, 50) + '...')
      console.log('Token Type:', tokenData.token_type)
      console.log('Expires In:', tokenData.expires_in, 'seconds')
      console.log('Scope:', tokenData.scope)
      
      if (tokenData.refresh_token) {
        console.log('New Refresh Token:', tokenData.refresh_token?.substring(0, 20) + '...')
      }

      console.log('\n📋 Update your Railway environment variables:')
      console.log('FORTNOX_API_TOKEN =', tokenData.access_token)
      if (tokenData.refresh_token) {
        console.log('FORTNOX_REFRESH_TOKEN =', tokenData.refresh_token)
      }

      console.log('\n🚀 Commands to update Railway:')
      console.log(`railway variables set FORTNOX_API_TOKEN="${tokenData.access_token}"`)
      if (tokenData.refresh_token) {
        console.log(`railway variables set FORTNOX_REFRESH_TOKEN="${tokenData.refresh_token}"`)
      }

      return tokenData
      
    } else {
      console.log('❌ FAILED: Token refresh failed')
      console.log('Response Body:', JSON.stringify(response.data, null, 2))
      
      if (response.status === 400) {
        console.log('\n🤔 Common causes for 400 Bad Request:')
        console.log('- Refresh token has expired')
        console.log('- Invalid client credentials')
        console.log('- Malformed request')
      } else if (response.status === 401) {
        console.log('\n🤔 Common causes for 401 Unauthorized:')
        console.log('- Invalid client_id or client_secret')
        console.log('- Refresh token is invalid or revoked')
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
  const newToken = await refreshAccessToken()
  
  if (newToken) {
    console.log('\n🎉 Token refresh completed successfully!')
    console.log('You can now test the API with the new token.')
  } else {
    console.log('\n💥 Token refresh failed!')
    console.log('You may need to re-authorize your application in Fortnox Developer Portal.')
  }
}

if (require.main === module) {
  main()
} 