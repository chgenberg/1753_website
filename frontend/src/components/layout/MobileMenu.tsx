'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { X } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { usePathname } from 'next/navigation'

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
}

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const { user } = useAuth()
  const pathname = usePathname()
  const currentLocale = pathname.split('/')[1] || 'sv'

  const menuItems = [
    { 
      href: `/${currentLocale}`, 
      label: 'HEM'
    },
    { 
      href: `/${currentLocale}/products`, 
      label: 'PRODUKTER'
    },
    { 
      href: `/${currentLocale}/quiz`, 
      label: 'HUDANALYS' 
    },
    { 
      href: `/${currentLocale}/om-oss`, 
      label: 'OM OSS',
      children: [
        { href: `/${currentLocale}/om-oss/ingredienser`, label: 'Ingredienser' },
        { href: `/${currentLocale}/om-oss/faq`, label: 'Vanliga frågor' },
        { href: `/${currentLocale}/om-oss/aterforsaljare`, label: 'Återförsäljare' },
      ]
    },
    { 
      href: `/${currentLocale}/kunskap`, 
      label: 'KUNSKAP',
      children: [
        { href: `/${currentLocale}/kunskap/e-bok`, label: 'E-bok' },
        { href: `/${currentLocale}/kunskap/funktionella-ravaror`, label: 'Funktionella råvaror' },
        { href: `/${currentLocale}/blogg`, label: 'Blogg' },
      ]
    },
    { 
      href: `/${currentLocale}/kontakt`, 
      label: 'KONTAKT' 
    },
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Background overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          
          {/* Menu panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed right-0 top-0 h-full w-80 md:w-96 bg-white z-50 overflow-y-auto"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 md:top-8 md:right-8 p-2 hover:opacity-60 transition-opacity"
            >
              <X className="w-6 h-6 text-black" />
            </button>

            {/* Menu items */}
            <nav className="pt-20 px-8 md:px-12 pb-8">
              {menuItems.map((item, index) => (
                <div key={item.href} className="mb-8">
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => !item.children && onClose()}
                      className="block text-lg font-light tracking-wider text-black hover:opacity-60 transition-opacity mb-4"
                    >
                      {item.label}
                    </Link>
                    
                    {/* Child items */}
                    {item.children && (
                      <div className="ml-4 space-y-3">
                        {item.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            onClick={onClose}
                            className="block text-sm font-light text-gray-600 hover:text-black transition-colors"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </motion.div>
                </div>
              ))}

              {/* User menu items at bottom */}
              {user ? (
                <div className="mt-12 pt-8 border-t border-gray-200">
                  <Link
                    href={`/${currentLocale}/dashboard`}
                    onClick={onClose}
                    className="block text-sm font-light text-gray-600 hover:text-black transition-colors mb-3"
                  >
                    Min profil
                  </Link>
                  <button
                    onClick={() => {
                      // logout() would go here
                      onClose()
                    }}
                    className="block text-sm font-light text-gray-600 hover:text-black transition-colors"
                  >
                    Logga ut
                  </button>
                </div>
              ) : (
                <div className="mt-12 pt-8 border-t border-gray-200">
                  <Link
                    href={`/${currentLocale}/auth/login`}
                    onClick={onClose}
                    className="block text-sm font-light text-gray-600 hover:text-black transition-colors"
                  >
                    Logga in
                  </Link>
                </div>
              )}
            </nav>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
} 