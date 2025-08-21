<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\JsonResponse;

class SybkaController extends Controller
{
    protected $accessToken;
    protected $apiUrl;
    protected $teamId;

    public function __construct()
    {
        $this->accessToken = env('SYNKA_ACCESS_TOKEN');
        $this->apiUrl = env('SYNKA_API_URL');
        $this->teamId = env('SYNKA_TEAM_ID');
    }

    /**
     * Get products from Sybka
     */
    public function getProducts(Request $request): JsonResponse
    {
        $sku = $request->get('sku', '');
        $next = null;
        $allProducts = [];
        $data = $sku ? ['sku' => $sku] : [];

        do {
            try {
                $response = Http::withHeaders([
                    'Authorization' => 'Bearer ' . $this->accessToken,
                    'X-TeamID' => $this->teamId,
                ])->timeout(30)->retry(5, 500)
                ->get($next ?? $this->apiUrl . 'product', $data);

                $body = $response->json();
                $next = $body['links']['next'] ?? null;
                $allProducts = array_merge($allProducts, $body['data'] ?? []);

            } catch (\Exception $e) {
                Log::error('Sybka getProducts error: ' . $e->getMessage());
                return response()->json(['error' => 'Failed to fetch products'], 500);
            }
        } while ($next !== null);

        return response()->json(['products' => $allProducts]);
    }

