'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { useCart } from '@/contexts/CartContext'
import { 
  CreditCard,
  Lock,
  Shield,
  ArrowLeft,
  Check,
  AlertCircle,
  Loader2
} from 'lucide-react'
import toast from 'react-hot-toast'

interface CheckoutForm {
  // Personal info
  email: string
  firstName: string
  lastName: string
  phone: string
  
  // Shipping address
  address: string
  apartment: string
  city: string
  postalCode: string
  country: string
  
  // Payment method
  paymentMethod: 'card' | 'swish'
  
  // Marketing
  newsletter: boolean
}

export default function CheckoutPage() {
  const router = useRouter()
  const { items, total, subtotal, shipping, clearCart } = useCart()
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentStep, setCurrentStep] = useState(1) // 1: Info, 2: Payment
  
  const [form, setForm] = useState<CheckoutForm>({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    apartment: '',
    city: '',
    postalCode: '',
    country: 'SE',
    paymentMethod: 'card',
    newsletter: false
  })

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0 && !isProcessing) {
      router.push('/cart')
    }
  }, [items, router, isProcessing])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const validateForm = () => {
    const required = ['email', 'firstName', 'lastName', 'phone', 'address', 'city', 'postalCode']
    const missing = required.filter(field => !form[field as keyof CheckoutForm])
    
    if (missing.length > 0) {
      toast.error('Vänligen fyll i alla obligatoriska fält')
      return false
    }
    
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(form.email)) {
      toast.error('Vänligen ange en giltig e-postadress')
      return false
    }
    
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    if (currentStep === 1) {
      setCurrentStep(2)
      return
    }
    
    setIsProcessing(true)
    
    try {
      // Subscribe to newsletter if opted in
      if (form.newsletter && form.email) {
        try {
          await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002'}/api/newsletter/subscribe`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: form.email,
              firstName: form.firstName,
              source: 'checkout'
            })
          });
        } catch (newsletterError) {
          console.error('Newsletter subscription error:', newsletterError);
        }
      }
      
      // Generate unique order ID
      const orderId = `1753-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      
      // Prepare order data for payment
      const orderData = {
        orderId,
        customer: {
          email: form.email,
          firstName: form.firstName,
          lastName: form.lastName,
          phone: form.phone,
          address: form.address,
          apartment: form.apartment,
          city: form.city,
          postalCode: form.postalCode,
          country: form.country
        },
        items: items.map(item => ({
          productId: item.productId,
          name: item.product.name,
          price: item.price,
          quantity: item.quantity,
          sku: item.product.id, // Using product ID as SKU for now
          variantId: item.variantId
        })),
        subtotal,
        shipping,
        tax: 0, // VAT is included in Swedish prices
        total,
        currency: 'SEK',
        paymentMethod: form.paymentMethod,
        newsletter: form.newsletter,
        comments: ''
      }

      // Create payment order
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002'}/api/orders/payment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Payment creation failed')
      }

      // Store order ID in localStorage for success page
      localStorage.setItem('currentOrderId', result.orderId)
      localStorage.setItem('orderData', JSON.stringify({
        orderId: result.orderId,
                total,
        items: items.map(item => ({ name: item.product.name, quantity: item.quantity })),
        customer: {
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email
              }
      }))

      // Clear cart before redirect
      clearCart()

      // Redirect to Viva Wallet for payment
      if (result.redirectUrl) {
        window.location.href = result.redirectUrl
      } else {
        // Fallback - redirect to success page (for testing)
      router.push('/checkout/success')
      }
      
    } catch (error: any) {
      console.error('Payment error:', error)
      toast.error(error.message || 'Något gick fel med betalningen. Försök igen.')
      setIsProcessing(false)
    }
  }

  if (items.length === 0 && !isProcessing) {
    return null // Prevent flash while redirecting
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 pt-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                currentStep >= 1 ? 'bg-[#4A3428] text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                {currentStep > 1 ? <Check className="w-5 h-5" /> : '1'}
              </div>
              <span className="ml-2 text-sm font-medium">Information</span>
            </div>
            <div className="w-24 h-1 mx-4 bg-gray-300">
              <div className={`h-full bg-[#4A3428] transition-all duration-300 ${
                currentStep >= 2 ? 'w-full' : 'w-0'
              }`} />
            </div>
            <div className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                currentStep >= 2 ? 'bg-[#4A3428] text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                2
              </div>
              <span className="ml-2 text-sm font-medium">Betalning</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit}>
                {currentStep === 1 ? (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    {/* Contact Information */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                      <h2 className="text-xl font-semibold mb-4">Kontaktinformation</h2>
                      <div className="space-y-4">
                        <input
                          type="email"
                          name="email"
                          value={form.email}
                          onChange={handleInputChange}
                          placeholder="E-postadress *"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F5F3F0]0"
                          required
                        />
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            name="newsletter"
                            id="newsletter"
                            checked={form.newsletter}
                            onChange={handleInputChange}
                            className="mr-2"
                          />
                          <label htmlFor="newsletter" className="text-sm text-gray-600">
                            Ja, jag vill gärna ta emot erbjudanden och nyheter via e-post
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Shipping Information */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                      <h2 className="text-xl font-semibold mb-4">Leveransadress</h2>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <input
                            type="text"
                            name="firstName"
                            value={form.firstName}
                            onChange={handleInputChange}
                            placeholder="Förnamn *"
                            className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F5F3F0]0"
                            required
                          />
                          <input
                            type="text"
                            name="lastName"
                            value={form.lastName}
                            onChange={handleInputChange}
                            placeholder="Efternamn *"
                            className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F5F3F0]0"
                            required
                          />
                        </div>
                        <input
                          type="tel"
                          name="phone"
                          value={form.phone}
                          onChange={handleInputChange}
                          placeholder="Telefonnummer *"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F5F3F0]0"
                          required
                        />
                        <input
                          type="text"
                          name="address"
                          value={form.address}
                          onChange={handleInputChange}
                          placeholder="Gatuadress *"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F5F3F0]0"
                          required
                        />
                        <input
                          type="text"
                          name="apartment"
                          value={form.apartment}
                          onChange={handleInputChange}
                          placeholder="Lägenhet, svit, etc. (valfritt)"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F5F3F0]0"
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <input
                            type="text"
                            name="postalCode"
                            value={form.postalCode}
                            onChange={handleInputChange}
                            placeholder="Postnummer *"
                            className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F5F3F0]0"
                            required
                          />
                          <input
                            type="text"
                            name="city"
                            value={form.city}
                            onChange={handleInputChange}
                            placeholder="Stad *"
                            className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F5F3F0]0"
                            required
                          />
                        </div>
                        <select
                          name="country"
                          value={form.country}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F5F3F0]0"
                        >
                          <option value="SE">Sverige</option>
                          <option value="NO">Norge</option>
                          <option value="DK">Danmark</option>
                          <option value="FI">Finland</option>
                        </select>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-[#4A3428] text-white py-4 rounded-lg font-medium hover:bg-[#3A2A1E] transition-colors"
                    >
                      Fortsätt till betalning
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    {/* Payment Method */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                      <h2 className="text-xl font-semibold mb-4">Betalningsmetod</h2>
                      <div className="space-y-4">
                        <label className="flex items-center p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-[#F5F3F0]0 transition-colors">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="card"
                            checked={form.paymentMethod === 'card'}
                            onChange={handleInputChange}
                            className="mr-3"
                          />
                          <CreditCard className="w-6 h-6 mr-3 text-gray-600" />
                          <div className="flex-1">
                            <p className="font-medium">Betalkort</p>
                            <p className="text-sm text-gray-500">Visa, Mastercard, American Express</p>
                          </div>
                        </label>
                        
                        <label className="flex items-center p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-[#F5F3F0]0 transition-colors">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="swish"
                            checked={form.paymentMethod === 'swish'}
                            onChange={handleInputChange}
                            className="mr-3"
                          />
                          <div className="w-6 h-6 mr-3 bg-[#4A3428] rounded-full flex items-center justify-center text-white font-bold text-xs">
                            S
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">Swish</p>
                            <p className="text-sm text-gray-500">Betala direkt med Swish</p>
                          </div>
                        </label>
                      </div>
                    </div>

                    {/* Viva Wallet Info */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-start">
                        <Shield className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-blue-900">Säker betalning med Viva Wallet</p>
                          <p className="text-sm text-blue-700 mt-1">
                            Din betalning processas säkert via Viva Wallet. Vi sparar aldrig dina kortuppgifter.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={() => setCurrentStep(1)}
                        className="flex-1 bg-gray-100 text-gray-700 py-4 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                      >
                        <ArrowLeft className="w-5 h-5" />
                        Tillbaka
                      </button>
                      <button
                        type="submit"
                        disabled={isProcessing}
                        className="flex-1 bg-[#4A3428] text-white py-4 rounded-lg font-medium hover:bg-[#3A2A1E] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Behandlar...
                          </>
                        ) : (
                          <>
                            <Lock className="w-5 h-5" />
                            Betala {total} kr
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                )}
              </form>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
                <h2 className="text-xl font-semibold mb-4">Ordersammanfattning</h2>
                
                {/* Cart Items */}
                <div className="space-y-4 mb-6">
                  {items.map((item) => (
                    <div key={`${item.productId}-${item.variantId}`} className="flex gap-4">
                      <div className="relative w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                        {item.product.images && item.product.images[0] && (
                          <Image
                            src={item.product.images[0].url}
                            alt={item.product.name}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{item.product.name}</p>
                        <p className="text-sm text-gray-500">Antal: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-medium">{item.price * item.quantity} kr</p>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="space-y-2 pt-6 border-t">
                  <div className="flex justify-between text-sm">
                    <span>Delsumma</span>
                    <span>{subtotal} kr</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Frakt</span>
                    <span>{shipping === 0 ? 'Gratis' : `${shipping} kr`}</span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold pt-2 border-t">
                    <span>Total</span>
                    <span>{total} kr</span>
                  </div>
                  <p className="text-xs text-gray-500">inkl. moms</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
} 