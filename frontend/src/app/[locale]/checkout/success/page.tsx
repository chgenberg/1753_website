'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { 
  CheckCircle, 
  Package, 
  Mail, 
  ArrowRight,
  Printer
} from 'lucide-react'
import confetti from 'canvas-confetti'

export default function CheckoutSuccessPage() {
  const router = useRouter()

  useEffect(() => {
    // Trigger confetti animation
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#00937c', '#E79C1A', '#00b89d']
    })

    // Clean up confetti after 5 seconds
    const timer = setTimeout(() => {
      confetti.reset()
    }, 5000)

    return () => {
      clearTimeout(timer)
      confetti.reset()
    }
  }, [])

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 pt-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            {/* Success Icon */}
            <div className="flex justify-center mb-6">
              <div className="bg-[#E5DDD5] rounded-full p-6">
                <CheckCircle className="w-16 h-16 text-[#FCB237]" />
              </div>
            </div>

            {/* Success Message */}
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Tack för din beställning!
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Vi har tagit emot din beställning och den behandlas nu.
              Du kommer att få en orderbekräftelse via e-post inom kort.
            </p>

            {/* Order Number */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <p className="text-sm text-gray-500 mb-2">Ordernummer</p>
              <p className="text-2xl font-bold text-gray-900">#1753-{Date.now()}</p>
            </div>

            {/* What's Next */}
            <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
              <h2 className="text-xl font-semibold mb-6">Vad händer nu?</h2>
              <div className="space-y-6 text-left">
                <div className="flex items-start">
                  <div className="bg-[#E5DDD5] rounded-full p-2 mr-4 flex-shrink-0">
                    <Mail className="w-5 h-5 text-[#FCB237]" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Orderbekräftelse</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Du kommer att få en e-post med orderbekräftelse och kvitto inom några minuter.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-[#E5DDD5] rounded-full p-2 mr-4 flex-shrink-0">
                    <Package className="w-5 h-5 text-[#FCB237]" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Packning och leverans</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Din order packas inom 1-2 arbetsdagar. Du får ett spårningsnummer när paketet skickas.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-[#E5DDD5] rounded-full p-2 mr-4 flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-[#FCB237]" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Leverans</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Förväntad leveranstid är 2-4 arbetsdagar efter att paketet skickats.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/products"
                className="bg-[#FCB237] text-white px-8 py-3 rounded-lg font-medium hover:bg-[#3A2A1E] transition-colors flex items-center justify-center gap-2"
              >
                Fortsätt handla
                <ArrowRight className="w-5 h-5" />
              </Link>
              <button
                onClick={() => window.print()}
                className="bg-gray-100 text-gray-700 px-8 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
              >
                <Printer className="w-5 h-5" />
                Skriv ut kvitto
              </button>
            </div>

            {/* Support Info */}
            <div className="mt-12 p-6 bg-gray-100 rounded-lg">
              <p className="text-sm text-gray-600">
                Har du frågor om din beställning? Kontakta oss på{' '}
                <a href="mailto:kundservice@1753skincare.com" className="text-[#FCB237] hover:text-[#3A2A1E] font-medium">
                  kundservice@1753skincare.com
                </a>{' '}
                eller ring{' '}
                <a href="tel:0732305521" className="text-[#FCB237] hover:text-[#3A2A1E] font-medium">
                  0732-305521
                </a>
              </p>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </>
  )
} 