'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { useCart } from '@/contexts/CartContext'
import VivaSmartCheckout from '@/components/checkout/VivaSmartCheckout'
import ExpressCheckout from '@/components/checkout/ExpressCheckout'
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
  ShoppingBag,
  Sparkles,
  Star,
  Heart,
  Zap,
  Gift
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
  const [currentStep, setCurrentStep] = useState(1) // 1: Info, 2: Shipping, 3: Payment, 4: Card Details
  const [isMobile, setIsMobile] = useState(false)
  const [orderDetails, setOrderDetails] = useState<{orderId: string, orderCode: string, amount: number} | null>(null)
  
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
        body: JSON.stringify({ 
          code: discountCode.toUpperCase(),
          orderTotal: subtotal 
        })
      })

      const data = await response.json()

      if (data.success) {
        setAppliedDiscount({
          id: data.discountCode.id,
          code: data.discountCode.code,
          name: data.discountCode.name,
          type: data.discountCode.type,
          value: data.discountCode.discountAmount
        })
        toast.success('Rabattkod tillagd! 🎉')
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
    
    // The discount value is already calculated from the backend
    return appliedDiscount.value || 0
  }

  const finalTotal = total - calculateDiscount()

  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  
  const handlePaymentSuccess = (transactionId: string) => {
    // Clear cart and redirect to success
    clearCart()
    const orderCode = orderDetails?.orderCode || ''
    router.push(`/checkout/success?transactionId=${transactionId}&orderCode=${orderCode}`)
  }
  
  const handlePaymentError = (error: string) => {
    toast.error(error)
    setIsProcessing(false)
  }

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
      // Create order in backend
      const orderData = {
        customer: {
          email: form.email,
          firstName: form.firstName,
          lastName: form.lastName,
          phone: form.phone
        },
        shippingAddress: {
          address: form.address,
          apartment: form.apartment,
          city: form.city,
          postalCode: form.postalCode,
          country: form.country
        },
        items: items.map(item => ({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
          price: item.price
        })),
        discountCode: appliedDiscount?.code,
        subtotal,
        shippingCost: shipping,
        total: finalTotal,
        newsletter: form.newsletter
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002'}/api/orders/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to create order')
      }

      // Clear cart before redirecting to payment
      clearCart()

      // Redirect directly to Viva Wallet external checkout
      const vivaBaseUrl = process.env.NEXT_PUBLIC_VIVA_BASE_URL?.includes('demo') 
        ? 'https://demo.vivapayments.com' 
        : 'https://www.vivapayments.com'
      
      const checkoutUrl = `${vivaBaseUrl}/web/checkout?ref=${data.orderCode}&s=${process.env.NEXT_PUBLIC_VIVA_SOURCE_CODE}`
      
      // Redirect to Viva Wallet
      window.location.href = checkoutUrl
      
    } catch (error: any) {
      console.error('Error creating order:', error)
      toast.error(error.message || 'Ett fel uppstod vid beställningen')
      setIsProcessing(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FFF9F3] via-white to-[#FFF9F3]">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.6 }}
          >
            <ShoppingBag className="w-32 h-32 text-[#E5D5C7] mx-auto mb-8" />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl font-light tracking-[0.2em] uppercase mb-4"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            Din varukorg är tom
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-gray-600 mb-8 tracking-wider"
          >
            Upptäck våra naturliga hudvårdsprodukter
          </motion.p>
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/products')}
            className="bg-[#E79C1A] text-white px-10 py-4 rounded-full font-light tracking-wider hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
          >
            FORTSÄTT HANDLA
          </motion.button>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF9F3] via-white to-[#FFF9F3]">
      <Header />
      
      <div className="container mx-auto px-4 sm:px-6 pt-24 pb-12 md:pt-32 md:pb-16 max-w-6xl">
        {/* Header with progress */}
        <div className="mb-8 md:mb-12">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-6"
          >
            <button
              onClick={() => currentStep > 1 ? setCurrentStep(currentStep - 1) : router.push('/cart')}
              className="group flex items-center gap-2 text-gray-600 hover:text-[#E79C1A] transition-colors"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="hidden md:inline font-light tracking-wider">TILLBAKA</span>
            </button>
            
            <div className="flex items-center gap-2 sm:gap-3 text-xs md:text-sm">
              {[
                { num: 1, label: 'INFORMATION' },
                { num: 2, label: 'LEVERANS' },
                { num: 3, label: 'ÖVERSIKT' },
                { num: 4, label: 'BETALNING' }
              ].map((step, index) => (
                <div key={step.num} className="flex items-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: currentStep >= step.num ? 1 : 0.8 }}
                    className={`
                      w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-light
                      ${currentStep >= step.num 
                        ? 'bg-[#E79C1A] text-white shadow-lg' 
                        : 'bg-gray-200 text-gray-500'
                      }
                    `}
                  >
                    {currentStep > step.num ? <Check className="w-4 h-4" /> : step.num}
                  </motion.div>
                  <span className={`hidden md:inline ml-2 tracking-wider ${
                    currentStep >= step.num ? 'text-[#E79C1A] font-medium' : 'text-gray-400'
                  }`}>
                    {step.label}
                  </span>
                  {index < 3 && <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 mx-1 sm:mx-2 text-gray-300" />}
                </div>
              ))}
            </div>
          </motion.div>
          
          {/* Animated progress bar */}
          <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: '0%' }}
              animate={{ width: `${(currentStep / 4) * 100}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="h-full bg-[#E79C1A] shadow-sm"
            />
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12 overflow-hidden">
          {/* Main Form */}
          <div className="lg:col-span-2 min-w-0">
            <AnimatePresence mode="wait">
              {/* Step 1: Contact Information */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-6 sm:p-8 md:p-10 border border-[#E5D5C7]/30"
                >
                  <div className="flex items-center gap-3 mb-8">
                    <motion.div
                      initial={{ rotate: -180 }}
                      animate={{ rotate: 0 }}
                      transition={{ duration: 0.5 }}
                      className="w-12 h-12 bg-[#E79C1A] rounded-full flex items-center justify-center shadow-lg"
                    >
                      <User className="w-6 h-6 text-white" />
                    </motion.div>
                    <h2 className="text-xl md:text-3xl font-light tracking-[0.1em] md:tracking-[0.2em] uppercase" style={{ fontFamily: "'Inter', sans-serif" }}>
                      Kontaktinformation
                    </h2>
                  </div>

                  {/* Express Checkout */}
                  <ExpressCheckout 
                    onSuccess={(orderData: any) => {
                      // Handle successful express checkout
                      router.push(`/checkout/success?orderCode=${orderData.orderCode}`)
                    }}
                    onError={(error: string) => {
                      console.error('Express checkout error:', error)
                    }}
                    className="mb-8"
                  />

                  <div className="space-y-6">
                    {/* Email with floating label */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="relative"
                    >
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        autoComplete="email"
                        inputMode="email"
                        className={`
                          w-full px-4 sm:px-6 py-3 sm:py-4 bg-[#FFF9F3] border-2 rounded-2xl text-gray-800 
                          focus:ring-0 focus:border-[#E79C1A] outline-none transition-all
                          ${formErrors.email ? 'border-red-400' : 'border-transparent'}
                          peer
                        `}
                        placeholder=" "
                        id="email"
                      />
                      <label 
                        htmlFor="email"
                        className="absolute left-4 sm:left-6 top-3 sm:top-4 text-gray-500 transition-all duration-200 
                        peer-placeholder-shown:translate-y-0 peer-focus:-translate-y-8 peer-focus:text-[#E79C1A] peer-focus:text-sm
                        peer-[:not(:placeholder-shown)]:-translate-y-8 peer-[:not(:placeholder-shown)]:text-sm"
                      >
                        E-postadress
                      </label>
                      <Mail className="absolute right-4 sm:right-6 top-3 sm:top-4 w-5 h-5 text-gray-400" />
                      {formErrors.email && (
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-red-500 text-sm mt-2 ml-2"
                        >
                          {formErrors.email}
                        </motion.p>
                      )}
                    </motion.div>

                    {/* Name fields with animation */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="relative"
                      >
                        <input
                          type="text"
                          value={form.firstName}
                          onChange={(e) => handleInputChange('firstName', e.target.value)}
                          autoComplete="given-name"
                          className={`
                            w-full px-4 sm:px-6 py-3 sm:py-4 bg-[#FFF9F3] border-2 rounded-2xl text-gray-800
                            focus:ring-0 focus:border-[#E79C1A] outline-none transition-all
                            ${formErrors.firstName ? 'border-red-400' : 'border-transparent'}
                            peer
                          `}
                          placeholder=" "
                          id="firstName"
                        />
                        <label 
                          htmlFor="firstName"
                          className="absolute left-4 sm:left-6 top-3 sm:top-4 text-gray-500 transition-all duration-200 
                          peer-placeholder-shown:translate-y-0 peer-focus:-translate-y-8 peer-focus:text-[#E79C1A] peer-focus:text-sm
                          peer-[:not(:placeholder-shown)]:-translate-y-8 peer-[:not(:placeholder-shown)]:text-sm"
                        >
                          Förnamn
                        </label>
                        {formErrors.firstName && (
                          <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-red-500 text-sm mt-2 ml-2"
                          >
                            {formErrors.firstName}
                          </motion.p>
                        )}
                      </motion.div>
                      
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="relative"
                      >
                        <input
                          type="text"
                          value={form.lastName}
                          onChange={(e) => handleInputChange('lastName', e.target.value)}
                          autoComplete="family-name"
                          className={`
                            w-full px-4 sm:px-6 py-3 sm:py-4 bg-[#FFF9F3] border-2 rounded-2xl text-gray-800
                            focus:ring-0 focus:border-[#E79C1A] outline-none transition-all
                            ${formErrors.lastName ? 'border-red-400' : 'border-transparent'}
                            peer
                          `}
                          placeholder=" "
                          id="lastName"
                        />
                        <label 
                          htmlFor="lastName"
                          className="absolute left-4 sm:left-6 top-3 sm:top-4 text-gray-500 transition-all duration-200 
                          peer-placeholder-shown:translate-y-0 peer-focus:-translate-y-8 peer-focus:text-[#E79C1A] peer-focus:text-sm
                          peer-[:not(:placeholder-shown)]:-translate-y-8 peer-[:not(:placeholder-shown)]:text-sm"
                        >
                          Efternamn
                        </label>
                        {formErrors.lastName && (
                          <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-red-500 text-sm mt-2 ml-2"
                          >
                            {formErrors.lastName}
                          </motion.p>
                        )}
                      </motion.div>
                    </div>

                    {/* Phone with icon */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="relative"
                    >
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        autoComplete="tel"
                        inputMode="tel"
                        pattern="[0-9\-\+\s\(\)]+"
                        className={`
                          w-full px-4 sm:px-6 py-3 sm:py-4 bg-[#FFF9F3] border-2 rounded-2xl text-gray-800
                          focus:ring-0 focus:border-[#E79C1A] outline-none transition-all
                          ${formErrors.phone ? 'border-red-400' : 'border-transparent'}
                          peer
                        `}
                        placeholder=" "
                        id="phone"
                      />
                      <label 
                        htmlFor="phone"
                        className="absolute left-4 sm:left-6 top-3 sm:top-4 text-gray-500 transition-all duration-200 
                        peer-placeholder-shown:translate-y-0 peer-focus:-translate-y-8 peer-focus:text-[#E79C1A] peer-focus:text-sm
                        peer-[:not(:placeholder-shown)]:-translate-y-8 peer-[:not(:placeholder-shown)]:text-sm"
                      >
                        Telefonnummer
                      </label>
                      <Phone className="absolute right-4 sm:right-6 top-3 sm:top-4 w-5 h-5 text-gray-400" />
                      {formErrors.phone && (
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-red-500 text-sm mt-2 ml-2"
                        >
                          {formErrors.phone}
                        </motion.p>
                      )}
                    </motion.div>

                    {/* Newsletter with custom checkbox */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="pt-6"
                    >
                      <label className="flex items-start gap-4 cursor-pointer group">
                        <div className="relative">
                          <input
                            type="checkbox"
                            checked={form.newsletter}
                            onChange={(e) => handleInputChange('newsletter', e.target.checked)}
                            className="sr-only"
                          />
                          <div className={`
                            w-6 h-6 rounded-lg border-2 transition-all duration-200
                            ${form.newsletter ? 'bg-[#E79C1A] border-transparent' : 'bg-white border-gray-300'}
                            group-hover:border-[#E79C1A]
                          `}>
                            {form.newsletter && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 300 }}
                              >
                                <Check className="w-4 h-4 text-white absolute top-0.5 left-0.5" />
                              </motion.div>
                            )}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-700 font-light">
                            Ja, jag vill gärna ta del av nyheter och erbjudanden
                          </span>
                          <p className="text-sm text-gray-500 mt-1">
                            Få 10% rabatt på din första order! 🎁
                          </p>
                        </div>
                      </label>
                    </motion.div>

                    {/* Continue button with hover effect */}
                    <motion.button
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                      onClick={handleNextStep}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-5 bg-[#E79C1A] text-white rounded-2xl font-light tracking-wider text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center gap-3 group"
                    >
                      <span>FORTSÄTT TILL LEVERANS</span>
                      <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Shipping Information */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-6 sm:p-8 md:p-10 border border-[#E5D5C7]/30"
                >
                  <div className="flex items-center gap-3 mb-8">
                    <motion.div
                      initial={{ rotate: -180 }}
                      animate={{ rotate: 0 }}
                      transition={{ duration: 0.5 }}
                      className="w-12 h-12 bg-[#E79C1A] rounded-full flex items-center justify-center shadow-lg"
                    >
                      <MapPin className="w-6 h-6 text-white" />
                    </motion.div>
                    <h2 className="text-xl md:text-3xl font-light tracking-[0.1em] md:tracking-[0.2em] uppercase" style={{ fontFamily: "'Inter', sans-serif" }}>
                      Leveransadress
                    </h2>
                  </div>

                  <div className="space-y-6">
                    {/* Address */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="relative"
                    >
                      <input
                        type="text"
                        value={form.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        className={`
                          w-full px-4 sm:px-6 py-3 sm:py-4 bg-[#FFF9F3] border-2 rounded-2xl text-gray-800
                          focus:ring-0 focus:border-[#E79C1A] outline-none transition-all
                          ${formErrors.address ? 'border-red-400' : 'border-transparent'}
                          peer
                        `}
                        placeholder=" "
                        id="address"
                      />
                      <label 
                        htmlFor="address"
                        className="absolute left-4 sm:left-6 top-3 sm:top-4 text-gray-500 transition-all duration-200 
                        peer-placeholder-shown:translate-y-0 peer-focus:-translate-y-8 peer-focus:text-[#E79C1A] peer-focus:text-sm
                        peer-[:not(:placeholder-shown)]:-translate-y-8 peer-[:not(:placeholder-shown)]:text-sm"
                      >
                        Gatuadress
                      </label>
                      {formErrors.address && (
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-red-500 text-sm mt-2 ml-2"
                        >
                          {formErrors.address}
                        </motion.p>
                      )}
                    </motion.div>

                    {/* Apartment */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="relative"
                    >
                      <input
                        type="text"
                        value={form.apartment}
                        onChange={(e) => handleInputChange('apartment', e.target.value)}
                        className="w-full px-6 py-4 bg-[#FFF9F3] border-2 border-transparent rounded-2xl text-gray-800 focus:ring-0 focus:border-[#E79C1A] outline-none transition-all peer"
                        placeholder=" "
                        id="apartment"
                      />
                      <label 
                        htmlFor="apartment"
                        className="absolute left-6 top-4 text-gray-500 transition-all duration-200 
                        peer-placeholder-shown:translate-y-0 peer-focus:-translate-y-8 peer-focus:text-[#E79C1A] peer-focus:text-sm
                        peer-[:not(:placeholder-shown)]:-translate-y-8 peer-[:not(:placeholder-shown)]:text-sm"
                      >
                        Lägenhet, svit etc. (valfritt)
                      </label>
                    </motion.div>

                    {/* City and Postal Code */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="relative"
                      >
                        <input
                          type="text"
                          value={form.postalCode}
                          onChange={(e) => handleInputChange('postalCode', e.target.value)}
                          className={`
                            w-full px-6 py-4 bg-[#FFF9F3] border-2 rounded-2xl text-gray-800
                            focus:ring-0 focus:border-[#E79C1A] outline-none transition-all
                            ${formErrors.postalCode ? 'border-red-400' : 'border-transparent'}
                            peer
                          `}
                          placeholder=" "
                          id="postalCode"
                        />
                        <label 
                          htmlFor="postalCode"
                          className="absolute left-6 top-4 text-gray-500 transition-all duration-200 
                          peer-placeholder-shown:translate-y-0 peer-focus:-translate-y-8 peer-focus:text-[#E79C1A] peer-focus:text-sm
                          peer-[:not(:placeholder-shown)]:-translate-y-8 peer-[:not(:placeholder-shown)]:text-sm"
                        >
                          Postnummer
                        </label>
                        {formErrors.postalCode && (
                          <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-red-500 text-sm mt-2 ml-2"
                          >
                            {formErrors.postalCode}
                          </motion.p>
                        )}
                      </motion.div>
                      
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="relative"
                      >
                        <input
                          type="text"
                          value={form.city}
                          onChange={(e) => handleInputChange('city', e.target.value)}
                          className={`
                            w-full px-6 py-4 bg-[#FFF9F3] border-2 rounded-2xl text-gray-800
                            focus:ring-0 focus:border-[#E79C1A] outline-none transition-all
                            ${formErrors.city ? 'border-red-400' : 'border-transparent'}
                            peer
                          `}
                          placeholder=" "
                          id="city"
                        />
                        <label 
                          htmlFor="city"
                          className="absolute left-6 top-4 text-gray-500 transition-all duration-200 
                          peer-placeholder-shown:translate-y-0 peer-focus:-translate-y-8 peer-focus:text-[#E79C1A] peer-focus:text-sm
                          peer-[:not(:placeholder-shown)]:-translate-y-8 peer-[:not(:placeholder-shown)]:text-sm"
                        >
                          Stad
                        </label>
                        {formErrors.city && (
                          <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-red-500 text-sm mt-2 ml-2"
                          >
                            {formErrors.city}
                          </motion.p>
                        )}
                      </motion.div>
                    </div>

                    {/* Country with custom select */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="relative"
                    >
                      <select
                        value={form.country}
                        onChange={(e) => handleInputChange('country', e.target.value)}
                        className="w-full px-6 py-4 bg-[#FFF9F3] border-2 border-transparent rounded-2xl text-gray-800 focus:ring-0 focus:border-[#E79C1A] outline-none transition-all appearance-none cursor-pointer"
                      >
                        <option value="Sverige">Sverige</option>
                        <option value="Norge">Norge</option>
                        <option value="Danmark">Danmark</option>
                        <option value="Finland">Finland</option>
                      </select>
                      <ChevronRight className="absolute right-6 top-4 w-5 h-5 text-gray-400 rotate-90 pointer-events-none" />
                      <label className="absolute left-6 -top-4 text-sm text-gray-500">
                        Land
                      </label>
                    </motion.div>

                    {/* Shipping method info card */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                      className="bg-[#FFF9F3] rounded-2xl p-6 mt-8 border border-[#E5D5C7]/30"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md">
                          <Package className="w-6 h-6 text-[#E79C1A]" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-800 mb-2">Standard leverans</h3>
                          <p className="text-sm text-gray-600 mb-3">
                            Leverans inom 2-4 arbetsdagar
                          </p>
                          <div className="flex items-center gap-2 text-[#E79C1A]">
                            <Sparkles className="w-4 h-4" />
                            <span className="text-sm font-medium">Fri frakt över 500 kr!</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>

                    {/* Continue button */}
                    <motion.button
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 }}
                      onClick={handleNextStep}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-5 bg-[#E79C1A] text-white rounded-2xl font-light tracking-wider text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center gap-3 group"
                    >
                      <span>GRANSKA BESTÄLLNING</span>
                      <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Order Review */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-6 sm:p-8 md:p-10 border border-[#E5D5C7]/30"
                >
                  <div className="flex items-center gap-3 mb-8">
                    <motion.div
                      initial={{ rotate: -180 }}
                      animate={{ rotate: 0 }}
                      transition={{ duration: 0.5 }}
                      className="w-12 h-12 bg-[#E79C1A] rounded-full flex items-center justify-center shadow-lg"
                    >
                      <Check className="w-6 h-6 text-white" />
                    </motion.div>
                    <h2 className="text-xl md:text-3xl font-light tracking-[0.1em] md:tracking-[0.2em] uppercase" style={{ fontFamily: "'Inter', sans-serif" }}>
                      Orderöversikt
                    </h2>
                  </div>

                  <div className="space-y-6">
                    {/* Delivery info cards */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="bg-[#FFF9F3] rounded-2xl p-6 space-y-4"
                    >
                      <div className="flex items-center gap-3 text-[#E79C1A] mb-2">
                        <MapPin className="w-5 h-5" />
                        <h3 className="font-medium">Leveransadress</h3>
                      </div>
                      <p className="text-gray-700 leading-relaxed">
                        {form.firstName} {form.lastName}<br />
                        {form.address} {form.apartment && `, ${form.apartment}`}<br />
                        {form.postalCode} {form.city}<br />
                        {form.country}
                      </p>
                    </motion.div>
                    
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="bg-[#FFF9F3] rounded-2xl p-6 space-y-4"
                    >
                      <div className="flex items-center gap-3 text-[#E79C1A] mb-2">
                        <Mail className="w-5 h-5" />
                        <h3 className="font-medium">Kontaktuppgifter</h3>
                      </div>
                      <p className="text-gray-700 leading-relaxed">
                        {form.email}<br />
                        {form.phone}
                      </p>
                    </motion.div>
                        
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="bg-[#FFF9F3] rounded-2xl p-6"
                    >
                      <div className="flex items-center gap-3 text-[#E79C1A] mb-4">
                        <ShoppingBag className="w-5 h-5" />
                        <h3 className="font-medium">Orderdetaljer</h3>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between text-gray-700">
                          <span>Delsumma</span>
                          <span className="font-medium">{subtotal} kr</span>
                        </div>
                        <div className="flex justify-between text-gray-700">
                          <span>Frakt</span>
                          <span className="font-medium">{shipping === 0 ? 'Gratis' : `${shipping} kr`}</span>
                        </div>
                        {appliedDiscount && (
                          <div className="flex justify-between text-green-600">
                            <span className="flex items-center gap-2">
                              <Gift className="w-4 h-4" />
                              Rabatt ({appliedDiscount.code})
                            </span>
                            <span className="font-medium">-{calculateDiscount()} kr</span>
                          </div>
                        )}
                        <div className="pt-3 border-t border-[#E5D5C7]">
                          <div className="flex justify-between text-lg">
                            <span className="font-medium">Totalt</span>
                            <span className="font-semibold text-[#E79C1A]">{finalTotal} kr</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>

                    {/* Security badges */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="bg-green-50 rounded-2xl p-6 border border-green-100"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md">
                          <Shield className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-green-900 mb-2">Säker betalning</h3>
                          <p className="text-sm text-green-700">
                            Din betalningsinformation är krypterad och säker. Vi lagrar aldrig kortuppgifter.
                          </p>
                        </div>
                      </div>
                    </motion.div>

                    {/* Trust badges */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="grid grid-cols-3 gap-4"
                    >
                      {[
                        { icon: Lock, text: 'SSL-krypterad' },
                        { icon: Star, text: '4.8/5 betyg' },
                        { icon: Heart, text: '30 dagars öppet köp' }
                      ].map((badge, index) => (
                        <div key={index} className="text-center">
                          <div className="w-12 h-12 bg-[#FFF9F3] rounded-full flex items-center justify-center mx-auto mb-2">
                            <badge.icon className="w-6 h-6 text-[#E79C1A]" />
                          </div>
                          <p className="text-xs text-gray-600">{badge.text}</p>
                        </div>
                      ))}
                    </motion.div>

                    {/* Place order button */}
                    <motion.button
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                      onClick={handleSubmitOrder}
                      disabled={isProcessing}
                      whileHover={{ scale: isProcessing ? 1 : 1.02 }}
                      whileTap={{ scale: isProcessing ? 1 : 0.98 }}
                      className="w-full py-4 sm:py-5 bg-[#E79C1A] text-white rounded-2xl font-medium tracking-wide sm:tracking-wider text-base sm:text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-75 disabled:cursor-not-allowed flex items-center justify-center gap-2 sm:gap-3 group"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                          <span className="text-sm sm:text-base">BEHANDLAR BESTÄLLNING...</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
                          <span className="text-sm sm:text-base">SLUTFÖR KÖP ({finalTotal} kr)</span>
                          <Lock className="w-3 h-3 sm:w-4 sm:h-4 opacity-60" />
                        </>
                      )}
                    </motion.button>

                    {/* Terms */}
                    <p className="text-xs text-gray-500 text-center">
                      Genom att slutföra köpet godkänner du våra{' '}
                      <a href="/villkor" className="text-[#E79C1A] hover:underline">köpvillkor</a>
                      {' '}och{' '}
                      <a href="/integritetspolicy" className="text-[#E79C1A] hover:underline">integritetspolicy</a>
                    </p>
                  </div>
                </motion.div>
              )}
              

            </AnimatePresence>
          </div>

          {/* Order Summary Sidebar - Enhanced */}
          <div className="lg:sticky lg:top-24 h-fit">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-4 sm:p-6 md:p-8 border border-[#E5D5C7]/30"
            >
              <h3 className="text-lg sm:text-xl font-light tracking-wide sm:tracking-wider mb-6 uppercase">Ordersammanfattning</h3>
              
              {/* Items with animation */}
              <div className="space-y-4 mb-6">
                {items.map((item, index) => (
                  <motion.div
                    key={`${item.productId}-${item.variantId || 'default'}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-4 p-3 bg-[#FFF9F3] rounded-2xl"
                  >
                    <div className="relative">
                      <Image
                        src={item.product.images?.[0]?.url || '/placeholder.jpg'}
                        alt={item.product.name}
                        width={70}
                        height={70}
                        className="rounded-xl object-cover"
                      />
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2 + index * 0.1 }}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-[#E79C1A] text-white text-xs rounded-full flex items-center justify-center shadow-md"
                      >
                        {item.quantity}
                      </motion.span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-800">{item.product.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">{item.price} kr</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Discount code input - Enhanced */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mb-6"
              >
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={discountCode}
                      onChange={(e) => setDiscountCode(e.target.value)}
                      placeholder="Rabattkod"
                      className="w-full px-4 py-3 bg-[#FFF9F3] border-2 border-transparent rounded-xl text-sm focus:ring-0 focus:border-[#E79C1A] outline-none transition-all pl-10"
                      disabled={!!appliedDiscount}
                    />
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                  {appliedDiscount ? (
                    <motion.button
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      onClick={removeDiscount}
                      className="px-4 py-3 bg-red-100 text-red-600 rounded-xl text-sm hover:bg-red-200 transition-all flex items-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      <span>Ta bort</span>
                    </motion.button>
                  ) : (
                    <button
                      onClick={validateDiscountCode}
                      disabled={isValidatingDiscount || !discountCode.trim()}
                      className="px-6 py-3 bg-[#E79C1A] text-white rounded-xl text-sm hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-red-500 text-xs mt-2 flex items-center gap-1"
                  >
                    <AlertCircle className="w-3 h-3" />
                    {discountError}
                  </motion.p>
                )}
                {appliedDiscount && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-green-600 text-xs mt-2 flex items-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    {appliedDiscount.name} tillagd!
                  </motion.p>
                )}
              </motion.div>

              {/* Totals with animation */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="space-y-3 pt-6 border-t border-[#E5D5C7]"
              >
                <div className="flex justify-between text-gray-700">
                  <span>Delsumma</span>
                  <span>{subtotal} kr</span>
                </div>
                {appliedDiscount && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex justify-between text-green-600"
                  >
                    <span className="flex items-center gap-2">
                      <Gift className="w-4 h-4" />
                      Rabatt
                    </span>
                    <span>-{calculateDiscount()} kr</span>
                  </motion.div>
                )}
                <div className="flex justify-between text-gray-700">
                  <span>Frakt</span>
                  <span>{shipping === 0 ? 'Gratis' : `${shipping} kr`}</span>
                </div>
                <div className="flex justify-between text-xl font-medium pt-3 border-t border-[#E5D5C7]">
                  <span>Totalt</span>
                  <motion.span
                    key={finalTotal}
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    className="text-[#E79C1A]"
                  >
                    {finalTotal} kr
                  </motion.span>
                </div>
              </motion.div>

              {/* Trust badges with animation */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-8 pt-6 border-t border-[#E5D5C7] space-y-4"
              >
                {[
                  { icon: Shield, text: 'Säker betalning', color: 'text-green-600' },
                  { icon: Package, text: 'Fri frakt över 500 kr', color: 'text-blue-600' },
                  { icon: Heart, text: '30 dagars öppet köp', color: 'text-red-600' }
                ].map((badge, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + index * 0.1 }}
                    className="flex items-center gap-3 text-sm"
                  >
                    <badge.icon className={`w-5 h-5 ${badge.color}`} />
                    <span className="text-gray-700">{badge.text}</span>
                  </motion.div>
                ))}
              </motion.div>

              {/* Customer support */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="mt-6 p-4 bg-[#FFF9F3] rounded-2xl text-center"
              >
                <p className="text-sm text-gray-600 mb-2">Behöver du hjälp?</p>
                <a href="/kontakt" className="text-[#E79C1A] hover:underline text-sm font-medium">
                  Kontakta kundservice →
                </a>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  )
} 