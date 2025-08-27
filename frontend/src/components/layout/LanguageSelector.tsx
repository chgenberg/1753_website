'use client'

import { useState, useRef, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Globe } from 'lucide-react'
import { getCurrencyByLocale } from '@/lib/currency'

interface Language {
  code: string
  name: string
  flag: string
}

const languages: Language[] = [
  { code: 'sv', name: 'Svenska', flag: '🇸🇪' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' }
]

interface LanguageSelectorProps {
  variant?: 'light' | 'dark'
}

export function LanguageSelector({ variant = 'light' }: LanguageSelectorProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  // Get current locale from pathname
  const currentLocale = pathname.split('/')[1] || 'sv'
  const currentLanguage = languages.find(lang => lang.code === currentLocale) || languages[0]

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLanguageChange = (langCode: string) => {
    // Get the new path with the new locale
    const segments = pathname.split('/')
    segments[1] = langCode
    const newPath = segments.join('/')
    
    // Navigate to the new path
    router.push(newPath)
    setIsOpen(false)

    // Store the preference
    localStorage.setItem('preferredLanguage', langCode)
  }

  const textColor = variant === 'dark' ? 'text-black' : 'text-white'
  const bgColor = variant === 'dark' ? 'bg-white' : 'bg-black/20 backdrop-blur-sm'
  const hoverBg = variant === 'dark' ? 'hover:bg-gray-100' : 'hover:bg-white/20'

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg ${bgColor} ${textColor} transition-all hover:opacity-90`}
        aria-label="Select language"
      >
        <Globe className="w-5 h-5" />
        <span className="text-sm font-medium hidden sm:inline">
          {currentLanguage.flag} {currentLanguage.code.toUpperCase()}
        </span>
        <span className="text-sm font-medium sm:hidden">
          {currentLanguage.flag}
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className={`absolute right-0 mt-2 w-48 rounded-lg shadow-lg ${
              variant === 'dark' ? 'bg-white' : 'bg-black/90 backdrop-blur-sm'
            } overflow-hidden z-50`}
          >
            {languages.map((lang) => {
              const currency = getCurrencyByLocale(lang.code)
              const isActive = lang.code === currentLocale
              
              return (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  className={`w-full px-4 py-3 flex items-center justify-between ${
                    variant === 'dark' ? 'text-black' : 'text-white'
                  } ${hoverBg} transition-colors ${
                    isActive ? 'font-semibold' : ''
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <span className="text-lg">{lang.flag}</span>
                    <span className="text-sm">{lang.name}</span>
                  </span>
                  <span className="text-xs opacity-60">{currency}</span>
                </button>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
} 