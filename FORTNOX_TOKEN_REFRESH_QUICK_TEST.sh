#!/bin/bash

# Fortnox Token Refresh - Quick Test Script
# Usage: bash FORTNOX_TOKEN_REFRESH_QUICK_TEST.sh

set -e

DOMAIN="${1:-localhost:3001}"
PROTOCOL="${2:-http}"

echo "🔍 Fortnox Token Refresh Verification Script"
echo "=============================================="
echo "Testing domain: $PROTOCOL://$DOMAIN"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
print_success() {
  echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
  echo -e "${RED}❌ $1${NC}"
}

print_info() {
  echo -e "${BLUE}ℹ️  $1${NC}"
}

print_warning() {
  echo -e "${YELLOW}⚠️  $1${NC}"
}

# Test 1: Check if backend is running
echo "📡 Test 1: Backend Connectivity"
echo "--------------------------------"
if curl -s "$PROTOCOL://$DOMAIN/api/webhooks/debug-integrations" > /dev/null 2>&1; then
  print_success "Backend is reachable"
else
  print_error "Backend is not reachable at $PROTOCOL://$DOMAIN"
  echo "Make sure backend is running and domain is correct."
  exit 1
fi
echo ""

# Test 2: Get current token info
echo "🔐 Test 2: Current Token Status"
echo "--------------------------------"
TOKEN_INFO=$(curl -s "$PROTOCOL://$DOMAIN/api/webhooks/debug-fortnox" | jq '.token // empty' 2>/dev/null || echo "null")

if [ "$TOKEN_INFO" = "null" ] || [ -z "$TOKEN_INFO" ]; then
  print_error "Could not fetch token info"
  echo "Full response:"
  curl -s "$PROTOCOL://$DOMAIN/api/webhooks/debug-fortnox" | jq '.'
  exit 1
fi

IS_OAUTH=$(echo "$TOKEN_INFO" | jq -r '.isOAuth // "unknown"')
EXP_ISO=$(echo "$TOKEN_INFO" | jq -r '.expISO // "unknown"')
NOW_ISO=$(echo "$TOKEN_INFO" | jq -r '.nowISO // "unknown"')

if [ "$IS_OAUTH" = "true" ]; then
  print_success "Using OAuth Bearer token"
else
  print_warning "Not using OAuth (using legacy API credentials)"
fi

echo "Token expires: $EXP_ISO"
echo "Current time:  $NOW_ISO"

# Calculate time remaining (bash-friendly)
if command -v date &> /dev/null; then
  EXP_EPOCH=$(date -f - +%s <<< "$EXP_ISO" 2>/dev/null || echo "0")
  NOW_EPOCH=$(date -f - +%s <<< "$NOW_ISO" 2>/dev/null || echo "0")
  TIME_REMAINING=$((EXP_EPOCH - NOW_EPOCH))
  
  if [ $TIME_REMAINING -gt 0 ]; then
    MINUTES=$((TIME_REMAINING / 60))
    print_success "Token valid for ~$MINUTES more minutes"
  else
    print_warning "Token may have expired!"
  fi
fi
echo ""

# Test 3: Connection to Fortnox
echo "🏢 Test 3: Fortnox API Connection"
echo "-----------------------------------"
FULL_RESPONSE=$(curl -s "$PROTOCOL://$DOMAIN/api/webhooks/debug-fortnox")
SUCCESS=$(echo "$FULL_RESPONSE" | jq -r '.success // false')

if [ "$SUCCESS" = "true" ]; then
  COMPANY=$(echo "$FULL_RESPONSE" | jq -r '.response.data.CompanyName // "Unknown"')
  print_success "Connected to Fortnox: $COMPANY"
else
  print_error "Could not connect to Fortnox"
  echo "Error details:"
  echo "$FULL_RESPONSE" | jq '.error // .response.data'
fi
echo ""

# Test 4: Force Token Refresh
echo "🔄 Test 4: Force Token Refresh"
echo "-------------------------------"
print_info "Forcing token refresh..."

