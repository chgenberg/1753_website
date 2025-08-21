<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Sybka API Configuration
    |--------------------------------------------------------------------------
    |
    | Here you can configure your Sybka API credentials and endpoints.
    |
    */

    'access_token' => env('SYNKA_ACCESS_TOKEN', 'QgFCIjnAOZrZlD2J4pxyJq8VmPZNH7sl5jG5U3gSQbBb25eO6r2yEQoYm1eV'),
    'api_url' => env('SYNKA_API_URL', 'https://mitt.synkaplus.se/api/'),
    'team_id' => env('SYNKA_TEAM_ID', '844'),

    /*
    |--------------------------------------------------------------------------
    | API Endpoints (based on test results)
    |--------------------------------------------------------------------------
    */

    'endpoints' => [
        'products' => 'product',  // Use singular form
        'orders' => 'order',     // Use singular form  
        'refunds' => 'refund',   // Use singular form
    ],

    /*
    |--------------------------------------------------------------------------
    | Request Configuration
    |--------------------------------------------------------------------------
    */

    'timeout' => env('SYNKA_TIMEOUT', 30),
    'retry_attempts' => env('SYNKA_RETRY_ATTEMPTS', 5),
    'retry_delay' => env('SYNKA_RETRY_DELAY', 500),

    /*
    |--------------------------------------------------------------------------
    | Fortnox Integration
    |--------------------------------------------------------------------------
    */

    'fortnox' => [
        'webhook_secret' => env('FORTNOX_WEBHOOK_SECRET', ''),
        'order_prefix' => env('FORTNOX_ORDER_PREFIX', '1753-'),
    ],
]; 