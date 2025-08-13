'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Cookie, X, Settings, Check } from 'lucide-react'
import { useTranslations } from 'next-intl'

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
  const t = useTranslations()
  const [showBanner, setShowBanner] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: false,
    marketing: false
  })

  useEffect(() => {
    const cookieConsent = localStorage.getItem('cookieConsent')
    if (!cookieConsent) {
      setShowBanner(true)
    } else {
      const savedPreferences = JSON.parse(cookieConsent)
      applyPreferences(savedPreferences)
    }
  }, [])

  const emitConsentChanged = (prefs: CookiePreferences) => {
    try {
      window.dispatchEvent(new CustomEvent('consent-changed', { detail: prefs }))
    } catch {}
  }

  const applyPreferences = (prefs: CookiePreferences) => {
    if (prefs.analytics) {
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('consent', 'update', { 'analytics_storage': 'granted' })
      }
    } else {
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('consent', 'update', { 'analytics_storage': 'denied' })
      }
    }

    if (prefs.marketing) {
      if (typeof window !== 'undefined') {
        window._drip_allowed = true
      }
    } else {
      if (typeof window !== 'undefined') {
        window._drip_allowed = false
      }
    }

    emitConsentChanged(prefs)
  }

  const acceptAll = () => {
    const allAccepted = { necessary: true, analytics: true, marketing: true }
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
    const onlyNecessary = { necessary: true, analytics: false, marketing: false }
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
                        <div className="w-12 h-12 bg-[#FCB237] bg-opacity-10 rounded-full flex items-center justify-center">
                          <Cookie className="w-6 h-6 text-[#FCB237]" />
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          {t('cookieBanner.title')}
                        </h3>
                        <p className="text-gray-600 mb-6">
                          {t('cookieBanner.description')}
                        </p>
                        
                        <div className="flex flex-col sm:flex-row gap-3">
                          <button onClick={acceptAll} className="px-6 py-3 bg-[#FCB237] text-white rounded-full font-medium hover:bg-[#E79C1A] transition-colors">
                            {t('cookieBanner.acceptAll')}
                          </button>
                          
                          <button onClick={declineAll} className="px-6 py-3 bg-gray-200 text-gray-800 rounded-full font-medium hover:bg-gray-300 transition-colors">
                            {t('cookieBanner.onlyNecessary')}
                          </button>
                          
                          <button onClick={() => setShowSettings(!showSettings)} className="px-6 py-3 border-2 border-[#FCB237] text-[#FCB237] rounded-full font-medium hover:bg-[#FCB237] hover:text-white transition-colors flex items-center justify-center gap-2">
                            <Settings className="w-4 h-4" />
                            {t('cookieBanner.customize')}
                          </button>
                        </div>
                        
                        <p className="text-sm text-gray-500 mt-4">
                          {t('cookieBanner.learnMore')}{' '}
                          <a href="/integritetspolicy" className="text-[#FCB237] hover:underline">
                            {t('navigation.privacyPolicy')}
                          </a>
                          {' '}{t('cookieBanner.and')}{' '}
                          <a href="/cookies" className="text-[#FCB237] hover:underline">
                            {t('navigation.cookies')}
                          </a>
                        </p>
                      </div>
                      
                      <button onClick={() => setShowBanner(false)} className="flex-shrink-0 text-gray-400 hover:text-gray-600">
                        <X className="w-6 h-6" />
                      </button>
                    </div>
                  </div>
                ) : (
                  // Settings Panel
                  <div className="p-6 md:p-8">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-gray-900">
                        {t('cookieBanner.settings.title')}
                      </h3>
                      <button onClick={() => setShowSettings(false)} className="text-gray-400 hover:text-gray-600">
                        <X className="w-6 h-6" />
                      </button>
                    </div>
                    
                    <div className="space-y-6">
                      {/* Necessary Cookies */}
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 mb-1">
                              {t('cookieBanner.settings.necessary.title')}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {t('cookieBanner.settings.necessary.desc')}
                            </p>
                          </div>
                          <div className="ml-4">
                            <div className="w-12 h-7 bg-[#FCB237] rounded-full flex items-center justify-center cursor-not-allowed opacity-60">
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
                              {t('cookieBanner.settings.analytics.title')}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {t('cookieBanner.settings.analytics.desc')}
                            </p>
                          </div>
                          <div className="ml-4">
                            <button onClick={() => setPreferences({ ...preferences, analytics: !preferences.analytics })} className={`w-12 h-7 rounded-full transition-colors relative ${preferences.analytics ? 'bg-[#FCB237]' : 'bg-gray-300'}`}>
                              <motion.div className="w-5 h-5 bg-white rounded-full absolute top-1" animate={{ x: preferences.analytics ? 20 : 2 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }} />
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      {/* Marketing Cookies */}
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 mb-1">
                              {t('cookieBanner.settings.marketing.title')}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {t('cookieBanner.settings.marketing.desc')}
                            </p>
                          </div>
                          <div className="ml-4">
                            <button onClick={() => setPreferences({ ...preferences, marketing: !preferences.marketing })} className={`w-12 h-7 rounded-full transition-colors relative ${preferences.marketing ? 'bg-[#FCB237]' : 'bg-gray-300'}`}>
                              <motion.div className="w-5 h-5 bg-white rounded-full absolute top-1" animate={{ x: preferences.marketing ? 20 : 2 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-3 mt-8">
                      <button onClick={acceptSelected} className="flex-1 px-6 py-3 bg-[#FCB237] text-white rounded-full font-medium hover:bg-[#E79C1A] transition-colors">
                        {t('cookieBanner.saveSettings')}
                      </button>
                      <button onClick={acceptAll} className="flex-1 px-6 py-3 border-2 border-[#FCB237] text-[#FCB237] rounded-full font-medium hover:bg-[#FCB237] hover:text-white transition-colors">
                        {t('cookieBanner.acceptAll')}
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