'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Cookie, X, Settings, Check } from 'lucide-react'

interface CookiePreferences {
  necessary: boolean
  analytics: boolean
  marketing: boolean
}

declare global {
  interface Window {
    gtag?: Function
    _drip_allowed?: boolean
  }
}

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: false,
    marketing: false
  })

  useEffect(() => {
    // Check if user has already made a choice
    const cookieConsent = localStorage.getItem('cookieConsent')
    if (!cookieConsent) {
      setShowBanner(true)
    } else {
      // Apply saved preferences
      const savedPreferences = JSON.parse(cookieConsent)
      applyPreferences(savedPreferences)
    }
  }, [])

  const applyPreferences = (prefs: CookiePreferences) => {
    // Apply analytics cookies
    if (prefs.analytics) {
      // Enable Google Analytics, etc.
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('consent', 'update', {
          'analytics_storage': 'granted'
        })
      }
    } else {
      // Disable analytics
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('consent', 'update', {
          'analytics_storage': 'denied'
        })
      }
    }

    // Apply marketing cookies
    if (prefs.marketing) {
      // Enable marketing cookies (Drip, etc.)
      if (typeof window !== 'undefined') {
        window._drip_allowed = true
      }
    } else {
      // Disable marketing cookies
      if (typeof window !== 'undefined') {
        window._drip_allowed = false
      }
    }
  }

  const acceptAll = () => {
    const allAccepted = {
      necessary: true,
      analytics: true,
      marketing: true
    }
    setPreferences(allAccepted)
    localStorage.setItem('cookieConsent', JSON.stringify(allAccepted))
    applyPreferences(allAccepted)
    setShowBanner(false)
  }

  const acceptSelected = () => {
    localStorage.setItem('cookieConsent', JSON.stringify(preferences))
    applyPreferences(preferences)
    setShowBanner(false)
    setShowSettings(false)
  }

  const declineAll = () => {
    const onlyNecessary = {
      necessary: true,
      analytics: false,
      marketing: false
    }
    setPreferences(onlyNecessary)
    localStorage.setItem('cookieConsent', JSON.stringify(onlyNecessary))
    applyPreferences(onlyNecessary)
    setShowBanner(false)
  }

  return (
    <AnimatePresence>
      {showBanner && (
        <>
          {/* Dark overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-40"
            onClick={() => setShowSettings(false)}
          />

          {/* Cookie Banner */}
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 25 }}
            className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6"
          >
            <div className="max-w-7xl mx-auto">
              <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                {!showSettings ? (
                  // Main Banner
                  <div className="p-6 md:p-8">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-[#4A3428] bg-opacity-10 rounded-full flex items-center justify-center">
                          <Cookie className="w-6 h-6 text-[#4A3428]" />
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          Vi värnar om din integritet 🍪
                        </h3>
                        <p className="text-gray-600 mb-6">
                          Vi använder cookies för att förbättra din upplevelse på vår webbplats, 
                          analysera trafik och anpassa innehåll. Du kan välja vilka cookies du godkänner.
                        </p>
                        
                        <div className="flex flex-col sm:flex-row gap-3">
                          <button
                            onClick={acceptAll}
                            className="px-6 py-3 bg-[#4A3428] text-white rounded-full font-medium hover:bg-[#3A2418] transition-colors"
                          >
                            Acceptera alla
                          </button>
                          
                          <button
                            onClick={declineAll}
                            className="px-6 py-3 bg-gray-200 text-gray-800 rounded-full font-medium hover:bg-gray-300 transition-colors"
                          >
                            Endast nödvändiga
                          </button>
                          
                          <button
                            onClick={() => setShowSettings(!showSettings)}
                            className="px-6 py-3 border-2 border-[#4A3428] text-[#4A3428] rounded-full font-medium hover:bg-[#4A3428] hover:text-white transition-colors flex items-center justify-center gap-2"
                          >
                            <Settings className="w-4 h-4" />
                            Anpassa
                          </button>
                        </div>
                        
                        <p className="text-sm text-gray-500 mt-4">
                          Läs mer i vår{' '}
                          <a href="/integritetspolicy" className="text-[#4A3428] hover:underline">
                            integritetspolicy
                          </a>
                          {' '}och{' '}
                          <a href="/cookies" className="text-[#4A3428] hover:underline">
                            cookie-policy
                          </a>
                        </p>
                      </div>
                      
                      <button
                        onClick={() => setShowBanner(false)}
                        className="flex-shrink-0 text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-6 h-6" />
                      </button>
                    </div>
                  </div>
                ) : (
                  // Settings Panel
                  <div className="p-6 md:p-8">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-gray-900">
                        Cookie-inställningar
                      </h3>
                      <button
                        onClick={() => setShowSettings(false)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-6 h-6" />
                      </button>
                    </div>
                    
                    <div className="space-y-6">
                      {/* Necessary Cookies */}
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 mb-1">
                              Nödvändiga cookies
                            </h4>
                            <p className="text-sm text-gray-600">
                              Dessa cookies är nödvändiga för att webbplatsen ska fungera korrekt. 
                              De kan inte stängas av.
                            </p>
                          </div>
                          <div className="ml-4">
                            <div className="w-12 h-7 bg-[#4A3428] rounded-full flex items-center justify-center cursor-not-allowed opacity-60">
                              <Check className="w-4 h-4 text-white" />
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Analytics Cookies */}
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 mb-1">
                              Analyserande cookies
                            </h4>
                            <p className="text-sm text-gray-600">
                              Hjälper oss förstå hur besökare använder webbplatsen genom att samla 
                              in och rapportera anonym information.
                            </p>
                          </div>
                          <div className="ml-4">
                            <button
                              onClick={() => setPreferences({ ...preferences, analytics: !preferences.analytics })}
                              className={`w-12 h-7 rounded-full transition-colors relative ${
                                preferences.analytics ? 'bg-[#4A3428]' : 'bg-gray-300'
                              }`}
                            >
                              <motion.div
                                className="w-5 h-5 bg-white rounded-full absolute top-1"
                                animate={{ x: preferences.analytics ? 20 : 2 }}
                                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                              />
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      {/* Marketing Cookies */}
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 mb-1">
                              Marknadsföringscookies
                            </h4>
                            <p className="text-sm text-gray-600">
                              Används för att visa relevanta annonser och mäta effektiviteten 
                              av våra marknadsföringskampanjer.
                            </p>
                          </div>
                          <div className="ml-4">
                            <button
                              onClick={() => setPreferences({ ...preferences, marketing: !preferences.marketing })}
                              className={`w-12 h-7 rounded-full transition-colors relative ${
                                preferences.marketing ? 'bg-[#4A3428]' : 'bg-gray-300'
                              }`}
                            >
                              <motion.div
                                className="w-5 h-5 bg-white rounded-full absolute top-1"
                                animate={{ x: preferences.marketing ? 20 : 2 }}
                                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                              />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-3 mt-8">
                      <button
                        onClick={acceptSelected}
                        className="flex-1 px-6 py-3 bg-[#4A3428] text-white rounded-full font-medium hover:bg-[#3A2418] transition-colors"
                      >
                        Spara inställningar
                      </button>
                      <button
                        onClick={acceptAll}
                        className="flex-1 px-6 py-3 border-2 border-[#4A3428] text-[#4A3428] rounded-full font-medium hover:bg-[#4A3428] hover:text-white transition-colors"
                      >
                        Acceptera alla
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
} 