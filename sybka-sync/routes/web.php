<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\SybkaController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
*/

Route::get('/', function () {
    return view('welcome');
});

// Sybka API routes
Route::prefix('api/sybka')->group(function () {
    Route::get('/products', [SybkaController::class, 'getProducts']);
    Route::post('/orders', [SybkaController::class, 'createOrder']);
    Route::post('/refunds', [SybkaController::class, 'createRefund']);
    Route::get('/test', [SybkaController::class, 'testConnection']);
});

// Health check
Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'timestamp' => now(),
        'service' => 'Sybka Sync Service'
    ]);
}); 