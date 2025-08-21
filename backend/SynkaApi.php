<?php

namespace App\Classes;

use Carbon\Carbon;
use App\Models\User;
use GuzzleHttp\Psr7\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Http\Client\RequestException;

class SynkaApi
{
   protected $user;
   protected $access_token;
   protected $api_url;
   protected $api_team_id;
   protected $api_products;
   protected $api_orders;
   protected $api_refunds;

   public function __construct()
   {
      $this->access_token = env('SYNKA_ACCESS_TOKEN');
      $this->api_url = env('SYNKA_API_URL');
      $this->api_team_id = env('SYNKA_TEAM_ID');
      $this->api_products = 'product';
      $this->api_orders = 'order';
      $this->api_refunds = 'refund';
   }

   public function getProducts($sku = '')
   {
      $next = null;
      $data = $products = [];
      if($sku != '') {
         $data = [
            'sku' => $sku
         ];
      }

      do {
         $response = Http::withHeaders([
            'Authorization' => 'Bearer '.$this->access_token,
            'X-TeamID' => $this->api_team_id,
        ])->timeout(30)->retry(5, 500)
         ->get(($next !== null ? $next : $this->api_url.$this->api_products), $data);
         $body = $response->json();
         $next = $body['links']['next'] ?? null;
         $products[] = $body['data'];
      } while ($next !== null);
      
      return $products;
   }

   public function createOrder($invoice)
   {
      $order_id = $invoice['YourOrderNumber'];
      list($firstname, $lastname) = explode(' ', $invoice['CustomerName']);
      $data = [
         "shop_order_id" => $order_id,
         "shop_order_increment_id" => 'PREFIX-'.$order_id,
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
         // "billing_state" => '',
         "billing_postcode" => $invoice['ZipCode'],
         "billing_country" => $invoice['Country'],
         "billing_email" => $invoice['EmailInformation']['EmailAddressTo'],
         "billing_firstname" => $firstname,
         "billing_lastname" => $lastname,
         "billing_street" => $invoice['Address1'],
         "billing_street_2" => $invoice['Address2'],
         "billing_phone" => $invoice['Phone1'],
         // "billing_company" => $invoice[''],
         // "billing_vat_id" => $invoice[''],
         "shipping_city" => $invoice['DeliveryCity'],
         // "shipping_state" => '',
         "shipping_postcode" => $invoice['DeliveryZipCode'],
         "shipping_country" => $invoice['DeliveryCountry'],
         "shipping_email" => $invoice['EmailInformation']['EmailAddressTo'],
         "shipping_firstname" => $firstname,
         "shipping_lastname" => $lastname,
         "shipping_street" => $invoice['DeliveryAddress1'],
         "shipping_street_2" => $invoice['DeliveryAddress2'],
         "shipping_phone" => $invoice['Phone1'],
         // "shipping_company" => $invoice[''],
         // "shipping_vat_id" => $invoice[''],
         "order_comment" => $invoice['Remarks'],
         "shop_created_at" => $invoice['InvoiceDate'],
         "shop_updated_at" => $invoice['InvoiceDate'],
         "payment_gateway" => "vivawallet",
         "transaction_id" => $invoice['YourOrderNumber'],
         "sent_to_crm" => true,
         "fortnox_invoice_id" => $invoice['DocumentNumber']
      ];

      $total_qty_ordered = 0;
      foreach ($invoice['InvoiceRows'] as $row) {
         if($row['ArticleNumber'] == '') { continue; }
         $total_qty_ordered += $row['DeliveredQuantity'];
         $price_incl_tax = round($row['PriceExcludingVAT'] * (1 + ($row['VAT'] / 100)), 2);
         $data['order_rows'][] = [
            "sku" => $row['ArticleNumber'],
            "name" => $row['Description'],
            "shop_order_id" => $order_id,
            "shop_item_id" => $row['RowId'],
            "shop_product_id" => $row['ShopProductId'],
            "product_type" => $row['ProductType'],
            "qty_ordered" => $row['DeliveredQuantity'],
            "price" => $row['PriceExcludingVAT'],
            "price_incl_tax" => $price_incl_tax,
            "row_total" => $row['PriceExcludingVAT'] * $row['DeliveredQuantity'],
            "row_total_incl_tax" => $price_incl_tax * $row['DeliveredQuantity'],
            "row_weight" => 0.00,
            "tax_amount" => $price_incl_tax - $row['PriceExcludingVAT'],
            "tax_percent" => $row['VAT']
         ];
      }

      $data['total_qty_ordered'] = $total_qty_ordered;

      try {
         $response = Http::withHeaders([
            'Authorization' => 'Bearer '.$this->access_token,
            'X-TeamID' => $this->api_team_id,
         ])->timeout(30)->retry(5, 500)
            ->post($this->api_url.$this->api_orders, $data);
   
         return $response->status();
      } catch (RequestException $e) {
         Log::error($e->response->body());
         return $e->response->status();
      }

   }

   public function createRefund($invoice)
   {
      $order_id = $invoice['YourOrderNumber'];
      list($firstname, $lastname) = explode(' ', $invoice['CustomerName']);
      $data = [
         "grand_total" => 0 - $invoice['Total'],
         "subtotal" => 0 - ($invoice['Total'] - $invoice['TotalVAT']),
         "adjustment" => null,
         "subtotal_incl_tax" => 0 - $invoice['Total'],
         "tax_amount" => 0 - $invoice['TotalVAT'],
         "shipping_amount" => 0 - ($invoice['Freight'] - $invoice['FreightVAT']),
         "shipping_incl_tax" => 0 - $invoice['Freight'],
         "shipping_tax_amount" => 0 - $invoice['FreightVAT'],
         "currency" => $invoice['Currency'],
         "shop_order_id" => $order_id,
         "shop_refund_id" => $order_id.$invoice['DocumentNumber'],
         "payment_provider_ref" => null,
         "sent_to_crm" => true,
         "crm_credit_id" => $invoice['DocumentNumber'],
         "shop_created_at" => $invoice['InvoiceDate'],
      ];

      $total_qty_ordered = 0;
      foreach ($invoice['InvoiceRows'] as $row) {
         if($row['ArticleNumber'] == '') { continue; }
         $total_qty_ordered += $row['DeliveredQuantity'];
         $price_incl_tax = round($row['PriceExcludingVAT'] * (1 + ($row['VAT'] / 100)), 2);
         $data['refund_rows'][] = [
            "sku" => $row['ArticleNumber'],
            "name" => $row['Description'],
            "qty" => 0 - $row['DeliveredQuantity'],
            "row_total" => (0 - $row['PriceExcludingVAT']) * $row['DeliveredQuantity'],
            "row_total_incl_tax" => 0 - ($price_incl_tax * $row['DeliveredQuantity']),
            "tax_amount" => ($price_incl_tax - $row['PriceExcludingVAT']),
            "tax_percent" => $row['VAT'],
            "shop_refund_id" => $order_id.$invoice['DocumentNumber'],
            "shop_item_id" => $row['RowId'],
            "shop_product_id" => $row['ShopProductId'],
         ];
      }


      try {
         $response = Http::withHeaders([
            'Authorization' => 'Bearer '.$this->access_token,
            'X-TeamID' => $this->api_team_id,
         ])->timeout(30)->retry(5, 500)
            ->post($this->api_url.$this->api_refunds, $data);
   
         return $response->status();
      } catch (RequestException $e) {
         Log::error($e->response->body());
         return $e->response->status();
      }

   }
}