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
  
  // Backend API base (must be set via NEXT_PUBLIC_API_URL)
  const apiBase = process.env.NEXT_PUBLIC_API_URL || ''
  
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

  // Verify order status with backend
  useEffect(() => {
    const verifyOrderStatus = async () => {
      if (!orderCode) return
      
      try {
        const response = await fetch(`${apiBase}/api/webhooks/verify-order-status`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ orderCode })
        })
        
        const data = await response.json()
        
        if (data.success) {
          console.log('Order verified and updated:', data)
          
          // Fetch full order details
          if (data.orderId) {
            const orderResponse = await fetch(`${apiBase}/api/orders/${data.orderId}`)
            if (orderResponse.ok) {
              const orderDetails = await orderResponse.json()
              setOrderData(orderDetails)
            }
          }
          
          toast.success('Din beställning har bekräftats!', {
            icon: '✅',
            duration: 5000
          })
        } else if (data.status === 'PENDING') {
          // Payment might not be processed yet, retry after a delay
          setTimeout(() => {
            verifyOrderStatus()
          }, 3000)
        }
      } catch (error) {
        console.error('Error verifying order status:', error)
      }
    }
    
    verifyOrderStatus()
  }, [orderCode])

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
    const orderNumber = orderData?.orderNumber || orderCode || fallbackOrderNumber
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
      description: 'Din order är på väg till dig',
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
      <style jsx global>{`
        @media print {
          /* Hide non-essential elements */
          .print-hide,
          header,
          footer,
          nav,
          button,
          .timeline-section,
          .share-section,
          .action-buttons,
          .confetti-canvas,
          .no-print {
            display: none !important;
          }

          /* Reset page margins and colors */
          @page {
            margin: 1.5cm;
            size: A4;
          }

          body {
            margin: 0;
            color: #000 !important;
            background: white !important;
            font-family: 'Inter', Arial, sans-serif;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          /* Show print-only elements */
          .print-only {
            display: block !important;
          }

          /* Main container */
          .print-container {
            max-width: 100% !important;
            padding: 0 !important;
            background: white !important;
          }

          /* Order details styling */
          .order-details-print {
            page-break-inside: avoid;
          }

          /* Products table */
          .print-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
          }

          .print-table th {
            text-align: left;
            padding: 10px;
            border-bottom: 2px solid #E79C1A;
            font-weight: 600;
          }

          .print-table td {
            padding: 10px;
            border-bottom: 1px solid #eee;
          }

          /* Ensure colors and shadows are preserved */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            box-shadow: none !important;
            text-shadow: none !important;
          }

          /* Specific color preservation */
          .text-accent {
            color: #E79C1A !important;
          }

          /* Remove animations */
          * {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>

      {/* Print-only header */}
      <div className="print-only hidden">
        <div className="text-center mb-8">
          <img src="/1753.png" alt="1753 Skincare" className="h-16 mx-auto mb-4" />
          <h1 className="text-3xl font-light tracking-[0.2em] uppercase text-accent">
            Orderbekräftelse
          </h1>
          <p className="text-gray-600 mt-2">
            {new Date().toLocaleDateString('sv-SE', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
        <div className="border-t-2 border-[#E79C1A] mb-8"></div>
      </div>

      <div className="min-h-screen bg-gradient-to-br from-[#FFF9F3] via-white to-[#FFF9F3] print-container">
        <div className="no-print">
          <Header />
        </div>
        
        <div className="container mx-auto px-4 py-8 md:py-16 max-w-4xl">
          {/* Animated checkmark - hidden in print */}
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="flex justify-center mb-8 no-print"
          >
            <div className="relative">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0"
              >
                <Sparkles className="w-32 h-32 text-[#E79C1A]/20" />
              </motion.div>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="relative bg-gradient-to-br from-[#E79C1A] to-[#D68910] rounded-full p-6 shadow-2xl"
              >
                <CheckCircle className="w-20 h-20 text-white" strokeWidth={1.5} />
              </motion.div>
            </div>
          </motion.div>

          {/* Success Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-light tracking-[0.2em] uppercase mb-4">
              Tack för din beställning!
            </h1>
            <p className="text-xl text-gray-600 mb-2 no-print">
              Vi är så glada att få vara en del av din hudvårdsresa 💛
            </p>
            <p className="text-gray-500 no-print">
              En bekräftelse har skickats till din e-post
            </p>
          </motion.div>

          {/* Order Details Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-3xl shadow-xl p-8 mb-8 relative overflow-hidden order-details-print"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#E79C1A]/10 to-transparent rounded-full blur-3xl -mr-32 -mt-32 no-print" />
            
            <div className="relative">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 pb-6 border-b border-gray-200">
                <div>
                  <h2 className="text-2xl font-medium mb-2">Orderdetaljer</h2>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">Ordernummer:</span>
                    <span className="font-mono font-medium text-[#E79C1A] text-accent">
                      {orderData?.orderNumber || orderCode || fallbackOrderNumber}
                    </span>
                    <button
                      onClick={copyOrderNumber}
                      className="text-gray-400 hover:text-[#E79C1A] transition-colors no-print"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="flex gap-3 mt-4 md:mt-0 no-print">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => window.print()}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-all flex items-center gap-2"
                  >
                    <Printer className="w-4 h-4" />
                    <span className="hidden md:inline">Skriv ut</span>
                  </motion.button>
                </div>
              </div>

              {/* Order Summary - Print optimized */}
              <div className="space-y-4">
                <h3 className="font-medium text-lg mb-3">Dina produkter</h3>
                
                {/* Print-only summary */}
                <div className="print-only hidden">
                  <div className="border border-gray-200 rounded-lg p-4 mb-4">
                    <p className="font-medium mb-2">Ordersammanfattning</p>
                    <div className="space-y-2 text-sm">
                      <p>• Antal produkter: 1</p>
                      <p>• Leveransmetod: Standard (3-5 arbetsdagar)</p>
                      <p>• Betalningsmetod: Viva Wallet</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-semibold text-[#E79C1A]">Totalt betalt: 895 kr</p>
                    <p className="text-sm text-gray-600 mt-1">Inkl. moms och fri frakt</p>
                  </div>
                </div>

                {/* Screen display */}
                <div className="no-print">
                  {orderData ? (
                    <div className="space-y-3">
                      {orderData.items?.map((item: any, index: number) => (
                        <div key={index} className="bg-gray-50 rounded-xl p-4">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-[#E79C1A]/10 rounded-lg flex items-center justify-center">
                                <Gift className="w-6 h-6 text-[#E79C1A]" />
                              </div>
                              <div>
                                <p className="font-medium">{item.product?.name || item.name || 'Produkt'}</p>
                                <p className="text-sm text-gray-500">{item.quantity} st</p>
                              </div>
                            </div>
                            <p className="font-medium">{item.price * item.quantity} kr</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    // Fallback/Loading state
                    <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-[#E79C1A]/10 rounded-lg flex items-center justify-center">
                            <Gift className="w-6 h-6 text-[#E79C1A]" />
                          </div>
                          <div>
                            <div className="h-5 bg-gray-200 rounded w-32 animate-pulse"></div>
                            <div className="h-4 bg-gray-200 rounded w-16 mt-1 animate-pulse"></div>
                          </div>
                        </div>
                        <div className="h-5 bg-gray-200 rounded w-20 animate-pulse"></div>
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center text-lg font-medium">
                      <span>Totalt</span>
                      <span className="text-[#E79C1A]">
                        {orderData ? `${orderData.totalAmount} kr` : '... kr'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Inkl. moms och fri frakt</p>
                  </div>
                </div>
              </div>

              {/* Delivery information */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="font-medium text-lg mb-3">Leveransinformation</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Truck className="w-5 h-5 text-[#E79C1A]" />
                    <p className="font-medium">Standard leverans</p>
                  </div>
                  <p className="text-sm text-gray-600">• Leveranstid: 3-5 arbetsdagar</p>
                  <p className="text-sm text-gray-600">• Spårbar försändelse</p>
                  <p className="text-sm text-gray-600">• Fri frakt på alla beställningar</p>
                  <p className="text-sm text-gray-600 mt-3">Du får ett spårningsnummer via e-post när din order skickas.</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Timeline - hidden in print */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-3xl shadow-xl p-8 mb-8 timeline-section no-print"
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

          {/* Share section - hidden in print */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-gradient-to-r from-[#FFF9F3] to-[#FFF5ED] rounded-3xl p-8 mb-8 text-center relative overflow-hidden share-section no-print"
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
                      className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-white rounded-xl shadow-xl p-2 z-50 min-w-[160px]"
                    >
                      <button
                        onClick={() => shareOrder('instagram')}
                        className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors w-full text-left"
                      >
                        <Instagram className="w-5 h-5" />
                        <span>Instagram</span>
                      </button>
                      <button
                        onClick={() => shareOrder('facebook')}
                        className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors w-full text-left"
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

          {/* Action buttons - hidden in print */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex flex-col md:flex-row gap-4 justify-center action-buttons no-print"
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

          {/* Print-only footer */}
          <div className="print-only hidden mt-12 pt-8 border-t border-gray-200 text-center text-sm text-gray-600">
            <p>1753 Skincare • www.1753skincare.com</p>
            <p>Kundservice: info@1753skincare.com • Tel: 08-123 456 78</p>
            <p className="mt-2 text-xs">Denna orderbekräftelse är automatiskt genererad</p>
          </div>
        </div>
        
        <div className="no-print">
          <Footer />
        </div>
      </div>
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