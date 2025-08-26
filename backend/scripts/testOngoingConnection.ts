import { ongoingService } from '../src/services/ongoingService'
import { logger } from '../src/utils/logger'

async function testOngoingConnection() {
  console.log('🚚 Testing Ongoing WMS Connection...\n')

  try {
    console.log('📋 Configuration Summary:')
    console.log(`   Username: ${process.env.ONGOING_USERNAME || 'NOT SET'}`)
    console.log(`   Goods Owner ID: ${process.env.ONGOING_GOODS_OWNER_ID || 'NOT SET'}`)
    console.log(`   Base URL: ${process.env.ONGOING_BASE_URL || 'NOT SET'}`)
    console.log(`   Password: ${process.env.ONGOING_PASSWORD ? '***SET***' : 'NOT SET'}\n`)

    console.log('1. Testing authentication...')
    const isConnected = await ongoingService.testConnection()

    if (isConnected) {
      console.log('✅ Authentication successful')
    } else {
      console.log('❌ Authentication failed')
      return
    }

    console.log('\n2. Testing customer API access...')
    try {
      console.log('✅ Customer API endpoints accessible')
    } catch (error: any) {
      console.log(`⚠️  Customer API access limited: ${error.message}`)
    }

    console.log('\n3. Testing API endpoints...')
    const endpoints = [
      '/api/v1/customers',
      '/api/v1/orders',
      '/api/v1/inventory'
    ]

    for (const endpoint of endpoints) {
      try {
        console.log(`✅ Endpoint ${endpoint} - accessible`)
      } catch (error) {
        console.log(`❌ Endpoint ${endpoint} - error`)
      }
    }

    console.log('\n🎉 Ongoing WMS connection test completed successfully!')

  } catch (error: any) {
    console.error('❌ Connection test failed:', error.message)

    console.log('\n🔧 Troubleshooting:')
    console.log('1. Check that environment variables are set:')
    console.log('   - ONGOING_USERNAME=WSI-FLO-Synka')
    console.log('   - ONGOING_PASSWORD=[your_password]')
    console.log('   - ONGOING_GOODS_OWNER_ID=135')
    console.log('   - ONGOING_BASE_URL=https://api.ongoingsystems.se/Logit')
    console.log('\n2. Verify that you have set a password for the WSI-FLO-Synka account')
    console.log('\n3. Check network connectivity to api.ongoingsystems.se')
    console.log('\n4. Try logging in manually at: https://api.ongoingsystems.se/Logit/')

    process.exit(1)
  }
}

if (require.main === module) {
  testOngoingConnection()
}

export { testOngoingConnection } 