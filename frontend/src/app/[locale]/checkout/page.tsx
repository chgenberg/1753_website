'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
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
  X,
  User,
  Mail,
  Phone,
  MapPin,
  ChevronRight,
  Package,
  ShoppingBag
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
  type: 'percentage' | 'fixed'
  value: number
  minAmount?: number
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
  const [currentStep, setCurrentStep] = useState(1) // 1: Info, 2: Shipping, 3: Payment
  const [isMobile, setIsMobile] = useState(false)
  
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
  
  // Check if mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Load saved form data
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
        }
      }
    } catch {}
  }, [])

  // Save form data
  useEffect(() => {
    try {
      const consent = localStorage.getItem('cookieConsent')
      if (consent) {
        const prefs = JSON.parse(consent)
        const allowStorage = typeof prefs === 'boolean' ? prefs : Boolean(prefs?.necessary)
        if (allowStorage) {
          localStorage.setItem('checkoutInfo', JSON.stringify(form))
        }
      }
    } catch {}
  }, [form])

  const handleInputChange = (field: keyof CheckoutForm, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const validateDiscountCode = async () => {
    if (!discountCode.trim()) return

    setIsValidatingDiscount(true)
    setDiscountError('')

    try {
      const response = await fetch('/api/discounts/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: discountCode.toUpperCase() })
      })

      const data = await response.json()

      if (data.valid) {
        setAppliedDiscount(data.discount)
        toast.success('Rabattkod tillagd!')
      } else {
        setDiscountError(data.message || 'Ogiltig rabattkod')
      }
    } catch (error) {
      setDiscountError('Kunde inte validera rabattkoden')
    } finally {
      setIsValidatingDiscount(false)
    }
  }

  const removeDiscount = () => {
    setAppliedDiscount(null)
    setDiscountCode('')
    setDiscountError('')
  }

  const calculateDiscount = () => {
    if (!appliedDiscount) return 0
    
    if (appliedDiscount.type === 'percentage') {
      return Math.round(subtotal * (appliedDiscount.value / 100))
    } else {
      return Math.min(appliedDiscount.value, subtotal)
    }
  }

  const finalTotal = total - calculateDiscount()

  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  const validateStep1 = () => {
    const errors: Record<string, string> = {}
    
    if (!form.email) errors.email = 'E-post krävs'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Ogiltig e-postadress'
    
    if (!form.firstName) errors.firstName = 'Förnamn krävs'
    if (!form.lastName) errors.lastName = 'Efternamn krävs'
    if (!form.phone) errors.phone = 'Telefon krävs'

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return false
    }
    
    setFormErrors({})
    return true
  }

  const validateStep2 = () => {
    const errors: Record<string, string> = {}
    
    if (!form.address) errors.address = 'Adress krävs'
    if (!form.city) errors.city = 'Stad krävs'
    if (!form.postalCode) errors.postalCode = 'Postnummer krävs'

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return false
    }
    
    setFormErrors({})
    return true
  }

  const handleNextStep = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2)
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3)
    }
  }

  const handleSubmitOrder = async () => {
    setIsProcessing(true)
    
    try {
      // TODO: Implement real payment processing
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
      <div className="min-h-screen bg-gradient-to-br from-[#FAF8F5] via-white to-[#F5F0E8]">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <ShoppingBag className="w-24 h-24 text-gray-300 mx-auto mb-6" />
          <h1 className="text-3xl font-light mb-4">Din varukorg är tom</h1>
          <p className="text-gray-600 mb-8">Upptäck våra naturliga hudvårdsprodukter</p>
          <button
            onClick={() => router.push('/products')}
            className="bg-gradient-to-r from-[#8B6B47] to-[#6B5337] text-white px-8 py-4 rounded-full hover:shadow-lg transition-all"
          >
            Fortsätt handla
          </button>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF8F5] via-white to-[#F5F0E8]">
      <Header />
      
      <div className="container mx-auto px-4 py-6 md:py-12 max-w-6xl">
        {/* Mobile Progress */}
        <div className="mb-6 md:mb-8">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => currentStep > 1 ? setCurrentStep(currentStep - 1) : router.push('/cart')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden md:inline">Tillbaka</span>
            </button>
            
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className={currentStep >= 1 ? 'text-[#8B6B47] font-medium' : ''}>Information</span>
              <ChevronRight className="w-4 h-4" />
              <span className={currentStep >= 2 ? 'text-[#8B6B47] font-medium' : ''}>Leverans</span>
              <ChevronRight className="w-4 h-4" />
              <span className={currentStep >= 3 ? 'text-[#8B6B47] font-medium' : ''}>Betalning</span>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: '0%' }}
              animate={{ width: `${(currentStep / 3) * 100}%` }}
              transition={{ duration: 0.5 }}
              className="h-full bg-gradient-to-r from-[#8B6B47] to-[#6B5337]"
            />
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {/* Step 1: Contact Information */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-2xl shadow-sm p-6 md:p-8"
                >
                  <h2 className="text-2xl font-light mb-6 flex items-center gap-3">
                    <User className="w-6 h-6 text-[#8B6B47]" />
                    Kontaktinformation
                  </h2>

                  <div className="space-y-4">
                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        E-postadress
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="email"
                          value={form.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#8B6B47] focus:border-transparent outline-none transition-all ${
                            formErrors.email ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="din@email.com"
                        />
                      </div>
                      {formErrors.email && (
                        <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>
                      )}
                    </div>

                    {/* Name fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Förnamn
                        </label>
                        <input
                          type="text"
                          value={form.firstName}
                          onChange={(e) => handleInputChange('firstName', e.target.value)}
                          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#8B6B47] focus:border-transparent outline-none transition-all ${
                            formErrors.firstName ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {formErrors.firstName && (
                          <p className="text-red-500 text-sm mt-1">{formErrors.firstName}</p>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Efternamn
                        </label>
                        <input
                          type="text"
                          value={form.lastName}
                          onChange={(e) => handleInputChange('lastName', e.target.value)}
                          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#8B6B47] focus:border-transparent outline-none transition-all ${
                            formErrors.lastName ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {formErrors.lastName && (
                          <p className="text-red-500 text-sm mt-1">{formErrors.lastName}</p>
                        )}
                      </div>
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Telefon
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="tel"
                          value={form.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#8B6B47] focus:border-transparent outline-none transition-all ${
                            formErrors.phone ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="07X-XXX XX XX"
                        />
                      </div>
                      {formErrors.phone && (
                        <p className="text-red-500 text-sm mt-1">{formErrors.phone}</p>
                      )}
                    </div>

                    {/* Newsletter */}
                    <div className="pt-4">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form.newsletter}
                          onChange={(e) => handleInputChange('newsletter', e.target.checked)}
                          className="mt-1 w-5 h-5 text-[#8B6B47] focus:ring-[#8B6B47] border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700">
                          Ja, jag vill gärna ta del av utbildande information och erbjudanden via e-post
                        </span>
                      </label>
                    </div>

                    {/* Continue button */}
                    <motion.button
                      onClick={handleNextStep}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-4 bg-gradient-to-r from-[#8B6B47] to-[#6B5337] text-white rounded-xl font-medium text-lg shadow-lg hover:shadow-xl transition-all duration-300 mt-6"
                    >
                      Fortsätt till leverans
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Shipping Information */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-2xl shadow-sm p-6 md:p-8"
                >
                  <h2 className="text-2xl font-light mb-6 flex items-center gap-3">
                    <MapPin className="w-6 h-6 text-[#8B6B47]" />
                    Leveransadress
                  </h2>

                  <div className="space-y-4">
                    {/* Address */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Adress
                      </label>
                      <input
                        type="text"
                        value={form.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#8B6B47] focus:border-transparent outline-none transition-all ${
                          formErrors.address ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Gatuadress"
                      />
                      {formErrors.address && (
                        <p className="text-red-500 text-sm mt-1">{formErrors.address}</p>
                      )}
                    </div>

                    {/* Apartment */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Lägenhet, svit etc. (valfritt)
                      </label>
                      <input
                        type="text"
                        value={form.apartment}
                        onChange={(e) => handleInputChange('apartment', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8B6B47] focus:border-transparent outline-none transition-all"
                      />
                    </div>

                    {/* City and Postal Code */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Postnummer
                        </label>
                        <input
                          type="text"
                          value={form.postalCode}
                          onChange={(e) => handleInputChange('postalCode', e.target.value)}
                          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#8B6B47] focus:border-transparent outline-none transition-all ${
                            formErrors.postalCode ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="123 45"
                        />
                        {formErrors.postalCode && (
                          <p className="text-red-500 text-sm mt-1">{formErrors.postalCode}</p>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Stad
                        </label>
                        <input
                          type="text"
                          value={form.city}
                          onChange={(e) => handleInputChange('city', e.target.value)}
                          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#8B6B47] focus:border-transparent outline-none transition-all ${
                            formErrors.city ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {formErrors.city && (
                          <p className="text-red-500 text-sm mt-1">{formErrors.city}</p>
                        )}
                      </div>
                    </div>

                    {/* Country */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Land
                      </label>
                      <select
                        value={form.country}
                        onChange={(e) => handleInputChange('country', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8B6B47] focus:border-transparent outline-none transition-all"
                      >
                        <option value="Sverige">Sverige</option>
                        <option value="Norge">Norge</option>
                        <option value="Danmark">Danmark</option>
                        <option value="Finland">Finland</option>
                      </select>
                    </div>

                    {/* Shipping method info */}
                    <div className="bg-[#FAF8F5] rounded-xl p-4 mt-6">
                      <div className="flex items-center gap-3 text-[#8B6B47]">
                        <Package className="w-5 h-5" />
                        <span className="font-medium">Standard leverans</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">
                        Leverans inom 2-4 arbetsdagar. Fri frakt över 500 kr.
                      </p>
                    </div>

                    {/* Continue button */}
                    <motion.button
                      onClick={handleNextStep}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-4 bg-gradient-to-r from-[#8B6B47] to-[#6B5337] text-white rounded-xl font-medium text-lg shadow-lg hover:shadow-xl transition-all duration-300 mt-6"
                    >
                      Fortsätt till betalning
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Payment */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-2xl shadow-sm p-6 md:p-8"
                >
                  <h2 className="text-2xl font-light mb-6 flex items-center gap-3">
                    <CreditCard className="w-6 h-6 text-[#8B6B47]" />
                    Betalning
                  </h2>

                  <div className="space-y-4">
                    {/* Payment method selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Välj betalningsmetod
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <button
                          onClick={() => handleInputChange('paymentMethod', 'card')}
                          className={`p-4 rounded-xl border-2 transition-all ${
                            form.paymentMethod === 'card'
                              ? 'border-[#8B6B47] bg-[#8B6B47]/10'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <CreditCard className="w-8 h-8 mx-auto mb-2 text-[#8B6B47]" />
                          <div className="font-medium">Kort</div>
                          <div className="text-sm text-gray-600 mt-1">Visa, Mastercard, etc.</div>
                        </button>
                        
                        <button
                          onClick={() => handleInputChange('paymentMethod', 'swish')}
                          className={`p-4 rounded-xl border-2 transition-all ${
                            form.paymentMethod === 'swish'
                              ? 'border-[#8B6B47] bg-[#8B6B47]/10'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="w-8 h-8 mx-auto mb-2 bg-[#00C863] rounded-lg flex items-center justify-center text-white font-bold">
                            S
                          </div>
                          <div className="font-medium">Swish</div>
                          <div className="text-sm text-gray-600 mt-1">Betala med mobilen</div>
                        </button>
                      </div>
                    </div>

                    {/* Security info */}
                    <div className="bg-green-50 rounded-xl p-4 flex items-start gap-3">
                      <Shield className="w-5 h-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-green-900">Säker betalning</p>
                        <p className="text-sm text-green-700 mt-1">
                          Din betalningsinformation är krypterad och säker
                        </p>
                      </div>
                    </div>

                    {/* Place order button */}
                    <motion.button
                      onClick={handleSubmitOrder}
                      disabled={isProcessing}
                      whileHover={{ scale: isProcessing ? 1 : 1.02 }}
                      whileTap={{ scale: isProcessing ? 1 : 0.98 }}
                      className="w-full py-4 bg-gradient-to-r from-[#FCB237] to-[#E79C1A] text-white rounded-xl font-medium text-lg shadow-lg hover:shadow-xl transition-all duration-300 mt-6 disabled:opacity-75 disabled:cursor-not-allowed"
                    >
                      {isProcessing ? (
                        <span className="flex items-center justify-center gap-3">
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Behandlar beställning...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-3">
                          <Lock className="w-5 h-5" />
                          Slutför köp ({finalTotal} kr)
                        </span>
                      )}
                    </motion.button>

                    {/* Terms */}
                    <p className="text-xs text-gray-500 text-center mt-4">
                      Genom att slutföra köpet godkänner du våra{' '}
                      <a href="/villkor" className="text-[#8B6B47] hover:underline">köpvillkor</a>
                      {' '}och{' '}
                      <a href="/integritetspolicy" className="text-[#8B6B47] hover:underline">integritetspolicy</a>
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Order Summary (Sidebar) */}
          <div className="lg:sticky lg:top-24 h-fit">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-lg font-medium mb-4">Ordersammanfattning</h3>
              
              {/* Items */}
              <div className="space-y-3 mb-6">
                {items.map((item) => (
                  <div key={`${item.productId}-${item.variantId || 'default'}`} className="flex items-center gap-3">
                    <div className="relative">
                      <Image
                        src={item.product.images?.[0]?.url || '/placeholder.jpg'}
                        alt={item.product.name}
                        width={60}
                        height={60}
                        className="rounded-lg object-cover"
                      />
                      <span className="absolute -top-2 -right-2 w-5 h-5 bg-[#8B6B47] text-white text-xs rounded-full flex items-center justify-center">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium">{item.product.name}</h4>
                      <p className="text-sm text-gray-600">{item.price} kr</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Discount code */}
              <div className="mb-6">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                    placeholder="Rabattkod"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#8B6B47] focus:border-transparent outline-none"
                    disabled={!!appliedDiscount}
                  />
                  {appliedDiscount ? (
                    <button
                      onClick={removeDiscount}
                      className="px-4 py-2 bg-red-100 text-red-600 rounded-lg text-sm hover:bg-red-200 transition-colors"
                    >
                      Ta bort
                    </button>
                  ) : (
                    <button
                      onClick={validateDiscountCode}
                      disabled={isValidatingDiscount || !discountCode.trim()}
                      className="px-4 py-2 bg-[#8B6B47] text-white rounded-lg text-sm hover:bg-[#6B5337] transition-colors disabled:opacity-50"
                    >
                      {isValidatingDiscount ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        'Använd'
                      )}
                    </button>
                  )}
                </div>
                {discountError && (
                  <p className="text-red-500 text-xs mt-1">{discountError}</p>
                )}
                {appliedDiscount && (
                  <p className="text-green-600 text-xs mt-1 flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    {appliedDiscount.name} tillagd
                  </p>
                )}
              </div>

              {/* Totals */}
              <div className="space-y-2 pt-4 border-t">
                <div className="flex justify-between text-sm">
                  <span>Delsumma</span>
                  <span>{subtotal} kr</span>
                </div>
                {appliedDiscount && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Rabatt</span>
                    <span>-{calculateDiscount()} kr</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span>Frakt</span>
                  <span>{shipping === 0 ? 'Gratis' : `${shipping} kr`}</span>
                </div>
                <div className="flex justify-between font-medium text-lg pt-2 border-t">
                  <span>Totalt</span>
                  <span>{finalTotal} kr</span>
                </div>
              </div>

              {/* Trust badges */}
              <div className="mt-6 pt-6 border-t space-y-3">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Shield className="w-4 h-4" />
                  <span>Säker betalning</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Package className="w-4 h-4" />
                  <span>Fri frakt över 500 kr</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Check className="w-4 h-4" />
                  <span>30 dagars öppet köp</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  )
} 