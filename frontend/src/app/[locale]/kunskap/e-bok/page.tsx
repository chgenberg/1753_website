'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Footer } from '@/components/layout/Footer'
import { HeroNavigation } from '@/components/layout/HeroNavigation'
import { CartDrawer } from '@/components/cart/CartDrawer'
import { usePathname } from 'next/navigation'

export default function EBookPage() {
  const pathname = usePathname()
  const currentLocale = pathname.split('/')[1] || 'sv'
  
  const [email, setEmail] = useState('')
  const [privacyAccepted, setPrivacyAccepted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [errors, setErrors] = useState<{email?: string, privacy?: string}>({})

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const newErrors: {email?: string, privacy?: string} = {}

    if (!email || email.trim() === '') {
      newErrors.email = 'E-postadress krävs'
    } else if (!validateEmail(email)) {
      newErrors.email = 'Ogiltig e-postadress'
    }

    if (!privacyAccepted) {
      newErrors.privacy = 'Du måste acceptera integritetspolicyn'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})
    setIsSubmitting(true)

    try {
      // Subscribe to Drip
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          source: 'ebook-download'
        }),
      })

      if (response.ok) {
        setIsSubmitted(true)
        // Trigger PDF download
        const link = document.createElement('a')
        link.href = '/e-book_weedyourskin_backup.pdf'
        link.download = 'Weed_Your_Skin_1753.pdf'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } else {
        throw new Error('Failed to subscribe')
      }
    } catch (error) {
      console.error('Error:', error)
      setErrors({ email: 'Ett fel uppstod. Försök igen.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      
      {/* Hero Section with Full-Screen Image */}
      <section className="relative h-screen min-h-[600px]">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          {/* Desktop Image */}
          <div className="hidden md:block relative w-full h-full">
            <Image
              src="/bok.jpg"
              alt="E-bok bakgrund"
              fill
              className="object-cover"
              priority
              quality={100}
            />
          </div>
          
          {/* Mobile Image */}
          <div className="md:hidden relative w-full h-full">
            <Image
              src="/bok_mobile.png"
              alt="E-bok bakgrund mobil"
              fill
              className="object-cover"
              priority
              quality={100}
            />
          </div>
          
          {/* Dark overlay for better text visibility */}
          <div className="absolute inset-0 bg-black/40" />
        </div>

        {/* Use the reusable navigation component */}
        <HeroNavigation />



        {/* Hero Content */}
        <div className="relative z-10 h-full flex items-center justify-center px-6">
          <div className="max-w-2xl mx-auto text-center">
            {!isSubmitted ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                {/* Title */}
                <h1 className="text-white text-center px-6 md:px-8 max-w-4xl mb-12">
                  <span className="block text-sm md:text-base font-light tracking-[0.3em] uppercase">
                    LADDA HEM VÅR KOSTNADSFRIA E-BOK
                  </span>
                </h1>

                {/* Email Form */}
                <form onSubmit={handleSubmit} className="max-w-md mx-auto">
                  <div className="space-y-4">
                    {/* Email Input */}
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Din e-postadress"
                      className={`w-full px-6 py-4 bg-white/10 backdrop-blur-sm border ${
                        errors.email ? 'border-red-400' : 'border-white/30'
                      } rounded-full text-white placeholder-white/70 focus:outline-none focus:border-white/60 focus:bg-white/20 transition-all`}
                      disabled={isSubmitting}
                    />
                    {errors.email && (
                      <p className="text-white/90 text-sm">{errors.email}</p>
                    )}

                    {/* Privacy Checkbox */}
                    <label className="flex items-start space-x-3 cursor-pointer text-white/90 text-sm">
                      <input
                        type="checkbox"
                        checked={privacyAccepted}
                        onChange={(e) => setPrivacyAccepted(e.target.checked)}
                        className="mt-1 h-4 w-4 bg-white/10 border-white/30 text-[#FCB237] focus:ring-[#FCB237] rounded"
                        disabled={isSubmitting}
                      />
                      <span>
                        Jag godkänner{' '}
                        <Link
                          href="/integritetspolicy"
                          className="underline hover:opacity-70"
                          target="_blank"
                        >
                          integritetspolicyn
                        </Link>
                      </span>
                    </label>
                    {errors.privacy && (
                      <p className="text-white/90 text-sm">{errors.privacy}</p>
                    )}

                    {/* Submit Button with Pulse Animation */}
                    <motion.button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-white text-gray-900 px-8 py-4 rounded-full font-light tracking-wider uppercase text-sm hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      animate={{
                        scale: [1, 1.05, 1],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatType: "loop",
                      }}
                    >
                      {isSubmitting ? 'Skickar...' : 'Skicka'}
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            ) : (
              /* Success Message */
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-white text-center"
              >
                <h2 className="text-2xl md:text-3xl font-light mb-6">
                  Tack för din prenumeration!
                </h2>
                <p className="text-lg mb-8 opacity-90">
                  E-boken har skickats till din e-post och nedladdningen startar automatiskt.
                </p>
                <a
                  href="/e-book_weedyourskin_backup.pdf"
                  download="Weed_Your_Skin_1753.pdf"
                  className="inline-block bg-white text-gray-900 px-8 py-4 rounded-full font-light tracking-wider uppercase text-sm hover:bg-gray-100 transition-all"
                >
                  Ladda ner igen
                </a>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
} 