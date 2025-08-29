<?php

// Simple PHP server for Sybka API
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Configuration - use environment variables
$config = [
    'access_token' => $_ENV['SYNKA_ACCESS_TOKEN'] ?? 'your-token-here',
    'api_url' => 'https://mitt.synkaplus.se/api/',
    'team_id' => '844',
    'timeout' => 30,
    'retry_attempts' => 5,
    'retry_delay' => 500
];

// Helper function to make HTTP requests
function makeRequest($method, $url, $data = null, $headers = []) {
    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL => $url,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 30,
        CURLOPT_HTTPHEADER => $headers,
        CURLOPT_CUSTOMREQUEST => $method,
    ]);
    
    if ($data && in_array($method, ['POST', 'PUT', 'PATCH'])) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    }
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    return [
        'status' => $httpCode,
        'body' => $response ? json_decode($response, true) : null
    ];
}

// Route handler
$requestUri = $_SERVER['REQUEST_URI'];
$requestMethod = $_SERVER['REQUEST_METHOD'];
$path = parse_url($requestUri, PHP_URL_PATH);

// Health check
if ($path === '/health') {
    echo json_encode([
        'status' => 'ok',
        'timestamp' => date('c'),
        'service' => 'Sybka Sync Service',
        'config' => [
            'api_url' => $config['api_url'],
            'team_id' => $config['team_id'],
            'has_token' => !empty($config['access_token'])
        ]
    ]);
    exit;
}

// Test connection
if ($path === '/api/sybka/test') {
    $headers = [
        'Authorization: Bearer ' . $config['access_token'],
        'X-TeamID: ' . $config['team_id'],
        'Content-Type: application/json'
    ];
    
    // Try different endpoints to find what works
    $testEndpoints = [
        'product?limit=1',
        'order?limit=1',
        'order?status=completed&limit=1',
        'order?status=shipped&limit=1',
    ];
    
    $results = [];
    foreach ($testEndpoints as $endpoint) {
        $result = makeRequest('GET', $config['api_url'] . $endpoint, null, $headers);
        $results[$endpoint] = [
            'status' => $result['status'],
            'success' => $result['status'] >= 200 && $result['status'] < 300,
            'response' => $result['body']
        ];
    }
    
    echo json_encode([
        'api_url' => $config['api_url'],
        'team_id' => $config['team_id'],
        'has_token' => !empty($config['access_token']),
        'endpoint_tests' => $results
    ]);
    exit;
}

// Get products
if ($path === '/api/sybka/products' && $requestMethod === 'GET') {
    $sku = $_GET['sku'] ?? '';
    $limit = $_GET['limit'] ?? null;
    
    $headers = [
        'Authorization: Bearer ' . $config['access_token'],
        'X-TeamID: ' . $config['team_id'],
        'Content-Type: application/json'
    ];
    
    $queryParams = [];
    if ($sku) $queryParams['sku'] = $sku;
    if ($limit) $queryParams['limit'] = $limit;
    
    $url = $config['api_url'] . 'product';
    if (!empty($queryParams)) {
        $url .= '?' . http_build_query($queryParams);
    }
    
    $result = makeRequest('GET', $url, null, $headers);
    
    if ($result['status'] === 200) {
        echo json_encode([
            'products' => $result['body']['data'] ?? $result['body'] ?? [],
            'count' => count($result['body']['data'] ?? $result['body'] ?? [])
        ]);
    } else {
        http_response_code($result['status']);
        echo json_encode([
            'error' => 'Failed to fetch products', 
            'status' => $result['status'],
            'response' => $result['body']
        ]);
    }
    exit;
}

// Get completed orders (for syncing back to Fortnox)
if ($path === '/api/sybka/orders/completed' && $requestMethod === 'GET') {
    $since = $_GET['since'] ?? date('Y-m-d', strtotime('-7 days'));
    
    $headers = [
        'Authorization: Bearer ' . $config['access_token'],
        'X-TeamID: ' . $config['team_id'],
        'Content-Type: application/json'
    ];
    
    // Try different status filters to find completed orders
    $statusFilters = [
        'status=completed',
        'status=shipped', 
        'status=delivered',
        'fulfillment_status=completed',
        'fulfillment_status=shipped'
    ];
    
    $allCompletedOrders = [];
    
    foreach ($statusFilters as $filter) {
        $url = $config['api_url'] . 'order?' . $filter;
        if ($since) {
            $url .= '&updated_at=' . $since;
        }
        
        $result = makeRequest('GET', $url, null, $headers);
        
        if ($result['status'] === 200 && !empty($result['body']['data'])) {
            $allCompletedOrders = array_merge($allCompletedOrders, $result['body']['data']);
        }
    }
    
    // Remove duplicates based on shop_order_id
    $uniqueOrders = [];
    foreach ($allCompletedOrders as $order) {
        $orderId = $order['shop_order_id'] ?? $order['id'] ?? null;
        if ($orderId && !isset($uniqueOrders[$orderId])) {
            $uniqueOrders[$orderId] = $order;
        }
    }
    
    echo json_encode([
        'completed_orders' => array_values($uniqueOrders),
        'count' => count($uniqueOrders),
        'since' => $since
    ]);
    exit;
}

// Create order
if ($path === '/api/sybka/orders' && $requestMethod === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($input['shop_order_id']) && !isset($input['YourOrderNumber'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing shop_order_id or YourOrderNumber']);
        exit;
    }
    
    // Handle both Fortnox format and direct e-commerce format
    if (isset($input['YourOrderNumber'])) {
        // Fortnox invoice format (legacy)
        $orderId = $input['YourOrderNumber'];
        $customerName = $input['CustomerName'] ?? '';
        $nameParts = explode(' ', trim($customerName), 2);
        $firstname = $nameParts[0] ?? '';
        $lastname = $nameParts[1] ?? '';
        
        $orderData = [
            "shop_order_id" => $orderId,
            "shop_order_increment_id" => '1753-' . $orderId,
            "order_date" => $input['InvoiceDate'],
            "currency" => $input['Currency'],
            "grand_total" => $input['Total'],
            "subtotal" => $input['Total'] - $input['TotalVAT'],
            "tax_amount" => $input['TotalVAT'],
            "billing_firstname" => $firstname,
            "billing_lastname" => $lastname,
            "billing_email" => $input['EmailInformation']['EmailAddressTo'] ?? '',
            // ... rest of Fortnox mapping
        ];
    } else {
        // Direct e-commerce format
        $orderData = $input; // Already in correct format
    }
    
    $headers = [
        'Authorization: Bearer ' . $config['access_token'],
        'X-TeamID: ' . $config['team_id'],
        'Content-Type: application/json'
    ];
    
    $result = makeRequest('POST', $config['api_url'] . 'order', $orderData, $headers);
    
    http_response_code($result['status']);
    echo json_encode([
        'success' => $result['status'] >= 200 && $result['status'] < 300,
        'status' => $result['status'],
        'order_id' => $orderData['shop_order_id'],
        'response' => $result['body']
    ]);
    exit;
}

// Default 404
http_response_code(404);
echo json_encode(['error' => 'Not found', 'path' => $path]); 