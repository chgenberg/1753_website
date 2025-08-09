'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { CartDrawer } from '@/components/cart/CartDrawer'
import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/contexts/AuthContext'
import { 
  ShoppingBag, User, ChevronDown, LogOut,
  Sparkles, Leaf, ShieldCheck, Package,
  BookOpen, Phone, Info, Home, Menu, X, PenTool
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const topBarMessages = [
  { icon: <Sparkles className="w-4 h-4" />, text: "✨ KOSTNADSFRITT & PERSONLIGT" },
  { icon: <Leaf className="w-4 h-4" />, text: "🌿 NATURLIGA INGREDIENSER" },
  { icon: <ShieldCheck className="w-4 h-4" />, text: "🛡️ 30 DAGARS ÖPPET KÖP" },
]

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0)
  const [showUserDropdown, setShowUserDropdown] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
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

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/' || pathname === '/sv'
    }
    return pathname.includes(href)
  }

  return (
    <>
      {/* Fixed Top Bar */}
      <div className="fixed top-0 left-0 right-0 bg-[#4A3428] text-white text-xs sm:text-sm py-2 z-50">
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
        isScrolled ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-white shadow-md'
      }`}>
        <div className="container mx-auto px-4">
          {/* Compact header with navigation, logo, and user/cart on same line */}
          <div className="flex items-center justify-between py-3">
            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>

            {/* Desktop Navigation - Center */}
            <nav className="hidden md:block mx-auto">
              <ul className="flex items-center gap-6">
                {/* Hem */}
                <li>
                  <Link
                    href="/"
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-sm ${
                      isActive('/') 
                        ? 'bg-[#4A3428] text-white' 
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <Home className="w-4 h-4" />
                    <span className="font-medium">Hem</span>
                  </Link>
                </li>

                {/* Produkter */}
                <li>
                  <Link
                    href="/products"
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-sm ${
                      isActive('/products') 
                        ? 'bg-[#4A3428] text-white' 
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <Package className="w-4 h-4" />
                    <span className="font-medium">Produkter</span>
                  </Link>
                </li>

                {/* Om oss - with dropdown */}
                <li className="relative">
                  <button
                    onMouseEnter={() => setActiveDropdown('om-oss')}
                    onMouseLeave={() => setActiveDropdown(null)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-sm ${
                      isActive('/om-oss') 
                        ? 'bg-[#4A3428] text-white' 
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                    aria-haspopup="menu"
                    aria-expanded={activeDropdown === 'om-oss'}
                    aria-controls="menu-om-oss"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        setActiveDropdown(prev => prev === 'om-oss' ? null : 'om-oss')
                      }
                      if (e.key === 'Escape') setActiveDropdown(null)
                      if (e.key === 'ArrowDown') setActiveDropdown('om-oss')
                    }}
                  >
                    <Info className="w-4 h-4" />
                    <span className="font-medium">Om oss</span>
                    <ChevronDown className="w-3 h-3" />
                  </button>

                  {/* Dropdown */}
                  <AnimatePresence>
                    {activeDropdown === 'om-oss' && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        onMouseEnter={() => setActiveDropdown('om-oss')}
                        onMouseLeave={() => setActiveDropdown(null)}
                        className="absolute top-full left-0 mt-1 w-64 bg-white rounded-lg shadow-lg py-2 border border-gray-200"
                        id="menu-om-oss"
                        role="menu"
                        aria-labelledby="menu-om-oss"
                        onKeyDown={(e) => { if (e.key === 'Escape') setActiveDropdown(null) }}
                      >
                        <Link
                          href="/om-oss"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          role="menuitem"
                          tabIndex={0}
                        >
                          Om oss
                        </Link>
                        <Link
                          href="/om-oss/aterforsaljare"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          role="menuitem"
                          tabIndex={0}
                        >
                          Återförsäljare
                        </Link>
                        <Link
                          href="/om-oss/faq"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          role="menuitem"
                          tabIndex={0}
                        >
                          Q&A
                        </Link>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </li>

                {/* Kunskap - with dropdown */}
                <li className="relative">
                  <button
                    onMouseEnter={() => setActiveDropdown('kunskap')}
                    onMouseLeave={() => setActiveDropdown(null)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-sm ${
                      isActive('/kunskap') || isActive('/quiz') || isActive('/blogg')
                        ? 'bg-[#4A3428] text-white'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                    aria-haspopup="menu"
                    aria-expanded={activeDropdown === 'kunskap'}
                    aria-controls="menu-kunskap"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        setActiveDropdown(prev => prev === 'kunskap' ? null : 'kunskap')
                      }
                      if (e.key === 'Escape') setActiveDropdown(null)
                      if (e.key === 'ArrowDown') setActiveDropdown('kunskap')
                    }}
                  >
                    <BookOpen className="w-4 h-4" />
                    <span className="font-medium">Kunskap</span>
                    <ChevronDown className="w-3 h-3" />
                  </button>

                  {/* Dropdown */}
                  <AnimatePresence>
                    {activeDropdown === 'kunskap' && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        onMouseEnter={() => setActiveDropdown('kunskap')}
                        onMouseLeave={() => setActiveDropdown(null)}
                        className="absolute top-full left-0 mt-1 w-64 bg-white rounded-lg shadow-lg py-2 border border-gray-200"
                        id="menu-kunskap"
                        role="menu"
                        aria-labelledby="menu-kunskap"
                        onKeyDown={(e) => { if (e.key === 'Escape') setActiveDropdown(null) }}
                      >
                        <Link
                          href="/blogg"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          role="menuitem"
                          tabIndex={0}
                        >
                          Blogg
                          <PenTool className="w-4 h-4" />
                        </Link>
                        <Link
                          href="/kunskap/e-bok"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          role="menuitem"
                          tabIndex={0}
                        >
                          E-bok: Weed Your Skin
                        </Link>
                        <Link
                          href="/quiz"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          role="menuitem"
                          tabIndex={0}
                        >
                          Hudanalys
                          <Sparkles className="w-4 h-4 text-amber-600" />
                        </Link>
                        <Link
                          href="/om-oss/ingredienser"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          role="menuitem"
                          tabIndex={0}
                        >
                          Våra ingredienser
                        </Link>
                        <Link
                          href="/kunskap/funktionella-ravaror"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          role="menuitem"
                          tabIndex={0}
                        >
                          Funktionella råvaror
                        </Link>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </li>



                {/* Kontakt */}
                <li>
                  <Link
                    href="/kontakt"
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-sm ${
                      isActive('/kontakt') 
                        ? 'bg-[#4A3428] text-white' 
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <Phone className="w-4 h-4" />
                    <span className="font-medium">Kontakt</span>
                  </Link>
                </li>
              </ul>
            </nav>

            {/* Logo - Left side */}
            <Link href="/" className="order-first mr-auto">
              <Image
                src="/1753.png"
                alt="1753 Skincare"
                width={180}
                height={60}
                className="h-14 w-auto md:h-16"
                priority
              />
            </Link>

            {/* User & Cart - Far right */}
            <div className="flex items-center gap-2">
              {/* User Account */}
              <div className="relative">
                {user ? (
                  <button
                    onClick={() => setShowUserDropdown(!showUserDropdown)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <User className="w-5 h-5" />
                    <span className="hidden lg:inline text-sm">
                      {user.firstName || 'Mitt konto'}
                    </span>
                  </button>
                ) : (
                  <Link
                    href="/auth/login"
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Sparkles className="w-5 h-5 text-amber-600" />
                    <User className="w-5 h-5" />
                    <span className="hidden lg:inline text-sm">Logga in</span>
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
                        href="/dashboard"
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

          {/* Mobile Navigation Menu */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.nav
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="md:hidden border-t border-gray-100 overflow-hidden"
              >
                <ul className="py-4 space-y-2">
                  <li>
                    <Link
                      href="/"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-all ${
                        isActive('/') 
                          ? 'bg-[#4A3428] text-white' 
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      <Home className="w-4 h-4" />
                      <span className="font-medium">Hem</span>
                    </Link>
                  </li>

                  <li>
                    <Link
                      href="/products"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-all ${
                        isActive('/products') 
                          ? 'bg-[#4A3428] text-white' 
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      <Package className="w-4 h-4" />
                      <span className="font-medium">Produkter</span>
                    </Link>
                  </li>

                  <li>
                    <div className="px-4 py-2">
                      <p className="text-sm font-semibold text-gray-600 mb-2">Om oss</p>
                      <div className="space-y-1 ml-4">
                        <Link
                          href="/om-oss"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="block py-2 text-sm text-gray-700 hover:text-[#4A3428]"
                        >
                          Vilka är vi?
                        </Link>
                        <Link
                          href="/om-oss/faq"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="block py-2 text-sm text-gray-700 hover:text-[#4A3428]"
                        >
                          Q&A
                        </Link>
                        <Link
                          href="/om-oss/aterforsaljare"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="block py-2 text-sm text-gray-700 hover:text-[#4A3428]"
                        >
                          Återförsäljare
                        </Link>
                        <Link
                          href="/recensioner"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="block py-2 text-sm text-gray-700 hover:text-[#4A3428]"
                        >
                          Recensioner
                        </Link>
                      </div>
                    </div>
                  </li>

                  <li>
                    <div className="px-4 py-2">
                      <p className="text-sm font-semibold text-gray-600 mb-2">Kunskap</p>
                      <div className="space-y-1 ml-4">
                        <Link
                          href="/blogg"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="block py-2 text-sm text-gray-700 hover:text-[#4A3428]"
                        >
                          Blogg
                        </Link>
                        <Link
                          href="/kunskap/e-bok"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="block py-2 text-sm text-gray-700 hover:text-[#4A3428]"
                        >
                          E-bok: Weed Your Skin
                        </Link>
                        <Link
                          href="/quiz"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="block py-2 text-sm text-gray-700 hover:text-[#4A3428]"
                        >
                          Hudanalys
                        </Link>
                        <Link
                          href="/om-oss/ingredienser"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="block py-2 text-sm text-gray-700 hover:text-[#4A3428]"
                        >
                          Våra ingredienser
                        </Link>
                        <Link
                          href="/kunskap/funktionella-ravaror"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="block py-2 text-sm text-gray-700 hover:text-[#4A3428]"
                        >
                          Funktionella råvaror
                        </Link>
                      </div>
                    </div>
                  </li>

                  <li>
                    <Link
                      href="/kontakt"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-all ${
                        isActive('/kontakt') 
                          ? 'bg-[#4A3428] text-white' 
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      <Phone className="w-4 h-4" />
                      <span className="font-medium">Kontakt</span>
                    </Link>
                  </li>
                </ul>
              </motion.nav>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Spacer to prevent content from going under fixed header */}
      <div className="h-24" />

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