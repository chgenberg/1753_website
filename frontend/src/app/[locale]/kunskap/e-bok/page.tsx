'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Download, FileText, Mail, Check, Sparkles, Shield } from 'lucide-react'

export default function EBookPage() {
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
          tags: ['ebook-download'],
          source: 'ebook-page'
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

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-[#FAF8F5]">
        <Header />
        
        <main className="pt-20 pb-20">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-white rounded-2xl shadow-xl p-12"
            >
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-10 h-10 text-green-600" />
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Tack för din prenumeration!
              </h1>
              
              <p className="text-lg text-gray-700 mb-8">
                E-boken har skickats till din e-post och nedladdningen startade automatiskt. 
                Om nedladdningen inte startade, klicka på knappen nedan.
              </p>

              <div className="space-y-4">
                <a
                  href="/e-book_weedyourskin_backup.pdf"
                  download="Weed_Your_Skin_1753.pdf"
                  className="inline-flex items-center px-8 py-4 bg-[#4A3428] text-white rounded-full font-medium hover:bg-[#3A2418] transition-colors duration-300 shadow-lg"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Ladda ner e-boken igen
                </a>
                
                <p className="text-sm text-gray-600">
                  Du kommer också att få värdefulla hudvårdstips och erbjudanden i din inkorg.
                </p>
              </div>
            </motion.div>
          </div>
        </main>
        
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      <Header />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative py-20 px-4 md:px-8 overflow-hidden">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center">
              {/* Text Content */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center md:text-left"
              >
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                  Weed Your Skin - E-bok
                </h1>
                <p className="text-xl text-gray-700 mb-8">
                  Upptäck hemligheten bakom frisk och strålande hud med vår omfattande guide 
                  om CBD-baserad hudvård och hudens ekosystem.
                </p>

                {/* Features */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                  <div className="text-center">
                    <FileText className="w-10 h-10 text-[#4A3428] mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-900">300+ Sidor</p>
                  </div>
                  <div className="text-center">
                    <svg className="w-10 h-10 text-[#4A3428] mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm font-medium text-gray-900">Vetenskapligt</p>
                  </div>
                  <div className="text-center">
                    <Download className="w-10 h-10 text-[#4A3428] mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-900">Direkt Nedladdning</p>
                  </div>
                </div>

                {/* What's Inside */}
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Vad du får:</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                      Komplett guide till CBD-hudvård
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                      Vetenskapliga studier och referenser
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                      Praktiska hudvårdstips
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                      Ingrediensguide och recept
                    </li>
                  </ul>
                </div>
              </motion.div>

              {/* Book Image */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="relative"
              >
                <div className="relative mx-auto max-w-md">
                  {/* Background decoration */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#4A3428]/10 to-transparent rounded-3xl transform rotate-3"></div>
                  
                  {/* Book image */}
                  <div className="relative z-10 transform hover:scale-105 transition-transform duration-300">
                    <Image
                      src="/bok.jpg"
                      alt="Weed Your Skin E-bok"
                      width={400}
                      height={600}
                      className="rounded-2xl shadow-2xl w-full h-auto"
                      priority
                    />
                    
                    {/* Badge */}
                    <div className="absolute -top-4 -right-4 bg-[#4A3428] text-white rounded-full px-6 py-3 shadow-lg transform rotate-12">
                      <span className="text-sm font-bold">300+ sidor</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Download Form Section */}
        <section className="pb-20 px-4 md:px-8">
          <div className="max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-white rounded-2xl shadow-xl overflow-hidden"
            >
              <div className="p-8">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-[#4A3428]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-8 h-8 text-[#4A3428]" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Ladda ner din kostnadsfria e-bok
                  </h2>
                  <p className="text-gray-600">
                    Ange din e-postadress nedan för att få direkt tillgång till e-boken
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Email Input */}
                  <div>
                    <label className="flex items-center text-gray-700 text-sm font-medium mb-2">
                      <Mail className="w-4 h-4 mr-2 text-[#4A3428]" />
                      Din e-postadress
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="din@email.com"
                      className={`w-full px-4 py-3 bg-gray-50 border ${errors.email ? 'border-red-400' : 'border-gray-200'} rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#4A3428] focus:bg-white transition-colors`}
                      disabled={isSubmitting}
                    />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                  </div>

                  {/* Privacy Policy */}
                  <div>
                    <label className="flex items-start space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={privacyAccepted}
                        onChange={(e) => setPrivacyAccepted(e.target.checked)}
                        className="mt-1 h-4 w-4 text-[#4A3428] focus:ring-[#4A3428] border-gray-300 rounded"
                        disabled={isSubmitting}
                      />
                      <div className="flex-1">
                        <div className="text-gray-600 text-sm">
                          <Shield className="w-4 h-4 inline mr-1" />
                          Jag godkänner{' '}
                          <a href="/integritetspolicy" target="_blank" className="text-[#4A3428] hover:text-[#3A2418] underline">
                            integritetspolicyn
                          </a>{' '}
                          och samtycker till att få värdefulla hudvårdstips och erbjudanden via e-post
                        </div>
                        {errors.privacy && <p className="text-red-500 text-sm mt-1">{errors.privacy}</p>}
                      </div>
                    </label>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center px-8 py-4 bg-[#4A3428] text-white rounded-full font-medium hover:bg-[#3A2418] transition-colors duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Skickar...
                      </>
                    ) : (
                      <>
                        <Download className="w-5 h-5 mr-2" />
                        Ladda ner e-boken gratis
                      </>
                    )}
                  </button>

                  {/* Security Note */}
                  <div className="text-center">
                    <p className="text-xs text-gray-500">
                      🔒 Vi skickar aldrig spam och du kan avregistrera dig när som helst
                    </p>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  )
} 