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

    'access_token' => env('SYNKA_ACCESS_TOKEN', 'VlLeysd3nZNCMiqSxF0qWv6SHYMn7YXVl85kSMaEb0EkvbBNJVrKnP01odSD'),
    'api_url' => env('SYNKA_API_URL', 'https://api.sybka.com/v1/'),
    'team_id' => env('SYNKA_TEAM_ID', ''),

    /*
    |--------------------------------------------------------------------------
    | API Endpoints
    |--------------------------------------------------------------------------
    */

    'endpoints' => [
        'products' => 'product',
        'orders' => 'order',
        'refunds' => 'refund',
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
        'order_prefix' => env('FORTNOX_ORDER_PREFIX', 'PREFIX-'),
    ],
]; 