'use client'

import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Globe } from 'lucide-react'
import { getCurrencyByLocale } from '@/lib/currency'

interface LanguagePopupProps {
  detectedCountry?: string
  suggestedLocale?: string
}

const countryToLocale: Record<string, string> = {
  'SE': 'sv',
  'GB': 'en',
  'US': 'en',
  'ES': 'es',
  'DE': 'de',
  'FR': 'fr',
  'NO': 'sv', // Norway might prefer Swedish
  'DK': 'sv', // Denmark might prefer Swedish
  'FI': 'sv', // Finland might prefer Swedish
}

const localeNames: Record<string, string> = {
  'sv': 'Svenska',
  'en': 'English',
  'es': 'Español',
  'de': 'Deutsch',
  'fr': 'Français'
}

const welcomeMessages: Record<string, { title: string; detected: string; question: string; yes: string; no: string; later: string }> = {
  'en': {
    title: 'Welcome!',
    detected: 'We detected you are visiting from',
    question: 'Would you like to switch to',
    yes: 'Yes, switch language',
    no: 'No, keep',
    later: 'You can always change the language later in the menu'
  },
  'es': {
    title: '¡Bienvenido!',
    detected: 'Detectamos que nos visitas desde',
    question: '¿Te gustaría cambiar a',
    yes: 'Sí, cambiar idioma',
    no: 'No, mantener',
    later: 'Siempre puedes cambiar el idioma más tarde en el menú'
  },
  'de': {
    title: 'Willkommen!',
    detected: 'Wir haben festgestellt, dass Sie uns besuchen aus',
    question: 'Möchten Sie wechseln zu',
    yes: 'Ja, Sprache wechseln',
    no: 'Nein, behalten',
    later: 'Sie können die Sprache jederzeit später im Menü ändern'
  },
  'fr': {
    title: 'Bienvenue!',
    detected: 'Nous avons détecté que vous nous rendez visite depuis',
    question: 'Souhaitez-vous passer à',
    yes: 'Oui, changer de langue',
    no: 'Non, garder',
    later: 'Vous pouvez toujours changer de langue plus tard dans le menu'
  },
  'sv': {
    title: 'Välkommen!',
    detected: 'Vi upptäckte att du besöker oss från',
    question: 'Vill du byta till',
    yes: 'Ja, byt språk',
    no: 'Nej, behåll',
    later: 'Du kan alltid ändra språk senare i menyn'
  }
}

export function LanguagePopup() {
  const [showPopup, setShowPopup] = useState(false)
  const [suggestedLocale, setSuggestedLocale] = useState<string | null>(null)
  const [detectedCountry, setDetectedCountry] = useState<string | null>(null)
  const pathname = usePathname()
  const router = useRouter()
  
  const currentLocale = pathname.split('/')[1] || 'sv'

  useEffect(() => {
    // Check if user has already dismissed the popup or has a preference
    const hasSeenPopup = sessionStorage.getItem('hasSeenLanguagePopup')
    const preferredLanguage = localStorage.getItem('preferredLanguage')
    
    if (hasSeenPopup || preferredLanguage) {
      return
    }

    // Detect user's location using IP geolocation
    const detectLocation = async () => {
      try {
        // Using our API endpoint for location detection
        const response = await fetch('/api/geolocation')
        const data = await response.json()
        
        if (data.country_code) {
          setDetectedCountry(data.country_code)
          const suggested = countryToLocale[data.country_code]
          
          // Only show popup if suggested locale is different from current
          if (suggested && suggested !== currentLocale) {
            setSuggestedLocale(suggested)
            setShowPopup(true)
          }
        }
      } catch (error) {
        console.error('Failed to detect location:', error)
      }
    }

    // Delay the popup slightly for better UX
    const timer = setTimeout(detectLocation, 2000)
    return () => clearTimeout(timer)
  }, [currentLocale])

  const handleAccept = () => {
    if (suggestedLocale) {
      const segments = pathname.split('/')
      segments[1] = suggestedLocale
      const newPath = segments.join('/')
      
      localStorage.setItem('preferredLanguage', suggestedLocale)
      sessionStorage.setItem('hasSeenLanguagePopup', 'true')
      
      router.push(newPath)
    }
    setShowPopup(false)
  }

  const handleDismiss = () => {
    sessionStorage.setItem('hasSeenLanguagePopup', 'true')
    setShowPopup(false)
  }

  if (!suggestedLocale) return null

  const suggestedCurrency = getCurrencyByLocale(suggestedLocale)
  const currentCurrency = getCurrencyByLocale(currentLocale)
  const messages = welcomeMessages[suggestedLocale] || welcomeMessages['en']

  return (
    <AnimatePresence>
      {showPopup && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={handleDismiss}
          />
          
          {/* Popup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90%] max-w-md"
          >
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-[#D4AF37] to-[#F5D547] p-6 relative">
                <button
                  onClick={handleDismiss}
                  className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
                
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <Globe className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      {messages.title}
                    </h3>
                    <p className="text-white/90 text-sm mt-1">
                      {messages.detected} {detectedCountry}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Content */}
              <div className="p-6">
                <p className="text-gray-700 mb-6">
                  {messages.question} <span className="font-semibold">{localeNames[suggestedLocale]}</span> 
                  {suggestedCurrency !== currentCurrency && (
                    <>
                      {' '}och se priser i <span className="font-semibold">{suggestedCurrency}</span>
                    </>
                  )}?
                </p>
                
                <div className="flex gap-3">
                  <button
                    onClick={handleAccept}
                    className="flex-1 bg-[#D4AF37] text-white py-3 px-6 rounded-lg font-semibold hover:bg-[#B8941F] transition-colors"
                  >
                    {messages.yes}
                  </button>
                  <button
                    onClick={handleDismiss}
                    className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                  >
                    {messages.no} {localeNames[currentLocale]}
                  </button>
                </div>
                
                <p className="text-xs text-gray-500 mt-4 text-center">
                  {messages.later}
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
} 