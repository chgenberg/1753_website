# Viva Smart Checkout Integration Guide

## Overview

This guide covers the integration of Viva Wallet's Smart Checkout into the 1753 Skincare e-commerce platform. Smart Checkout provides a secure, PCI-compliant payment form that handles card tokenization and payment processing.

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│   Frontend  │────►│   Backend    │────►│ Viva Wallet  │
│  (Next.js)  │     │  (Express)   │     │     API      │
└─────────────┘     └──────────────┘     └──────────────┘
       │                    │                     │
       ▼                    ▼                     ▼
  Smart Checkout      Order Creation         Payment Process
    Widget           & Management           & Webhooks
```

## Implementation Steps

### 1. Backend Setup

#### Environment Variables
Add to your backend `.env`:
```bash
VIVA_MERCHANT_ID=your_merchant_id
VIVA_API_KEY=your_api_key
VIVA_SOURCE_CODE=your_source_code
VIVA_BASE_URL=https://api.vivapayments.com  # or demo-api for testing
```

#### Key Backend Components

1. **Order Creation Endpoint** (`/api/orders/create`)
   - Validates order data
   - Creates order in database
   - Creates payment order in Viva Wallet
   - Returns order code for Smart Checkout

2. **Payment Completion** (`/api/orders/complete-payment`)
   - Receives card token from Smart Checkout
   - Processes payment via Viva Wallet API
   - Updates order status
   - Triggers fulfillment process

3. **Webhook Handler** (`/api/webhooks/viva-wallet`)
   - Validates webhook signatures
   - Updates order status based on payment events
   - Handles refunds and cancellations

### 2. Frontend Integration

#### Environment Variables
Add to your frontend `.env.local`:
```bash
NEXT_PUBLIC_API_URL=http://localhost:5002
NEXT_PUBLIC_VIVA_PUBLIC_KEY=your_public_key
NEXT_PUBLIC_VIVA_SOURCE_CODE=your_source_code
NEXT_PUBLIC_VIVA_BASE_URL=https://api.vivapayments.com
```

#### Smart Checkout Component

The `VivaSmartCheckout` component handles:
- Loading Viva Wallet SDK
- Initializing secure card form
- Token generation
- Payment processing

Key features:
- PCI-compliant card input fields
- Built-in validation
- 3D Secure support
- Multiple card type support

### 3. Checkout Flow

1. **Order Summary** - Customer reviews order
2. **Contact Info** - Email, name, phone
3. **Shipping Address** - Delivery details
4. **Order Creation** - Backend creates order and payment
5. **Payment Form** - Smart Checkout widget
6. **Success Page** - Order confirmation

### 4. Testing

#### Test Cards (Demo Environment)

| Card Number | Result |
|------------|--------|
| 4111 1111 1111 1111 | Success |
| 5555 5555 5555 4444 | Success (Mastercard) |
| 4508 0340 0000 0009 | 3D Secure |
| 4000 0000 0000 0002 | Declined |

Use any future expiry date and any 3-digit CVV.

### 5. Security Considerations

1. **PCI Compliance**
   - Card details never touch your servers
   - Tokenization handled by Viva Wallet
   - Secure iframe implementation

2. **Webhook Security**
   - Validate all webhook signatures
   - Use HTTPS for webhook endpoints
   - Implement idempotency

3. **API Security**
   - Use environment variables for credentials
   - Implement rate limiting
   - Log all payment activities

### 6. Error Handling

Common error scenarios:
- Network failures
- Invalid card details
- Insufficient funds
- 3D Secure failures

The integration handles these gracefully with user-friendly error messages.

### 7. Production Checklist

Before going live:
- [ ] Switch from demo to production API URLs
- [ ] Update all API credentials
- [ ] Configure production webhook URL in Viva Wallet portal
- [ ] Test with real cards (small amounts)
- [ ] Set up monitoring and alerts
- [ ] Review error logs
- [ ] Verify SSL certificates

## API Reference

### Create Order
```javascript
POST /api/orders/create
{
  customer: {
    email: string,
    firstName: string,
    lastName: string,
    phone: string
  },
  shippingAddress: {
    address: string,
    city: string,
    postalCode: string,
    country: string
  },
  items: [{
    productId: string,
    quantity: number,
    price: number
  }],
  total: number
}
```

### Complete Payment
```javascript
POST /api/orders/complete-payment
{
  orderCode: string,
  cardToken: string
}
```

## Troubleshooting

### Common Issues

1. **"Failed to load payment script"**
   - Check network connectivity
   - Verify API URLs are correct
   - Check browser console for CORS errors

2. **"Invalid credentials"**
   - Verify merchant ID and API key
   - Ensure using correct environment (demo vs production)

3. **"Payment failed"**
   - Check Viva Wallet dashboard for details
   - Verify source code configuration
   - Check webhook logs

## Support

- Viva Wallet Documentation: https://developer.viva.com
- Support Email: support@vivawallet.com
- Technical Issues: Create ticket in Viva Wallet portal 