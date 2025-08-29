<?php

// Explore Sybka+ API endpoints systematically
// Use environment variable instead of hardcoded token
$accessToken = $_ENV['SYNKA_ACCESS_TOKEN'] ?? 'your-token-here';
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
        'error' => $error
    ];
}

$headers = [
    'Authorization: Bearer ' . $accessToken,
    'X-TeamID: ' . $teamId,
    'Content-Type: application/json'
];

echo "🔍 Exploring Sybka+ API endpoints...\n\n";

// Common warehouse/inventory management endpoints to test
$endpointsToTest = [
    // Products/Items
    'product',
    'products', 
    'item',
    'items',
    'inventory',
    'stock',
    
    // Orders
    'order',
    'orders',
    'shipment',
    'shipments',
    'fulfillment',
    
    // Customers/Companies
    'customer',
    'customers',
    'company',
    'companies',
    
    // Warehouse operations
    'warehouse',
    'warehouses',
    'location',
    'locations',
    'pick',
    'picks',
    'picklist',
    'picklists',
    
    // Reports/Status
    'report',
    'reports',
    'status',
    'health',
    'dashboard',
    
    // Settings/Config
    'settings',
    'config',
    'user',
    'users',
    'team',
    'teams',
];

foreach ($endpointsToTest as $endpoint) {
    echo "Testing endpoint: /{$endpoint}\n";
    
    $result = makeRequest('GET', $apiUrl . $endpoint, null, $headers);
    
    echo "  Status: {$result['status']}";
    if ($result['error']) {
        echo " | Error: {$result['error']}";
    }
    
    if ($result['status'] === 200) {
        echo " ✅ SUCCESS!";
        if ($result['body']) {
            echo "\n  Response keys: " . implode(', ', array_keys($result['body']));
            if (isset($result['body']['data'])) {
                echo "\n  Data count: " . (is_array($result['body']['data']) ? count($result['body']['data']) : 'N/A');
            }
        }
    } elseif ($result['status'] === 404) {
        echo " ❌ Not found";
    } elseif ($result['status'] >= 400) {
        echo " ⚠️  Client/Server error";
        if ($result['body'] && isset($result['body']['message'])) {
            echo " - " . $result['body']['message'];
        }
    }
    
    echo "\n\n";
    
    // Small delay to be nice to the API
    usleep(100000); // 0.1 second
}

echo "✅ Exploration completed!\n";
echo "💡 Look for endpoints with status 200 - those are available!\n"; 