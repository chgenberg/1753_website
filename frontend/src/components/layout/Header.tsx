'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { CartDrawer } from '@/components/cart/CartDrawer'
import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/contexts/AuthContext'
import { 
  ShoppingBag, User, ChevronDown, LogOut,
  Sparkles, Leaf, ShieldCheck, Package,
  BookOpen, Phone, Info, Home, Menu, X, PenTool, MapPin
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const TopBarMessages = ({ t }: { t: (k: string) => string }) => ([
  { icon: <Sparkles className="w-4 h-4" />, text: t('headerTopBar.freeShipping') },
  { icon: <Leaf className="w-4 h-4" />, text: t('headerTopBar.naturalIngredients') },
  { icon: <ShieldCheck className="w-4 h-4" />, text: t('headerTopBar.openPurchase') },
])

export function Header() {
  const t = useTranslations()
  const router = useRouter()
  const [isScrolled, setIsScrolled] = useState(false)
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0)
  const [showUserDropdown, setShowUserDropdown] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isLangOpen, setIsLangOpen] = useState(false)
  const pathname = usePathname()
  const { cartCount, openCart } = useCart()
  const { user, logout } = useAuth()
  const langRef = useRef<HTMLDivElement | null>(null)
  const menuRef = useRef<HTMLDivElement | null>(null)
  const headerRef = useRef<HTMLElement | null>(null)
  const [headerHeight, setHeaderHeight] = useState<number>(0)
  const topBarRef = useRef<HTMLDivElement | null>(null)
  const [topBarHeight, setTopBarHeight] = useState<number>(0)
 
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
      // Close dropdowns on scroll for safety
      setIsLangOpen(false)
      setActiveDropdown(null)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
 
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % TopBarMessages({ t }).length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])
 
  // Measure header & top bar height to offset the drawer below them
  useEffect(() => {
    const measure = () => {
      setHeaderHeight(headerRef.current?.offsetHeight || 0)
      setTopBarHeight(topBarRef.current?.offsetHeight || 0)
    }
    measure()
    const ro = new ResizeObserver(measure)
    if (headerRef.current) ro.observe(headerRef.current)
    if (topBarRef.current) ro.observe(topBarRef.current)
    window.addEventListener('resize', measure)
    return () => {
      window.removeEventListener('resize', measure)
      ro.disconnect()
    }
  }, [])
 
  // Close language dropdown on outside click / ESC / route change
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setIsLangOpen(false)
      }
    }
    const onKey = (e: KeyboardEvent) => { 
      if (e.key === 'Escape') { setIsLangOpen(false); setIsMobileMenuOpen(false) }
    }
    document.addEventListener('mousedown', onDocClick)
    window.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('mousedown', onDocClick); window.removeEventListener('keydown', onKey) }
  }, [])
 
  useEffect(() => {
    // When route changes, make sure all menus close
    setIsLangOpen(false)
    setActiveDropdown(null)
    setIsMobileMenuOpen(false)
  }, [pathname])
 
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

  const buildLocaleHref = (locale: string) => {
    // Ensure path starts with /{locale}
    const parts = pathname.split('/')
    if (parts.length > 1) {
      if (['sv', 'en', 'es', 'de', 'fr'].includes(parts[1])) {
        parts[1] = locale
        return parts.join('/') || `/${locale}`
      }
    }
    return `/${locale}${pathname.startsWith('/') ? '' : '/'}${pathname}`
  }

  const currentLocale = (pathname.split('/')[1] || 'sv') as string
  const localize = (href: string) => {
    if (!href.startsWith('/')) return href
    const seg1 = href.split('/')[1]
    if (['sv','en','es','de','fr'].includes(seg1)) return href
    return `/${currentLocale}${href}`
  }

  const isSv = (pathname.split('/')[1] || 'sv') === 'sv'

  return (
    <>
      {/* Restored Top Bar */}
      <div ref={topBarRef} className="fixed top-0 left-0 right-0 bg-[#4A3428] text-white text-xs sm:text-sm py-2 z-50">
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
              {TopBarMessages({ t })[currentMessageIndex].icon}
              <span className="font-medium tracking-wider">
                {t('headerTopBar.bannerPrefix')} • {TopBarMessages({ t })[currentMessageIndex].text}
              </span>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
       
      {/* Main Header - full white background */}
      <header ref={headerRef} className={`fixed left-0 right-0 z-40 bg-white transition-all duration-300 ${
        isScrolled ? 'shadow-lg' : 'shadow-md'
      }`}>
        <div className="container mx-auto px-4">
          {/* Centered logo, hamburger left, actions right */}
          <div className="relative flex items-center justify-between py-6 md:py-7">
            {/* Hamburger */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Öppna meny"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>

            {/* filler */}
            <div className="w-10" />

            {/* Logo */}
            <Link href={localize('/')} className="absolute left-1/2 -translate-x-1/2">
              <Image
                src="/1753.png"
                alt="1753 Skincare"
                width={200}
                height={70}
                className="h-20 w-auto md:h-24"
                priority
              />
            </Link>

            {/* User & Cart */}
            <div className="flex items-center gap-2">
              {/* Locale Switcher */}
              <div ref={langRef} className="relative">
                <button
                  className="px-3 py-2 text-sm rounded-lg hover:bg-gray-100 border border-gray-200"
                  aria-haspopup="listbox"
                  aria-label="Byt språk"
                  aria-expanded={isLangOpen}
                  onClick={() => setIsLangOpen((o) => !o)}
                >
                  {pathname.split('/')[1] || 'sv'}
                </button>
                {isLangOpen && (
                  <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    {['sv', 'en', 'es', 'de', 'fr'].map((loc) => {
                      const href = buildLocaleHref(loc)
                      const isActiveLoc = pathname.startsWith(`/${loc}`)
                      return (
                        <button
                          key={loc}
                          onClick={() => { setIsLangOpen(false); router.push(href) }}
                          className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 ${isActiveLoc ? 'text-[#4A3428] font-medium' : 'text-gray-700'}`}
                          role="option"
                          aria-selected={isActiveLoc}
                        >
                          {loc.toUpperCase()}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
              {/* User Account */}
              <div className="relative">
                {user ? (
                  <button
                    onClick={() => setShowUserDropdown(!showUserDropdown)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <User className="w-5 h-5" />
                    <span className="hidden lg:inline text-sm">
                      {user.firstName || t('navigation.account')}
                    </span>
                  </button>
                ) : (
                  <Link
                    href={localize('/auth/login')}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Sparkles className="w-5 h-5 text-amber-600" />
                    <User className="w-5 h-5" />
                    <span className="hidden lg:inline text-sm">{t('navigation.login')}</span>
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
                        href={localize('/dashboard')}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowUserDropdown(false)}
                      >
                        {t('account.profile')}
                      </Link>
                      <Link
                        href={localize('/dashboard')}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowUserDropdown(false)}
                      >
                        {t('account.orders')}
                      </Link>
                      <hr className="my-2" />
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        {t('navigation.logout')}
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

          {/* Left Drawer Menu (all breakpoints) */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <div className="fixed left-0 right-0 bottom-0 z-[60]" style={{ top: headerHeight }}>
                {/* Backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black/20 backdrop-blur-[2px]"
                  onClick={() => setIsMobileMenuOpen(false)}
                />
                {/* Drawer */}
                <motion.aside
                  ref={menuRef}
                  initial={{ x: -420, opacity: 1 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -420, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 30 }}
                  className="absolute left-0 top-0 h-full w-[86%] max-w-[420px] bg-white shadow-2xl"
                  role="dialog"
                  aria-modal
                >
                  <div className="px-4 py-6 h-full flex flex-col">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Meny</span>
                      <button aria-label="Stäng meny" onClick={() => setIsMobileMenuOpen(false)} className="p-2 rounded hover:bg-gray-100">
                        <X className="w-6 h-6" />
                      </button>
                    </div>
                    <div className="mt-6 grid gap-3 w-full">
                      <Link href={localize('/')} onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-between px-5 py-4 rounded-xl border hover:border-[#4A3428] hover:bg-[#4A3428]/5 transition-colors">
                        <span className="flex items-center gap-3 text-lg"><Home className="w-5 h-5" />{t('navigation.home')}</span>
                        <ChevronDown className="w-4 h-4 rotate-[-90deg]" />
                      </Link>
                      <Link href={localize('/products')} onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-between px-5 py-4 rounded-xl border hover:border-[#4A3428] hover:bg-[#4A3428]/5 transition-colors">
                        <span className="flex items-center gap-3 text-lg"><Package className="w-5 h-5" />{t('navigation.products')}</span>
                        <ChevronDown className="w-4 h-4 rotate-[-90deg]" />
                      </Link>
                      <div className="px-5 py-4 rounded-xl border">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-3 text-lg"><Info className="w-5 h-5" />{t('navigation.about')}</span>
                        </div>
                        <div className="mt-3 grid gap-2 pl-8 text-gray-700">
                          <Link href={localize('/om-oss')} onClick={() => setIsMobileMenuOpen(false)} className="hover:text-[#4A3428]">{t('navigation.about')}</Link>
                          {isSv && (
                            <Link href={localize('/om-oss/aterforsaljare')} onClick={() => setIsMobileMenuOpen(false)} className="hover:text-[#4A3428]">Återförsäljare</Link>
                          )}
                          <Link href={localize('/om-oss/faq')} onClick={() => setIsMobileMenuOpen(false)} className="hover:text-[#4A3428]">Q&A</Link>
                        </div>
                      </div>
                      <div className="px-5 py-4 rounded-xl border">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-3 text-lg"><BookOpen className="w-5 h-5" />{t('navigation.knowledge')}</span>
                        </div>
                        <div className="mt-3 grid gap-2 pl-8 text-gray-700">
                          <Link href={localize('/blogg')} onClick={() => setIsMobileMenuOpen(false)} className="hover:text-[#4A3428]">{t('navigation.blog')}</Link>
                          <Link href={localize('/kunskap/e-bok')} onClick={() => setIsMobileMenuOpen(false)} className="hover:text-[#4A3428]">E-bok: Weed Your Skin</Link>
                          <Link href={localize('/quiz')} onClick={() => setIsMobileMenuOpen(false)} className="hover:text-[#4A3428]">{t('Quiz.title')}</Link>
                          <Link href={localize('/om-oss/ingredienser')} onClick={() => setIsMobileMenuOpen(false)} className="hover:text-[#4A3428]">Våra ingredienser</Link>
                          <Link href={localize('/kunskap/funktionella-ravaror')} onClick={() => setIsMobileMenuOpen(false)} className="hover:text-[#4A3428]">Funktionella råvaror</Link>
                        </div>
                      </div>
                      <Link href={localize('/kontakt')} onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-between px-5 py-4 rounded-xl border hover:border-[#4A3428] hover:bg-[#4A3428]/5 transition-colors">
                        <span className="flex items-center gap-3 text-lg"><Phone className="w-5 h-5" />{t('navigation.contact')}</span>
                        <ChevronDown className="w-4 h-4 rotate-[-90deg]" />
                      </Link>
                    </div>
                    <div className="mt-auto text-center text-xs text-gray-500 py-4">© 1753 Skincare</div>
                  </div>
                </motion.aside>
              </div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Spacer adjusted for taller header */}
      <div className="h-36 md:h-40" />

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
      {isLangOpen && (
        <div
          className="fixed inset-0 z-20 md:hidden"
          onClick={() => setIsLangOpen(false)}
          aria-hidden
        />
      )}
    </>
  )
} 