<?php

// Test different possible API endpoints for Sybka+
$accessToken = 'VlLeysd3nZNCMiqSxF0qWv6SHYMn7YXVl85kSMaEb0EkvbBNJVrKnP01odSD';
$teamId = ''; // Empty for now

$possibleUrls = [
    'https://api.sybka.se/v1/',
    'https://api.sybkaplus.com/v1/',
    'https://api.sybka.com/api/v1/',
    'https://sybka.com/api/v1/',
    'https://app.sybka.com/api/v1/',
    'https://api-eu.sybka.com/v1/',
    'https://eu.api.sybka.com/v1/',
];

echo "🔍 Testing different Sybka+ API endpoints...\n\n";

foreach ($possibleUrls as $index => $baseUrl) {
    echo ($index + 1) . "️⃣ Testing: $baseUrl\n";
    
    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL => $baseUrl,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 5,
        CURLOPT_HTTPHEADER => [
            'Authorization: Bearer ' . $accessToken,
            'Content-Type: application/json'
        ],
        CURLOPT_FOLLOWLOCATION => false
    ]);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);
    
    echo "  Status: $httpCode";
    if ($error) {
        echo " | Error: $error";
    }
    if ($httpCode > 0 && $response) {
        $decoded = json_decode($response, true);
        if ($decoded) {
            echo " | Response: " . json_encode($decoded);
        } else {
            echo " | Response: " . substr($response, 0, 100) . "...";
        }
    }
    echo "\n\n";
}

echo "💡 Tips:\n";
echo "- Status 0 = DNS/connection issues\n";
echo "- Status 404 = Wrong URL\n";
echo "- Status 401/403 = Authentication issues\n";
echo "- Status 200 = Success!\n";
echo "- Status 400 = Bad request (might need team_id)\n"; 