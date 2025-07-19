'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '@/contexts/CartContext'
import { 
  Home, 
  Info, 
  Package, 
  Phone, 
  ShoppingBag,
  Users,
  Leaf,
  HelpCircle,
  Store,
  BookOpen
} from 'lucide-react'

interface MenuItem {
  name: string
  href: string
  icon: React.ReactNode
  children?: {
    name: string
    href: string
    icon?: React.ReactNode
  }[]
}

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const pathname = usePathname()
  const { cartCount, openCart } = useCart()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 300)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const menuItems: MenuItem[] = [
    {
      name: 'HEM',
      href: '/',
      icon: <Home className="w-5 h-5" />
    },
    {
      name: 'OM OSS',
      href: '/om-oss', // Navigate to Om oss page when clicked directly
      icon: <Info className="w-5 h-5" />,
      children: [
        { name: 'Vilka är vi?', href: '/om-oss', icon: <Users className="w-4 h-4" /> },
        { name: 'Våra ingredienser', href: '/om-oss/ingredienser', icon: <Leaf className="w-4 h-4" /> },
        { name: 'Q & A', href: '/om-oss/faq', icon: <HelpCircle className="w-4 h-4" /> },
        { name: 'Återförsäljare', href: '/om-oss/aterforsaljare', icon: <Store className="w-4 h-4" /> }
      ]
    },
    {
      name: 'PRODUKTER',
      href: '/products',
      icon: <Package className="w-5 h-5" />
    },
    {
      name: 'KUNSKAP',
      href: '/kunskap',
      icon: <BookOpen className="w-5 h-5" />,
      children: [
        { name: 'Blogg', href: '/blogg', icon: <BookOpen className="w-4 h-4" /> },
        { name: 'E-BOK', href: '/kunskap/e-bok', icon: <BookOpen className="w-4 h-4" /> }
      ]
    },
    {
      name: 'KONTAKTA OSS',
      href: '/kontakt',
      icon: <Phone className="w-5 h-5" />
    }
  ]

  return (
    <>
      {/* Scrolling Banner */}
      <div className="fixed top-0 left-0 right-0 z-[60] h-10 overflow-hidden bg-black">
        <div className="absolute inset-0">
          <svg
            className="absolute bottom-0 w-full h-3"
            preserveAspectRatio="none"
            viewBox="0 0 1200 40"
          >
            <path
              d="M0,20 Q150,5 300,20 T600,20 T900,20 T1200,20 L1200,40 L0,40 Z"
              fill="#000000"
              className="animate-pulse"
            />
          </svg>
        </div>
        <div className="relative z-10 flex h-full items-center overflow-hidden">
          <div className="animate-marquee whitespace-nowrap">
            <span className="text-white text-sm font-medium tracking-wider px-8">
              FRI FRAKT ÖVER 500 KR • FRI FRAKT ÖVER 500 KR • FRI FRAKT ÖVER 500 KR • FRI FRAKT ÖVER 500 KR • FRI FRAKT ÖVER 500 KR • FRI FRAKT ÖVER 500 KR • FRI FRAKT ÖVER 500 KR • FRI FRAKT ÖVER 500 KR •
            </span>
          </div>
        </div>
      </div>

      {/* Vertical Navigation on Left - Always visible with glassmorphism */}
      <nav className={`fixed left-0 top-0 h-full z-50 transition-all duration-500 pt-10 ${
        isScrolled ? 'bg-white/90 backdrop-blur-md shadow-lg' : 'bg-black/20 backdrop-blur-sm'
      }`}>
        <div className="flex flex-col h-full py-6 px-4">
          {/* Logo integrated in navigation */}
          <div className="flex justify-center mb-6">
            <Link href="/" className="relative">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                whileHover={{ scale: 1.05 }}
                className="bg-white rounded-full p-3 hover:bg-gray-100 transition-all duration-300"
              >
                <Image
                  src="/1753.png"
                  alt="1753 Skincare"
                  width={32}
                  height={32}
                  className="h-8 w-auto opacity-100"
                />
              </motion.div>
            </Link>
          </div>
          
          <div className="flex-1 flex flex-col items-center space-y-6">
            {menuItems.map((item) => (
              <div 
                key={item.name} 
                className="relative group"
                onMouseEnter={() => setHoveredItem(item.name)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative"
                >
                  {item.children ? (
                    <div
                      className={`flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 cursor-pointer ${
                        isScrolled 
                          ? 'text-gray-600 hover:text-black hover:bg-gray-200'
                          : 'text-white/80 hover:text-black hover:bg-white'
                      }`}
                    >
                      {item.icon}
                    </div>
                  ) : (
                    <Link
                      href={item.href}
                      className={`flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ${
                        pathname === item.href
                          ? 'bg-[#064400] text-white'
                          : isScrolled 
                            ? 'text-gray-600 hover:text-black hover:bg-gray-200'
                            : 'text-white/80 hover:text-black hover:bg-white'
                      }`}
                    >
                      {item.icon}
                    </Link>
                  )}
                </motion.div>

                {/* Glassmorphism tooltip */}
                <AnimatePresence>
                  {hoveredItem === item.name && !item.children && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="absolute left-16 top-1/2 -translate-y-1/2 whitespace-nowrap pointer-events-none"
                    >
                      <div className={`backdrop-blur-md px-4 py-2 rounded-lg shadow-lg border ${
                        isScrolled 
                          ? 'bg-white/90 border-gray-200/50 text-black' 
                          : 'bg-white/90 border-white/20 text-black'
                      }`}>
                        <span className="text-sm font-medium">{item.name}</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submenu - Shows on hover */}
                <AnimatePresence>
                  {hoveredItem === item.name && item.children && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute left-16 top-0 ml-2"
                    >
                      <div className={`backdrop-blur-md rounded-lg shadow-xl border py-2 min-w-[200px] ${
                        isScrolled 
                          ? 'bg-white/95 border-gray-200/50' 
                          : 'bg-white/90 border-white/20'
                      }`}>
                        <div className={`px-4 py-2 mb-2 border-b ${
                          isScrolled ? 'border-gray-200/50' : 'border-gray-200/30'
                        }`}>
                          <span className={`text-sm font-semibold ${
                            isScrolled ? 'text-black' : 'text-black'
                          }`}>{item.name}</span>
                        </div>
                        {item.children.map((child) => (
                          <Link
                            key={child.name}
                            href={child.href}
                            className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-all duration-200 ${
                              isScrolled 
                                ? 'text-gray-600 hover:text-black hover:bg-gray-100' 
                                : 'text-gray-700 hover:text-black hover:bg-gray-100'
                            }`}
                          >
                            {child.icon}
                            <span>{child.name}</span>
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          {/* Cart Icon at Bottom */}
          <div className="mt-auto flex justify-center">
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <button
                onClick={openCart}
                className={`relative flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ${
                  isScrolled 
                    ? 'text-gray-600 hover:text-black hover:bg-gray-200'
                    : 'text-white/80 hover:text-black hover:bg-white'
                }`}
              >
                <ShoppingBag className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#064400] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>
            </motion.div>
          </div>
        </div>
      </nav>

      {/* Main content padding */}
      <style jsx global>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        
        .animate-marquee {
          display: inline-block;
          animation: marquee 30s linear infinite;
        }
      `}</style>
    </>
  )
} 