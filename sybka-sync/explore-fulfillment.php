<?php

// Explore Sybka+ fulfillment and shipment endpoints
$accessToken = 'QgFCIjnAOZrZlD2J4pxyJq8VmPZNH7sl5jG5U3gSQbBb25eO6r2yEQoYm1eV';
$apiUrl = 'https://mitt.synkaplus.se/api/';
$teamId = '844';

function makeRequest($method, $url, $data = null, $headers = []) {
    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL => $url,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 10,
        CURLOPT_HTTPHEADER => $headers,
        CURLOPT_CUSTOMREQUEST => $method,
    ]);
    
    if ($data && in_array($method, ['POST', 'PUT', 'PATCH'])) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    }
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);
    
    return [
        'status' => $httpCode,
        'body' => $response ? json_decode($response, true) : null,
        'error' => $error,
        'raw_body' => $response
    ];
}

$headers = [
    'Authorization: Bearer ' . $accessToken,
    'X-TeamID: ' . $teamId,
    'Content-Type: application/json'
];

echo "🚚 Exploring Sybka+ fulfillment endpoints (Sybka+ → Fortnox)...\n\n";

// Test different query parameters and endpoints for order status/fulfillment
$fulfillmentEndpoints = [
    // Order status variations
    'order?status=completed',
    'order?status=shipped',
    'order?status=fulfilled',
    'order?status=delivered',
    'order?fulfillment_status=completed',
    'order?fulfillment_status=shipped',
    
    // Potential shipment endpoints
    'shipment',
    'delivery',
    'fulfillment',
    'tracking',
    
    // Order updates/webhooks
    'order/updates',
    'order/status',
    'order/completed',
    'order/shipped',
    
    // Potential export/sync endpoints
    'export',
    'export/order',
    'export/shipment',
    'sync',
    'sync/fortnox',
    'webhook',
    'webhook/order',
    
    // Inventory updates
    'inventory/update',
    'stock/update',
    'product/stock',
];

foreach ($fulfillmentEndpoints as $endpoint) {
    echo "Testing: /{$endpoint}\n";
    
    $result = makeRequest('GET', $apiUrl . $endpoint, null, $headers);
    
    echo "  Status: {$result['status']}";
    if ($result['error']) {
        echo " | Error: {$result['error']}";
    }
    
    if ($result['status'] === 200) {
        echo " ✅ SUCCESS!";
        if ($result['body']) {
            echo "\n  Response keys: " . implode(', ', array_keys($result['body']));
            if (isset($result['body']['data']) && is_array($result['body']['data'])) {
                echo "\n  Data count: " . count($result['body']['data']);
                if (!empty($result['body']['data'])) {
                    echo "\n  Sample data keys: " . implode(', ', array_keys($result['body']['data'][0]));
                }
            }
        }
    } elseif ($result['status'] === 404) {
        echo " ❌ Not found";
    } elseif ($result['status'] >= 400) {
        echo " ⚠️  Error";
        if ($result['body'] && isset($result['body']['message'])) {
            echo " - " . $result['body']['message'];
        }
    }
    
    echo "\n\n";
    usleep(100000); // 0.1 second delay
}

// Test order endpoint with different parameters to see what data is available
echo "🔍 Testing order endpoint with various parameters...\n\n";

$orderParams = [
    '',
    '?limit=5',
    '?per_page=5',
    '?page=1',
    '?updated_at=' . date('Y-m-d', strtotime('-7 days')),
    '?created_at=' . date('Y-m-d', strtotime('-7 days')),
    '?from=' . date('Y-m-d', strtotime('-7 days')),
    '?since=' . date('Y-m-d', strtotime('-7 days')),
];

foreach ($orderParams as $params) {
    echo "Testing: /order{$params}\n";
    
    $result = makeRequest('GET', $apiUrl . 'order' . $params, null, $headers);
    
    echo "  Status: {$result['status']}";
    if ($result['status'] === 200 && $result['body']) {
        echo " ✅";
        echo "\n  Response structure: " . json_encode(array_keys($result['body']), JSON_PRETTY_PRINT);
        
        if (isset($result['body']['meta'])) {
            echo "\n  Meta info: " . json_encode($result['body']['meta'], JSON_PRETTY_PRINT);
        }
        
        if (isset($result['body']['links'])) {
            echo "\n  Links: " . json_encode($result['body']['links'], JSON_PRETTY_PRINT);
        }
    }
    
    echo "\n\n";
    usleep(100000);
}

echo "✅ Fulfillment exploration completed!\n";
echo "💡 Look for endpoints that return order status, shipment info, or tracking data!\n"; 