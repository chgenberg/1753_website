'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { 
  CheckCircle, 
  Package, 
  Mail, 
  ArrowRight,
  Printer,
  Heart,
  Star,
  Sparkles,
  Gift,
  Clock,
  Truck,
  Shield,
  Share2,
  Instagram,
  Facebook,
  Copy,
  Check
} from 'lucide-react'
import confetti from 'canvas-confetti'
import toast from 'react-hot-toast'
import { useCart } from '@/contexts/CartContext'

function SuccessContent() {
  const searchParams = useSearchParams()
  const [copied, setCopied] = useState(false)
  const [orderData, setOrderData] = useState<any>(null)
  const [showShareMenu, setShowShareMenu] = useState(false)
  const { clearCart } = useCart()
  
  // Get parameters from URL (from Viva Wallet or our internal redirect)
  const transactionId = searchParams.get('transactionId') || searchParams.get('t')
  const orderCode = searchParams.get('orderCode') || searchParams.get('orderid')
  const eventId = searchParams.get('eventId') // From Viva Wallet
  const eci = searchParams.get('eci') // From Viva Wallet
  
  // Generate fallback order number only once
  const [fallbackOrderNumber] = useState(() => `1753-${Date.now()}`)
  
  useEffect(() => {
    // Clear cart after successful payment (idempotent)
    try { clearCart() } catch {}
  }, [clearCart])

  useEffect(() => {
    // Multiple confetti bursts for extra celebration
    const burst1 = setTimeout(() => {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#E79C1A', '#FFD700', '#FFA500', '#FF6347']
      })
    }, 200)
    
    const burst2 = setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#E79C1A', '#FFD700', '#FFA500']
      })
    }, 400)
    
    const burst3 = setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#E79C1A', '#FFD700', '#FFA500']
      })
    }, 600)

    // Clean up confetti after 8 seconds
    const cleanup = setTimeout(() => {
      confetti.reset()
    }, 8000)

    return () => {
      clearTimeout(burst1)
      clearTimeout(burst2)
      clearTimeout(burst3)
      clearTimeout(cleanup)
      confetti.reset()
    }
  }, [])

  const copyOrderNumber = () => {
    const orderNumber = orderCode || fallbackOrderNumber
    navigator.clipboard.writeText(orderNumber)
    setCopied(true)
    toast.success('Ordernummer kopierat!')
    setTimeout(() => setCopied(false), 3000)
  }

  const shareOrder = (platform: string) => {
    const message = `Jag har precis beställt fantastiska hudvårdsprodukter från @1753skincare! 🌿✨`
    const url = 'https://1753skincare.com'
    
    switch(platform) {
      case 'instagram':
        // Instagram doesn't have direct share URL, copy message instead
        navigator.clipboard.writeText(message)
        toast.success('Text kopierad! Klistra in i Instagram')
        break
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(message)}`, '_blank')
        break
    }
    setShowShareMenu(false)
  }

  const timelineSteps = [
    {
      icon: Mail,
      title: 'Orderbekräftelse',
      description: 'E-post skickas inom några minuter',
      time: 'Nu',
      status: 'active'
    },
    {
      icon: Package,
      title: 'Packning',
      description: 'Din order packas med kärlek',
      time: '1-2 dagar',
      status: 'pending'
    },
    {
      icon: Truck,
      title: 'På väg',
      description: 'Spårningsnummer skickas via e-post',
      time: '2-3 dagar',
      status: 'pending'
    },
    {
      icon: Heart,
      title: 'Levererad!',
      description: 'Njut av din nya hudvårdsrutin',
      time: '3-5 dagar',
      status: 'pending'
    }
  ]

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-br from-[#FFF9F3] via-white to-[#FFF9F3] pt-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16">
          
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            {/* Animated Success Icon */}
            <motion.div 
              className="flex justify-center mb-8"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ 
                type: "spring",
                stiffness: 260,
                damping: 20,
                delay: 0.1 
              }}
            >
              <div className="relative">
                <div className="bg-gradient-to-br from-[#E79C1A] to-[#D68910] rounded-full p-8 shadow-2xl">
                  <CheckCircle className="w-20 h-20 text-white" strokeWidth={2.5} />
                </div>
                <motion.div
                  className="absolute -top-4 -right-4"
                  animate={{ rotate: [0, 10, -10, 10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                >
                  <Sparkles className="w-8 h-8 text-[#E79C1A]" />
                </motion.div>
              </div>
            </motion.div>

            {/* Success Message */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h1 className="text-4xl md:text-5xl font-light tracking-[0.2em] uppercase mb-4">
                Tack för din beställning!
              </h1>
              <p className="text-xl text-gray-600 mb-2">
                Vi är så glada att få vara en del av din hudvårdsresa 💛
              </p>
              <p className="text-gray-500">
                En bekräftelse har skickats till din e-post
              </p>
            </motion.div>
          </motion.div>

          {/* Order Details Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-3xl shadow-xl p-8 mb-8 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#E79C1A]/10 to-transparent rounded-full blur-3xl -mr-32 -mt-32" />
            
            <div className="relative">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-500 uppercase tracking-wider mb-1">Ordernummer</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    #{orderCode || fallbackOrderNumber}
                  </p>
                </div>
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={copyOrderNumber}
                    className="px-4 py-2 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors flex items-center gap-2"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span className="text-sm">{copied ? 'Kopierat!' : 'Kopiera'}</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => window.print()}
                    className="px-4 py-2 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors flex items-center gap-2"
                  >
                    <Printer className="w-4 h-4" />
                    <span className="text-sm">Skriv ut</span>
                  </motion.button>
                </div>
              </div>

              {/* Estimated Delivery */}
              <div className="bg-[#FFF9F3] rounded-2xl p-6 flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md">
                  <Clock className="w-6 h-6 text-[#E79C1A]" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Beräknad leverans</p>
                  <p className="text-sm text-gray-600">
                    {new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toLocaleDateString('sv-SE', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Timeline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-3xl shadow-xl p-8 mb-8"
          >
            <h2 className="text-2xl font-light tracking-wider mb-8 text-center">Din orders resa</h2>
            
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-8 top-12 bottom-12 w-0.5 bg-gray-200" />
              
              <div className="space-y-8">
                {timelineSteps.map((step, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="flex items-start gap-4"
                  >
                    <div className={`
                      relative z-10 w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all
                      ${step.status === 'active' 
                        ? 'bg-gradient-to-br from-[#E79C1A] to-[#D68910]' 
                        : 'bg-gray-100'
                      }
                    `}>
                      <step.icon className={`w-8 h-8 ${step.status === 'active' ? 'text-white' : 'text-gray-400'}`} />
                      {step.status === 'active' && (
                        <motion.div
                          className="absolute inset-0 rounded-full bg-[#E79C1A]/30"
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      )}
                    </div>
                    <div className="flex-1 pt-2">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className={`font-medium ${step.status === 'active' ? 'text-gray-900' : 'text-gray-500'}`}>
                          {step.title}
                        </h3>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          step.status === 'active' 
                            ? 'bg-[#E79C1A]/20 text-[#E79C1A]' 
                            : 'bg-gray-100 text-gray-500'
                        }`}>
                          {step.time}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{step.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Share the love */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-gradient-to-r from-[#FFF9F3] to-[#FFF5ED] rounded-3xl p-8 mb-8 text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-pattern opacity-5" />
            <div className="relative">
              <Heart className="w-12 h-12 text-[#E79C1A] mx-auto mb-4" />
              <h3 className="text-xl font-medium mb-3">Dela kärleken!</h3>
              <p className="text-gray-600 mb-6">
                Berätta för dina vänner om din nya hudvårdsrutin
              </p>
              
              <div className="relative inline-block">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowShareMenu(!showShareMenu)}
                  className="px-6 py-3 bg-[#E79C1A] text-white rounded-full font-medium hover:opacity-90 transition-all flex items-center gap-2 mx-auto"
                >
                  <Share2 className="w-5 h-5" />
                  Dela din beställning
                </motion.button>
                
                <AnimatePresence>
                  {showShareMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-white rounded-xl shadow-xl p-2 z-20"
                    >
                      <button
                        onClick={() => shareOrder('instagram')}
                        className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors w-full"
                      >
                        <Instagram className="w-5 h-5" />
                        <span>Instagram</span>
                      </button>
                      <button
                        onClick={() => shareOrder('facebook')}
                        className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors w-full"
                      >
                        <Facebook className="w-5 h-5" />
                        <span>Facebook</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
          >
            <Link
              href="/products"
              className="bg-[#E79C1A] text-white px-8 py-4 rounded-full font-medium hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
            >
              Fortsätt handla
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/kunskap/e-bok"
              className="bg-white text-gray-900 px-8 py-4 rounded-full font-medium hover:bg-gray-50 transition-all flex items-center justify-center gap-2 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 border border-gray-200"
            >
              <Gift className="w-5 h-5 text-[#E79C1A]" />
              Upptäck vår E-bok
            </Link>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="grid grid-cols-3 gap-4 mb-12"
          >
            {[
              { icon: Shield, title: 'Säker betalning', desc: 'SSL-krypterad' },
              { icon: Truck, title: 'Fri frakt', desc: 'Över 500 kr' },
              { icon: Star, title: '30 dagars', desc: 'Öppet köp' }
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <item.icon className="w-8 h-8 text-[#E79C1A]" />
                </div>
                <p className="font-medium text-sm">{item.title}</p>
                <p className="text-xs text-gray-500">{item.desc}</p>
              </div>
            ))}
          </motion.div>

          {/* Support Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="text-center p-8 bg-gray-50 rounded-3xl"
          >
            <h4 className="font-medium mb-3">Behöver du hjälp?</h4>
            <p className="text-sm text-gray-600 mb-4">
              Vi finns här för dig! Kontakta oss gärna om du har några frågor.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="mailto:hej@1753skincare.com" 
                className="text-[#E79C1A] hover:underline font-medium flex items-center justify-center gap-2"
              >
                <Mail className="w-4 h-4" />
                hej@1753skincare.com
              </a>
              <a 
                href="tel:0732305521" 
                className="text-[#E79C1A] hover:underline font-medium"
              >
                073-230 55 21
              </a>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E79C1A]"></div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
} 