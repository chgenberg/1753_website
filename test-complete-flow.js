const https = require('https');

const testCompleteFlow = async () => {
  console.log('🧪 Testing complete order flow without real money...');
  
  // Test order creation with correct data format
  const orderData = {
    customer: {
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'Customer',
      phone: '0701234567'
    },
    shippingAddress: {
      address: 'Testgatan 1',
      city: 'Stockholm',
      postalCode: '11122',
      country: 'Sweden'
    },
    items: [
      {
        productId: 'test-product',
        quantity: 1,
        price: 299
      }
    ],
    subtotal: 299,
    shippingCost: 49,
    total: 348,
    currency: 'SEK',
    newsletter: false  // Now optional but included
  };

  console.log('1. Testing order creation...');
  
  return new Promise((resolve) => {
    const postData = JSON.stringify(orderData);
    
    const options = {
      hostname: '1753websitebackend-production.up.railway.app',
      port: 443,
      path: '/api/orders/create',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'Origin': 'https://1753website-production.up.railway.app'
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        console.log(`📊 Status: ${res.statusCode}`);
        
        try {
          const result = JSON.parse(responseData);
          
          if (result.success) {
            console.log('✅ Order creation successful!');
            console.log(`📦 Order ID: ${result.orderId}`);
            console.log(`🔢 Order Code: ${result.orderCode}`);
            console.log(`💰 Amount: ${result.amount}`);
            
            // Now test manual webhook trigger
            setTimeout(() => {
              console.log('\n2. Testing manual webhook trigger...');
              testManualWebhook(result.orderId);
            }, 2000);
            
          } else {
            console.log('❌ Order creation failed:', result.error);
            if (result.details) {
              console.log('📋 Details:', result.details);
            }
          }
        } catch (e) {
          console.log('❌ Failed to parse response:', responseData);
        }
        
        resolve();
      });
    });

    req.on('error', (error) => {
      console.error('❌ Request failed:', error.message);
      resolve();
    });

    req.write(postData);
    req.end();
  });
};

const testManualWebhook = (orderId) => {
  // Find the order by ID and trigger webhook processing
  const options = {
    hostname: '1753websitebackend-production.up.railway.app',
    port: 443,
    path: `/api/webhooks/test-webhook?orderNumber=${orderId}`,
    method: 'GET'
  };

  const req = https.request(options, (res) => {
    let responseData = '';
    res.on('data', (chunk) => {
      responseData += chunk;
    });
    
    res.on('end', () => {
      console.log(`📊 Webhook test status: ${res.statusCode}`);
      
      try {
        const result = JSON.parse(responseData);
        
        if (result.success) {
          console.log('✅ Webhook processing successful!');
          console.log('🎯 This means Fortnox and Ongoing integration should work!');
        } else {
          console.log('❌ Webhook test failed:', result.error);
        }
      } catch (e) {
        console.log('Response:', responseData);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Webhook test failed:', error.message);
  });

  req.end();
};

testCompleteFlow();
