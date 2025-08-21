#!/bin/bash

BASE_URL="http://localhost:8000"

echo "🧪 Testing Sybka Sync API..."

# Test health endpoint
echo ""
echo "1️⃣ Testing health endpoint..."
curl -s "$BASE_URL/health" | jq '.' 2>/dev/null || curl -s "$BASE_URL/health"

# Test Sybka connection
echo ""
echo "2️⃣ Testing Sybka API connection..."
curl -s "$BASE_URL/api/sybka/test" | jq '.' 2>/dev/null || curl -s "$BASE_URL/api/sybka/test"

# Test products endpoint
echo ""
echo "3️⃣ Testing products endpoint..."
curl -s "$BASE_URL/api/sybka/products?limit=2" | jq '.' 2>/dev/null || curl -s "$BASE_URL/api/sybka/products?limit=2"

# Test order creation with sample data
echo ""
echo "4️⃣ Testing order creation (sample data)..."
cat > /tmp/sample_order.json << 'EOF'
{
  "YourOrderNumber": "TEST-001",
  "CustomerName": "Test Testsson",
  "InvoiceDate": "2024-01-15",
  "Currency": "SEK",
  "Total": 500.00,
  "TotalVAT": 100.00,
  "Freight": 50.00,
  "FreightVAT": 10.00,
  "City": "Stockholm",
  "ZipCode": "11122",
  "Country": "SE",
  "Address1": "Testgatan 123",
  "Address2": "",
  "Phone1": "+46701234567",
  "DeliveryCity": "Stockholm",
  "DeliveryZipCode": "11122",
  "DeliveryCountry": "SE",
  "DeliveryAddress1": "Testgatan 123",
  "DeliveryAddress2": "",
  "Remarks": "Test order",
  "DocumentNumber": "INV-001",
  "EmailInformation": {
    "EmailAddressTo": "test@example.com"
  },
  "InvoiceRows": [
    {
      "ArticleNumber": "TEST-PRODUCT-1",
      "Description": "Test Product",
      "DeliveredQuantity": 2,
      "PriceExcludingVAT": 200.00,
      "VAT": 25,
      "RowId": "1",
      "ShopProductId": "test-1",
      "ProductType": "simple"
    }
  ]
}
EOF

curl -s -X POST "$BASE_URL/api/sybka/orders" \
  -H "Content-Type: application/json" \
  -d @/tmp/sample_order.json | jq '.' 2>/dev/null || curl -s -X POST "$BASE_URL/api/sybka/orders" -H "Content-Type: application/json" -d @/tmp/sample_order.json

# Clean up
rm -f /tmp/sample_order.json

echo ""
echo "✅ API tests completed!"
echo ""
echo "💡 Tips:"
echo "  - Check logs: docker-compose logs app (Docker) or storage/logs/laravel.log (local)"
echo "  - Update SYNKA_TEAM_ID in .env if needed"
echo "  - Check Sybka dashboard for created orders" 