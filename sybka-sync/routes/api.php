<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\SybkaController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Sybka API routes
Route::prefix('sybka')->group(function () {
    Route::get('/products', [SybkaController::class, 'getProducts']);
    Route::post('/orders', [SybkaController::class, 'createOrder']);
    Route::post('/refunds', [SybkaController::class, 'createRefund']);
    Route::get('/test', [SybkaController::class, 'testConnection']);
}); 