const https = require('https');

const testOrderCreation = async () => {
  console.log('🧪 Testing order creation...');
  
  const orderData = {
    customer: {
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'Customer',
      phone: '0701234567'
    },
    shippingAddress: {
      firstName: 'Test',
      lastName: 'Customer',
      address: 'Testgatan 1',
      city: 'Stockholm',
      postalCode: '11122',
      country: 'Sweden'
    },
    billingAddress: {
      firstName: 'Test',
      lastName: 'Customer',
      address: 'Testgatan 1',
      city: 'Stockholm',
      postalCode: '11122',
      country: 'Sweden'
    },
    items: [
      {
        productId: 'test-product',
        name: 'Test Product',
        price: 299,
        quantity: 1
      }
    ],
    subtotal: 299,
    shippingCost: 49,
    total: 348,
    currency: 'SEK',
    paymentMethod: 'card'
  };

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
    console.log(`Status: ${res.statusCode}`);
    console.log('Headers:', res.headers);
    
    let responseData = '';
    res.on('data', (chunk) => {
      responseData += chunk;
    });
    
    res.on('end', () => {
      console.log('Response:', responseData);
      try {
        const parsed = JSON.parse(responseData);
        if (parsed.success) {
          console.log('✅ Order creation successful!');
          console.log('📦 Order ID:', parsed.orderId);
          console.log('🔢 Order Code:', parsed.orderCode);
        } else {
          console.log('❌ Order creation failed:', parsed.error);
        }
      } catch (e) {
        console.log('❌ Failed to parse response');
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Request failed:', error.message);
  });

  req.write(postData);
  req.end();
};

testOrderCreation();