    /**
     * Create order in Sybka from Fortnox invoice data
     */
    public function createOrder(Request $request): JsonResponse
    {
        $invoice = $request->all();
        
        if (!isset($invoice['YourOrderNumber'])) {
            return response()->json(['error' => 'Missing YourOrderNumber'], 400);
        }

        $orderId = $invoice['YourOrderNumber'];
        [$firstname, $lastname] = explode(' ', $invoice['CustomerName'], 2);

        $orderData = [
            "shop_order_id" => $orderId,
            "shop_order_increment_id" => 'PREFIX-' . $orderId,
            "order_date" => $invoice['InvoiceDate'],
            "currency" => $invoice['Currency'],
            "grand_total" => $invoice['Total'],
            "subtotal" => $invoice['Total'] - $invoice['TotalVAT'],
            "discount_amount" => 0,
            "subtotal_incl_tax" => $invoice['Total'],
            "tax_amount" => $invoice['TotalVAT'],
            "shipping_amount" => $invoice['Freight'] - $invoice['FreightVAT'],
            "shipping_incl_tax" => $invoice['Freight'],
            "shipping_tax_amount" => $invoice['FreightVAT'],
            "shipping_discount_amount" => 0,
            "weight" => 0,
            "shipping_description" => $invoice['Freight'] != 0 ? 'Frakt' : '',
            "shipping_method" => $invoice['Freight'] != 0 ? 'Frakt' : '',
            "status" => 'completed',
            "fulfillment_status" => 'fulfilled',
            "billing_city" => $invoice['City'],
            "billing_postcode" => $invoice['ZipCode'],
            "billing_country" => $invoice['Country'],
            "billing_email" => $invoice['EmailInformation']['EmailAddressTo'],
            "billing_firstname" => $firstname,
            "billing_lastname" => $lastname,
            "billing_street" => $invoice['Address1'],
            "billing_street_2" => $invoice['Address2'],
            "billing_phone" => $invoice['Phone1'],
            "shipping_city" => $invoice['DeliveryCity'],
            "shipping_postcode" => $invoice['DeliveryZipCode'],
            "shipping_country" => $invoice['DeliveryCountry'],
            "shipping_email" => $invoice['EmailInformation']['EmailAddressTo'],
            "shipping_firstname" => $firstname,
            "shipping_lastname" => $lastname,
            "shipping_street" => $invoice['DeliveryAddress1'],
            "shipping_street_2" => $invoice['DeliveryAddress2'],
            "shipping_phone" => $invoice['Phone1'],
            "order_comment" => $invoice['Remarks'],
            "shop_created_at" => $invoice['InvoiceDate'],
            "shop_updated_at" => $invoice['InvoiceDate'],
            "payment_gateway" => "vivawallet",
            "transaction_id" => $invoice['YourOrderNumber'],
            "sent_to_crm" => true,
            "fortnox_invoice_id" => $invoice['DocumentNumber']
        ];

        $totalQtyOrdered = 0;
        $orderRows = [];

        foreach ($invoice['InvoiceRows'] as $row) {
            if (empty($row['ArticleNumber'])) continue;
            
            $totalQtyOrdered += $row['DeliveredQuantity'];
            $priceInclTax = round($row['PriceExcludingVAT'] * (1 + ($row['VAT'] / 100)), 2);
            
            $orderRows[] = [
                "sku" => $row['ArticleNumber'],
                "name" => $row['Description'],
                "shop_order_id" => $orderId,
                "shop_item_id" => $row['RowId'],
                "shop_product_id" => $row['ShopProductId'],
                "product_type" => $row['ProductType'],
                "qty_ordered" => $row['DeliveredQuantity'],
                "price" => $row['PriceExcludingVAT'],
                "price_incl_tax" => $priceInclTax,
                "row_total" => $row['PriceExcludingVAT'] * $row['DeliveredQuantity'],
                "row_total_incl_tax" => $priceInclTax * $row['DeliveredQuantity'],
                "row_weight" => 0.00,
                "tax_amount" => $priceInclTax - $row['PriceExcludingVAT'],
                "tax_percent" => $row['VAT']
            ];
        }

        $orderData['total_qty_ordered'] = $totalQtyOrdered;
        $orderData['order_rows'] = $orderRows;

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->accessToken,
                'X-TeamID' => $this->teamId,
            ])->timeout(30)->retry(5, 500)
            ->post($this->apiUrl . 'order', $orderData);

            Log::info('Sybka order created', ['order_id' => $orderId, 'status' => $response->status()]);
            
            return response()->json([
                'success' => $response->successful(),
                'status' => $response->status(),
                'order_id' => $orderId
            ]);

        } catch (\Exception $e) {
            Log::error('Sybka createOrder error: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to create order'], 500);
        }
    }

    /**
     * Create refund in Sybka from Fortnox credit note
     */
    public function createRefund(Request $request): JsonResponse
    {
        $invoice = $request->all();
        
        if (!isset($invoice['YourOrderNumber'])) {
            return response()->json(['error' => 'Missing YourOrderNumber'], 400);
        }

        $orderId = $invoice['YourOrderNumber'];
        [$firstname, $lastname] = explode(' ', $invoice['CustomerName'], 2);

        $refundData = [
            "grand_total" => 0 - $invoice['Total'],
            "subtotal" => 0 - ($invoice['Total'] - $invoice['TotalVAT']),
            "adjustment" => null,
            "subtotal_incl_tax" => 0 - $invoice['Total'],
            "tax_amount" => 0 - $invoice['TotalVAT'],
            "shipping_amount" => 0 - ($invoice['Freight'] - $invoice['FreightVAT']),
            "shipping_incl_tax" => 0 - $invoice['Freight'],
            "shipping_tax_amount" => 0 - $invoice['FreightVAT'],
            "currency" => $invoice['Currency'],
            "shop_order_id" => $orderId,
            "shop_refund_id" => $orderId . $invoice['DocumentNumber'],
            "payment_provider_ref" => null,
            "sent_to_crm" => true,
            "crm_credit_id" => $invoice['DocumentNumber'],
            "shop_created_at" => $invoice['InvoiceDate'],
        ];

        $refundRows = [];
        foreach ($invoice['InvoiceRows'] as $row) {
            if (empty($row['ArticleNumber'])) continue;
            
            $priceInclTax = round($row['PriceExcludingVAT'] * (1 + ($row['VAT'] / 100)), 2);
            
            $refundRows[] = [
                "sku" => $row['ArticleNumber'],
                "name" => $row['Description'],
                "qty" => 0 - $row['DeliveredQuantity'],
                "row_total" => (0 - $row['PriceExcludingVAT']) * $row['DeliveredQuantity'],
                "row_total_incl_tax" => 0 - ($priceInclTax * $row['DeliveredQuantity']),
                "tax_amount" => ($priceInclTax - $row['PriceExcludingVAT']),
                "tax_percent" => $row['VAT'],
                "shop_refund_id" => $orderId . $invoice['DocumentNumber'],
                "shop_item_id" => $row['RowId'],
                "shop_product_id" => $row['ShopProductId'],
            ];
        }

        $refundData['refund_rows'] = $refundRows;

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->accessToken,
                'X-TeamID' => $this->teamId,
            ])->timeout(30)->retry(5, 500)
            ->post($this->apiUrl . 'refund', $refundData);

            Log::info('Sybka refund created', ['order_id' => $orderId, 'status' => $response->status()]);
            
            return response()->json([
                'success' => $response->successful(),
                'status' => $response->status(),
                'refund_id' => $orderId . $invoice['DocumentNumber']
            ]);

        } catch (\Exception $e) {
            Log::error('Sybka createRefund error: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to create refund'], 500);
        }
    }

    /**
     * Test Sybka API connection
     */
    public function testConnection(): JsonResponse
    {
        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->accessToken,
                'X-TeamID' => $this->teamId,
            ])->timeout(10)->get($this->apiUrl . 'product?limit=1');

            return response()->json([
                'success' => $response->successful(),
                'status' => $response->status(),
                'message' => $response->successful() ? 'Connection OK' : 'Connection failed'
            ]);

        } catch (\Exception $e) {
            Log::error('Sybka connection test error: ' . $e->getMessage());
            return response()->json(['error' => 'Connection test failed'], 500);
        }
    }
} 