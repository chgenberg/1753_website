'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { CartDrawer } from '@/components/cart/CartDrawer'
import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/contexts/AuthContext'
import { 
  ShoppingBag, User, X
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export function Header() {
  const t = useTranslations()
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const { cartCount, openCart } = useCart()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isMenuOpen])

  const menuItems = [
    { 
      href: '/', 
      label: 'HEM'
    },
    { 
      href: '/products', 
      label: 'PRODUKTER'
    },
    { href: '/quiz', label: 'HUDANALYS' },
    { 
      href: '/om-oss', 
      label: 'OM OSS',
      children: [
        { href: '/om-oss/ingredienser', label: 'Ingredienser' },
        { href: '/om-oss/faq', label: 'Vanliga frågor' },
        { href: '/om-oss/aterforsaljare', label: 'Återförsäljare' },
      ]
    },
    { 
      href: '/kunskap', 
      label: 'KUNSKAP',
      children: [
        { href: '/kunskap/e-bok', label: 'E-bok' },
        { href: '/kunskap/funktionella-ravaror', label: 'Funktionella råvaror' },
        { href: '/blogg', label: 'Blogg' },
      ]
    },
    { href: '/kontakt', label: 'KONTAKT' },
  ]

  return (
    <>
      {/* Header */}
      <nav className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled ? 'bg-white shadow-md' : 'bg-white'
      }`}>
        <div className="flex items-center justify-between p-6 md:p-8">
          {/* Logo */}
          <Link href="/" className="block">
            <Image
              src="/1753.png"
              alt="1753 Skincare"
              width={150}
              height={60}
              className="h-12 md:h-16 w-auto"
              priority
            />
          </Link>

          {/* Right side icons */}
          <div className="flex items-center gap-4">
            {/* Cart Icon */}
            <button
              onClick={openCart}
              className="relative p-2 hover:opacity-70 transition-opacity"
            >
              <ShoppingBag className="w-6 h-6 text-black" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#FCB237] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Profile Icon */}
            <Link
              href={user ? '/dashboard' : '/auth/login'}
              className="p-2 hover:opacity-70 transition-opacity"
            >
              <User className="w-6 h-6 text-black" />
            </Link>

            {/* Hamburger Menu */}
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 hover:opacity-70 transition-opacity"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6 text-black" />
              ) : (
                <svg
                  className="w-6 h-6 text-black"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Spacer to prevent content from going under fixed header */}
      <div className="h-20 md:h-24" />

      {/* Slide-in Menu from Right */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Background overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              onClick={() => setIsMenuOpen(false)}
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
                onClick={() => setIsMenuOpen(false)}
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
                        onClick={() => !item.children && setIsMenuOpen(false)}
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
                              onClick={() => setIsMenuOpen(false)}
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
                {user && (
                  <div className="mt-12 pt-8 border-t border-gray-200">
                    <Link
                      href="/dashboard"
                      onClick={() => setIsMenuOpen(false)}
                      className="block text-sm font-light text-gray-600 hover:text-black transition-colors mb-3"
                    >
                      Min profil
                    </Link>
                    <button
                      onClick={() => {
                        logout()
                        setIsMenuOpen(false)
                      }}
                      className="block text-sm font-light text-gray-600 hover:text-black transition-colors"
                    >
                      Logga ut
                    </button>
                  </div>
                )}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Cart Drawer */}
      <CartDrawer />
    </>
  )
} 