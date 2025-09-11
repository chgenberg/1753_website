const https = require('https');

// Din Railway URL (byt ut mot din faktiska URL)
const RAILWAY_URL = process.env.RAILWAY_URL || 'your-railway-app.railway.app';
const ADMIN_TOKEN = process.env.ADMIN_TOKEN;

if (!ADMIN_TOKEN) {
  console.error('ADMIN_TOKEN environment variable is required');
  process.exit(1);
}

const options = {
  hostname: RAILWAY_URL.replace('https://', '').replace('http://', ''),
  port: 443,
  path: '/api/admin/sync-pending-orders',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${ADMIN_TOKEN}`
  }
};

console.log(`🚀 Triggering order sync on ${RAILWAY_URL}...`);

const req = https.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log(`✅ Response status: ${res.statusCode}`);
    try {
      const response = JSON.parse(data);
      console.log('📊 Response:', JSON.stringify(response, null, 2));
    } catch (e) {
      console.log('📄 Raw response:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Error:', error.message);
});

req.end(); 