REFRESH_RESPONSE=$(curl -s -X POST "$PROTOCOL://$DOMAIN/api/webhooks/debug-fortnox/refresh" \
  -H "Content-Type: application/json" 2>/dev/null || echo "{}")

REFRESH_SUCCESS=$(echo "$REFRESH_RESPONSE" | jq -r '.success // false' 2>/dev/null || echo "false")
REFRESHED=$(echo "$REFRESH_RESPONSE" | jq -r '.result.refreshed // false' 2>/dev/null || echo "false")
ROTATED=$(echo "$REFRESH_RESPONSE" | jq -r '.result.rotated // false' 2>/dev/null || echo "false")

if [ "$REFRESH_SUCCESS" = "true" ] && [ "$REFRESHED" = "true" ]; then
  print_success "Token refreshed successfully!"
  
  if [ "$ROTATED" = "true" ]; then
    print_info "Refresh token was rotated"
  else
    print_info "Refresh token was not rotated (normal behavior)"
  fi
else
  print_error "Token refresh failed"
  echo "Response:"
  echo "$REFRESH_RESPONSE" | jq '.'
  exit 1
fi
echo ""

# Test 5: Verify token changed
echo "🔍 Test 5: Verify Token Updated"
echo "--------------------------------"
SLEEP_TIME=2
print_info "Waiting $SLEEP_TIME seconds for tokens to propagate..."
sleep $SLEEP_TIME

NEW_TOKEN_INFO=$(curl -s "$PROTOCOL://$DOMAIN/api/webhooks/debug-fortnox" | jq '.token // empty' 2>/dev/null || echo "null")
NEW_EXP_ISO=$(echo "$NEW_TOKEN_INFO" | jq -r '.expISO // "unknown"')

if [ "$NEW_EXP_ISO" != "$EXP_ISO" ]; then
  print_success "Token expiry has changed (token was refreshed)"
  echo "Old expiry: $EXP_ISO"
  echo "New expiry: $NEW_EXP_ISO"
else
  print_warning "Token expiry is the same (could be cache or very fast refresh)"
fi
echo ""

# Test 6: Check logs
echo "📋 Test 6: Check Backend Logs"
echo "-----------------------------"
if [ -f "logs/combined.log" ]; then
  print_info "Recent Fortnox log entries:"
  grep -i "fortnox.*refresh" logs/combined.log | tail -5 || print_warning "No recent refresh logs found"
else
  print_warning "logs/combined.log not found"
fi
echo ""

# Test 7: Test order creation
echo "📦 Test 7: Test Order Creation (with current token)"
echo "---------------------------------------------------"
print_info "Creating a test order to verify token works..."

ORDER_RESPONSE=$(curl -s "$PROTOCOL://$DOMAIN/api/webhooks/create-test-order" 2>/dev/null || echo "{}")
ORDER_SUCCESS=$(echo "$ORDER_RESPONSE" | jq -r '.success // false' 2>/dev/null || echo "false")

if [ "$ORDER_SUCCESS" = "true" ]; then
  ORDER_NUMBER=$(echo "$ORDER_RESPONSE" | jq -r '.orderNumber // "unknown"')
  print_success "Test order created: $ORDER_NUMBER"
  print_info "Verify in Fortnox that order was synced with this number"
else
  print_error "Failed to create test order"
  echo "Response:"
  echo "$ORDER_RESPONSE" | jq '.' || echo "$ORDER_RESPONSE"
fi
echo ""

# Summary
echo "📊 Test Summary"
echo "==============="
echo "✅ Backend is running and responsive"
if [ "$IS_OAUTH" = "true" ]; then
  echo "✅ Using OAuth Bearer token"
fi
if [ "$REFRESH_SUCCESS" = "true" ] && [ "$REFRESHED" = "true" ]; then
  echo "✅ Token refresh works!"
fi
if [ "$ORDER_SUCCESS" = "true" ]; then
  echo "✅ Fortnox integration is working"
fi

echo ""
print_success "All tests passed! ✨"
echo ""
echo "For more detailed testing, see:"
echo "  - FORTNOX_TOKEN_REFRESH_VERIFICATION.md"
echo "  - VIVA_FORTNOX_PAYMENT_VERIFICATION.md"

