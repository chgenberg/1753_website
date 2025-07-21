'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { CartDrawer } from '@/components/cart/CartDrawer'
import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/contexts/AuthContext'
import { 
  Menu, X, Search, ShoppingBag, User, 
  ChevronDown, Globe, Heart, LogOut,
  Sparkles, Leaf, ShieldCheck
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const navigation = [
  { name: 'Hem', href: '/' },
  { name: 'Produkter', href: '/products' },
  { name: 'Om oss', href: '/om-oss' },
  { name: 'Quiz', href: '/quiz', highlight: true },
  { name: 'Kunskap', href: '/kunskap' },
  { name: 'Kontakt', href: '/kontakt' },
]

const topBarMessages = [
  { icon: <Sparkles className="w-4 h-4" />, text: "✨ KOSTNADSFRITT & PERSONLIGT" },
  { icon: <Leaf className="w-4 h-4" />, text: "🌿 NATURLIGA INGREDIENSER" },
  { icon: <ShieldCheck className="w-4 h-4" />, text: "🛡️ 30 DAGARS ÖPPET KÖP" },
]

export function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0)
  const [showUserDropdown, setShowUserDropdown] = useState(false)
  const pathname = usePathname()
  const { cartCount, openCart } = useCart()
  const { user, logout } = useAuth()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % topBarMessages.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  const handleLogout = async () => {
    await logout()
    setShowUserDropdown(false)
  }

  return (
    <>
      {/* Fixed Top Bar */}
      <div className="fixed top-0 left-0 right-0 bg-black text-white text-xs sm:text-sm py-2 z-50">
        <div className="container mx-auto px-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentMessageIndex}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.3 }}
              className="flex items-center justify-center gap-2"
            >
              {topBarMessages[currentMessageIndex].icon}
              <span className="font-medium tracking-wider">
                FRI FRAKT ÖVER 500 KR • {topBarMessages[currentMessageIndex].text}
              </span>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Main Header */}
      <header className={`fixed top-8 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-white'
      }`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            
            {/* Left - Menu Button */}
            <div className="flex items-center">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Toggle menu"
              >
                {isOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>

            {/* Center - Logo */}
            <div className="absolute left-1/2 transform -translate-x-1/2">
              <Link href="/" className="flex items-center">
                <Image
                  src="/1753.png"
                  alt="1753 Skincare"
                  width={120}
                  height={40}
                  className="h-10 w-auto"
                  priority
                />
              </Link>
            </div>

            {/* Right - User & Cart */}
            <div className="flex items-center gap-2">
              {/* User Account */}
              <div className="relative">
                {user ? (
                  <button
                    onClick={() => setShowUserDropdown(!showUserDropdown)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <User className="w-5 h-5" />
                    <span className="hidden md:inline text-sm">
                      {user.firstName || 'Mitt konto'}
                    </span>
                  </button>
                ) : (
                  <Link
                    href="/auth/login"
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <User className="w-5 h-5" />
                    <span className="hidden md:inline text-sm">Logga in</span>
                  </Link>
                )}

                {/* User Dropdown */}
                <AnimatePresence>
                  {showUserDropdown && user && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 border border-gray-200"
                    >
                      <Link
                        href="/dashboard"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowUserDropdown(false)}
                      >
                        Min profil
                      </Link>
                      <Link
                        href="/dashboard/orders"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowUserDropdown(false)}
                      >
                        Mina beställningar
                      </Link>
                      <hr className="my-2" />
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        Logga ut
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Cart */}
              <button
                onClick={openCart}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative"
                aria-label="Varukorg"
              >
                <ShoppingBag className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#4A3428] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile/Desktop Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden border-t border-gray-200"
            >
              <nav className="container mx-auto px-4 py-6">
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`
                        px-4 py-3 rounded-lg text-center transition-all duration-200
                        ${pathname === item.href 
                          ? 'bg-[#4A3428] text-white' 
                          : 'hover:bg-gray-100'
                        }
                        ${item.highlight 
                          ? 'bg-amber-50 border-2 border-amber-300 hover:bg-amber-100 font-semibold' 
                          : ''
                        }
                      `}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>

                {/* Additional Menu Items */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <Link
                      href="/om-oss/ingredienser"
                      onClick={() => setIsOpen(false)}
                      className="text-gray-600 hover:text-[#4A3428] transition-colors"
                    >
                      Ingredienser
                    </Link>
                    <Link
                      href="/om-oss/faq"
                      onClick={() => setIsOpen(false)}
                      className="text-gray-600 hover:text-[#4A3428] transition-colors"
                    >
                      Vanliga frågor
                    </Link>
                    <Link
                      href="/recensioner"
                      onClick={() => setIsOpen(false)}
                      className="text-gray-600 hover:text-[#4A3428] transition-colors"
                    >
                      Recensioner
                    </Link>
                    <Link
                      href="/om-oss/aterforsaljare"
                      onClick={() => setIsOpen(false)}
                      className="text-gray-600 hover:text-[#4A3428] transition-colors"
                    >
                      Återförsäljare
                    </Link>
                  </div>
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Spacer to prevent content from going under fixed header */}
      <div className="h-28" />

      {/* Cart Drawer */}
      <CartDrawer />

      {/* Overlay for dropdown menus */}
      {(showUserDropdown) && (
        <div 
          className="fixed inset-0 z-30" 
          onClick={() => {
            setShowUserDropdown(false)
          }}
        />
      )}
    </>
  )
} 