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

    'access_token' => env('SYNKA_ACCESS_TOKEN'),
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
        'client_id' => env('FORTNOX_CLIENT_ID', 'lWspWpJ1EjTS'),
        'client_secret' => env('FORTNOX_CLIENT_SECRET', 'vyzsHYsaNu'),
        'webhook_secret' => env('FORTNOX_WEBHOOK_SECRET', ''),
        'order_prefix' => env('FORTNOX_ORDER_PREFIX', '1753-'),
        
        // Recommended settings for Sybka+ integration
        'sync_settings' => [
            'fortnox_as_master' => true,
            'import_non_stock_items' => false,
            'sync_interval' => '15_minutes',
            'create_order_on_status' => 'completed',
            'create_invoice_on_status' => 'shipped',
            'sync_from_date' => '2025-08-21'
        ]
    ],
]; 