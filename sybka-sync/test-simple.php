<?php

// Simple test script for Sybka API
$accessToken = 'VlLeysd3nZNCMiqSxF0qWv6SHYMn7YXVl85kSMaEb0EkvbBNJVrKnP01odSD';
$apiUrl = 'https://api.sybka.com/v1/';
$teamId = ''; // Empty for now

echo "🧪 Testing Sybka API directly...\n\n";

// Test 1: Basic cURL test
echo "1️⃣ Testing basic cURL connection...\n";
$ch = curl_init();
curl_setopt_array($ch, [
    CURLOPT_URL => $apiUrl . 'product?limit=1',
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT => 10,
    CURLOPT_HTTPHEADER => [
        'Authorization: Bearer ' . $accessToken,
        'X-TeamID: ' . $teamId,
        'Content-Type: application/json'
    ],
    CURLOPT_VERBOSE => true,
    CURLOPT_STDERR => fopen('php://temp', 'w+')
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);

echo "HTTP Code: $httpCode\n";
echo "Error: " . ($error ?: 'None') . "\n";
echo "Response: " . ($response ?: 'Empty') . "\n\n";

curl_close($ch);

// Test 2: Try without team ID header
echo "2️⃣ Testing without X-TeamID header...\n";
$ch = curl_init();
curl_setopt_array($ch, [
    CURLOPT_URL => $apiUrl . 'product?limit=1',
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT => 10,
    CURLOPT_HTTPHEADER => [
        'Authorization: Bearer ' . $accessToken,
        'Content-Type: application/json'
    ]
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);

echo "HTTP Code: $httpCode\n";
echo "Error: " . ($error ?: 'None') . "\n";
echo "Response: " . ($response ?: 'Empty') . "\n\n";

curl_close($ch);

// Test 3: Try different endpoint
echo "3️⃣ Testing root API endpoint...\n";
$ch = curl_init();
curl_setopt_array($ch, [
    CURLOPT_URL => $apiUrl,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT => 10,
    CURLOPT_HTTPHEADER => [
        'Authorization: Bearer ' . $accessToken,
        'Content-Type: application/json'
    ]
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);

echo "HTTP Code: $httpCode\n";
echo "Error: " . ($error ?: 'None') . "\n";
echo "Response: " . ($response ?: 'Empty') . "\n\n";

curl_close($ch);

echo "✅ Test completed!\n";
echo "💡 If all tests show HTTP Code 0, there might be a network/DNS issue\n";
echo "💡 If you get 401/403, the API key might be wrong\n";
echo "💡 If you get 400, you might need the correct team_id\n"; 