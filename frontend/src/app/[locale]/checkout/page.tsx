'use client'

import { useState, useEffect, useRef } from 'react'
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
  Loader2,
  Tag,
  X
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

interface DiscountCode {
  id: string
  code: string
  name: string
  description?: string
  type: 'percentage' | 'fixed_amount'
  value: number
  discountAmount: number
}

interface AddressSuggestion {
  address: string
  city: string
  postalCode: string
}

export default function CheckoutPage() {
  const router = useRouter()
  const { items, total, subtotal, shipping, clearCart } = useCart()
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentStep, setCurrentStep] = useState(1) // 1: Info, 2: Payment
  
  // Discount code state
  const [discountCode, setDiscountCode] = useState('')
  const [appliedDiscount, setAppliedDiscount] = useState<DiscountCode | null>(null)
  const [isValidatingDiscount, setIsValidatingDiscount] = useState(false)
  const [discountError, setDiscountError] = useState('')
  
  // Address autocomplete state
  const [addressSuggestions, setAddressSuggestions] = useState<AddressSuggestion[]>([])
  const [showAddressSuggestions, setShowAddressSuggestions] = useState(false)
  const addressInputRef = useRef<HTMLInputElement>(null)
  
  const [form, setForm] = useState<CheckoutForm>({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    apartment: '',
    city: '',
    postalCode: '',
    country: 'Sverige',
    paymentMethod: 'card',
    newsletter: false
  })
  const [rememberInfo, setRememberInfo] = useState(false)

  useEffect(() => {
    try {
      const consent = localStorage.getItem('cookieConsent')
      const saved = localStorage.getItem('checkoutInfo')
      if (consent && saved) {
        const prefs = JSON.parse(consent)
        const allowStorage = typeof prefs === 'boolean' ? prefs : Boolean(prefs?.necessary)
        if (allowStorage) {
          const parsed = JSON.parse(saved)
          setForm((prev) => ({ ...prev, ...parsed }))
          setRememberInfo(true)
        }
      }
    } catch {}
  }, [])

  useEffect(() => {
    if (!rememberInfo) return
    try {
      const consent = localStorage.getItem('cookieConsent')
      const prefs = consent ? JSON.parse(consent) : null
      const allowStorage = typeof prefs === 'boolean' ? prefs : Boolean(prefs?.necessary)
      if (allowStorage) {
        const { email, firstName, lastName, phone, address, apartment, city, postalCode } = form
        localStorage.setItem('checkoutInfo', JSON.stringify({ email, firstName, lastName, phone, address, apartment, city, postalCode }))
      }
    } catch {}
  }, [form, rememberInfo])

  // Calculate totals with discount
  const originalTotal = total
  const discountAmount = appliedDiscount?.discountAmount || 0
  const finalTotal = Math.max(0, originalTotal - discountAmount)

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0 && !isProcessing) {
      router.push('/cart')
    }
  }, [items, router, isProcessing])

  // Validate discount code
  const validateDiscountCode = async (code: string) => {
    if (!code.trim()) return

    setIsValidatingDiscount(true)
    setDiscountError('')

    try {
      const response = await fetch('/api/discounts/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: code.trim(),
          orderTotal: originalTotal
        }),
      })

      const data = await response.json()

      if (data.success) {
        setAppliedDiscount(data.discountCode)
        setDiscountError('')
        toast.success(`Rabattkod tillagd! Du sparar ${data.discountCode.discountAmount} kr`)
      } else {
        setDiscountError(data.message)
        setAppliedDiscount(null)
      }
    } catch (error) {
      console.error('Error validating discount code:', error)
      setDiscountError('Ett fel uppstod vid validering av rabattkoden')
      setAppliedDiscount(null)
    } finally {
      setIsValidatingDiscount(false)
    }
  }

  // Handle discount code application
  const handleApplyDiscount = () => {
    validateDiscountCode(discountCode)
  }

  // Remove applied discount
  const handleRemoveDiscount = () => {
    setAppliedDiscount(null)
    setDiscountCode('')
    setDiscountError('')
  }

  // Address autocomplete using Swedish postal service API
  const searchAddressSuggestions = async (query: string) => {
    if (query.length < 3) {
      setAddressSuggestions([])
      return
    }

    try {
      const response = await fetch(`/api/address-suggestions?q=${encodeURIComponent(query)}&limit=8`)
      const data = await response.json()

      if (data.success) {
        setAddressSuggestions(data.suggestions)
      } else {
        setAddressSuggestions([])
      }
    } catch (error) {
      console.error('Error fetching address suggestions:', error)
      setAddressSuggestions([])
    }
  }

  // Handle address input change
  const handleAddressChange = (value: string) => {
    setForm(prev => ({ ...prev, address: value }))
    searchAddressSuggestions(value)
    setShowAddressSuggestions(true)
  }

  // Select address suggestion
  const selectAddressSuggestion = (suggestion: AddressSuggestion) => {
    setForm(prev => ({
      ...prev,
      address: suggestion.address,
      city: suggestion.city,
      postalCode: suggestion.postalCode
    }))
    setShowAddressSuggestions(false)
    setAddressSuggestions([])
  }

  const handleInputChange = (field: keyof CheckoutForm, value: string | boolean) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const [formErrors, setFormErrors] = useState<string[]>([])

  const validateStep1 = () => {
    const errors: string[] = []
    if (!form.email) errors.push('E-post krävs')
    if (!form.firstName) errors.push('Förnamn krävs')
    if (!form.lastName) errors.push('Efternamn krävs')
    if (!form.phone) errors.push('Telefon krävs')
    if (!form.address) errors.push('Adress krävs')
    if (!form.city) errors.push('Stad krävs')
    if (!form.postalCode) errors.push('Postnummer krävs')

    if (errors.length > 0) {
      toast.error(errors[0])
      setFormErrors(errors)
      return false
    }
    setFormErrors([])
    return true
  }

  const handleContinueToPayment = () => {
    if (validateStep1()) {
      setCurrentStep(2)
    }
  }

  const handleSubmitOrder = async () => {
    setIsProcessing(true)
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Clear cart and redirect to success
      clearCart()
      router.push('/checkout/success')
    } catch (error) {
      console.error('Error submitting order:', error)
      toast.error('Ett fel uppstod vid beställningen')
    } finally {
      setIsProcessing(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Din varukorg är tom</h1>
          <button
            onClick={() => router.push('/products')}
            className="bg-[#FCB237] text-white px-6 py-3 rounded-full hover:bg-[#E79C1A] transition-colors"
          >
            Fortsätt handla
          </button>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Back button */}
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Tillbaka
          </button>

          {/* Progress indicator */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep >= 1 ? 'bg-[#FCB237] text-white' : 'bg-gray-200'
              }`}>
                {currentStep > 1 ? <Check className="w-4 h-4" /> : '1'}
              </div>
              <div className={`w-16 h-1 ${currentStep >= 2 ? 'bg-[#FCB237]' : 'bg-gray-200'}`} />
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep >= 2 ? 'bg-[#FCB237] text-white' : 'bg-gray-200'
              }`}>
                2
              </div>
            </div>
          </div>

          {/* Live region for form errors */}
          <div aria-live="polite" className="sr-only" id="form-errors-live">
            {formErrors?.join('. ')}
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left column - Form */}
            <div className="space-y-6">
              {currentStep === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white rounded-lg shadow-md p-6"
                >
                  <h2 className="text-xl font-semibold mb-6">Leveransinformation</h2>
                  
                  {/* Personal Info */}
                  <div className="space-y-4 mb-6">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        E-postadress *
                      </label>
                      <input
                        id="email"
                        type="email"
                        value={form.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FCB237]"
                        required
                        aria-invalid={formErrors?.includes('E-post krävs')}
                        aria-describedby={formErrors?.includes('E-post krävs') ? 'email-error' : undefined}
                      />
                      {formErrors?.includes('E-post krävs') && (
                        <p id="email-error" className="mt-1 text-sm text-red-600">E-post krävs</p>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                          Förnamn *
                        </label>
                        <input
                          id="firstName"
                          type="text"
                          value={form.firstName}
                          onChange={(e) => handleInputChange('firstName', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FCB237]"
                          required
                          aria-invalid={formErrors?.includes('Förnamn krävs')}
                          aria-describedby={formErrors?.includes('Förnamn krävs') ? 'firstName-error' : undefined}
                        />
                        {formErrors?.includes('Förnamn krävs') && (
                          <p id="firstName-error" className="mt-1 text-sm text-red-600">Förnamn krävs</p>
                        )}
                      </div>
                      <div>
                        <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                          Efternamn *
                        </label>
                        <input
                          id="lastName"
                          type="text"
                          value={form.lastName}
                          onChange={(e) => handleInputChange('lastName', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FCB237]"
                          required
                          aria-invalid={formErrors?.includes('Efternamn krävs')}
                          aria-describedby={formErrors?.includes('Efternamn krävs') ? 'lastName-error' : undefined}
                        />
                        {formErrors?.includes('Efternamn krävs') && (
                          <p id="lastName-error" className="mt-1 text-sm text-red-600">Efternamn krävs</p>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                        Telefonnummer *
                      </label>
                      <input
                        id="phone"
                        type="tel"
                        inputMode="tel"
                        pattern="[0-9 +()-]{6,}"
                        value={form.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FCB237]"
                        required
                        aria-invalid={formErrors?.includes('Telefon krävs')}
                        aria-describedby={formErrors?.includes('Telefon krävs') ? 'phone-error' : undefined}
                      />
                      {formErrors?.includes('Telefon krävs') && (
                        <p id="phone-error" className="mt-1 text-sm text-red-600">Telefon krävs</p>
                      )}
                    </div>
                  </div>

                  {/* Shipping Address with Autocomplete */}
                  <div className="space-y-4 mb-6">
                    <h3 className="font-medium text-gray-900">Leveransadress</h3>
                    
                    <div className="relative">
                      <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                        Adress *
                      </label>
                      <input
                        id="address"
                        ref={addressInputRef}
                        type="text"
                        value={form.address}
                        onChange={(e) => handleAddressChange(e.target.value)}
                        onFocus={() => setShowAddressSuggestions(true)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FCB237]"
                        placeholder="Börja skriv din adress..."
                        required
                        aria-invalid={formErrors?.includes('Adress krävs')}
                        aria-describedby={formErrors?.includes('Adress krävs') ? 'address-error' : undefined}
                        aria-autocomplete="list"
                        aria-controls="address-suggestions"
                      />
                      {formErrors?.includes('Adress krävs') && (
                        <p id="address-error" className="mt-1 text-sm text-red-600">Adress krävs</p>
                      )}
                      
                      {/* Address Suggestions */}
                      {showAddressSuggestions && addressSuggestions.length > 0 && (
                        <div id="address-suggestions" className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto" role="listbox">
                          {addressSuggestions.map((suggestion, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() => selectAddressSuggestion(suggestion)}
                              className="w-full px-4 py-2 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                              role="option"
                            >
                              <div className="font-medium">{suggestion.address}</div>
                              <div className="text-sm text-gray-500">
                                {suggestion.postalCode} {suggestion.city}
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="apartment" className="block text-sm font-medium text-gray-700 mb-1">
                        Lägenhet, svit, etc. (valfritt)
                      </label>
                      <input
                        id="apartment"
                        type="text"
                        value={form.apartment}
                        onChange={(e) => handleInputChange('apartment', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FCB237]"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                          Stad *
                        </label>
                        <input
                          id="city"
                          type="text"
                          value={form.city}
                          onChange={(e) => handleInputChange('city', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FCB237]"
                          required
                          aria-invalid={formErrors?.includes('Stad krävs')}
                          aria-describedby={formErrors?.includes('Stad krävs') ? 'city-error' : undefined}
                        />
                        {formErrors?.includes('Stad krävs') && (
                          <p id="city-error" className="mt-1 text-sm text-red-600">Stad krävs</p>
                        )}
                      </div>
                      <div>
                        <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">
                          Postnummer *
                        </label>
                        <input
                          id="postalCode"
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]{3}[ ]?[0-9]{2}"
                          value={form.postalCode}
                          onChange={(e) => handleInputChange('postalCode', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FCB237]"
                          required
                          aria-invalid={formErrors?.includes('Postnummer krävs')}
                          aria-describedby={formErrors?.includes('Postnummer krävs') ? 'postalCode-error' : undefined}
                        />
                        {formErrors?.includes('Postnummer krävs') && (
                          <p id="postalCode-error" className="mt-1 text-sm text-red-600">Postnummer krävs</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Newsletter */}
                  <div className="mb-6">
                    <label className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={form.newsletter}
                        onChange={(e) => handleInputChange('newsletter', e.target.checked)}
                        className="mt-1 h-4 w-4 text-[#FCB237] focus:ring-[#FCB237] border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700">
                        Ja, jag vill gärna ta utbildande information och erbjudanden via e-post
                      </span>
                    </label>
                  </div>

                  {/* Remember info */}
                  <div className="mb-6">
                    <label className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={rememberInfo}
                        onChange={(e) => setRememberInfo(e.target.checked)}
                        className="mt-1 h-4 w-4 text-[#FCB237] focus:ring-[#FCB237] border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700">
                        Spara mina uppgifter på den här enheten
                      </span>
                    </label>
                  </div>

                  <button
                    onClick={handleContinueToPayment}
                    className="w-full bg-[#FCB237] text-white py-3 rounded-full font-medium hover:bg-[#E79C1A] transition-colors"
                  >
                    Fortsätt till betalning
                  </button>
                </motion.div>
              )}

              {currentStep === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white rounded-lg shadow-md p-6"
                >
                  <h2 className="text-xl font-semibold mb-6">Betalningsmetod</h2>
                  
                  {/* Payment methods */}
                  <div className="space-y-4 mb-6">
                    <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="card"
                        checked={form.paymentMethod === 'card'}
                        onChange={(e) => handleInputChange('paymentMethod', e.target.value as 'card' | 'swish')}
                        className="mr-3"
                      />
                      <CreditCard className="w-5 h-5 mr-3 text-gray-600" />
                      <span>Kort (Visa, Mastercard)</span>
                    </label>
                    
                    <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="swish"
                        checked={form.paymentMethod === 'swish'}
                        onChange={(e) => handleInputChange('paymentMethod', e.target.value as 'card' | 'swish')}
                        className="mr-3"
                      />
                      <div className="w-5 h-5 mr-3 bg-[#00BFA5] rounded-sm flex items-center justify-center">
                        <span className="text-white text-xs font-bold">S</span>
                      </div>
                      <span>Swish</span>
                    </label>
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={() => setCurrentStep(1)}
                      className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-full font-medium hover:bg-gray-50 transition-colors"
                    >
                      Tillbaka
                    </button>
                    
                    <button
                      onClick={handleSubmitOrder}
                      disabled={isProcessing}
                      className="flex-1 bg-[#FCB237] text-white py-3 rounded-full font-medium hover:bg-[#E79C1A] transition-colors disabled:opacity-50 flex items-center justify-center"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Bearbetar...
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4 mr-2" />
                          Slutför köp
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Right column - Order summary */}
            <div className="lg:sticky lg:top-8 h-fit">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-6">Ordersammanfattning</h2>
                
                {/* Cart items */}
                <div className="space-y-4 mb-6">
                  {items.map((item) => (
                    <div key={`${item.productId}-${item.variantId || 'default'}`} className="flex gap-4">
                      <div className="relative w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                        {item.product.images && item.product.images[0] && (
                          <Image
                            src={item.product.images[0].url || item.product.images[0]}
                            alt={item.product.name}
                            fill
                            className="object-cover"
                          />
                        )}
                        <div className="absolute -top-2 -right-2 bg-gray-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {item.quantity}
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-sm">{item.product.name}</h3>
                        <p className="text-gray-600 text-sm">{item.price} kr</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{item.price * item.quantity} kr</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Discount Code Section */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium mb-3 flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    Rabattkod
                  </h3>
                  
                  {appliedDiscount ? (
                    <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-md">
                      <div>
                        <span className="font-medium text-green-800">{appliedDiscount.code}</span>
                        <p className="text-sm text-green-600">
                          {appliedDiscount.description || appliedDiscount.name}
                        </p>
                      </div>
                      <button
                        onClick={handleRemoveDiscount}
                        className="text-green-600 hover:text-green-800"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <label htmlFor="discountCode" className="sr-only">Rabattkod</label>
                      <input
                        id="discountCode"
                        type="text"
                        value={discountCode}
                        onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                        placeholder="Ange rabattkod"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#FCB237]"
                        aria-invalid={Boolean(discountError)}
                        aria-describedby={discountError ? 'discount-error' : undefined}
                      />
                      <button
                        onClick={handleApplyDiscount}
                        className="px-4 py-2 bg-[#FCB237] text-white rounded-md text-sm hover:bg-[#E79C1A] disabled:opacity-50"
                        disabled={isValidatingDiscount}
                        aria-busy={isValidatingDiscount}
                      >
                        {isValidatingDiscount ? 'Kontrollerar…' : 'Lägg till'}
                      </button>
                    </div>
                  )}
                  {discountError && (
                    <p id="discount-error" className="mt-2 text-sm text-red-600" role="alert">{discountError}</p>
                  )}
                </div>

                {/* Order totals */}
                <div className="space-y-2 border-t pt-4">
                  <div className="flex justify-between">
                    <span>Delsumma</span>
                    <span>{subtotal} kr</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Frakt</span>
                    <span>{shipping === 0 ? 'Gratis' : `${shipping} kr`}</span>
                  </div>
                  {appliedDiscount && (
                    <div className="flex justify-between text-green-600">
                      <span>Rabatt ({appliedDiscount.code})</span>
                      <span>-{discountAmount} kr</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-semibold border-t pt-2">
                    <span>Totalt</span>
                    <span>{finalTotal} kr</span>
                  </div>
                </div>

                {/* Security info */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Shield className="w-4 h-4" />
                    <span>Säker betalning med SSL-kryptering</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
} 