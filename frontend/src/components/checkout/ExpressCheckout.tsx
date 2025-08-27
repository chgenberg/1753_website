'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useCart } from '@/contexts/CartContext'
import { useCurrency } from '@/contexts/CurrencyContext'
import { CreditCard, Smartphone, Zap } from 'lucide-react'
import toast from 'react-hot-toast'

// Type declarations for Apple Pay and Google Pay
declare global {
  interface Window {
    ApplePaySession: any
    google: {
      payments: {
        api: {
          PaymentsClient: any
        }
      }
    }
  }
}

interface ExpressCheckoutProps {
  onSuccess?: (orderData: any) => void
  onError?: (error: string) => void
  className?: string
}

export default function ExpressCheckout({ onSuccess, onError, className = '' }: ExpressCheckoutProps) {
  const { items, total, subtotal, shipping } = useCart()
  const { currency, convertFromSEK } = useCurrency()
  const [isApplePayAvailable, setIsApplePayAvailable] = useState(false)
  const [isGooglePayAvailable, setIsGooglePayAvailable] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    // Check Apple Pay availability
    if (window.ApplePaySession && window.ApplePaySession.canMakePayments()) {
      setIsApplePayAvailable(true)
    }

    // Check Google Pay availability
    if (window.google && window.google.payments) {
      const paymentsClient = new window.google.payments.api.PaymentsClient({
        environment: process.env.NODE_ENV === 'production' ? 'PRODUCTION' : 'TEST'
      })

      paymentsClient.isReadyToPay({
        apiVersion: 2,
        apiVersionMinor: 0,
        allowedPaymentMethods: [{
          type: 'CARD',
          parameters: {
            allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
            allowedCardNetworks: ['MASTERCARD', 'VISA']
          }
        }]
      }).then((response: any) => {
        if (response.result) {
          setIsGooglePayAvailable(true)
        }
      }).catch(console.error)
    }
  }, [])

  const handleApplePay = async () => {
    if (!window.ApplePaySession) return

    setIsProcessing(true)
    
    try {
      const paymentRequest = {
        countryCode: 'SE',
        currencyCode: currency,
        supportedNetworks: ['visa', 'masterCard', 'amex'],
        merchantCapabilities: ['supports3DS'],
        total: {
          label: '1753 Skincare',
          amount: convertFromSEK(total).toFixed(2),
          type: 'final'
        },
        lineItems: items.map(item => ({
          label: item.product.name,
          amount: convertFromSEK(item.price * item.quantity).toFixed(2),
          type: 'final'
        }))
      }

      const session = new window.ApplePaySession(3, paymentRequest)
      
      session.onvalidatemerchant = async (event: any) => {
        // Validate with Viva Wallet
        try {
          const response = await fetch('/api/payments/apple-pay/validate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              validationURL: event.validationURL,
              displayName: '1753 Skincare'
            })
          })
          
          const merchantSession = await response.json()
          session.completeMerchantValidation(merchantSession)
        } catch (error) {
          session.abort()
          throw error
        }
      }

      session.onpaymentauthorized = async (event: any) => {
        try {
          // Process payment with Viva Wallet
          const response = await fetch('/api/payments/apple-pay/process', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              payment: event.payment,
              orderData: {
                items,
                total,
                subtotal,
                shipping,
                currency
              }
            })
          })

          const result = await response.json()
          
          if (result.success) {
            session.completePayment(window.ApplePaySession.STATUS_SUCCESS)
            onSuccess?.(result.orderData)
          } else {
            session.completePayment(window.ApplePaySession.STATUS_FAILURE)
            throw new Error(result.error)
          }
        } catch (error) {
          session.completePayment(window.ApplePaySession.STATUS_FAILURE)
          throw error
        }
      }

      session.begin()
    } catch (error: any) {
      console.error('Apple Pay error:', error)
      toast.error('Apple Pay-betalning misslyckades')
      onError?.(error.message)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleGooglePay = async () => {
    if (!window.google?.payments) return

    setIsProcessing(true)

    try {
      const paymentsClient = new window.google.payments.api.PaymentsClient({
        environment: process.env.NODE_ENV === 'production' ? 'PRODUCTION' : 'TEST'
      })

      const paymentDataRequest = {
        apiVersion: 2,
        apiVersionMinor: 0,
        allowedPaymentMethods: [{
          type: 'CARD',
          parameters: {
            allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
            allowedCardNetworks: ['MASTERCARD', 'VISA']
          },
          tokenizationSpecification: {
            type: 'PAYMENT_GATEWAY',
            parameters: {
              gateway: 'viva',
              gatewayMerchantId: process.env.NEXT_PUBLIC_VIVA_MERCHANT_ID || ''
            }
          }
        }],
        merchantInfo: {
          merchantId: process.env.NEXT_PUBLIC_GOOGLE_PAY_MERCHANT_ID || '',
          merchantName: '1753 Skincare'
        },
        transactionInfo: {
          totalPriceStatus: 'FINAL',
          totalPrice: convertFromSEK(total).toFixed(2),
          currencyCode: currency,
          countryCode: 'SE'
        }
      }

      const paymentData = await paymentsClient.loadPaymentData(paymentDataRequest)
      
      // Process with Viva Wallet
      const response = await fetch('/api/payments/google-pay/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentData,
          orderData: {
            items,
            total,
            subtotal,
            shipping,
            currency
          }
        })
      })

      const result = await response.json()
      
      if (result.success) {
        onSuccess?.(result.orderData)
      } else {
        throw new Error(result.error)
      }
    } catch (error: any) {
      console.error('Google Pay error:', error)
      toast.error('Google Pay-betalning misslyckades')
      onError?.(error.message)
    } finally {
      setIsProcessing(false)
    }
  }

  if (!isApplePayAvailable && !isGooglePayAvailable) {
    return null
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 h-px bg-gray-200"></div>
        <span className="text-sm text-gray-500 flex items-center gap-2">
          <Zap className="w-4 h-4" />
          Express Checkout
        </span>
        <div className="flex-1 h-px bg-gray-200"></div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {isApplePayAvailable && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleApplePay}
            disabled={isProcessing || items.length === 0}
            className="flex items-center justify-center gap-3 bg-black text-white py-4 px-6 rounded-xl font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
            </svg>
            Pay
          </motion.button>
        )}

        {isGooglePayAvailable && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleGooglePay}
            disabled={isProcessing || items.length === 0}
            className="flex items-center justify-center gap-3 bg-white border-2 border-gray-300 text-gray-800 py-4 px-6 rounded-xl font-medium hover:border-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Pay
          </motion.button>
        )}
      </div>
    </div>
  )
} 