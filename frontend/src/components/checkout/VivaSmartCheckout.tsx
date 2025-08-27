'use client'

import { useEffect, useRef, useState } from 'react'
import { Loader2, AlertCircle } from 'lucide-react'

declare global {
  interface Window {
    VivaPayments?: {
      cards: {
        setup: (config: VivaCheckoutConfig) => void
      }
    }
  }
}

interface VivaCheckoutConfig {
  baseURL: string
  publicKey: string
  sourceCode: string
  paymentTimeout: number
  cardTokenHandler: (token: string) => void
  installmentsHandler?: (installments: number) => void
  nativeMobileSDKHandler?: () => void
}

interface VivaSmartCheckoutProps {
  orderCode: string
  amount: number
  onSuccess: (transactionId: string) => void
  onError: (error: string) => void
  publicKey: string
  sourceCode: string
  baseURL?: string
}

export default function VivaSmartCheckout({ 
  orderCode, 
  amount, 
  onSuccess, 
  onError,
  publicKey,
  sourceCode,
  baseURL = 'https://api.vivapayments.com'
}: VivaSmartCheckoutProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [fallbackUrl, setFallbackUrl] = useState<string | null>(null)

  // Pick correct Viva host for script/fallback based on environment
  const checkoutHost = baseURL?.includes('demo')
    ? 'https://demo.vivapayments.com'
    : 'https://www.vivapayments.com'

  useEffect(() => {
    // Precompute fallback so user can access the external checkout immediately
    setFallbackUrl(`${checkoutHost}/web/checkout?ref=${orderCode}${sourceCode ? `&s=${sourceCode}` : ''}`)

    // Guard: missing public configuration → fallback to hosted checkout
    if (!publicKey || !sourceCode) {
      const message = 'Betalning är inte korrekt konfigurerad (saknar nycklar).'
      setError(message)
      setIsLoading(false)
      onError(message)
      return
    }

    // Load Viva Smart Checkout script
    const script = document.createElement('script')
    script.src = `${checkoutHost}/web/checkout/v2/js`
    script.async = true
    script.onload = () => {
      initializeCheckout()
    }
    script.onerror = () => {
      setError('Kunde inte ladda betalningsskriptet')
      setIsLoading(false)
      onError('Failed to load payment script')
    }
    document.body.appendChild(script)

    return () => {
      // Cleanup
      try {
        document.body.removeChild(script)
      } catch {}
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderCode])

  const initializeCheckout = () => {
    if (!window.VivaPayments || !window.VivaPayments.cards || typeof window.VivaPayments.cards.setup !== 'function') {
      setError('Viva Payments SDK är inte tillgängligt')
      setIsLoading(false)
      onError('Payment system not available')
      setFallbackUrl(`${checkoutHost}/web/checkout?ref=${orderCode}&s=${sourceCode}`)
      return
    }

    try {
      // Initialize Viva Smart Checkout
      window.VivaPayments.cards.setup({
        baseURL,
        publicKey,
        sourceCode,
        paymentTimeout: 1800, // 30 minutes
        cardTokenHandler: async (token: string) => {
          try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002'}/api/orders/complete-payment`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                orderCode,
                cardToken: token
              })
            })

            const data = await response.json()

            if (data.success) {
              onSuccess(data.transactionId)
            } else {
              throw new Error(data.error || 'Payment failed')
            }
          } catch (err: any) {
            setError(err.message || 'Payment processing failed')
            onError(err.message || 'Payment processing failed')
          }
        },
        installmentsHandler: (installments: number) => {
          console.log('Installments selected:', installments)
        }
      })

      setIsLoading(false)
    } catch (err: any) {
      console.error('Viva Smart Checkout init error:', err)
      setError('Failed to initialize payment')
      setIsLoading(false)
      onError('Failed to initialize payment')
      setFallbackUrl(`${checkoutHost}/web/checkout?ref=${orderCode}&s=${sourceCode}`)
    }
  }

  return (
    <div className="w-full">
      {/* Always-visible external checkout link */}
      {fallbackUrl && (
        <div className="mb-4 p-4 bg-[#FFF9F3] border border-[#E79C1A]/30 rounded-xl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p className="text-sm text-gray-800">
              Om betalningsformuläret inte laddar eller om din webbläsare blockerar det, kan du gå vidare via vår säkra externa betalning.
            </p>
            <a
              href={fallbackUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-[#E79C1A] text-white hover:opacity-90 transition text-sm font-medium"
            >
              Öppna säker betalning
            </a>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-[#E79C1A]" />
          <span className="ml-3 text-gray-600">Laddar betalningsformulär...</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 mb-4">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-900">Betalningsfel</p>
            <p className="text-sm text-red-700 mt-1">{error}</p>
            {fallbackUrl && (
              <a
                href={fallbackUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center mt-3 px-4 py-2 rounded-lg bg-[#E79C1A] text-white hover:opacity-90 transition"
              >
                Fortsätt till säker betalning
              </a>
            )}
          </div>
        </div>
      )}

      {/* Viva Card Form Container */}
      <div 
        ref={containerRef}
        id="viva-card-form"
        className="space-y-4"
      >
        {/* Card Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Kortnummer
          </label>
          <div 
            data-vp="card-number" 
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus-within:ring-2 focus-within:ring-[#E79C1A] focus-within:border-transparent transition-all"
          />
        </div>

        {/* Expiry and CVV */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Utgångsdatum
            </label>
            <div 
              data-vp="expiry" 
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus-within:ring-2 focus-within:ring-[#E79C1A] focus-within:border-transparent transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              CVV
            </label>
            <div 
              data-vp="cvv" 
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus-within:ring-2 focus-within:ring-[#E79C1A] focus-within:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Cardholder Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Kortinnehavarens namn
          </label>
          <input
            type="text"
            id="cardholder-name"
            placeholder="Som det står på kortet"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#E79C1A] focus:border-transparent outline-none transition-all"
          />
        </div>

        {/* Remember Card Option */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="remember-card"
            className="w-4 h-4 text-[#E79C1A] border-gray-300 rounded focus:ring-[#E79C1A]"
          />
          <label htmlFor="remember-card" className="text-sm text-gray-700">
            Spara kort för framtida köp
          </label>
        </div>
      </div>

      {/* Card type icons */}
      {/* Removed until assets are added to /public/images/payment to avoid 404s
      <div className="flex items-center gap-3 mt-4 justify-center opacity-50">
        <img src="/images/payment/visa.svg" alt="Visa" className="h-8" />
        <img src="/images/payment/mastercard.svg" alt="Mastercard" className="h-8" />
        <img src="/images/payment/amex.svg" alt="American Express" className="h-8" />
      </div>
      */}
    </div>
  )
} 