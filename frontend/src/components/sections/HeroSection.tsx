'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/contexts/AuthContext'
import { CartDrawer } from '@/components/cart/CartDrawer'
import { ShoppingBag, User, X } from 'lucide-react'

export function HeroSection() {
  const [isMobile, setIsMobile] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { cartCount, openCart } = useCart()
  const { user } = useAuth()

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
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
      <section className="relative min-h-screen overflow-hidden">
        {/* Background Image - Full Screen */}
        <div className="absolute inset-0 z-0">
          <Image
            src={isMobile 
              ? "/background/swin_backgrund_mobile.png"
              : "/background/swin_backgrund.png"
            }
            alt="Minimalist background"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          {/* Subtle gradient overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/20" />
        </div>

        {/* White Navigation on top of hero */}
        <nav className="absolute top-0 left-0 right-0 z-20 p-6 md:p-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="block">
              <Image
                src="/1753_white.png"
                alt="1753 Skincare"
                width={200}
                height={80}
                className="h-16 md:h-24 w-auto"
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
                <ShoppingBag className="w-6 h-6 text-white" />
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
                <User className="w-6 h-6 text-white" />
              </Link>

              {/* Hamburger Menu */}
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 hover:opacity-70 transition-opacity"
              >
                {isMenuOpen ? (
                  <X className="w-6 h-6 text-white" />
                ) : (
                  <svg
                    className="w-6 h-6 text-white"
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

        {/* Minimalist Text */}
        <div className="absolute inset-x-0 top-1/3 md:top-1/4 z-10 flex items-center justify-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="text-white text-center px-6 md:px-8 max-w-4xl"
          >
            <span className="block text-sm md:text-base font-light tracking-[0.3em] uppercase">
              Hudvårdsindustrin har sin sanning.
            </span>
            <span className="block text-sm md:text-base font-light tracking-[0.3em] uppercase mt-2">
              Vi har en annan.
            </span>
          </motion.h1>
        </div>
      </section>

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
                        // logout() would go here
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