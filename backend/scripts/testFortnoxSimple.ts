import { fortnoxService } from '../src/services/fortnoxService'
import { logger } from '../src/utils/logger'

async function testFortnoxConnection() {
  try {
    console.log('🔍 Testing Fortnox connection...')
    
    const isConnected = await fortnoxService.testConnection()
    
    if (isConnected) {
      console.log('✅ SUCCESS: Fortnox API is working!')
      console.log('🎉 You can now import orders to Fortnox!')
    } else {
      console.log('❌ FAILED: Fortnox connection failed')
    }
    
    return isConnected
    
  } catch (error: any) {
    console.error('💥 Error testing Fortnox:', error.message)
    return false
  }
}

if (require.main === module) {
  testFortnoxConnection()
    .then((success) => {
      process.exit(success ? 0 : 1)
    })
} 