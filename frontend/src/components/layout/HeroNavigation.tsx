'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ShoppingBag, User, X } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/contexts/AuthContext'
import { usePathname } from 'next/navigation'
import { MobileMenu } from './MobileMenu'
import { LanguageSelector } from './LanguageSelector'

export function HeroNavigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()
  const currentLocale = pathname.split('/')[1] || 'sv'
  const { cartCount, openCart } = useCart()
  const { user } = useAuth()

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

  return (
    <>
      {/* Navigation */}
      <nav className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-4 md:p-6">
        {/* Logo */}
        <Link href={`/${currentLocale}`} className="hover:opacity-90 transition-opacity">
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
            href={user ? `/${currentLocale}/dashboard` : `/${currentLocale}/auth/login`}
            className="p-2 hover:opacity-70 transition-opacity"
          >
            <User className="w-6 h-6 text-white" />
          </Link>

          {/* Language Selector */}
          <LanguageSelector variant="light" />

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
      </nav>

      {/* Mobile Menu */}
      <MobileMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </>
  )
} 